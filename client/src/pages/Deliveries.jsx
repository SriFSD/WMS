import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Deliveries({
  orders,
  customers,
  products,
  deliveries,
  setDeliveries,
  setProducts,
  paymentDues,
  setPaymentDues,
}) {
  const navigate = useNavigate();
  const firstInputRef = useRef(null);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [notDeliveredReason, setNotDeliveredReason] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const latestDeliveryByOrderId = useMemo(() => {
    const map = {};

    deliveries.forEach((delivery) => {
      const existing = map[delivery.orderId];
      if (!existing) {
        map[delivery.orderId] = delivery;
        return;
      }

      const existingTime = new Date(
        existing.updatedAt || existing.deliveredAt || 0,
      ).getTime();
      const currentTime = new Date(
        delivery.updatedAt || delivery.deliveredAt || 0,
      ).getTime();

      if (currentTime >= existingTime) {
        map[delivery.orderId] = delivery;
      }
    });

    return map;
  }, [deliveries]);

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order) => latestDeliveryByOrderId[order.id]?.status !== "DELIVERED",
      ),
    [orders, latestDeliveryByOrderId],
  );

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  const selectableOrders = useMemo(() => {
    if (!selectedOrder) return pendingOrders;
    const exists = pendingOrders.some((order) => order.id === selectedOrder.id);
    return exists ? pendingOrders : [selectedOrder, ...pendingOrders];
  }, [pendingOrders, selectedOrder]);

  const selectedCustomer = useMemo(() => {
    if (!selectedOrder) return null;

    return (
      customers.find((customer) => customer.name === selectedOrder.customerName) ||
      null
    );
  }, [customers, selectedOrder]);

  useEffect(() => {
    if (!selectedOrderId) {
      setDeliveryStatus("");
      setNotDeliveredReason("");
      setDeliveryDate(new Date().toISOString().split("T")[0]);
      return;
    }

    const existingDelivery = latestDeliveryByOrderId[selectedOrderId];
    if (existingDelivery) {
      setDeliveryStatus(existingDelivery.status || "");
      setNotDeliveredReason(existingDelivery.reason || "");
      setDeliveryDate(
        (existingDelivery.deliveryDate || "").toString().split("T")[0] ||
          new Date().toISOString().split("T")[0],
      );
    } else {
      setDeliveryStatus("");
      setNotDeliveredReason("");
      setDeliveryDate(new Date().toISOString().split("T")[0]);
    }
  }, [latestDeliveryByOrderId, selectedOrderId]);

  const handleUpdateDelivery = () => {
    const nextErrors = {};

    if (!selectedOrderId) nextErrors.selectedOrderId = "Order is required";
    if (!deliveryDate) nextErrors.deliveryDate = "Delivery date is required";
    if (!deliveryStatus) nextErrors.deliveryStatus = "Delivery status is required";
    if (deliveryStatus !== "DELIVERED" && !notDeliveredReason) {
      nextErrors.notDeliveredReason = "Reason is required";
    }
    if (selectedOrderId && !selectedOrder) {
      nextErrors.selectedOrderId = "Please select a valid order";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const existingDelivery = latestDeliveryByOrderId[selectedOrderId];

    if (deliveryStatus === "DELIVERED") {
      for (let item of selectedOrder.items) {
        const product = products.find((p) => p.id === item.productId);

        if (!product || product.totalQty < item.quantity) {
          alert(`Not enough stock for ${product?.name}`);
          return;
        }
      }

      if (existingDelivery?.status !== "DELIVERED") {
        setProducts((prevProducts) =>
          prevProducts.map((product) => {
            const orderedItem = selectedOrder.items.find(
              (item) => item.productId === product.id,
            );

            if (orderedItem) {
              return {
                ...product,
                totalQty: product.totalQty - orderedItem.quantity,
              };
            }

            return product;
          }),
        );
      }

      const hasDue = paymentDues.some((due) => due.orderId === selectedOrder.id);
      if (!hasDue) {
        const newPaymentDue = {
          id: Date.now(),
          orderId: selectedOrder.id,
          customerName: selectedOrder.customerName,
          orderAmount: selectedOrder.orderAmount,
          paidAmount: 0,
          balanceAmount: selectedOrder.orderAmount,
          status: "NOT_PAID",
        };

        setPaymentDues((prevDues) => [...prevDues, newPaymentDue]);
      }
    }

    const updatedDelivery = {
      id: existingDelivery?.id || Date.now(),
      orderId: selectedOrderId,
      status: deliveryStatus,
      deliveryDate,
      reason: deliveryStatus === "DELIVERED" ? "" : notDeliveredReason,
      deliveredAt:
        deliveryStatus === "DELIVERED"
          ? new Date(`${deliveryDate}T00:00:00`)
          : existingDelivery?.deliveredAt || null,
      updatedAt: new Date(),
    };

    setDeliveries((prevDeliveries) =>
      existingDelivery
        ? prevDeliveries.map((delivery) =>
            delivery.orderId === selectedOrderId ? updatedDelivery : delivery,
          )
        : [...prevDeliveries, updatedDelivery],
    );
    alert("Delivery updated successfully");
  };

  const isViewPaymentEnabled =
    Boolean(selectedOrderId) &&
    latestDeliveryByOrderId[selectedOrderId]?.status === "DELIVERED";

  const handleViewPayment = () => {
    if (!selectedOrderId) {
      alert("Please select an order");
      return;
    }

    const hasDue = paymentDues.some((due) => due.orderId === selectedOrderId);
    if (!hasDue) {
      alert("No payment due found for this order yet");
      return;
    }

    navigate("/payments", { state: { focusOrderId: selectedOrderId } });
  };

  return (
    <div className="deliveries">
      <h1 className="page-title">Deliveries</h1>

      <section className="order-card">
        <h3>Choose Order</h3>
        <label>Order No *</label>
        <select
          ref={firstInputRef}
          value={selectedOrderId}
          className={errors.selectedOrderId ? "field-error" : ""}
          onChange={(e) =>
            {
              setSelectedOrderId(
                e.target.value ? Number(e.target.value) : "",
              );
              if (errors.selectedOrderId) {
                setErrors((prev) => ({ ...prev, selectedOrderId: "" }));
              }
            }
          }
        >
          <option value="">-- Select from Pending Deliveries --</option>
          {selectableOrders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.id} - {order.customerName}
              {latestDeliveryByOrderId[order.id]?.status === "DELIVERED"
                ? " (Delivered)"
                : ""}
            </option>
          ))}
        </select>
        {errors.selectedOrderId && (
          <div className="error-text">{errors.selectedOrderId}</div>
        )}
        {pendingOrders.length === 0 && <p>All orders are delivered.</p>}
      </section>

      <section className="order-card">
        <h3>Order, Customer and Product Details</h3>
        <label>Order No *</label>
        <input
          type="text"
          value={selectedOrder?.id || ""}
          placeholder="Select pending order"
          readOnly
        />

        <label>Delivery Date *</label>
        <input
          type="date"
          value={deliveryDate}
          className={errors.deliveryDate ? "field-error" : ""}
          onChange={(e) => {
            setDeliveryDate(e.target.value);
            if (errors.deliveryDate) {
              setErrors((prev) => ({ ...prev, deliveryDate: "" }));
            }
          }}
        />
        {errors.deliveryDate && <div className="error-text">{errors.deliveryDate}</div>}

        <h4>Customer Details</h4>
        <div className="delivery-form-grid">
          <div className="readonly-field">
            <span>Name</span>
            <input type="text" value={selectedOrder?.customerName || ""} readOnly />
          </div>
          <div className="readonly-field">
            <span>Contact Number</span>
            <input type="text" value={selectedCustomer?.phone || ""} readOnly />
          </div>
          <div className="readonly-field readonly-full">
            <span>Delivery Address</span>
            <input type="text" value={selectedCustomer?.location || ""} readOnly />
          </div>
        </div>

        <h4>Product Details</h4>
        {!selectedOrder?.items?.length && <p>No products</p>}
        <div className="product-mini-list">
          {selectedOrder?.items?.map((item, index) => (
            <div key={`${item.productId}-${index}`} className="product-mini-row">
              <div className="readonly-field">
                <span>Product Name</span>
                <input type="text" value={item.productName} readOnly />
              </div>
              <div className="readonly-field">
                <span>Ordered Qty</span>
                <input type="text" value={item.quantity} readOnly />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="order-card">
        <h3>Delivery Status</h3>
        <label>Delivery Status *</label>
        <select
          value={deliveryStatus}
          className={errors.deliveryStatus ? "field-error" : ""}
          onChange={(e) => {
            setDeliveryStatus(e.target.value);
            if (errors.deliveryStatus) {
              setErrors((prev) => ({ ...prev, deliveryStatus: "" }));
            }
          }}
        >
          <option value="">-- Select Status --</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="NOT_DELIVERED">NOT DELIVERED</option>
          <option value="PENDING">PENDING</option>
        </select>
        {errors.deliveryStatus && (
          <div className="error-text">{errors.deliveryStatus}</div>
        )}

        {deliveryStatus && deliveryStatus !== "DELIVERED" && (
          <>
            <label>Reason *</label>
            <select
              value={notDeliveredReason}
              className={errors.notDeliveredReason ? "field-error" : ""}
              onChange={(e) => {
                setNotDeliveredReason(e.target.value);
                if (errors.notDeliveredReason) {
                  setErrors((prev) => ({ ...prev, notDeliveredReason: "" }));
                }
              }}
            >
              <option value="">-- Select Reason --</option>
              <option value="CUSTOMER_UNAVAILABLE">Customer unavailable</option>
              <option value="ADDRESS_ISSUE">Address issue</option>
              <option value="STOCK_DELAY">Stock delay</option>
              <option value="TRANSPORT_DELAY">Transport delay</option>
            </select>
            {errors.notDeliveredReason && (
              <div className="error-text">{errors.notDeliveredReason}</div>
            )}
          </>
        )}

        <button onClick={handleUpdateDelivery}>Update Delivery</button>
        <button disabled={!isViewPaymentEnabled} onClick={handleViewPayment}>
          View Payment
        </button>
      </section>
    </div>
  );
}
