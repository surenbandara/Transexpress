import React, { useContext } from 'react';
import { StyleSheet, useWindowDimensions, View, Text } from 'react-native';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { TicketList } from '../../components/orderview/TicketList';
import { OrderType } from '../../utils/Model';
import { OrderContext } from '../../components/context/OrderProvider';
import Badge from '../../components/badge/Badge';

const renderScene = SceneMap({
  pending: () => <TicketList state={OrderType.PENDING} />,
  delivering: () => <TicketList state={OrderType.DELIVERING} />,
});

const TabViewComponent: React.FC = () => {
  const layout = useWindowDimensions();
  const { orderCount } = useContext(OrderContext);

  return (
    <TabView
      navigationState={{
        index: 0,
        routes: [
          { key: 'pending', title: `Pending`, icon: 'pending-actions', count: orderCount.pending },
          { key: 'delivering', title: `Active`, icon: 'local-shipping', count: orderCount.delivering },
        ],
      }}
      renderScene={renderScene}
      onIndexChange={() => {}}
      initialLayout={{ width: layout.width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          style={styles.tabBar}
          indicatorStyle={styles.indicator}
          renderLabel={({ route, focused }) => (
            <View style={styles.tabContainer}>
              <View style={styles.iconWithBadge}>
                <Icon
                  name={route.icon}
                  size={24}
                  color={focused ? '#007bff' : '#888'} 
                />
                <Badge count={route.count} />
              </View>
              <Text style={[styles.label, { color: focused ? '#007bff' : '#888' }]}>
                {route.title}
              </Text>
            </View>
          )}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
  },
  indicator: {
    backgroundColor: '#007bff',
  },
  label: {
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
    textAlign: 'center',
  },
  iconWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabContainer: {
    alignItems: 'center',
  },
});

export default TabViewComponent;
