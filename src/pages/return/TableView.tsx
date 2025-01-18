import React, { useContext } from 'react';
import { TicketList } from '../../components/orderview/TicketList';
import { OrderType, Order } from '../../utils/Model';


const TabViewComponent: React.FC = () => {
  return (
    <TicketList state={OrderType.REJECTED} />
  );
};

export default TabViewComponent;

