import { useEffect, useRef, useState } from "react";

function Orders({ orders, setOrders, products, customers }) {
  const firstInputRef = useRef(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

  const handleDelete = (indexToDelete) => {
    setItems(items.filter((_, index) => index !== indexToDelete));
  };

  const orderAmount = items.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return total;
    return total + product.mrp * item.quantity;
  }, 0);

  const handleCreateOrder = () => {
    const nextErrors = {};
    const selectedCustomer = customers.find(
      (customer) => customer.id === selectedCustomerId,
    );
    const validItems = items.filter(
      (item) => item.productId && Number(item.quantity) > 0,
    );

    if (!selectedCustomerId || !selectedCustomer) {
      nextErrors.customerName = "Customer name is required";
    }
    if (validItems.length === 0) {
      nextErrors.items = "Add at least one valid product with quantity";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const newOrder = {
      id: Date.now(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: validItems.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          productId: product.id,
          productName: product.name,
          quantity: Number(item.quantity),
          rate: product.mrp,
        };
      }),
      orderAmount,
      createdAt: new Date(),
    };

    setOrders([...orders, newOrder]);
    setSelectedCustomerId("");
    setItems([{ productId: "", quantity: 1 }]);
    setErrors({});
    firstInputRef.current?.focus();
  };

  return (
    <div className="orders">
      <h1 className="page-title">Create Order</h1>

      <select
        ref={firstInputRef}
        value={selectedCustomerId}
        className={errors.customerName ? "field-error" : ""}
        onChange={(e) =>
          {
          setSelectedCustomerId(e.target.value ? Number(e.target.value) : "");
          if (errors.customerName) {
            setErrors((prev) => ({ ...prev, customerName: "" }));
          }
        }}
      >
        <option value="">-- Select Customer --</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name}
          </option>
        ))}
      </select>
      {errors.customerName && (
        <div className="error-text">{errors.customerName}</div>
      )}

      <h3 className="orders-subtitle">Order Items</h3>
      {items.map((item, index) => (
        <div key={index} className="item-row">
          <select
            value={item.productId}
            className={errors.items ? "field-error" : ""}
            onChange={(e) => {
              const updated = [...items];
              updated[index].productId = Number(e.target.value);
              setItems(updated);
            }}
          >
            <option value="">-- Select Product --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={item.quantity}
            className={errors.items ? "field-error" : ""}
            onChange={(e) => {
              const updated = [...items];
              updated[index].quantity = Number(e.target.value);
              setItems(updated);
            }}
          />

          <button onClick={() => handleDelete(index)}>Remove Item</button>
        </div>
      ))}

      <div className="order-item-actions">
        <button onClick={handleAddItem}>Add Item</button>
      </div>
      {errors.items && <div className="error-text">{errors.items}</div>}

      <p>
        <strong>Order Total: ₹{orderAmount}</strong>
      </p>

      <button onClick={handleCreateOrder}>Create Order</button>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <h3>{order.customerName}</h3>
            <p>₹{order.orderAmount}</p>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.productName} - {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
