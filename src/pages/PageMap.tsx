import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Dashboard from "./dashboard/Dashboard";
import EditRecordPage from "./common/EditRecordPage";
import RemoveRecordPage from "./common/RemoveRecordPage";
import { DeliveredList } from "./delivered/DeliveredList";
import { ReturnList } from "./return/ReturnList";
import Map from "../components/map/Map";
import SearchPageDashboard from "./dashboard/SearchPage";
import SearchPageDelivered from "./delivered/SearchPage";
import SearchPageReturned from "./return/SearchPage";
import GeoLocationConfirmationPage from "./dashboard/GeoLocationConfirmation";
import CreateRecordPage from "./create/CreateOrder";
import Upload from "./upload/ExcelUploader";
import TestChart from "./analysis/AnalysisPage";

const Stack = createNativeStackNavigator();

export function DashboardMap({ navigation }) {

    return (
          <Stack.Navigator initialRouteName="DashboardHome">
            <Stack.Screen name="DashboardHome" component={Dashboard} options={{ headerShown: false }}  />
            <Stack.Screen name="Edit Record" component={EditRecordPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Reschedule/Return Record" component={RemoveRecordPage}  options={{ headerShown: false }}/>
            <Stack.Screen name="Dashboard Search" component={SearchPageDashboard} options={{ headerShown: false }}/>
            <Stack.Screen name="GeoLocationConfirmation" component={GeoLocationConfirmationPage} options={{ headerShown: false }}/>
          </Stack.Navigator>
    );
}

export function DeliveredMap({ navigation }) {

    return (
          <Stack.Navigator initialRouteName="DeliveredHome">
            <Stack.Screen name="DeliveredHome" component={DeliveredList} options={{ headerShown: false }}  />
            <Stack.Screen name="Edit Record" component={EditRecordPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Delivered Search" component={SearchPageDelivered} options={{ headerShown: false }}/>
          </Stack.Navigator>
    );
}

export function ReturnedMap({ navigation }) {

  return (
        <Stack.Navigator initialRouteName="ReturnedHome">
          <Stack.Screen name="ReturnedHome" component={ReturnList} options={{ headerShown: false }}  />
          <Stack.Screen name="Edit Record" component={EditRecordPage} options={{ headerShown: false }}/>
          <Stack.Screen name="Reschedule/Return Record" component={RemoveRecordPage}  options={{ headerShown: false }}/>
          <Stack.Screen name="Returned Search" component={SearchPageReturned} options={{ headerShown: false }}/>
        </Stack.Navigator>
  );
}

export function CreateOrderMap({ navigation }) {

  return (
        <Stack.Navigator initialRouteName="CreateOrderHome">
          <Stack.Screen name="CreateOrderHome" component={CreateRecordPage} options={{ headerShown: false }}  />
        </Stack.Navigator>
  );
}

export function UploadOrderMap({ navigation }) {

  return (
        <Stack.Navigator initialRouteName="UploadOrderHome">
          <Stack.Screen name="UploadOrderHome" component={Upload} options={{ headerShown: false }}  />
        </Stack.Navigator>
  );
}

export function GeodMap({ navigation }) {

  return (
        <Stack.Navigator initialRouteName="GeoHome">
          <Stack.Screen name="GeoHome" component={Map} options={{ headerShown: false }}  />
        </Stack.Navigator>
  );
}

export function AnalysisMap({ navigation }) {

  return (
        <Stack.Navigator initialRouteName="AnalysisHome">
          <Stack.Screen name="AnalysisHome" component={TestChart} options={{ headerShown: false }}  />
        </Stack.Navigator>
  );
}