using System;
using System.Net;
using System.Net.NetworkInformation;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Net.Sockets;
using PacTheMan.Models;
using Bebop.Runtime;

namespace lean_pactheman_client {
    public class Player {

        private TcpClient _client;
        public SessionMsg Session;
        private MoveAdapter _moveAdapter;

        public Position StartPosition { get; set; }
        public Position Position {
            get => (Position) GameState.Instance.PlayerState.PlayerPositions[Session.ClientId ?? Guid.NewGuid()] ?? new Position();
            set {
                GameState.Instance.PlayerState.PlayerPositions[Session.ClientId ?? Guid.NewGuid()] = value;
            }
        }

        private CancellationTokenSource _ctSource;
        private CancellationToken _ct;
        public bool Connected = false;
        public bool Ready = false;
        public string Name { get; set; }

        public Player(string name) {
            Name = name;
            _moveAdapter = new MoveAdapter();
        }

        private Position UpdatePosition(float x = 0, int xFactor = 1, float y = 0, int yFactor = 1) {
            return new Position() { X = (this.Position.X + x) * xFactor, Y = (this.Position.Y + y) * yFactor };
        }

        public async Task Connect(IPAddress address, int port) {
            _ctSource = new CancellationTokenSource();
            _ct = _ctSource.Token;
            _client = new TcpClient() { NoDelay = true };

            try {
                await _client.ConnectAsync(address, port);
            } catch (Exception ex) {
                Console.WriteLine(ex.ToString());
            }

            // start listener as seperate thread
            new Thread(() => Listen()).Start();
            Connected = true;
        }

        public void Disconnect() {
            Console.WriteLine("Disconnect got called");
            if (Connected) {
                _ctSource.Cancel();
                _client.Dispose();
                _ctSource.Dispose();
            }
            Connected = false;
        }

        public async Task Exit() {
            Console.WriteLine("called exit");
            var exitMsg = new ExitMsg {
                Session = Session
            };
            var netMsg = new NetworkMessage {
                IncomingOpCode = ExitMsg.OpCode,
                IncomingRecord = exitMsg.EncodeAsImmutable()
            };
            if (_client?.GetState() == TcpState.Established) {
                await _client.GetStream().WriteAsync(netMsg.Encode());
            }
            Disconnect();
        }

        private async void Listen() {
            // Were we already canceled?
            _ct.ThrowIfCancellationRequested();

            Byte[] buffer = new Byte[1024];

            try {
                while (true) {
                    if (_ct.IsCancellationRequested) {
                        _ct.ThrowIfCancellationRequested();
                    }

                    if (await _client.GetStream().ReadAsync(buffer, _ct) == 0) {
                        // server closed session
                        this.Disconnect();
                        return;
                    }

                    var msg = NetworkMessage.Decode(buffer);
                    BebopMirror.HandleRecord(msg.IncomingRecord.ToArray(), msg.IncomingOpCode ?? 0, this);
                }
            } catch (OperationCanceledException) {
                // swallow -> canceled thread
            } catch (Exception ex) {
                Console.WriteLine(ex.ToString());
            }
        }

        public async Task Host() {
            // send join
            var joinMsg = new JoinMsg {
                PlayerName = Name
            };
            var netMsg = new NetworkMessage {
                IncomingOpCode = JoinMsg.OpCode,
                IncomingRecord = joinMsg.EncodeAsImmutable()
            };

            await _client.GetStream().WriteAsync(netMsg.Encode());
        }

        public async Task Join() {
            // send join
            var joinMsg = new JoinMsg {
                PlayerName = Name,
                Session = Session
            };
            var netMsg = new NetworkMessage {
                IncomingOpCode = JoinMsg.OpCode,
                IncomingRecord = joinMsg.EncodeAsImmutable()
            };

            await _client.GetStream().WriteAsync(netMsg.Encode());
        }

        public async Task SetReady() {
            var rdyMsg = new ReadyMsg {
                Session = Session,
                Ready = true
            };
            var netMsg = new NetworkMessage {
                IncomingOpCode = ReadyMsg.OpCode,
                IncomingRecord = rdyMsg.EncodeAsImmutable()
            };
            await _client.GetStream().WriteAsync(netMsg.Encode());
        }

        public async void Move() {

            Position updatedPosition;

            updatedPosition = _moveAdapter.GetMove(this);

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

                await _client.GetStream().WriteAsync(msg.Encode());
            } catch (ObjectDisposedException) {
                // swallow -> server sent exit
            } catch (OperationCanceledException) {
                // swallow -> thread canceled
            }
        }
    }
}