import React, { useContext } from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { OrderContext, TicketProvider } from './components/context/OrderProvider';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AnalysisMap, CreateOrderMap, DashboardMap, DeliveredMap, GeodMap, ReturnedMap, UploadOrderMap } from './pages/PageMap';
import CustomDrawerContent from './components/drawercontent/DrawerContent';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './pages/login/Login';
import Badge from './components/badge/Badge';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const Home = () => {
  return (
    <TicketProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={AppDrawer}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </TicketProvider>
  );
};

const AppDrawer = () => {
  const { orderCount } = useContext(OrderContext);

  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardMap} 
        options={({ navigation }) => ({
          title: 'Hand-On Packages',
          drawerIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Icon name="cube" color={color} size={size} />
            </View>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 10 }}>
              <Icon
                name="search"
                size={24}
                color="black"
                onPress={() => navigation.navigate('Dashboard Search')}
                style={{ marginRight: 20 }}
              />
            </View>
          ),
        })}
      />
      <Drawer.Screen 
        name="Delivered" 
        component={DeliveredMap}
        options={({ navigation }) => ({
          title: 'Delivered Orders',
          drawerIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Icon name="check-circle" color={color} size={size} />
              <Badge count={orderCount.delivered} /> 
            </View>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 10 }}>
              <Icon
                name="search"
                size={24}
                color="black"
                onPress={() => navigation.navigate('Delivered Search')}
                style={{ marginRight: 20 }}
              />
            </View>
          ),
        })}
      />
      <Drawer.Screen 
        name="Returned" 
        component={ReturnedMap} 
        options={({ navigation }) => ({
          title: 'Returned Orders',
          drawerIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Icon name="arrow-circle-left" color={color} size={size} />
              <Badge count={orderCount.rejected} /> 
            </View>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 10 }}>
              <Icon
                name="search"
                size={24}
                color="black"
                onPress={() => navigation.navigate('Returned Search')}
                style={{ marginRight: 20 }}
              />
            </View>
          ),
        })}
      />

      <Drawer.Screen 
        name="Create" 
        component={CreateOrderMap} 
        options={({ navigation }) => ({
          title: 'Create Custom Order',
          drawerIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Icon name="edit" color={color} size={size} />
            </View>
          ),
        })}
      />

      <Drawer.Screen 
        name="Upload" 
        component={UploadOrderMap} 
        options={({ navigation }) => ({
          title: 'Upload',
          drawerIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Icon name="cloud-upload" color={color} size={size} />
            </View>
          ),
        })}
      />
      <Drawer.Screen 
        name="Map" 
        component={GeodMap} 
        options={{
          title: 'Customer Map',
          drawerIcon: ({ color, size }) => (
            <Icon name="map-o" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen 
        name="Analysis" 
        component={AnalysisMap} 
        options={({ navigation }) => ({
          title: 'Analysis',
          drawerIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Icon name="bar-chart" color={color} size={size} />
            </View>
          ),
        })}
      />
    </Drawer.Navigator>
  );
};

export default Home;
