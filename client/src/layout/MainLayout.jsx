import { Routes, Route } from "react-router-dom";
import NavItem from "../components/NavItem";
import Dashboard from "../pages/Dashboard";
import Customers from "../pages/Customers";
import Orders from "../pages/Orders";
import Deliveries from "../pages/Deliveries";
import Stock from "../pages/Stock";
import Payments from "../pages/Payments";
import Products from "../pages/Products";
import ClearData from "../pages/ClearData";

export default function MainLayout({ customers, setCustomers , products, setProducts , orders, setOrders, deliveries, setDeliveries, paymentDues, setPaymentDues}) {
  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <NavItem to="/">Dashboard</NavItem>
        <NavItem to="/customers">Customers</NavItem>
        <NavItem to="/products">Products</NavItem>
        <NavItem to="/orders">Orders</NavItem>
        <NavItem to="/deliveries">Deliveries</NavItem>
        <NavItem to="/stock">Stock</NavItem>
        <NavItem to="/payments">Payments</NavItem>
        <NavItem to="/clear-data">Clear Data</NavItem>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/customers"
            element={
              <Customers customers={customers} setCustomers={setCustomers} />
            }
          />
          <Route
            path="/products"
            element={
              <Products products={products} setProducts={setProducts} />
            }
          />
          <Route path="/orders" element={<Orders orders={orders} setOrders={setOrders} products={products} customers={customers} />} />
          <Route path="/deliveries" element={<Deliveries orders={orders} customers={customers} deliveries={deliveries} setDeliveries={setDeliveries} products={products} setProducts={setProducts} paymentDues={paymentDues} setPaymentDues={setPaymentDues}/>} />
          <Route path="/stock" element={<Stock  products={products} setProducts={setProducts} orders={orders} deliveries={deliveries}/>} />
          <Route path="/payments" element={<Payments  paymentDues={paymentDues} setPaymentDues={setPaymentDues}/>} />
          <Route path="/clear-data" element={<ClearData />} />
        </Routes>
      </main>
    </div>
  );
}
