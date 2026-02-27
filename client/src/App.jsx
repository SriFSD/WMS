import { BrowserRouter } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import "./App.css";
import usePersistentState from "./hooks/usePersistentState";

function App() {
  const [customers, setCustomers] = usePersistentState("customers", []);
  const [products, setProducts] = usePersistentState("products", []);
  const [orders, setOrders] = usePersistentState("orders", []);
  const [deliveries, setDeliveries] = usePersistentState("deliveries", []);
  const [paymentDues, setPaymentDues] = usePersistentState("paymentDues", []);

  return (
    <BrowserRouter>
      <MainLayout
        customers={customers}
        setCustomers={setCustomers}
        products={products}
        setProducts={setProducts}
        orders={orders}
        setOrders={setOrders}
        deliveries={deliveries}
        setDeliveries={setDeliveries}
        paymentDues={paymentDues}
        setPaymentDues={setPaymentDues}
      />
    </BrowserRouter>
  );
}

export default App;
