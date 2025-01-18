import React, { useContext, useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { OrderContext } from '../../components/context/OrderProvider';
import { dbUtils } from '../../utils/DbUtils';
import TabViewComponent from './TableView';

const Dashboard: React.FC = () => {
  const { initializeOrders, orders } = useContext(OrderContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const storedOrders = await dbUtils.getAllOrders();
        if (storedOrders) {
          initializeOrders(storedOrders);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const combinedOrders = useMemo(() => {
    const deliveringOrders = Object.values(orders.delivering).flat().slice(0, 2);
    const pendingOrders = Object.values(orders.pending).flat().slice(0, 2);
    return [...deliveringOrders, ...pendingOrders];
  }, [orders]);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {combinedOrders.length > 0 ? (
        <TabViewComponent />
      ) : (
        <View style={styles.noRecordsContainer}>
          <Text style={styles.noRecordsText}>No orders to be showed </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default Dashboard;
