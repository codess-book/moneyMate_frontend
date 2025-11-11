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
  FiCreditCard
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
  const navigate=useNavigate();

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
      '&:hover': {
        borderColor: "#4f46e5"
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
      '&:active': {
        backgroundColor: "#4f46e5"
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: "#2c2c2c",
      fontWeight: "600",
      fontSize: "15px"
    }),
    input: (base) => ({
      ...base,
      color: "#2c2c2c",
      fontWeight: "600",
      fontSize: "15px"
    }),
    placeholder: (base) => ({
      ...base,
      fontWeight: "500",
      color: "#9ca3af",
      fontSize: "15px"
    }),
  };

  // Items state
  const inputRefs = useRef({});
  const [itemOptions, setItemOptions] = useState([]);
  const [itemInputValues, setItemInputValues] = useState({});
  const [items, setItems] = useState([
    { name: '', quantity: 0, pricePerUnit: 0, totalPrice: 0 }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [disableNextDate, setDisableNextDate] = useState(false);

  // Fetch item dropdown options
  useEffect(() => {

    //axios.get(`${import.meta.env.VITE_API_URL}/api/items`)
    //console.log("API BASE URL:", import.meta.env.VITE_API_URL);
      axios.get(`${apiBaseUrl}/api/items`)
       
//yha change kra
    //axios.get("http://localhost:8080/api/items")
      .then(res => {
        const options = res.data.items.map(i => ({ value: i.name, label: i.name }));
        setItemOptions(options);
      })
      .catch(err => console.error("Error loading items:", err));
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
    setFormData(prev => ({
      ...prev,
      [name]: name === 'paidAmount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    if (field === 'name') {
      updatedItems[index].name = value;
    } else {
      updatedItems[index][field] = parseFloat(value) || 0;
      updatedItems[index].totalPrice =
        updatedItems[index].quantity * updatedItems[index].pricePerUnit;
    }
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, pricePerUnit: 0, totalPrice: 0 }]);
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

    const invalidItems = items.some(item => 
      !item.name?.trim() ||
      item.quantity <= 0 || 
      item.pricePerUnit < 0
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
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit
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
            "Authorization": `Bearer ${token}`
          },
        }
      );

      if (response.data?.customer?._id && response.data.message.includes("updated")) {
        toast.info("Existing customer updated successfully");
        navigate('/dashboard/viewCustomers');
        
      } else {
        toast.success("New customer added successfully with itemized billing");
        navigate('/dashboard/viewCustomers');
      }

      setFormData({
        name: "",
        phone: "",
        address: "",
        paymentDate: new Date().toISOString().split("T")[0],
        // paymentDate: formData.paymentDate || new Date().toISOString(),
        nextPaymentDate: "",
        paidAmount: 0,
      });
      setItems([{ name: '', quantity: 1, pricePerUnit: 0, totalPrice: 0 }]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to add customer";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-customer-container">
      <div className="form-header">
        <h2 className="form-title">Add / Update Customer</h2>
        <p className="form-subtitle">Fill in the details to create a new customer record</p>
        {error && <p className="error-message">{error}</p>}
      </div>

      <form className="add-customer-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Customer Basic Info Fields */}
          <div className="form-group">
            <label className="form-label">
              <FiUser className="input-icon" />
              Customer Name
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

          <div className="form-group">
            <label className="form-label">
              <FiPhone className="input-icon" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone with country code"
              className="form-input"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              <FiHome className="input-icon" />
              Address
            </label>
            <textarea
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete address"
              className="form-input"
              rows="3"
            />
          </div>

          {/* Items Section */}
          <div className="form-group full-width items-section">
  <label className="form-label section-label">
    <FiShoppingCart className="input-icon" />
    Items/Services
  </label>
  
  {items.map((item, index) => (
    <div key={index} className="item-row">
      {/* Item Name - Full width on mobile */}
      <div className="item-name-container mobile-full-width">
        <CreatableSelect
          styles={customStyles}
          isClearable
          options={itemOptions}
          inputValue={itemInputValues[index] ?? ""}
          onInputChange={(inputVal, { action }) => {
            if (action === "input-change") {
              setItemInputValues((prev) => ({ ...prev, [index]: inputVal }));
            }
          }}
          onChange={(option) => {
            const selectedValue = option?.value ?? "";
            setItemInputValues((prev) => ({ ...prev, [index]: selectedValue }));
            handleItemChange(index, "name", selectedValue);
            setTimeout(() => {
              const input = inputRefs.current[index];
              if (input) {
                input.focus();
                input.setSelectionRange(selectedValue.length, selectedValue.length);
              }
            }, 50);
          }}
          onBlur={() => {
            const typed = itemInputValues[index]?.trim();
            if (typed) {
              handleItemChange(index, "name", typed);
            }
          }}
          placeholder="Item name"
          classNamePrefix="react-select"
          className="item-select"
        />
        <input
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          value={items[index]?.name || ""}
          onChange={(e) => {
            const value = e.target.value;
            setItemInputValues((prev) => ({ ...prev, [index]: value }));
            handleItemChange(index, "name", value);
          }}
          placeholder="Details"
          className="form-input item-details"
        />
      </div>

      {/* Quantity, Price, Total - Row on desktop, stacked on mobile */}
      <div className="item-inputs-group">
        <div className="input-group">
          <span className="mobile-label text-red-950">Qty</span>
          <input
            type="text"
            value={item.quantity}
            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
            placeholder="Qty"
            className="form-input item-qty"
            required
          />
        </div>

        <div className="input-group">
          <span className="mobile-label">Price</span>
          <input
            type="text"
            value={item.pricePerUnit}
            onChange={(e) => handleItemChange(index, 'pricePerUnit', e.target.value)}
            placeholder="Price"
            className="form-input item-price"
            required
          />
        </div>

        <div className="input-group total-group">
          <span className="mobile-label">Total</span>
          <div className="item-total">₹{(item.quantity * item.pricePerUnit).toFixed(2)}</div>
        </div>

        <div className="input-group remove-group">
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="remove-item-btn"
            disabled={items.length <= 1}
            aria-label="Remove item"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  ))}
  
  <button type="button" onClick={addItem} className="add-item-btn">
    <FiPlus className="btn-icon" />
    Add Item
  </button>
</div>
          {/* Payment Information Section */}
          <div className="form-group">
            <label className="form-label">
              <FiCalendar className="input-icon" />
              Payment Date
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

          <div className="form-group">
            <label className="form-label">
              <FiCalendar className="input-icon" />
              Next Payment Date
            </label>
            <input
              type="date"
              name="nextPaymentDate"
              value={formData.nextPaymentDate}
              onChange={handleChange}
              className="form-input"
              disabled={disableNextDate}
              required={disableNextDate}
            />
            {disableNextDate && (
              <p className="full-payment-message">
                🎉 Full payment received!
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <FiCreditCard className="input-icon" />
              Paid Amount (₹)
            </label>
            <input
              type="text"
              name="paidAmount"
              value={formData.paidAmount}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Amount Summary Section */}
          <div className="form-group amount-summary">
            <div className="amount-row">
              <span className="amount-label">Total Amount:</span>
              <span className="amount-value">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="amount-row">
              <span className="amount-label">Paid Amount:</span>
              <span className="amount-value">₹{formData.paidAmount.toFixed(2)}</span>
            </div>
            <div className="amount-row balance">
              <span className="amount-label">Balance Amount:</span>
              <span className="amount-value">₹{balanceAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-text">Processing...</span>
            ) : (
              <>
                <FiPlus className="btn-icon" />
                {formData.name ? "Update Customer" : "Add Customer"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCustomer;