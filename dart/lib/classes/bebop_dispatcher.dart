import 'dart:io';
import 'dart:core';
import 'dart:typed_data';
import 'package:lean_dart_client/bebop_handlers/bebop_handler.dart';

class BebopDispatcher {
  BebopDispatcher._privateConstructor() {
    handlers = <int, BebopHandler>{};
  }
  static final BebopDispatcher instance = BebopDispatcher._privateConstructor();

  Future _analyzeDir(FileSystemEntity entity) async {
    if (await FileSystemEntity.isDirectory(entity.path)) {
      for (var child in await (entity as Directory).list().toList()) {
        await _analyzeDir(child);
      }
    } else {
      var inputFile = File.fromUri(Uri.parse(entity.path));
      var content = await inputFile.readAsLines();
      if (!content[0].contains('opcode')) return;
      var className = content[1].split(' ')[1];
      var opCodeString =
          RegExp(r'(\d+)').allMatches(content[0]).toList()[1].group(0);
      // IMPORTANT: bebop opcodes are stored as hex vals
      var opCode = int.tryParse(opCodeString, radix: 16);
      var handler = BebopHandler.fromClassName(className);
      if (handler != null) {
        registerHandler(opCode, handler);
      }
    }
  }

  Future initialize() async {
    var schemaDir = Directory('./bebob_schemas');
    await _analyzeDir(schemaDir);
  }

  Map<int, BebopHandler> handlers;

  void registerHandler(int opCode, BebopHandler handler) {
    handlers[opCode] = handler;
  }

  void removeHandler(int opCode) {
    handlers.remove(opCode);
  }

  void dispatch(int opCode, Uint8List message, {dynamic sender}) {
    handlers[opCode].handleMessage(sender, message);
  }

  @override
  String toString() {
    return 'registered opcodes: ${handlers.keys.join(', ')}';
  }
}
