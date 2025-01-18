import { useContext } from "react";
import { TicketList } from "../../components/orderview/TicketList";
import { OrderType } from "../../utils/Model";
import TabViewComponent from "./TableView";
import { OrderContext } from "../../components/context/OrderProvider";
import { StyleSheet, Text, View } from "react-native";

export const DeliveredList: React.FC = () => {

       const { orders } = useContext(OrderContext);

       return (
          <>
          {(() => {
          
          const deliveredOrders = Object.values(orders.delivered).flat().slice(0, 2);
          return deliveredOrders.length !== 0 ? (
                  <TabViewComponent/>
          ) : (
                  <View style={styles.noRecordsContainer}>
                  <Text style={styles.noRecordsText}>No orders to be showed </Text>
                  </View>
          );
          })()
          }
          </>
        );
            
  };


  const styles = StyleSheet.create({
       header: {
         flexDirection: 'row',
         alignItems: 'center',
         padding: 10,
         backgroundColor: 'white',
         borderBottomWidth: 1,
         borderBottomColor: '#dd3',
         justifyContent: 'space-between',
       },
       searchWrapper: {
         flexDirection: 'row',
         alignItems: 'center',
         flex: 1,
       },
       searchContainer: {
         flexDirection: 'row',
         alignItems: 'center',
         marginLeft: 10,
         backgroundColor: 'white',
         borderBottomWidth: 1,
         borderBottomColor: '#ddd',
         flex: 1,
       },
       searchInput: {
         borderBottomWidth: 1,
         borderBottomColor: '#ddd',
         padding: 5,
         marginRight: 10,
         flex: 1,
       },
       searchButton: {
         padding: 10,
         borderRadius: 5,
         alignItems: 'center',
       },
       searchButtonText: {
         color: 'black',
         fontWeight: 'bold',
       },
       uploadButton: {
         marginLeft: 10,
         marginRight: 10,
       },
       noRecordsContainer: {
         flex: 1,
         justifyContent: 'center',
         alignItems: 'center',
       },
       noRecordsText: {
         color: '#888',
         fontWeight: 'bold',
       },
       loadingContainer: {
         flex: 1,
         justifyContent: 'center',
         alignItems: 'center',
       },
     });