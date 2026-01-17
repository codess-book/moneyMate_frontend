import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUser, FiPhone, FiHome, FiSave, FiChevronRight } from "react-icons/fi";
import { toast } from "react-toastify";
import "../styles/EditCustomer.css";
const apiBaseUrl = import.meta.env.VITE_API_URL;

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: ""
  });

  // ✅ Universal input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prevCustomer) => ({
      ...prevCustomer,
      [name]: value
    }));
  };

  // ✅ Fetch customer data on component mount
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch( `${apiBaseUrl}/api/customers/${id}`  , {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch customer");
        }

        setCustomer(data);
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error(error.message || "Error fetching customer details");
      }
    };

    fetchCustomer();
  }, [id]);

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiBaseUrl}/api/customers/${id}`    , {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(customer)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      toast.success("Customer updated successfully!");
      navigate("/dashboard/ViewCustomers");
    } catch (error) {
      console.error("Update Error:", error);
      toast.error(error.message || "Error updating customer");
    }
  };

  return (
    <div className="edit-customer-container">
      <div className="edit-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiChevronRight className="btn-icon" /> Back
          
        </button>
        {/* <div className="header-content">
          <h2>Edit Customer</h2>
          <p>Update the details for {customer.name || "Customer"}</p>
        </div> */}
          <div className="form-header">
          <h2>EDIT CUSTOMER </h2>
          <p>Update the details for {customer.name || "Customer"}</p>
        </div>
      </div>

      <form className="edit-customer-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>
              <FiUser className="input-icon" />
              Customer Name
            </label>
            <input
              type="text"
              name="name"
              value={customer.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter full name"
            />
          </div>

          <div className="form-group">
            <label>
              <FiPhone className="input-icon" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={customer.phone}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group full-width">
            <label>
              <FiHome className="input-icon" />
              Address
            </label>
            <textarea
              name="address"
              value={customer.address}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter complete address"
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="save-btn">
            <FiSave className="btn-icon" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCustomer;
