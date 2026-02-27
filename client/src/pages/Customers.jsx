import { useEffect, useRef, useState } from "react";

function Customers({ customers, setCustomers }) {
  const firstInputRef = useRef(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleCreateCustomer = () => {
    const nextErrors = {};
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedLocation = location.trim();

    if (!trimmedName) nextErrors.name = "Customer name is required";
    if (!trimmedPhone) nextErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(trimmedPhone)) {
      nextErrors.phone = "Phone number must be 10 digits";
    }
    if (!trimmedEmail) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email";
    }
    if (!trimmedLocation) nextErrors.location = "Location is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const hasDuplicatePhone = customers.some(
      (customer) => customer.phone === trimmedPhone,
    );
    const hasDuplicateEmail = customers.some(
      (customer) => customer.email.toLowerCase() === trimmedEmail.toLowerCase(),
    );

    if (hasDuplicatePhone || hasDuplicateEmail) {
      const shouldProceed = window.confirm(
        "Mobile Number/Email already exists for another customer, Do you want to proceed?",
      );
      if (!shouldProceed) return;
    }

    const newCustomer = {
      id: Date.now(),
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      location: trimmedLocation,
      isActive,
    };

    setCustomers([...customers, newCustomer]);

    setName("");
    setPhone("");
    setEmail("");
    setLocation("");
    setIsActive(true);
    setErrors({});
    firstInputRef.current?.focus();
  };

  return (
    <div className="customers">
      <h1 className="page-title">Customers</h1>

      <div className="customer-form">
        <input
          ref={firstInputRef}
          placeholder="Customer Name"
          value={name}
          className={errors.name ? "field-error" : ""}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
        />
        {errors.name && <div className="error-text">{errors.name}</div>}

        <input
          placeholder="Phone Number"
          value={phone}
          className={errors.phone ? "field-error" : ""}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
          }}
        />
        {errors.phone && <div className="error-text">{errors.phone}</div>}

        <input
          placeholder="Email"
          type="email"
          value={email}
          className={errors.email ? "field-error" : ""}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          }}
        />
        {errors.email && <div className="error-text">{errors.email}</div>}

        <textarea
          rows={5}
          cols={30}
          placeholder="Location"
          value={location}
          className={errors.location ? "field-error" : ""}
          onChange={(e) => {
            setLocation(e.target.value);
            if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
          }}
        />
        {errors.location && <div className="error-text">{errors.location}</div>}
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <span>Is Active</span>
      </label>

      <button onClick={handleCreateCustomer}>
        Add Customer
      </button>

      <div className="customer-list">
        {customers.map((customer) => (
          <div key={customer.id} className="customer-card">
            <strong>{customer.name}</strong>
            <div>{customer.phone}</div>
            <div>{customer.email}</div>
            <div>{customer.location}</div>
            <div
              className={
                customer.isActive
                  ? "badge-active"
                  : "badge-inactive"
              }
            >
              {customer.isActive ? "Active" : "Inactive"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Customers;
