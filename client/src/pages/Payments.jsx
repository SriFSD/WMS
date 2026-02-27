import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Payments({ paymentDues, setPaymentDues }) {
  const location = useLocation();
  const [paymentInputs, setPaymentInputs] = useState({});
  const [errors, setErrors] = useState({});
  const orderRefs = useRef({});
  const paymentInputRefs = useRef({});
  const focusedOrderId = Number(location.state?.focusOrderId);

  const displayDues = useMemo(() => {
    if (!focusedOrderId) return paymentDues;

    return [...paymentDues].sort((a, b) => {
      if (a.orderId === focusedOrderId) return -1;
      if (b.orderId === focusedOrderId) return 1;
      return b.id - a.id;
    });
  }, [focusedOrderId, paymentDues]);

  useEffect(() => {
    if (!focusedOrderId) return;

    const targetNode = orderRefs.current[focusedOrderId];
    if (!targetNode) return;

    targetNode.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusedOrderId, displayDues]);

  useEffect(() => {
    if (focusedOrderId) {
      const focusedDue = displayDues.find((due) => due.orderId === focusedOrderId);
      if (focusedDue && paymentInputRefs.current[focusedDue.id]) {
        paymentInputRefs.current[focusedDue.id].focus();
        return;
      }
    }
    if (displayDues[0] && paymentInputRefs.current[displayDues[0].id]) {
      paymentInputRefs.current[displayDues[0].id].focus();
      return;
    }
  }, [displayDues, focusedOrderId]);

  const handleAddPayment = (dueId) => {
    const inputData = paymentInputs[dueId];
    const due = paymentDues.find((item) => item.id === dueId);
    const amount = Number(inputData?.amount);

    if (!inputData || Number.isNaN(amount) || amount <= 0) {
      setErrors((prev) => ({
        ...prev,
        [dueId]: "Enter a valid payment amount greater than 0",
      }));
      return;
    }

    if (due && amount > due.balanceAmount) {
      setErrors((prev) => ({
        ...prev,
        [dueId]: "Payment cannot be more than balance",
      }));
      return;
    }

    const updatedDues = paymentDues.map((due) => {
      if (due.id !== dueId) return due;

      const newPaid = due.paidAmount + amount;
      const newBalance = due.orderAmount - newPaid;

      let newStatus = "NOT_PAID";
      if (newPaid === 0) newStatus = "NOT_PAID";
      else if (newBalance > 0) newStatus = "PARTIALLY_PAID";
      else newStatus = "FULLY_PAID";

      return {
        ...due,
        paidAmount: newPaid,
        balanceAmount: newBalance,
        status: newStatus,
      };
    });

    setPaymentDues(updatedDues);
    setErrors((prev) => ({ ...prev, [dueId]: "" }));

    setPaymentInputs({
      ...paymentInputs,
      [dueId]: { amount: "" },
    });
  };

  return (
    <div className="payments">
      <h1 className="page-title">Payments</h1>

      {paymentDues.length === 0 && <p>No payment dues yet</p>}

      {displayDues.map((due) => (
        <div
          key={due.id}
          className="order-card"
          ref={(el) => {
            if (el) {
              orderRefs.current[due.orderId] = el;
            }
          }}
          style={{
            border:
              focusedOrderId === due.orderId
                ? "2px solid var(--accent)"
                : "1px solid #e5e7eb",
          }}
        >
          <h3>Order: {due.orderId}</h3>
          <p>Customer: {due.customerName}</p>
          <p>Total: {due.orderAmount}</p>
          <p>Paid: {due.paidAmount}</p>
          <p>Balance: {due.balanceAmount}</p>
          <p>Status: {due.status}</p>

          <input
            type="number"
            placeholder="Enter Amount"
            ref={(el) => {
              if (el) {
                paymentInputRefs.current[due.id] = el;
              }
            }}
            value={paymentInputs[due.id]?.amount || ""}
            className={errors[due.id] ? "field-error" : ""}
            onChange={(e) =>
              {
                setPaymentInputs({
                  ...paymentInputs,
                  [due.id]: {
                    amount: Number(e.target.value),
                  },
                });
                if (errors[due.id]) {
                  setErrors((prev) => ({ ...prev, [due.id]: "" }));
                }
              }
            }
          />
          {errors[due.id] && <div className="error-text">{errors[due.id]}</div>}

          <button onClick={() => handleAddPayment(due.id)}>
            Add Payment
          </button>

          <button disabled={due.status !== "FULLY_PAID"}>
            Download Invoice
          </button>
        </div>
      ))}
    </div>
  );
}
