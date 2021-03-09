import 'package:lean_dart_client/classes/bebop_dispatcher.dart';
import 'package:test/test.dart';

void main() {
  test('bebop dispatch init', () {
    var dispatcher = BebopDispatcher.instance;
    dispatcher.initialize();
    expect(dispatcher.handlers, isNotNull);
    print(dispatcher);
  });
}
