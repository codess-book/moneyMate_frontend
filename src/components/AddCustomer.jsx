import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/AddCustomer.css";
const apiBaseUrl = import.meta.env.VITE_API_URL;

import {
  FiUser,
  FiPhone,
  FiHome,
  FiDollarSign,
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiShoppingCart,
  FiCreditCard,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import CreatableSelect from "react-select/creatable";

const AddCustomer = () => {
  // Customer basic info state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentDate: new Date().toISOString().split("T")[0],
    nextPaymentDate: "",
    paidAmount: 0,
  });

  //another time when the customer comes for a payment
  const location = useLocation();
  const customer = location.state?.customer;
  const navigate = useNavigate();

  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
      }));

      // Optionally set ID if you want to update later
      //setCustomerId(customer._id || null);
    }
  }, [customer]);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      width: "100%",
      fontWeight: "600",
      fontSize: "16px",
      color: "#2c2c2c",
      borderColor: state.isFocused ? "#4f46e5" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(79, 70, 229, 0.2)" : "none",
      "&:hover": {
        borderColor: "#4f46e5",
      },
      backgroundColor: "#f9fafb",
      minHeight: "44px",
      paddingLeft: "8px",
      paddingRight: "8px",
      borderRadius: "8px",
    }),
    menu: (base) => ({
      ...base,
      fontWeight: "600",
      fontSize: "15px",
      color: "#333",
      zIndex: 9999,
      borderRadius: "8px",
      marginTop: "4px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "15px",
      backgroundColor: state.isFocused ? "#4f46e5" : "#fff",
      color: state.isFocused ? "#fff" : "#333",
      fontWeight: "600",
      cursor: "pointer",
      padding: "10px 16px",
      "&:active": {
        backgroundColor: "#4f46e5",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#2c2c2c",
      fontWeight: "600",
      fontSize: "15px",
    }),
    input: (base) => ({
      ...base,
      color: "#2c2c2c",
      fontWeight: "600",
      fontSize: "15px",
    }),
    placeholder: (base) => ({
      ...base,
      fontWeight: "500",
      color: "#9ca3af",
      fontSize: "15px",
    }),
  };

  // Items state
  const inputRefs = useRef({});
  const [itemOptions, setItemOptions] = useState([]);
  const [itemInputValues, setItemInputValues] = useState({});
  const [items, setItems] = useState([
    { name: "", quantity: 0, pricePerUnit: 0, totalPrice: 0 },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [disableNextDate, setDisableNextDate] = useState(false);
  const [printData, setPrintData] = useState(null);
  const printRef = useRef();

  // Fetch item dropdown options
  useEffect(() => {
    //axios.get(`${import.meta.env.VITE_API_URL}/api/items`)
    //console.log("API BASE URL:", import.meta.env.VITE_API_URL);
    axios
      .get(`${apiBaseUrl}/api/items`)

      //yha change kra
      //axios.get("http://localhost:8080/api/items")
      .then((res) => {
        const options = res.data.items.map((i) => ({
          value: i.name,
          label: i.name,
        }));
        setItemOptions(options);
      })
      .catch((err) => console.error("Error loading items:", err));
  }, []);

  // Calculate totals whenever items or paid amount changes
  useEffect(() => {
    const calculatedTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.pricePerUnit,
      0
    );
    setTotalAmount(calculatedTotal);

    const remaining = calculatedTotal - formData.paidAmount;
    setBalanceAmount(remaining);

    if (remaining <= 0) {
      setDisableNextDate(true);
      setFormData((prev) => ({ ...prev, nextPaymentDate: "" }));
    } else {
      setDisableNextDate(false);
    }
  }, [items, formData.paidAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "paidAmount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    if (field === "name") {
      updatedItems[index].name = value;
    } else {
      updatedItems[index][field] = parseFloat(value) || 0;
      updatedItems[index].totalPrice =
        updatedItems[index].quantity * updatedItems[index].pricePerUnit;
    }
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { name: "", quantity: 1, pricePerUnit: 0, totalPrice: 0 },
    ]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const invalidItems = items.some(
      (item) =>
        !item.name?.trim() || item.quantity <= 0 || item.pricePerUnit < 0
    );

    if (invalidItems) {
      setError("Please fill all item fields with valid values");
      setIsLoading(false);
      return;
    }

    if (formData.paidAmount < 0 || formData.paidAmount > totalAmount) {
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
    //addeed new
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
          name: item.name,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
        })),
        totalAmount,
        balanceAmount,
      };

      //"http://localhost:8080/api/customers/add",
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

        // Prepare bill data
        const billData = {
          farm: {
            name: "Arya Krishi Farm",
            address: "Put your address here",
            phone: "Your Mobile Number",
            gst: "Your GST Number (optional)",
          },
          customer: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
          },
          items,
          totalAmount,
          paidAmount: formData.paidAmount,
          balanceAmount,
          paymentDate: formData.paymentDate,
          nextPaymentDate,
          createdAt: new Date(),
          billNo: savedCustomer._id.slice(-6).toUpperCase(),
        };

        // Set data for printing
        setPrintData(billData);

        // Give React time to render hidden print UI
        setTimeout(() => {
          if (printRef.current) {
            window.print();
          }
        }, 300);

        // Toast + navigation
        if (response.data?.message.includes("updated")) {
          toast.info("Customer updated successfully");
        } else {
          toast.success("New customer added successfully");
        }

        // Reset form
        setFormData({
          name: "",
          phone: "",
          address: "",
          paymentDate: new Date().toISOString().split("T")[0],
          nextPaymentDate: "",
          paidAmount: 0,
        });
        setItems([{ name: "", quantity: 1, pricePerUnit: 0 }]);

        // Navigate AFTER print
        setTimeout(() => {
          navigate("/dashboard/viewCustomers");
        }, 500);
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

  return (
  <div className="customer-management">
    {/* Hidden Print Section */}
    <div className="print-section">
      <div ref={printRef} id="print-bill">
        <div className="print-header">
          <h2>{printData?.farm.name}</h2>
          <p>{printData?.farm.address}</p>
          <p>Phone: {printData?.farm.phone}</p>
        </div>

        <hr />

        <div className="print-customer">
          <h3>Customer Details</h3>
          <p>Name: {printData?.customer.name}</p>
          <p>Phone: {printData?.customer.phone}</p>
          <p>Address: {printData?.customer.address}</p>
        </div>

        <hr />

        <table className="print-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {printData?.items?.map((it, i) => (
              <tr key={i}>
                <td>{it.name}</td>
                <td>{it.quantity}</td>
                <td>{it.pricePerUnit}</td>
                <td>{(it.quantity * it.pricePerUnit).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        <div className="print-summary">
          <p><strong>Total Amount:</strong> ₹{printData?.totalAmount}</p>
          <p><strong>Paid Amount:</strong> ₹{printData?.paidAmount}</p>
          <p><strong>Balance:</strong> ₹{printData?.balanceAmount}</p>
          <p className="print-date">
            Bill Date: {new Date(printData?.paymentDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>

    {/* Main Form Section */}
    <div className="form-container">
      <div className="form-header">
        <h2>Add / Update Customer</h2>
        <p>Fill in the details to create a new customer record</p>
        {error && <div className="error-message">{error}</div>}
      </div>

      <form onSubmit={handleSubmit} className="customer-form">
        <div className="form-grid">
          {/* Customer Details Section */}
          <div className="form-section">
            <h3 className="section-title">Customer Information</h3>
            
            <div className="input-group">
              <label className="input-label">
                <FiUser className="input-icon" /> Customer Name
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
                <FiPhone className="input-icon" /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <FiHome className="input-icon" /> Address
              </label>
              <textarea
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows="3"
                className="form-textarea"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">
                <FiShoppingCart className="input-icon" /> Items / Services
              </h3>
            </div>

            <div className="items-container">
              {items.map((item, index) => (
                <div key={index} className="item-card">
                  <div className="item-header">
                    <div className="item-name-group">
                      <CreatableSelect
                        styles={customStyles}
                        isClearable
                        options={itemOptions}
                        inputValue={itemInputValues[index] ?? ""}
                        placeholder="Select or type item name"
                        onInputChange={(inputVal, { action }) => {
                          if (action === "input-change") {
                            setItemInputValues((prev) => ({
                              ...prev,
                              [index]: inputVal,
                            }));
                          }
                        }}
                        onChange={(option) => {
                          const selectedValue = option?.value ?? "";
                          setItemInputValues((prev) => ({
                            ...prev,
                            [index]: selectedValue,
                          }));
                          handleItemChange(index, "name", selectedValue);
                          setTimeout(() => {
                            const input = inputRefs.current[index];
                            if (input) {
                              input.focus();
                            }
                          }, 50);
                        }}
                        onBlur={() => {
                          const typed = itemInputValues[index]?.trim();
                          if (typed) handleItemChange(index, "name", typed);
                        }}
                        className="item-select"
                      />

                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        value={items[index]?.name || ""}
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                        placeholder="Item details"
                        className="item-details-input"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                      className="remove-item-btn"
                      aria-label="Remove item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className="item-details-grid">
                    <div className="detail-group">
                      <label className="detail-label">Quantity</label>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        placeholder="0"
                        required
                        className="detail-input"
                      />
                    </div>

                    <div className="detail-group">
                      <label className="detail-label">Price (₹)</label>
                      <input
                        type="text"
                        value={item.pricePerUnit}
                        onChange={(e) =>
                          handleItemChange(index, "pricePerUnit", e.target.value)
                        }
                        placeholder="0.00"
                        required
                        className="detail-input"
                      />
                    </div>

                    <div className="detail-group">
                      <label className="detail-label">Total</label>
                      <div className="total-display">
                        ₹{(item.quantity * item.pricePerUnit).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={addItem} className="add-item-btn">
              <FiPlus /> Add Item
            </button>
          </div>

          {/* Payment Section */}
          <div className="form-section">
            <h3 className="section-title">Payment Information</h3>
            
            <div className="payment-grid">
              <div className="input-group">
                <label className="input-label">
                  <FiCalendar className="input-icon" /> Payment Date
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
                  <FiCalendar className="input-icon" /> Next Payment Date
                </label>
                <input
                  type="date"
                  name="nextPaymentDate"
                  value={formData.nextPaymentDate}
                  onChange={handleChange}
                  disabled={disableNextDate}
                  required={disableNextDate}
                  className="form-input"
                />
                {disableNextDate && (
                  <div className="success-message">
                    🎉 Full payment received!
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FiCreditCard className="input-icon" /> Paid Amount (₹)
                </label>
                <input
                  type="text"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="summary-section">
            <div className="summary-card">
              <h4 className="summary-title">Payment Summary</h4>
              <div className="summary-item">
                <span>Total Amount:</span>
                <span className="summary-value">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Paid Amount:</span>
                <span className="summary-value">₹{formData.paidAmount}</span>
              </div>
              <div className="summary-item highlight">
                <span>Balance Amount:</span>
                <span className="summary-value">₹{balanceAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="submit-section">
            <button 
              type="submit" 
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <FiPlus className="btn-icon" />
                  {formData.name ? "Update Customer" : "Add Customer"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
);
}
// const printBill = (customer, items, totals) => {
//   const billWindow = window.open("", "PRINT", "height=800,width=700");

//   const billHTML = `
//     <html>
//       <head>
//         <title>Customer Bill - Arya Krishi Farm</title>
//       </head>
//       <body>
//         <h1 style="text-align:center; margin-bottom:0;">Arya Krishi Farm</h1>
//         <p style="text-align:center; margin-top:4px;">Ujjain, Madhya Pradesh • +91 XXXXX XXXXX</p>
//         <hr />

//         <h3>Customer Details</h3>
//         <p><strong>Name:</strong> ${customer.name}</p>
//         <p><strong>Phone:</strong> ${customer.phone}</p>
//         <p><strong>Address:</strong> ${customer.address}</p>
//         <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        
//         <h3>Items Purchased</h3>
//         <table border="1" cellpadding="8" cellspacing="0" width="100%">
//           <thead>
//             <tr>
//               <th>Item</th>
//               <th>Qty</th>
//               <th>Price</th>
//               <th>Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${items
//               .map(
//                 (i) => `
//                 <tr>
//                   <td>${i.name}</td>
//                   <td>${i.quantity}</td>
//                   <td>₹${i.pricePerUnit}</td>
//                   <td>₹${(i.quantity * i.pricePerUnit).toFixed(2)}</td>
//                 </tr>
//               `
//               )
//               .join("")}
//           </tbody>
//         </table>

//         <h3>Payment Summary</h3>
//         <p><strong>Total Amount:</strong> ₹${totals.total}</p>
//         <p><strong>Paid Amount:</strong> ₹${totals.paid}</p>
//         <p><strong>Balance:</strong> ₹${totals.balance}</p>

//         <hr />
//         <p style="text-align:center;">Thank you for choosing Arya Krishi Farm 🌱</p>
//       </body>
//     </html>
//   `;

//   billWindow.document.write(billHTML);
//   billWindow.document.close();
//   billWindow.focus();

//   setTimeout(() => {
//     billWindow.print();
//     billWindow.close();
//   }, 500);
// };

export default AddCustomer;
