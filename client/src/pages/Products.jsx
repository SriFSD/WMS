import { useEffect, useRef, useState } from "react";

function Products({ products, setProducts }) {
  const firstInputRef = useRef(null);
  const [name, setName] = useState("");
  const [mrp, setMrp] = useState("");
  const [unit, setUnit] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleCreateProduct = () => {
    const nextErrors = {};
    const trimmedName = name.trim();
    const numericMrp = Number(mrp);

    if (!trimmedName) nextErrors.name = "Product name is required";
    if (!mrp || Number.isNaN(numericMrp) || numericMrp <= 0) {
      nextErrors.mrp = "MRP must be greater than 0";
    }
    if (!unit) nextErrors.unit = "Unit is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const newProduct = {
      id: Date.now(),
      name: trimmedName,
      mrp: numericMrp,
      unit,
      isActive,
      totalQty: 0,
    };

    setProducts([...products, newProduct]);

    setName("");
    setMrp("");
    setUnit("");
    setIsActive(true);
    setErrors({});
    firstInputRef.current?.focus();
  };

  return (
    <div className="products">
      <h1 className="page-title">Products</h1>

      <div className="product-form">
        <input
          ref={firstInputRef}
          placeholder="Product Name"
          value={name}
          className={errors.name ? "field-error" : ""}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
        />
        {errors.name && <div className="error-text">{errors.name}</div>}

        <input
          type="number"
          placeholder="MRP"
          value={mrp}
          className={errors.mrp ? "field-error" : ""}
          onChange={(e) => {
            setMrp(e.target.value);
            if (errors.mrp) setErrors((prev) => ({ ...prev, mrp: "" }));
          }}
        />
        {errors.mrp && <div className="error-text">{errors.mrp}</div>}

        <select
          value={unit}
          className={errors.unit ? "field-error" : ""}
          onChange={(e) => {
            setUnit(e.target.value);
            if (errors.unit) setErrors((prev) => ({ ...prev, unit: "" }));
          }}
        >
          <option value="">Select</option>
          <option value="kg">kg</option>
          <option value="litre">litre</option>
          <option value="piece">piece</option>
        </select>
        {errors.unit && <div className="error-text">{errors.unit}</div>}

      </div>

       <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span>Is Active</span>
        </label>

        <button onClick={handleCreateProduct}>Add Product</button>

      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <strong>{product.name}</strong>
            <div>MRP: ₹{product.mrp}</div>
            <div>Unit: {product.unit}</div>
            <div>Total Qty: {product.totalQty}</div>
            <div
              className={product.isActive ? "badge-active" : "badge-inactive"}
            >
              {product.isActive ? "Active" : "Inactive"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
