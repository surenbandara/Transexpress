import { useContext, useEffect, useState } from "react";
import { OrderContext } from "../context/OrderProvider";
import { OrderType } from "../../utils/Model";
import { FlatList } from "react-native-gesture-handler";
import OrderTicket from "./OrderTicket";
import { totalPriceCalculator } from "../../utils/Services";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native";

export const TicketList: React.FC<{ state: OrderType }> = ({ state }) => {
  const { orders, orderTotal, orderCount} = useContext(OrderContext);
  const [ relatedOrders, setRelatedOrders] = useState(orders[state]);

  useEffect(() => {
    setRelatedOrders(orders[state]);
  }, [orders[state]]);


  const renderItem = ({ item}) => (<OrderTicket order={item} />);

  return (
    <View style={styles.container}>
      <FlatList
        data={relatedOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          orderTotal.delivered > 0 && { paddingBottom: 80 }, 
        ]}
        initialNumToRender={5}
        maxToRenderPerBatch={3}
        windowSize={3}

      />
      {orderTotal.delivered > 0 && state === OrderType.DELIVERED && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Total Price: Rs. {orderTotal.delivered}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555'
  },
});
