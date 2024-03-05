import 'package:flutter/material.dart';

class DataProvider extends ChangeNotifier {
  Map<String, dynamic>? _dateBody;
  String? _date;

  Map<String, dynamic>? get dateBody => _dateBody;
  String? get date => _date;

  setBody( Map<String, dynamic> dateBody) {
    _dateBody = dateBody;
    notifyListeners();
  }

  setDate(String date) {
    _date = date;
    notifyListeners();
  }
}
