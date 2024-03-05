import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:loading_overlay/loading_overlay.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pdfWidgets;
import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'DataProvider.dart';
import 'ListShowing.dart';
import 'SharedPreference.dart';
import 'package:permission_handler/permission_handler.dart';


void main() {

  runApp(
  ChangeNotifierProvider(
  create: (context) => DataProvider(),
  child: PDFViewerApp(),
  ),
  );
}

class PDFViewerApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PDF Viewer',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: PDFViewerPage(),
    );
  }
}

class PDFViewerPage extends StatefulWidget {
  @override
  _PDFViewerPageState createState() => _PDFViewerPageState();
}

class _PDFViewerPageState extends State<PDFViewerPage> {
  bool _loading = false;
  Map<String, dynamic>? orderdates;
  late SharedPreferencesHelper sharedPreferencesHelper;

  @override
  void initState() {
    super.initState();
    initializeState();
    checkPermissions();
  }

  Future<void> checkPermissions() async {
    // Check if permissions are granted
    if (await Permission.storage.isGranted ) {
      // Permissions are already granted, proceed with your logic
    } else {
      // Request permissions at runtime
      await requestPermissions();
    }
  }

  Future<void> requestPermissions() async {
    // Request storage and internet permissions
    var statuses = await [
      Permission.storage,
    ].request();

    // Check if permissions are granted
    if (statuses[Permission.storage] == PermissionStatus.granted ) {
      // Permissions granted, proceed with your logic
    } else {
      // Permissions denied, handle accordingly (e.g., show a message or request again)
    }
  }

  Future<void> initializeState() async {
    sharedPreferencesHelper = SharedPreferencesHelper();
    await sharedPreferencesHelper.initSharedPreferences();
    orderdates = sharedPreferencesHelper.readString("orderdates");

    Provider.of<DataProvider>(context, listen: false).setBody(orderdates!);

    orderdates ??= {};
    // Continue with the rest of your initialization code
  }




  Future<void> _pickAndUploadPdf() async {
    try {
      print("Try to pick");
      // Request storage permission if not granted
      if (!(await Permission.storage.isGranted)) {
        print("Request not granted");
        await requestStoragePermission();
        return;
      }

      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
      );

      if (result != null) {
        PlatformFile file = result.files.first;

        try {
          // Create a multipart request
          setState(() {
            _loading = true;
          });

          var request = http.MultipartRequest(
            'POST',
            Uri.parse('https://index-kgxqczsvjq-du.a.run.app'),
          );

          // Attach the file to the request
          request.files.add(http.MultipartFile.fromBytes(
            'file',
            await File(file.path!).readAsBytes(),
            filename: file.name,
          ));

          // Send the request
          var response = await request.send();

          List<dynamic> tableData =
          jsonDecode(await response.stream.bytesToString())["table_data"];

          for (Map<String, dynamic> order in tableData) {
            order["select"] = false;
            order["delivering"] = false;
            order["delivered"] = false;
            order["discarded"] = {"state": false, "reason": -1};
          }

          orderdates?[tableData[0]["date"]] = tableData;
          await sharedPreferencesHelper.writeString("orderdates", orderdates!);

          Provider.of<DataProvider>(context, listen: false).setBody(orderdates!);
        } catch (e) {
          print('Error uploading file: $e');
        } finally {
          setState(() {
            _loading = false; // Hide loading overlay
          });
        }
      } else {
        print('No file picked');
      }
    } catch (e) {
      print('Error: $e');
    }
  }

  Future<void> requestStoragePermission() async {
    var status = await Permission.photos.request();
    status = await Permission.storage.request();
    status = await Permission.accessMediaLocation.request();
    if (status.isGranted) {
      await _pickAndUploadPdf();
    } else {
      print('Photos and videos access permission denied.');
    }
  }



  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('PDF Viewer'),
      ),
      body: LoadingOverlay(
        isLoading: _loading,
        child:
        Center(
          child: orderdates != null
              ? ListView.builder(
            itemCount: orderdates?.length,
            itemBuilder: (context, index) {
              // Get the key (name) and data for the current index
              String? key = orderdates?.keys.elementAt(index);

              return Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
                elevation: 3,
                margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                child: ListTile(
                  title: Text(key!), // Use the key as the title
                  subtitle: Text("Sub title"),
                  onTap: () {
                    Provider.of<DataProvider>(context, listen: false).setDate(
                        key);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => ListShowing(sharedPreferencesHelper : sharedPreferencesHelper)),
                    );
                  },
                ),
              );
            },
          )
              : Text('No response data available.'),
        )

        ,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _pickAndUploadPdf,
        tooltip: 'Select and Open PDF',
        child: Icon(Icons.picture_as_pdf),
      ),
    );
  }



}

