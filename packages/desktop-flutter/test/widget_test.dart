import 'package:flutter_test/flutter_test.dart';
import 'package:skoolific_admin/main.dart';

void main() {
  testWidgets('App loads smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const SkoolificApp());
    expect(find.text('Skoolific Admin'), findsWidgets);
  });
}
