using System.Linq;
using System.Net.Sockets;
using System.Net.NetworkInformation;

namespace lean_pactheman_client {
    public static class TcpClientExtensions {

        /// <summary>
        /// Check if TcpClient is connected to remote.
        /// </summary>
        /// <param name="tcpClient"></param>
        /// <returns>Either true (if connected) or false (if disconnected)</returns>
        public static TcpState GetState(this TcpClient tcpClient) {

            var state = IPGlobalProperties.GetIPGlobalProperties()
              .GetActiveTcpConnections()
              ?.FirstOrDefault(x => x.LocalEndPoint.Equals(tcpClient.Client.LocalEndPoint)
                                 && x.RemoteEndPoint.Equals(tcpClient.Client.RemoteEndPoint)
              );


            return state?.State ?? TcpState.Unknown;
        }
    }
}