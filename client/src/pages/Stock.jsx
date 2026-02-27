import { useEffect, useRef, useState } from "react";

export default function Stock({ products, setProducts, orders, deliveries }) {
  const editQtyRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editedQty, setEditedQty] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingId !== null) {
      editQtyRef.current?.focus();
      editQtyRef.current?.select();
    }
  }, [editingId]);

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditedQty(product.totalQty);
  };

  const handleCancel = () => {
    if (editingId !== null) {
      setErrors((prev) => ({ ...prev, [editingId]: "" }));
    }
    setEditingId(null);
    setEditedQty("");
  };

  const handleUpdate = (id) => {
    const qty = Number(editedQty);
    if (Number.isNaN(qty) || qty < 0) {
      setErrors((prev) => ({ ...prev, [id]: "Quantity must be 0 or more" }));
      return;
    }

    const shouldSave = window.confirm("Save updated stock quantity?");
    if (!shouldSave) return;

    const updatedProducts = products.map((product) => {
      if (product.id === id) {
        return {
          ...product,
          totalQty: qty,
          lastModifiedAt: new Date().toISOString(),
        };
      }
      return product;
    });

    setProducts(updatedProducts);
    setEditingId(null);
    setEditedQty("");
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const latestDeliveryByOrderId = deliveries.reduce((acc, delivery) => {
    const prev = acc[delivery.orderId];
    if (!prev) {
      acc[delivery.orderId] = delivery;
      return acc;
    }

    const prevTime = new Date(prev.updatedAt || prev.deliveredAt || 0).getTime();
    const curTime = new Date(
      delivery.updatedAt || delivery.deliveredAt || 0,
    ).getTime();
    if (curTime >= prevTime) {
      acc[delivery.orderId] = delivery;
    }
    return acc;
  }, {});

  const reservedQtyByProductId = orders.reduce((acc, order) => {
    const latestDelivery = latestDeliveryByOrderId[order.id];
    if (latestDelivery?.status === "DELIVERED") {
      return acc;
    }

    order.items.forEach((item) => {
      acc[item.productId] = (acc[item.productId] || 0) + Number(item.quantity || 0);
    });
    return acc;
  }, {});

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  return (
    <div className="stock-page">
      <h1 className="page-title">Stock</h1>

      {products.length === 0 && <p>No products available</p>}

      {products.length > 0 && (
        <table className="stock-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product Name</th>
              <th>Total Qty</th>
              <th>Reserved Qty</th>
              <th>Available Qty</th>
              <th>Last Modified Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product, index) => {
              const reservedQty = reservedQtyByProductId[product.id] || 0;
              const availableQty = Number(product.totalQty || 0) - reservedQty;

              return (
                <tr key={product.id}>
                  <td>{index + 1}</td>

                  <td>{product.name}</td>

                  <td>
                    {editingId === product.id ? (
                      <>
                        <input
                          ref={editQtyRef}
                          type="number"
                          value={editedQty}
                          className={errors[product.id] ? "field-error" : ""}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            setEditedQty(e.target.value);
                            if (errors[product.id]) {
                              setErrors((prev) => ({ ...prev, [product.id]: "" }));
                            }
                          }}
                        />
                        {errors[product.id] && (
                          <div className="error-text">{errors[product.id]}</div>
                        )}
                      </>
                    ) : (
                      product.totalQty
                    )}
                  </td>

                  <td>{reservedQty}</td>
                  <td>{availableQty}</td>
                  <td>{formatDateTime(product.lastModifiedAt)}</td>

                  <td>
                    {editingId === product.id ? (
                      <>
                        <button onClick={() => handleUpdate(product.id)}>Save</button>
                        <button onClick={handleCancel}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => handleEditClick(product)}>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
