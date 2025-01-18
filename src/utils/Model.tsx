export interface Order {
    COD: number;
    address: string;
    date: string;
    id: string;
    name: string;
    numbers: string[];
    orderType: OrderType;
    photo: boolean;
    updatedAt: number;
    notes?: string;
    rejectReason? : string|RejectReasons
  }

export enum OrderType {
  REJECTED = "rejected",
  PENDING = "pending", 
  DELIVERING = "delivering",
  DELIVERED = "delivered"
}

export interface Orders {
  rejected: Order[];
  pending: Order[];
  delivering: Order[];
  delivered: Order[];
}

export interface OrdersCount {
  rejected: number;
  pending: number;
  delivering: number;
  delivered: number;
}

export interface OrdersTotal {
  rejected: number;
  pending: number;
  delivering: number;
  delivered: number;
}

export interface OrderContextType {
  orders: Orders;
  orderCount: OrdersCount;
  orderTotal: OrdersTotal;
  updateOrder: (updatedOrder : Order) => void;
  initializeOrders: (orders : Order[]) => any;
  insertOrder: (newOrder: Order) => void;
  deleteOrder: (deleteOrder: Order) => void;
}

export interface CustomerGeoLocation {
  name: string;
  id: string;
  latitue: number;
  longtiude: number;
  location: string;
  originalLocation: string;
}

export enum RejectReasons {
  OUT_CITY = "Out of city",
  NO_ANSWER = "No answer",
  PHONE_OFF = "Phone off",
  UNABLE_TO_PAY = "Unable to pay",
  HAVENT_ORDERED = "Haven't ordered",
  PRICE_DIFFERENCE = "Price difference",
  WRONG_PACKAGE = "Wrong package",
  CUSTOMER_REQUEST_TO_UNPACK = "Customer request to unpack",
  BAD_WEATHER = "Bad weather",
  RESCHEDULED = "Rescheduled",
  OTHER = "Other"
}

export type RootStackParamList = {
  EditRecordPage: { order: Order };
  RemoveRecordPage:  { order: Order };
  GeoLocationConfirmationPage: { order: Order };
};

export enum AuthOpCode {
  WRONG_PASSWORD = "Wrong password !",
  USER_NOT_FOUND = "User not found !",
  INVALID_CREDENTIALS = "Invalid credentials !",
  INVALID_EMAIL = "Invalid email !",
  OTHER = "Internal issue !",
  LOGIN_SUCCESS = "Successfully logged in !"
}

