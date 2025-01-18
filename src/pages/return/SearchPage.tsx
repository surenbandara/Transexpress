import React, { useContext, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Order, Orders } from '../../utils/Model';
import { OrderContext } from '../../components/context/OrderProvider';
import OrderTicket from '../../components/orderview/OrderTicket';
import { filterOrders } from '../../utils/Services';

const SearchPageReturned: React.FC = () => {
  const { orders } = useContext(OrderContext);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<Orders>();

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const updatedFilteredOrders: any = {
      rejected: []
    };

    Object.keys(orders).forEach((key) => {
      const orderKey = key as keyof Orders;
      updatedFilteredOrders[orderKey] = filterOrders(orders[orderKey] , query);
    });

    setFilteredOrders(updatedFilteredOrders);
  };

  const renderSection = (title: string, orders: Order[]) => {
    if (orders.length === 0) return null;

    return (
      <View key={title} style={styles.sectionContainer}>
        <View style={styles.sectionHeaderContainer}>
          <View style={styles.line} />
          <Text style={styles.sectionHeader}>{title}</Text>
          <View style={styles.line} />
        </View>

        {orders.map(order => (
          <View key={order.id} >
            <OrderTicket order={order}></OrderTicket>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        placeholderTextColor="#555" 
        value={searchQuery}
        onChangeText={handleSearchChange}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredOrders && (
          <>
            {renderSection('Rejected', filteredOrders.rejected)}
          </>
        )}
        {!filteredOrders || 
        (filteredOrders.rejected.length === 0 ) && (
          <Text style={styles.noResults}>No results found</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    color: '#555'
  },
  scrollContainer: {
    paddingBottom: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  sectionHeader: {
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555'
  },
  ticketContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ticketName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ticketDetails: {
    fontSize: 12,
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});

export default SearchPageReturned;
