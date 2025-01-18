import { createContext, ReactNode, useReducer } from "react";
import { Order, OrderContextType, Orders, OrdersCount, OrdersTotal, OrderType } from "../../utils/Model";
import { dbUtils } from "../../utils/DbUtils";
import { totalPriceCalculator } from "../../utils/Services";

type Action =
  | { type: 'SET_ORDERS'; payload: Orders }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'INSERT_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: Order };

interface State {
  orders: Orders;
  orderCount: OrdersCount;
  orderTotal: OrdersTotal;
}

const defaultOrders: Orders = {
  rejected: [],
  pending: [],
  delivering: [],
  delivered: [],
};

const defaultOrdersCount: OrdersCount = {
  rejected: 0,
  pending: 0,
  delivering: 0,
  delivered: 0,
};

const defaultOrdersTotal: OrdersTotal = {
  rejected: 0,
  pending: 0,
  delivering: 0,
  delivered: 0,
};

const initialState: State = {
  orders: defaultOrders,
  orderCount: defaultOrdersCount,
  orderTotal: defaultOrdersTotal,
};

const orderReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ORDERS':
      const dividedOrders = action.payload;
      const ordersCount: OrdersCount = {
        rejected: dividedOrders.rejected.length,
        pending: dividedOrders.pending.length,
        delivering: dividedOrders.delivering.length,
        delivered: dividedOrders.delivered.length,
      };

      const ordersTotal: OrdersTotal = {
        rejected: totalPriceCalculator(dividedOrders.rejected),
        pending: totalPriceCalculator(dividedOrders.pending),
        delivering: totalPriceCalculator(dividedOrders.delivering),
        delivered: totalPriceCalculator(dividedOrders.delivered),
      };

      return { ...state, orders: dividedOrders, orderCount: ordersCount, orderTotal: ordersTotal };

    case 'UPDATE_ORDER': {
      const updatedOrder = action.payload;
      const allOrders = [
        ...state.orders.rejected,
        ...state.orders.pending,
        ...state.orders.delivering,
        ...state.orders.delivered,
      ];
      const currentOrder = allOrders.find(order => order.id === updatedOrder.id);
      if (!currentOrder) return state;

      const newOrders = { ...state.orders };
      const filterOutOrder = (orders: Order[]) => orders.filter(order => order.id !== updatedOrder.id);
      
      if (currentOrder.orderType === updatedOrder.orderType) {
        newOrders[updatedOrder.orderType].splice(
          newOrders[updatedOrder.orderType].indexOf(currentOrder),
          1,
          updatedOrder
        );
      } else {
        newOrders[currentOrder.orderType] = filterOutOrder(newOrders[currentOrder.orderType]);
        newOrders[updatedOrder.orderType].push(updatedOrder);
      }

      const updatedOrdersCount: OrdersCount = {
        rejected: newOrders.rejected.length,
        pending: newOrders.pending.length,
        delivering: newOrders.delivering.length,
        delivered: newOrders.delivered.length,
      };

      const updatedOrdersTotal: OrdersTotal = {
        rejected: totalPriceCalculator(newOrders.rejected),
        pending: totalPriceCalculator(newOrders.pending),
        delivering: totalPriceCalculator(newOrders.delivering),
        delivered: totalPriceCalculator(newOrders.delivered),
      };

      return {
        ...state,
        orders: newOrders,
        orderCount: updatedOrdersCount,
        orderTotal: updatedOrdersTotal
      };
    }

    case 'INSERT_ORDER': {
      const newOrder = action.payload;
      const newOrders = { ...state.orders };
      newOrders[newOrder.orderType].push(newOrder);

      return {
        ...state,
        orders: newOrders,
        orderCount: {
          ...state.orderCount,
          [newOrder.orderType]: newOrders[newOrder.orderType].length,
        },
        orderTotal: {
          ...state.orderTotal,
          [newOrder.orderType]: totalPriceCalculator(newOrders[newOrder.orderType]),
        },
      };
    }

    case 'DELETE_ORDER': {
      const deleteOrder = action.payload;
      const newOrders = { ...state.orders };
      const filterOutOrder = (orders: Order[]) => orders.filter(order => order.id !== deleteOrder.id);

      newOrders[deleteOrder.orderType] = filterOutOrder(newOrders[deleteOrder.orderType]);

      return {
        ...state,
        orders: newOrders,
        orderCount: {
          ...state.orderCount,
          [deleteOrder.orderType]: newOrders[deleteOrder.orderType].length,
        },
        orderTotal: {
          ...state.orderTotal,
          [deleteOrder.orderType]: totalPriceCalculator(newOrders[deleteOrder.orderType]),
        },
      };
    }

    default:
      return state;
  }
};

const defaultContextValue: OrderContextType = {
  orders: defaultOrders,
  orderCount: defaultOrdersCount,
  orderTotal: defaultOrdersTotal,
  updateOrder: (updatedOrder : Order) => {},
  initializeOrders: (orders : Order[]) => {},
  insertOrder: (newOrder: Order) => {},
  deleteOrder: (deleteOrder: Order) => {}
};

export const OrderContext = createContext<OrderContextType>(defaultContextValue);

export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  const initializeOrders = (orders: Order[]) => {
    const dividedOrders = {
      rejected: orders.filter(order => order.orderType === OrderType.REJECTED),
      pending: orders.filter(order => order.orderType === OrderType.PENDING),
      delivering: orders.filter(order => order.orderType === OrderType.DELIVERING),
      delivered: orders.filter(order => order.orderType === OrderType.DELIVERED),
    };
    dispatch({ type: 'SET_ORDERS', payload: dividedOrders });
  };

  const insertOrder = async (newOrder: Order) => {
    await dbUtils.saveOrder(newOrder);
    dispatch({ type: 'INSERT_ORDER', payload: newOrder });
  };

  const deleteOrder = async (deleteOrder: Order) => {
    await dbUtils.deleteOrder(deleteOrder.id);
    dispatch({ type: 'DELETE_ORDER', payload: deleteOrder });
  };

  const updateOrder = async (updatedOrder: Order) : Promise<void> => {
    await dbUtils.updateOrder(updatedOrder.id, updatedOrder);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
  };

  return (
    <OrderContext.Provider value={{ ...state, initializeOrders, updateOrder, insertOrder, deleteOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
