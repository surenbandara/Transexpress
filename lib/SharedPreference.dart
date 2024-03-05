import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class SharedPreferencesHelper {
  SharedPreferences? _prefs;

  Future<void> initSharedPreferences() async {
    _prefs = await SharedPreferences.getInstance();
  }

  Future<void> writeString(String key ,Map<String, dynamic> jsonData) async {
    if (_prefs != null) {

      print("Writing");
        final jsonString = jsonEncode(jsonData);


       await _prefs!.setString(key, jsonString);
    }
  }

  Map<String, dynamic>? readString(String key) {
    if (_prefs != null) {
      print("Reading");
      String? jsonString = _prefs!.getString(key);

      if (jsonString != null) {
        // Convert the JSON string to a Map
        return jsonDecode(jsonString);
      }
    }
    return null;
  }
}