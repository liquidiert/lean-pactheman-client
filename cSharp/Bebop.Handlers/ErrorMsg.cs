using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class ErrorMsgHandler {

        [BindRecord(typeof(BebopRecord<ErrorMsg>))]
        public static void HandleErrorMsg(object client, ErrorMsg msg) {

            Console.Write($"Received {msg.ErrorMessage} violation. ");
            
        }
    }
}