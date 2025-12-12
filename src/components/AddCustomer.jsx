import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import {
  FiUser,
  FiPhone,
  FiHome,
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiCalendar,
  FiCreditCard,
} from "react-icons/fi";
import "../styles/AddCustomer.css"


const AddCustomer = () => {
  const apiBaseUrl = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const customer = location.state?.customer;
  const printRef = useRef();

  // ==========================================
  // FORM STATE
  // ==========================================
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentDate: new Date().toISOString().split("T")[0],
    nextPaymentDate: "",
    paidAmount: 0,
  });

  // ==========================================
  // ITEMS STATE WITH GST
  // ==========================================
  const [items, setItems] = useState([
    {
      category: "",
      name: "",
      quantity: "",
      pricePerUnit: "",
      unit: "",
      gstRate: 0, // Default no GST
      taxableAmount: 0,
      gstAmount: 0,
      totalAmount: 0,
    },
  ]);

  const [allProducts, setAllProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
      }));
    }
  }, [customer]);

  // fetch
  useEffect(() => {
    setLoadingProducts(true);
    axios
      .get(`${apiBaseUrl}/api/inventory/allItems`)
      .then((res) => {
        const products = res.data.items;
        setAllProducts(products);

        // Extract unique categories
        const categories = [
          ...new Set(products.map((p) => p.category).filter(Boolean)),
        ];
        setCategoryOptions(categories.map((c) => ({ value: c, label: c })));
      })
      .catch((err) => {
        console.error("Error loading items:", err);
        toast.error("Failed to load products");
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  // gst calculation
  const calculateItemTotals = (item) => {
    const quantity = Number(item.quantity) || 0;
    const pricePerUnit = Number(item.pricePerUnit) || 0;
    const gstRate = Number(item.gstRate) || 0;

    // Calculate with proper rounding (matching backend exactly)
    const taxableAmount = Math.round(quantity * pricePerUnit * 100) / 100;
    const gstAmount =
      gstRate > 0 ? Math.round(taxableAmount * gstRate * 100) / 10000 : 0;
    const totalAmount = Math.round((taxableAmount + gstAmount) * 100) / 100;

    return { taxableAmount, gstAmount, totalAmount };
  };

  // CALCULATE GRAND TOTALS

  const grandSubTotal = items.reduce(
    (sum, item) => sum + (item.taxableAmount || 0),
    0
  );
  const grandGST = items.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
  const grandTotal = items.reduce(
    (sum, item) => sum + (item.totalAmount || 0),
    0
  );
  const balanceAmount = grandTotal - formData.paidAmount;

  // HANDLE CATEGORY CHANGE

  const handleCategoryChange = (index, selectedOption) => {
    const category = selectedOption?.value || "";

    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = {
        ...newItems[index],
        category,
        name: "", // Reset product
        pricePerUnit: "",
        unit: "",
      };
      return newItems;
    });
  };

  // ==========================================
  // HANDLE PRODUCT SELECTION (AUTO-FILL)
  // ==========================================
  const handleProductChange = (index, selectedOption) => {
    // const productName = selectedOption?.value || "";
    const product = selectedOption?.product;
    console.log("product", product);

    // Find product in inventory
    // const product = allProducts.find((p) => p.name === productName);

    setItems((prev) => {
      const newItems = [...prev];

      if (product) {
        // Auto-fill from inventory
        newItems[index] = {
          ...newItems[index],
          itemId: product._id,
          name: product.name,
          pricePerUnit: product.price || "",
          unit: product.unit || "",
          category: product.category,
        };
      } else {
        // Manual entry
        newItems[index] = {
          ...newItems[index],
          name: productName,
        };
      }

      // Recalculate totals
      const calculated = calculateItemTotals(newItems[index]);
      newItems[index] = { ...newItems[index], ...calculated };

      return newItems;
    });
  };

  // ==========================================
  // HANDLE FIELD CHANGE
  // ==========================================
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };

      // Recalculate when quantity, price, or GST changes
      if (["quantity", "pricePerUnit", "gstRate"].includes(field)) {
        const calculated = calculateItemTotals(newItems[index]);
        newItems[index] = { ...newItems[index], ...calculated };
      }

      return newItems;
    });
  };

  // ADD / REMOVE ITEMS

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        category: "",
        name: "",
        quantity: "",
        pricePerUnit: "",
        unit: "",
        gstRate: 0,
        taxableAmount: 0,
        gstAmount: 0,
        totalAmount: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "paidAmount" ? parseFloat(value) || 0 : value,
    }));
  };
  const validateForm = () => {
    // Check required fields
    if (
      !formData.name?.trim() ||
      !formData.phone?.trim() ||
      !formData.address?.trim()
    ) {
      return "Please fill all customer details";
    }

    // Validate phone format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      return "Please enter a valid 10-digit phone number";
    }

    // Check items
    if (items.length === 0) {
      return "Please add at least one item";
    }

    const invalidItem = items.find(
      (item) =>
        !item.name?.trim() ||
        !item.category?.trim() ||
        Number(item.quantity) <= 0 ||
        Number(item.pricePerUnit) < 0
    );

    if (invalidItem) {
      return "Please check all item fields - name, category, quantity (>0), and price (≥0) are required";
    }

    return null;
  };

     useEffect(() => {
          if (printData && printRef.current) {
            setTimeout(() => {
              window.print();
            }, 50);
          }
        }, [printData]);


  // ==========================================
  // SUBMIT FORM
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent rapid double submission
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      toast.warning("Please wait before submitting again");
      return;
    }
    setLastSubmitTime(now);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    // Validation
    // const invalidItems = items.some(
    //   (item) =>
    //     !item.name?.trim() ||
    //     !item.category?.trim() || // ✅ Check category
    //     item.quantity <= 0 ||
    //     item.pricePerUnit < 0
    // );
    // if (invalidItems) {
    //   setError("Please fill all item fields with valid values");
    //   setIsLoading(false);
    //   return;
    // }

    if (formData.paidAmount < 0 || formData.paidAmount > grandTotal) {
      setError("Paid amount must be between 0 and total amount");
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setIsLoading(false);
      return;
    }

    // Auto next payment date
    let nextPaymentDate = formData.nextPaymentDate;
    if (!nextPaymentDate && balanceAmount > 0) {
      const paymentDateObj = new Date(formData.paymentDate);
      paymentDateObj.setMonth(paymentDateObj.getMonth() + 1);
      nextPaymentDate = paymentDateObj.toISOString().split("T")[0];
    }

    try {
      const payload = {
        ...formData,
        nextPaymentDate,
        items: items.map((item) => ({
          category: item.category || "General", // ✅ Add category
          name: item.name,
          quantity: Number(item.quantity),
          pricePerUnit: Number(item.pricePerUnit),
          gstRate: Number(item.gstRate) || 0,
          unit: item.unit || "",
        })),
      };


      const response = await axios.post(
        `${apiBaseUrl}/api/customers/add`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        const savedCustomer = response.data.customer;

        // Prepare bill data for printing
        const billData = {
          customer: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
          },
          items,
          subTotal: grandSubTotal,
          totalGST: grandGST,
          grandTotal,
          paidAmount: formData.paidAmount,
          balanceAmount,
          paymentDate: formData.paymentDate,
          nextPaymentDate,
          billNo: savedCustomer._id.slice(-6).toUpperCase(),
        };

        setPrintData(billData);

        console.log("billdata", billData);

        // // Print
        // setTimeout(() => {
        //   if (printRef.current) {
        //     window.print();
        //   }
        // }, 300);

        // Toast
        toast.success(
          response.data?.message.includes("updated")
            ? "Customer updated successfully"
            : "New customer added successfully"
        );

        // Reset form
        setFormData({
          name: "",
          phone: "",
          address: "",
          paymentDate: new Date().toISOString().split("T")[0],
          nextPaymentDate: "",
          paidAmount: 0,
        });
        setItems([
          {
            category: "",
            name: "",
            quantity: "",
            pricePerUnit: "",
            unit: "",
            gstRate: 0,
            taxableAmount: 0,
            gstAmount: 0,
            totalAmount: 0,
          },
        ]);

        // Navigate
        // setTimeout(() => {
        //   navigate("/dashboard/viewCustomers");
        // }, 500);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add customer";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (printData) {
      console.log("printData updated, triggering print...");
      const timer = setTimeout(() => {
        if (printRef.current) {
          console.log("Calling window.print()");
          window.print();
          setPrintData(null);
        } else {
          console.log("printRef.current not found");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printData]);


  // ==========================================
  // CUSTOM SELECT STYLES
  // ==========================================
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#4f46e5" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(79, 70, 229, 0.2)" : "none",
      "&:hover": { borderColor: "#4f46e5" },
      minHeight: "44px",
      borderRadius: "8px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    }),
  };

  // console.log("printdata", printData);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="customer-management">
      {/* PRINT SECTION */}

      {printData && (
        <div className="print-section" >
          <div ref={printRef} style={{ padding: "20px", fontFamily: "Arial" }}>
            <h2>Arya Krishi Seva Kendra</h2>
            <p>Bill No: {printData.billNo}</p>

            <h3>Customer: {printData.customer.name}</h3>
            <p>Phone: {printData.customer.phone}</p>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>GST%</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {printData.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.pricePerUnit}</td>
                    <td>{item.gstRate}%</td>
                    <td>₹{item.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: "20px" }}>
              <p>Subtotal: ₹{printData.subTotal.toFixed(2)}</p>
              <p>Total GST: ₹{printData.totalGST.toFixed(2)}</p>
              <p>
                <strong>Grand Total: ₹{printData.grandTotal.toFixed(2)}</strong>
              </p>
              <p>Paid: ₹{printData.paidAmount}</p>
              <p>Balance: ₹{printData.balanceAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN FORM */}
      <div className="form-container">
        <div className="form-header">
          <h2>Add / Update Customer</h2>
          {error && <div className="error-message">{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className="customer-form">
          {/* CUSTOMER INFO */}
          <div className="form-section">
            <h3 className="section-title">Customer Information</h3>

            <div className="input-group">
              <label className="input-label">
                <FiUser /> Customer Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <FiPhone /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={(e) => {
                  let val = e.target.value;

                  // Remove all non-numeric characters
                  val = val.replace(/\D/g, "");

                  // Limit to max 10 digits
                  if (val.length > 10) val = val.slice(0, 10);

                  handleChange({
                    target: {
                      name: "phone",
                      value: val,
                    },
                  });
                }}
                placeholder="Enter phone number"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <FiHome /> Address
              </label>
              <textarea
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                rows="3"
                className="form-textarea"
              />
            </div>
          </div>

          {/* ITEMS WITH GST */}
          <div className="form-section">
            <h3 className="section-title">
              <FiShoppingCart /> Items / Services
            </h3>

            {items.map((item, index) => {
              // Filter products by category
              const filteredProducts = item.category
                ? allProducts.filter((p) => p.category === item.category)
                : allProducts;

              // const productOptions = filteredProducts.map((p) => ({

              //   value: p.name,
              //   label: `${p.name} - ₹${p.price || 0}/${p.unit || "unit"}`,
              // }));
              const productOptions = filteredProducts.map((p) => ({
                value: p._id,
                label: `${p.name} - ₹${p.price}/${p.unit}`,
                product: p,
              }));

              return (
                <div key={index} className="item-card">
                  <div className="item-header">
                    <span>Item {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                      className="remove-item-btn"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  {/* Category */}
                  <div className="detail-group">
                    <label className="detail-label">Category</label>
                    <CreatableSelect
                      styles={customStyles}
                      isClearable
                      options={categoryOptions}
                      value={
                        categoryOptions.find(
                          (c) => c.value === item.category
                        ) || null
                      }
                      onChange={(option) => handleCategoryChange(index, option)}
                      placeholder="Select category"
                    />
                  </div>

                  {/* Product */}
                  <div className="detail-group">
                    <label className="detail-label">Product</label>
                    <CreatableSelect
                      styles={customStyles}
                      isClearable
                      options={productOptions}
                      value={
                        productOptions.find((p) => p.value === item.itemId) ||
                        null
                      }
                      onChange={(option) => handleProductChange(index, option)}
                      placeholder="Select product"
                      isDisabled={!item.category}
                    />
                  </div>

                  {/* Details Grid */}
                  <div className="item-details-grid">
                    <div className="detail-group">
                      <label className="detail-label">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        placeholder="0"
                        className="detail-input"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="detail-group">
                      <label className="detail-label">Unit</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) =>
                          handleItemChange(index, "unit", e.target.value)
                        }
                        placeholder="kg/pcs"
                        className="detail-input"
                      />
                    </div>

                    <div className="detail-group">
                      <label className="detail-label">Price/Unit (₹)</label>
                      <input
                        type="number"
                        value={item.pricePerUnit}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "pricePerUnit",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        className="detail-input"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="detail-group">
                      <label className="detail-label">GST %</label>
                      <select
                        value={item.gstRate}
                        onChange={(e) =>
                          handleItemChange(index, "gstRate", e.target.value)
                        }
                        className="detail-input"
                      >
                        <option value="0">No GST (0%)</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="item-calculations">
                    <div>Taxable: ₹{item.taxableAmount.toFixed(2)}</div>
                    <div>GST: ₹{item.gstAmount.toFixed(2)}</div>
                    <div>
                      <strong>Total: ₹{item.totalAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}

            <button type="button" onClick={addItem} className="add-item-btn">
              <FiPlus /> Add Item
            </button>
          </div>

          {/* PAYMENT INFO */}
          <div className="form-section">
            <h3 className="section-title">Payment Information</h3>

            <div className="payment-grid">
              <div className="input-group">
                <label className="input-label">
                  <FiCalendar /> Payment Date
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  required
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FiCalendar /> Next Payment Date
                </label>
                <input
                  type="date"
                  name="nextPaymentDate"
                  value={formData.nextPaymentDate}
                  onChange={handleChange}
                  disabled={balanceAmount <= 0}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FiCreditCard /> Paid Amount (₹)
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="form-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="summary-section">
            <div className="summary-card">
              <h4>Payment Summary</h4>
              <div className="summary-item">
                <span>Subtotal:</span>
                <span>₹{grandSubTotal.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Total GST:</span>
                <span>₹{grandGST.toFixed(2)}</span>
              </div>
              <div className="summary-item highlight">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Paid Amount:</span>
                <span>₹{formData.paidAmount}</span>
              </div>
              <div className="summary-item highlight">
                <span>Balance:</span>
                <span>₹{balanceAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="submit-section">
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? "Processing..." : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
