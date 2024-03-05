import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'DataProvider.dart';
import 'package:url_launcher/url_launcher.dart';

import 'SharedPreference.dart';

class ListShowing extends StatefulWidget {
  // Constructor and other properties...

  final SharedPreferencesHelper sharedPreferencesHelper;

  ListShowing({required this.sharedPreferencesHelper});

  @override
  _ListShowingState createState() => _ListShowingState();
}

class _ListShowingState extends State<ListShowing> with TickerProviderStateMixin  {

  Map<String, dynamic>? dateBody;
  String? date;

  TextEditingController _reasonController = TextEditingController();
  TextEditingController _customerNameController = TextEditingController();
  TextEditingController _phonenumberController = TextEditingController();
  TextEditingController _adressController = TextEditingController();
  TextEditingController _codController = TextEditingController();

  late AnimationController _animationController;
  late ColorTween _colorTween;

  Map<String , dynamic>  deliveringdata = {"status" : false , "address":null};

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      vsync: this,
      duration: Duration(seconds: 2),
    );

    _colorTween = ColorTween(
      begin: Colors.white,
      end: Colors.lightGreenAccent,
    );
    _animationController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void refresh(){
    widget.sharedPreferencesHelper.writeString("orderdates", dateBody!);
    setState(() {

    });
  }

  Future<void> _openMap(String address) async {
    String googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=$address&query_place_id=$address';

    if (await canLaunch(googleMapsUrl)) {
      await launch(googleMapsUrl);
    } else {
      throw 'Could not launch $googleMapsUrl';
    }
  }

  Future<void> _openNavigation(String destinationAddress) async {
    final String googleMapsUrl = 'https://www.google.com/maps/dir/?api=1&destination=$destinationAddress';

    if (await canLaunch(googleMapsUrl)) {
      await launch(googleMapsUrl);
    } else {
      throw 'Could not launch $googleMapsUrl';
    }
  }

  @override
  Widget build(BuildContext context) {

    // Access the responseBody using the DataProvider
    dateBody = Provider.of<DataProvider>(context).dateBody;
    date = Provider.of<DataProvider>(context).date;



    return MaterialApp(
      home: DefaultTabController(
        length: 3, // Number of tabs
        child: Scaffold(
          appBar: AppBar(
              actions: [

                IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: () {
                  },
                ),
                IconButton(
                  icon: Icon(Icons.route),
                  onPressed: () {
                  },
                ),
              ],
            title: Text('Orders'),
            bottom: const TabBar(
              tabs: [
                Tab(text: 'Cart '),
                Tab(text: 'Selected'),
                Tab(text: 'Delivered'),
              ],
            ),
          ),
          body: TabBarView(
            children: [

              Center(
                child:
                dateBody?[date] != null
                      ? ListView.builder(
                  itemCount: dateBody?[date]?.length ?? 0,
                    itemBuilder: (context, index) {
                      bool isCardSelected = dateBody![date][index]['select'] == true;
                      bool isDiscarded = dateBody![date][index]['discarded']['state'] == true;

                      // Skip cards that are already selected
                      if (isCardSelected) {
                        return SizedBox.shrink();
                      }

                      else{

                      Color cardColor = Colors.white; // Default color
                      if( isDiscarded){
                        cardColor = Colors.white24;
                      }

                      return Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                        color: cardColor,
                        elevation: 3, // Add some elevation for a subtle shadow effect
                        margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                        child: ListTile(
                          title: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [Text('${dateBody![date][index]['name'].toString()}'),
                            Text('Rs . ${dateBody![date][index]['COD'].toString()}')],) ,

                          subtitle: Text(dateBody![date][index]['address'].toString()),
                          onTap: () {
                            _phonenumberController.text =  dateBody![date][index]['numbers'][0];
                            _customerNameController.text = dateBody![date][index]['name'];
                            _adressController.text = dateBody![date][index]['address'];
                            _codController.text = dateBody![date][index]['COD'].toString();

                            if( isDiscarded){
                              _reasonController.text =  dateBody![date][index]['discarded']['reason'];
                            }

                            // Show a pop-up when a list item is tapped
                            showDialog(
                              context: context,
                              builder: (BuildContext context) {
                                return AlertDialog(
                                  title:  Container(
                                    alignment: Alignment.center,
                                    child: Text(
                                      '${dateBody![date][index]['id']}',

                                    ),
                                  ),
                                  content: SingleChildScrollView(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                                Text(
                                                  'Name :  ',

                                                ),

                                                Expanded(child:

                                                TextField(
                                                  controller: _customerNameController,
                                                  decoration: InputDecoration(
                                                    hintText: 'Type something...',
                                                    hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                  ),
                                                  onSubmitted: (value) {
                                                    dateBody![date][index]['name'] = _customerNameController.text;
                                                    refresh();

                                                  },)),

                                               ]
                                          ),),
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                          Text(
                                            'Phone :  ',

                                          ),

                                                Expanded(child:

                                                TextField(
                                                    controller: _phonenumberController,
                                                    decoration: InputDecoration(
                                                      hintText: 'Type something...',
                                                      hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                    ),
                                                    onSubmitted: (value) {
                                                     dateBody![date][index]['numbers'][0] = _phonenumberController.text;
                                                     refresh();

                                                    },)),

                                                IconButton(
                                                  icon: Icon(Icons.call),
                                                  onPressed: () async {
                                                    String phoneNumber = dateBody![date][index]['numbers'][0];
                                                    String url = 'tel:$phoneNumber';

                                                    if (await canLaunch(url)) {
                                                      await launch(url);
                                                    } else {
                                                      // Handle error, e.g., show a message to the user
                                                      print('Could not launch $url');
                                                    }
                                                  },
                                                ),]
                                        ),),
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                                Text(
                                                  'Address :  ',

                                                ),

                                                Expanded(child:

                                                TextField(
                                                  controller: _adressController,
                                                  decoration: InputDecoration(
                                                    hintText: 'Type something...',
                                                    hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                  ),
                                                  maxLines: null, // Set maxLines to null for multiline
                                                  keyboardType: TextInputType.multiline, // Allow multiline input
                                                  textInputAction: TextInputAction.done,
                                                  onSubmitted: (value) {
                                                    dateBody![date][index]['address'] = _adressController.text;
                                                    refresh();

                                                  },)),

                                                IconButton(
                                                  icon: Icon(Icons.pin_drop),
                                                  onPressed: ()  {
                                                    _openMap(dateBody![date][index]['address']);
                                                  },
                                                ),]
                                          ),),
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                                Text(
                                                  'COD :  ',

                                                ),

                                                Expanded(child:

                                                TextField(
                                                  controller:  _codController,
                                                  decoration: InputDecoration(
                                                    hintText: 'Type something...',
                                                    hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                  ),

                                                  onSubmitted: (value) {
                                                    dateBody![date][index]['COD'] =  _codController.text;
                                                    refresh();

                                                  },)),

                                              ]
                                          ),),

                                        isDiscarded == true ?
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                                Text(
                                                  'Reason :  ',

                                                ),

                                                Expanded(child:

                                                TextField(
                                                  controller: _reasonController,
                                                  decoration: InputDecoration(
                                                    hintText: 'Type something...',
                                                    hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                  ),
                                                  onSubmitted: (value) {
                                                    dateBody![date][index]['discarded']['reason'] = _reasonController.text;
                                                    refresh();

                                                  },)),

                                              ]
                                          ),)
                                        : SizedBox.shrink()
                                      ],
                                    ),
                                  ),
                                  actions: [

                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                      children: [
                                        isDiscarded == false ?
                                        Expanded(
                                          child: ElevatedButton(
                                            onPressed: () {
                                              Navigator.pop(context);
                                                dateBody![date][index]['select'] = true;
                                              refresh();

                                            },
                                            child: Icon(Icons.done),
                                            style: ElevatedButton.styleFrom(
                                              primary: Colors.blue,
                                            ),
                                          ),
                                        )
                                        :  SizedBox.shrink()

                                        ,

                                        isDiscarded == false ?
                                        SizedBox(width: 8)
                                            :  SizedBox.shrink()
                                        ,

                                        isDiscarded == false ?

                                        Expanded(
                                          child: ElevatedButton(
                                            onPressed : () {
                                              Navigator.pop(context);
                                              showDialog(
                                                context: context,
                                                builder: (BuildContext context) {
                                                  return AlertDialog(
                                                    title: Text('Reason for Discarding',
                                                      ),
                                                    content:
                                                    SingleChildScrollView(
                                                    child:
                                                    Column(
                                                      children: [
                                                        TextField(
                                                          controller: _reasonController,
                                                          decoration: InputDecoration(
                                                            hintText: 'Type your reason here',
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                      actions : [
                                                      Row(
                                                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                                      children: [

                                                        Expanded(
                                                      child: ElevatedButton(
                                                          child: Icon(Icons.save),
                                                          style: ElevatedButton.styleFrom(
                                                            primary: Colors.grey,
                                                          ),
                                                      onPressed : () {
                                                        dateBody![date][index]['discarded']['state'] = true;
                                                        dateBody![date][index]['discarded']['reason'] = _reasonController.text;
                                                        dateBody![date][index]['delivering'] = false;
                                                        dateBody![date][index]['delivered'] = false;
                                                        dateBody![date][index]['select'] = false;
                                                              Navigator.pop(context);})),
                                                        SizedBox(width: 8),
                                                        Expanded(
                                                            child: ElevatedButton(
                                                                child: Icon(Icons.cancel),
                                                                style: ElevatedButton.styleFrom(
                                                                  primary: Colors.grey,
                                                                ),
                                                                onPressed : () {
                                                                  Navigator.pop(context);}))
                                                      ]
                                                      )
                                                      ]
                                                  );

                                                },).then((value)
                                                  {_reasonController.clear();
                                                  refresh();});


                                            },
                                            child: Icon(Icons.delete),
                                            style: ElevatedButton.styleFrom(
                                              primary: Colors.grey,
                                            ),
                                          ),
                                        )
                                        :
                                        Expanded(
                                          child: ElevatedButton(
                                            onPressed: () {
                                              Navigator.pop(context);
                                              dateBody![date][index]['discarded']['state'] = false;
                                              dateBody![date][index]['discarded']['reason'] = -1;
                                              dateBody![date][index]['delivering'] = false;
                                              dateBody![date][index]['delivered'] = false;
                                              dateBody![date][index]['select'] = false;
                                              refresh();

                                            },
                                            child: Icon(Icons.restore),
                                            style: ElevatedButton.styleFrom(
                                              primary: Colors.blue,
                                            ),
                                          ),
                                        )
                                        ,

                                      ],
                                    )


                                  ],

                                );

                              },
                            ).then((value) {
                              _reasonController.clear();
                              refresh();
                            });

                          },
                        ),
                      );}

                    },
                  )
                      : Text('No response data available.'),

              ),
              Center(
                child: dateBody?[date] != null
                    ? ListView.builder(
                  itemCount: dateBody?[date]?.length ?? 0,
                  itemBuilder: (context, index) {
                    bool isCardSelected = dateBody![date][index]['select'] == true;
                    bool isCardNotDelivered = (dateBody![date][index]['delivered'] == false);
                    bool isNotDelivering = dateBody![date][index]['delivering'] == false;
                    bool isDiscarded = dateBody![date][index]['discarded']['state'] == true;

                    print(dateBody![date][index]['delivered']);
                    // Skip cards that are already selected
                    if (isCardSelected & isCardNotDelivered & !isDiscarded ) {

                      Color cardColor = Colors.white; // Default color

                    if(!isNotDelivering){


                        deliveringdata["status"] = true;
                        deliveringdata["address"] = dateBody![date][index]["address"];
                      return AnimatedBuilder(
                          animation: _animationController,
                      builder: (context, child) {
                      return Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                        color: _colorTween.evaluate(_animationController),
                        elevation: 3, // Add some elevation for a subtle shadow effect
                        margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                        child: ListTile(
                          title: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [Text('${dateBody![date][index]['name'].toString()}'),
                              Text('Rs . ${dateBody![date][index]['COD'].toString()}')],),
                          subtitle: Text(dateBody![date][index]['address'].toString()),
                          onTap: () {

                            _phonenumberController.text =  dateBody![date][index]['numbers'][0];
                            _customerNameController.text = dateBody![date][index]['name'];
                            _adressController.text = dateBody![date][index]['address'];
                            _codController.text = dateBody![date][index]['COD'].toString();

                            showDialog(
                              context: context,
                              builder: (BuildContext context) {
                                return AlertDialog(
                                  title:  Container(
                                    alignment: Alignment.center,
                                    child: Text(
                                      '${dateBody![date][index]['id']}',

                                    ),
                                  ),
                                  content: SingleChildScrollView(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                                Text(
                                                  'Name :  ',

                                                ),

                                                Expanded(child:

                                                TextField(
                                                  controller: _customerNameController,
                                                  decoration: InputDecoration(
                                                    hintText: 'Type something...',
                                                    hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                  ),
                                                  onSubmitted: (value) {
                                                    dateBody![date][index]['name'] = _customerNameController.text;
                                                    refresh();

                                                  },)),

                                              ]
                                          ),),
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                                Text(
                                                  'Phone :  ',

                                                ),

                                                Expanded(child:

                                                TextField(
                                                  controller: _phonenumberController,
                                                  decoration: InputDecoration(
                                                    hintText: 'Type something...',
                                                    hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                  ),
                                                  onSubmitted: (value) {
                                                    dateBody![date][index]['numbers'][0] = _phonenumberController.text;
                                                    refresh();

                                                  },)),

                                                IconButton(
                                                  icon: Icon(Icons.call),
                                                  onPressed: () async {
                                                    String phoneNumber = dateBody![date][index]['numbers'][0];
                                                    String url = 'tel:$phoneNumber';

                                                    if (await canLaunch(url)) {
                                                      await launch(url);
                                                    } else {
                                                      // Handle error, e.g., show a message to the user
                                                      print('Could not launch $url');
                                                    }
                                                  },
                                                ),]
                                          ),),
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                                Text(
                                                  'Address :  ',

                                                ),

                                                Expanded(child:

                                                TextField(
                                                  controller: _adressController,
                                                  decoration: InputDecoration(
                                                    hintText: 'Type something...',
                                                    hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                  ),
                                                  maxLines: null, // Set maxLines to null for multiline
                                                  keyboardType: TextInputType.multiline, // Allow multiline input
                                                  textInputAction: TextInputAction.done,
                                                  onSubmitted: (value) {
                                                    dateBody![date][index]['address'] = _adressController.text;
                                                    refresh();

                                                  },)),

                                                IconButton(
                                                  icon: Icon(Icons.pin_drop),
                                                  onPressed: ()  {
                                                    print('Map');
                                                  },
                                                ),]
                                          ),),
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                                Text(
                                                  'COD :  ',

                                                ),

                                                Expanded(child:

                                                TextField(
                                                  controller:  _codController,
                                                  decoration: InputDecoration(
                                                    hintText: 'Type something...',
                                                    hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                  ),

                                                  onSubmitted: (value) {
                                                    dateBody![date][index]['COD'] =  _codController.text;
                                                    refresh();

                                                  },)),

                                              ]
                                          ),),
                                      ],
                                    ),
                                  ),
                                  actions: [
                                     Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                      children: [
                                        Expanded(
                                          child: ElevatedButton(
                                            onPressed: () {
                                              Navigator.pop(context);

                                                dateBody![date][index]['delivered'] = true;
                                              dateBody![date][index]['discarded']['state'] = false;
                                              dateBody![date][index]['discarded']['reason'] = -1;
                                              dateBody![date][index]['delivering'] = false;
                                              dateBody![date][index]['select'] = false;
                                              refresh();
                                            },
                                            child: Icon(Icons.done_all),
                                            style: ElevatedButton.styleFrom(
                                              primary: Colors.blue,
                                            ),
                                          ),
                                        ),
                                        SizedBox(width: 8),
                                        isNotDelivering == true ?
                                        Expanded(
                                          child: ElevatedButton(
                                            onPressed: () {
                                              Navigator.pop(context);

                                              dateBody?[date].forEach((order) {
                                                if (order is Map<String, dynamic>) {

                                                    if (order['delivering'] == true) {;
                                                      order['delivering'] = false;
                                                    }

                                                }
                                              });

                                                dateBody![date][index]['delivering'] = true;
                                              refresh();
                                              // Your action for the second button
                                            },
                                            child: Icon(Icons.delivery_dining_outlined),
                                            style: ElevatedButton.styleFrom(
                                              primary: Colors.green,
                                            ),
                                          ),
                                        ):
                                        SizedBox.shrink(),
                                        SizedBox(width: 8),
                                        Expanded(
                                          child: ElevatedButton(
                                            onPressed : () {
                                              Navigator.pop(context);
                                              showDialog(
                                                context: context,
                                                builder: (BuildContext context) {
                                                  return AlertDialog(
                                                      title: Text('Reason for Discarding'),
                                                      content:
                                                      SingleChildScrollView(
                                                        child:
                                                        Column(
                                                          children: [
                                                            TextField(
                                                              controller: _reasonController,
                                                              decoration: InputDecoration(
                                                                hintText: 'Type your reason here',
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                      actions : [
                                                        Row(
                                                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                                            children: [

                                                              Expanded(
                                                                  child: ElevatedButton(
                                                                      child: Icon(Icons.save),
                                                                      style: ElevatedButton.styleFrom(
                                                                        primary: Colors.grey,
                                                                      ),
                                                                      onPressed : () {
                                                                        dateBody![date][index]['discarded']['state'] = true;
                                                                        dateBody![date][index]['discarded']['reason'] = _reasonController.text;
                                                                        dateBody![date][index]['delivering'] = false;
                                                                        dateBody![date][index]['delivered'] = false;
                                                                        dateBody![date][index]['select'] = false;
                                                                        Navigator.pop(context);})),
                                                              SizedBox(width: 8),
                                                              Expanded(
                                                                  child: ElevatedButton(
                                                                      child: Icon(Icons.cancel),
                                                                      style: ElevatedButton.styleFrom(
                                                                        primary: Colors.grey,
                                                                      ),
                                                                      onPressed : () {
                                                                        Navigator.pop(context);}))
                                                            ]
                                                        )
                                                      ]
                                                  );

                                                },).then((value)
                                              {_reasonController.clear();
                                              refresh();});


                                            },
                                            child: Icon(Icons.delete),
                                            style: ElevatedButton.styleFrom(
                                              primary: Colors.grey,
                                            ),
                                          ),
                                        )




                                      ],
                                    )

                                  ],

                                );

                              },
                            ).then((value) {
                              // Code to be executed after the dialog is closed
                              setState(() {
                                // Update state or perform other actions
                              });
                            });

                          },
                        ),
                      );});}
                    else{
                      return Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                        color: cardColor,
                        elevation: 3, // Add some elevation for a subtle shadow effect
                        margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                        child: ListTile(
                          title: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [Text('${dateBody![date][index]['name'].toString()}'),
                              Text('Rs . ${dateBody![date][index]['COD'].toString()}')],),
                          subtitle: Text(dateBody![date][index]['address'].toString()),
                          onTap: () {

                            _phonenumberController.text =  dateBody![date][index]['numbers'][0];
                            _customerNameController.text = dateBody![date][index]['name'];
                            _adressController.text = dateBody![date][index]['address'];
                            _codController.text = dateBody![date][index]['COD'].toString();

                            showDialog(
                              context: context,
                              builder: (BuildContext context) {
                                return AlertDialog(
                                  title:  Container(
                                    alignment: Alignment.center,
                                    child: Text(
                                      '${dateBody![date][index]['id']}',

                                    ),
                                  ),
                                  content: SingleChildScrollView(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                                Text(
                                                  'Name :  ',

                                                ),

                                                Expanded(child:

                                                TextField(
                                                  controller: _customerNameController,
                                                  decoration: InputDecoration(
                                                    hintText: 'Type something...',
                                                    hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                  ),
                                                  onSubmitted: (value) {
                                                    dateBody![date][index]['name'] = _customerNameController.text;
                                                    refresh();

                                                  },)),

                                              ]
                                          ),),
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                                Text(
                                                  'Phone :  ',

                                                ),

                                                Expanded(child:

                                                TextField(
                                                  controller: _phonenumberController,
                                                  decoration: InputDecoration(
                                                    hintText: 'Type something...',
                                                    hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                  ),
                                                  onSubmitted: (value) {
                                                    dateBody![date][index]['numbers'][0] = _phonenumberController.text;
                                                    refresh();

                                                  },)),

                                                IconButton(
                                                  icon: Icon(Icons.call),
                                                  onPressed: () async {
                                                    String phoneNumber = dateBody![date][index]['numbers'][0];
                                                    String url = 'tel:$phoneNumber';

                                                    if (await canLaunch(url)) {
                                                      await launch(url);
                                                    } else {
                                                      // Handle error, e.g., show a message to the user
                                                      print('Could not launch $url');
                                                    }
                                                  },
                                                ),]
                                          ),),
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                                Text(
                                                  'Address :  ',

                                                ),

                                                Expanded(child:

                                                TextField(
                                                  controller: _adressController,
                                                  decoration: InputDecoration(
                                                    hintText: 'Type something...',
                                                    hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                  ),
                                                  maxLines: null, // Set maxLines to null for multiline
                                                  keyboardType: TextInputType.multiline, // Allow multiline input
                                                  textInputAction: TextInputAction.done,
                                                  onSubmitted: (value) {
                                                    dateBody![date][index]['address'] = _adressController.text;
                                                    refresh();

                                                  },)),

                                                IconButton(
                                                  icon: Icon(Icons.pin_drop),
                                                  onPressed: ()  {
                                                    print('Map');
                                                  },
                                                ),]
                                          ),),
                                        Container(
                                          alignment: Alignment.center,
                                          child:
                                          Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [

                                                Text(
                                                  'COD :  ',

                                                ),

                                                Expanded(child:

                                                TextField(
                                                  controller:  _codController,
                                                  decoration: InputDecoration(
                                                    hintText: 'Type something...',
                                                    hintStyle: TextStyle(fontWeight: FontWeight.bold,),
                                                  ),

                                                  onSubmitted: (value) {
                                                    dateBody![date][index]['COD'] =  _codController.text;
                                                    refresh();

                                                  },)),

                                              ]
                                          ),),
                                      ],
                                    ),
                                  ),
                                  actions: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                      children: [
                                        Expanded(
                                          child: ElevatedButton(
                                            onPressed: () {
                                              Navigator.pop(context);

                                              dateBody![date][index]['delivered'] = true;
                                              refresh();
                                            },
                                            child: Icon(Icons.done_all),
                                            style: ElevatedButton.styleFrom(
                                              primary: Colors.blue,
                                            ),
                                          ),
                                        ),
                                        SizedBox(width: 8),
                                        isNotDelivering == true ?
                                        Expanded(
                                          child: ElevatedButton(
                                            onPressed: () {
                                              Navigator.pop(context);

                                              dateBody?[date].forEach((order) {
                                                if (order is Map<String, dynamic>) {

                                                  if (order['delivering'] == true) {;
                                                  order['delivering'] = false;
                                                  }

                                                }
                                              });

                                              dateBody![date][index]['delivering'] = true;
                                              refresh();
                                              // Your action for the second button
                                            },
                                            child: Icon(Icons.delivery_dining_outlined),
                                            style: ElevatedButton.styleFrom(
                                              primary: Colors.green,
                                            ),
                                          ),
                                        ):
                                        SizedBox.shrink(),
                                        SizedBox(width: 8),
                                        Expanded(
                                          child: ElevatedButton(
                                            onPressed : () {
                                              Navigator.pop(context);
                                              showDialog(
                                                context: context,
                                                builder: (BuildContext context) {
                                                  return AlertDialog(
                                                      title: Text('Reason for Discarding'),
                                                      content:
                                                      SingleChildScrollView(
                                                        child:
                                                        Column(
                                                          children: [
                                                            TextField(
                                                              controller: _reasonController,
                                                              decoration: InputDecoration(
                                                                hintText: 'Type your reason here',
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                      actions : [
                                                        Row(
                                                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                                            children: [

                                                              Expanded(
                                                                  child: ElevatedButton(
                                                                      child: Icon(Icons.save),
                                                                      style: ElevatedButton.styleFrom(
                                                                        primary: Colors.grey,
                                                                      ),
                                                                      onPressed : () {
                                                                        dateBody![date][index]['discarded']['state'] = true;
                                                                        dateBody![date][index]['discarded']['reason'] = _reasonController.text;
                                                                        dateBody![date][index]['delivering'] = false;
                                                                        dateBody![date][index]['delivered'] = false;
                                                                        dateBody![date][index]['select'] = false;
                                                                        Navigator.pop(context);})),
                                                              SizedBox(width: 8),
                                                              Expanded(
                                                                  child: ElevatedButton(
                                                                      child: Icon(Icons.cancel),
                                                                      style: ElevatedButton.styleFrom(
                                                                        primary: Colors.grey,
                                                                      ),
                                                                      onPressed : () {
                                                                        Navigator.pop(context);}))
                                                            ]
                                                        )
                                                      ]
                                                  );

                                                },).then((value)
                                              {_reasonController.clear();
                                              refresh();});


                                            },
                                            child: Icon(Icons.delete),
                                            style: ElevatedButton.styleFrom(
                                              primary: Colors.grey,
                                            ),
                                          ),
                                        )




                                      ],
                                    )

                                  ],

                                );

                              },
                            ).then((value) {
                              // Code to be executed after the dialog is closed
                              setState(() {
                                // Update state or perform other actions
                              });
                            });

                          },
                        ),
                      );}}
                    else{
                      return SizedBox.shrink();
                      }

                  },
                )
                    : Text('No response data available.'),

              ),
              Center(

        child: dateBody?[date] != null
      ? ListView.builder(
      itemCount: dateBody?[date]?.length ?? 0,
        itemBuilder: (context, index) {
          bool isCardSelected = dateBody![date][index]['select'] == true;
          bool isCardDelivered = (dateBody![date][index]['delivered'] == true);

          print(dateBody![date][index]['delivered']);
          // Skip cards that are already selected
          if (isCardSelected & isCardDelivered ) {

            Color cardColor = Colors.white; // Default color

            return
             Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10.0),
              ),
              color: cardColor,
              elevation: 3, // Add some elevation for a subtle shadow effect
              margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              child: ListTile(
                title: Text(dateBody![date][index]['name'].toString()),
                subtitle: Text(dateBody![date][index]['address'].toString()),
                onTap: () {
                  // Show a pop-up when a list item is tapped
                  showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return AlertDialog(
                        title: Text('${dateBody![date][index]['id']}'),
                        content: SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Customer Name: ${dateBody![date][index]['name']}'),
                              Row(
                                children: [
                                  Expanded(
                                    child: Text('Phone Number: ${dateBody![date][index]['numbers'][0]}'),
                                  ),
                                  IconButton(
                                    icon: Icon(Icons.call),
                                    onPressed: () async {
                                      String phoneNumber = dateBody![date][index]['numbers'][0];
                                      String url = 'tel:$phoneNumber';

                                      if (await canLaunch(url)) {
                                        await launch(url);
                                      } else {
                                        // Handle error, e.g., show a message to the user
                                        print('Could not launch $url');
                                      }
                                    },
                                  ),
                                ],
                              ),
                              Text('Address: ${dateBody![date][index]['address']}'),
                              Text('COD: ${dateBody![date][index]['COD']}'),
                            ],
                          ),
                        ),


                      );

                    },
                  ).then((value) {
                    // Code to be executed after the dialog is closed
                    setState(() {
                      // Update state or perform other actions
                    });
                  });

                },
              ),
            );

          }

          else{
            return SizedBox.shrink();
          }

        },
      )
            : Text('No response data available.'),),

            ],
          ),
          floatingActionButton: FloatingActionButton(
            onPressed: () {
              if(deliveringdata["status"]){
              _openNavigation(deliveringdata["address"]);}
              else{
                AlertDialog(
                  title:  Container(
                    alignment: Alignment.center,
                    child: Text(
                      'Select Next Stop',

                    ),
                  ),
                  content: Text("Please select your next stop for navigation"),
                  actions: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.pop(context);

                              refresh();
                            },
                            child: Icon(Icons.close),
                            style: ElevatedButton.styleFrom(
                              primary: Colors.blue,
                            ),
                          ),
                        ),


                      ],
                    )

                  ],

                );
              }
            },
            child: Icon(Icons.navigation ,color: Colors.white,),
            backgroundColor:  Colors.blue ,
          ),
        ),
      ),
    );
  }

}
