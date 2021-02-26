using System;
using System.Net;
using System.Net.NetworkInformation;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Net.WebSockets;
using PacTheMan.Models;
using Bebop.Runtime;
using Ninja.WebSockets;

namespace lean_pactheman_client {

    public class PlayerInfo {
        public SessionMsg Session { get; }
        public float MovementSpeed { get; }
        public Position StartPosition { get; }
        public Position Position { get; }
        public Position DownScaledPosition {
            get => new Position { X = (float)Math.Floor(Position.X / 64), Y = (float)Math.Floor(Position.Y / 64) };
        }

        public PlayerInfo(Player player) {
            this.Session = GameState.Instance.Session;
            this.MovementSpeed = player.MovementSpeed;
            this.StartPosition = player.StartPosition;
            this.Position = player.Position;
        }
    }
    public class Player {

        private WebSocket _socket;
        private MoveAdapter _moveAdapter;
        public float MovementSpeed { get => 350f; }
        public Position StartPosition { get; set; }
        public Position Position {
            get => (Position)GameState.Instance.PlayerState.PlayerPositions[(Guid)GameState.Instance.Session.ClientId] ?? new Position();
            set {
                GameState.Instance.PlayerState.PlayerPositions[(Guid)GameState.Instance.Session.ClientId] = value;
            }
        }
        public Position DownScaledPosition {
            get => new Position { X = (float)Math.Floor(Position.X / 64), Y = (float)Math.Floor(Position.Y / 64) };
        }

        private CancellationTokenSource _ctSource;
        private CancellationToken _ct;
        public bool Connected = false;
        public string Name { get; set; }

        public Player(string name) {
            Name = name;
            _moveAdapter = new MoveAdapter();
            GameState.Instance.ResetEvent += (object resetMsg, EventArgs args) => {
                StartPosition = Position = (resetMsg as ResetMsg).PlayerResetPoints[(Guid)GameState.Instance.Session.ClientId] as Position;
            };
            GameState.Instance.NewLevelEvent += (object sender, EventArgs args) => {
                Position = StartPosition;
            };
        }

        private Position UpdatePosition(float x = 0, int xFactor = 1, float y = 0, int yFactor = 1) {
            return new Position() { X = (this.Position.X + x) * xFactor, Y = (this.Position.Y + y) * yFactor };
        }

        public async Task Connect(string address, int port) {
            if (Connected) return;
            _ctSource = new CancellationTokenSource();
            _ct = _ctSource.Token;

            var factory = new WebSocketClientFactory();
            var uri = new Uri($"ws://{address}:{port}");

            try {
                _socket = await factory.ConnectAsync(uri);
            } catch (Exception ex) {
                Console.WriteLine(ex.ToString());
            }

            // start listener as seperate thread
            new Thread(() => Listen()).Start();
            Connected = true;
        }

        public async void Disconnect() {
            Console.WriteLine("Disconnect got called");
            await _socket.CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
            if (Connected) {
                _ctSource.Cancel();
                _socket.Dispose();
                _ctSource.Dispose();
            }
            Connected = false;
        }

        public async Task Exit() {
            Console.WriteLine("called exit");
            var exitMsg = new ExitMsg {
                Session = GameState.Instance.Session
            };
            var netMsg = new NetworkMessage {
                IncomingOpCode = ExitMsg.OpCode,
                IncomingRecord = exitMsg.EncodeAsImmutable()
            };
            await _socket.SendAsync(netMsg.Encode(), WebSocketMessageType.Binary, true, _ct);
            Disconnect();
        }

        private async void Listen() {
            // Were we already canceled?
            _ct.ThrowIfCancellationRequested();

            Byte[] buffer = new Byte[2048];

            try {
                while (true) {
                    if (_ct.IsCancellationRequested) {
                        _ct.ThrowIfCancellationRequested();
                    }

                    WebSocketReceiveResult res = await _socket.ReceiveAsync(buffer, _ct);

                    switch (res.MessageType) {
                        case WebSocketMessageType.Close:
                            Disconnect();
                            return;
                        case WebSocketMessageType.Text:
                            Console.WriteLine(buffer);
                            break;
                        case WebSocketMessageType.Binary:
                            var msg = NetworkMessage.Decode(buffer);
                            BebopMirror.HandleRecord(msg.IncomingRecord.ToArray(), msg.IncomingOpCode ?? 0, this);
                            break;
                    }

                }
            } catch (OperationCanceledException) {
                // swallow -> canceled thread
            } catch (Exception ex) {
                Console.WriteLine(ex.ToString());
            }
        }

        public async Task Host(int levelCount, int gameCount) {
            // send join
            var joinMsg = new JoinMsg {
                PlayerName = Name,
                LevelCount = levelCount,
                GameCount = gameCount
            };
            var netMsg = new NetworkMessage {
                IncomingOpCode = JoinMsg.OpCode,
                IncomingRecord = joinMsg.EncodeAsImmutable()
            };

            await _socket.SendAsync(netMsg.Encode(), WebSocketMessageType.Binary, true, _ct);
        }

        public async Task Join() {
            // send join
            var joinMsg = new JoinMsg {
                PlayerName = Name,
                Session = GameState.Instance.Session
            };
            var netMsg = new NetworkMessage {
                IncomingOpCode = JoinMsg.OpCode,
                IncomingRecord = joinMsg.EncodeAsImmutable()
            };

            await _socket.SendAsync(netMsg.Encode(), WebSocketMessageType.Binary, true, _ct);
        }

        public async Task SetReady() {
            var rdyMsg = new ReadyMsg {
                Session = GameState.Instance.Session,
                Ready = true
            };
            var netMsg = new NetworkMessage {
                IncomingOpCode = ReadyMsg.OpCode,
                IncomingRecord = rdyMsg.EncodeAsImmutable()
            };
            await _socket.SendAsync(netMsg.Encode(), WebSocketMessageType.Binary, true, _ct);
        }

        public async void Move() {

            Velocity updateVelocity;

            try {
                updateVelocity = _moveAdapter.GetMove(new PlayerInfo(this));
            } catch (ArgumentOutOfRangeException) {
                updateVelocity = new Velocity(0);
            }

            GameState.Instance.PlayerState.Direction = MovingState.Up.FromDirection(updateVelocity);

            Position updatedPosition = Position.Copy().AddOther(
                updateVelocity.Multiply(MovementSpeed).Multiply(Constants.FRAME_DELTA_APPROX).ToPosition()
            );

            if (!MapReader.Instance.IsValidPosition(updatedPosition.Copy().Downscaled())) return;

            // teleport if entering either left or right gate
            if (updatedPosition.X <= 38 || updatedPosition.X >= 1177) {
                Position = UpdatePosition(x: -1215, xFactor: -1);
            } else {
                Position = updatedPosition;
            }

            var msg = new NetworkMessage {
                IncomingOpCode = PlayerState.OpCode,
                IncomingRecord = GameState.Instance.PlayerState
                    .ToSynchronous().EncodeAsImmutable()
            };

            try {
                if (_ct.IsCancellationRequested) {
                    _ct.ThrowIfCancellationRequested();
                }

                await _socket.SendAsync(msg.Encode(), WebSocketMessageType.Binary, true, _ct);
            } catch (ObjectDisposedException) {
                // swallow -> server sent exit
            } catch (OperationCanceledException) {
                // swallow -> thread canceled
            }
        }
    }
}