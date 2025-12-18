// AddPaymentModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import "../styles/AddPaymentModel.css";
const apiBaseUrl = import.meta.env.VITE_API_URL;

const AddPaymentModal = ({ isOpen, onClose, customerId, onPaymentSuccess }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${apiBaseUrl}/api/payment/add/${customerId}`,
        {
          amountPaid: parseInt(amountPaid),
          paymentDate: new Date().toISOString(),
          nextPaymentDate,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

       toast.success("New customer added successfully with itemized billing");
      onClose();
      if (onPaymentSuccess) onPaymentSuccess(res.data);
    } catch (err) {
      console.error(err);
      alert('Error while adding payment');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Add Payment</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Amount Paid (₹)</label>
            <input
              type="number"
              required
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Next Payment Date</label>
            <input
              type="date"
              required
              value={nextPaymentDate}
              onChange={(e) => setNextPaymentDate(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn cancel-btn">
              Cancel
            </button>
            <button type="submit" className="btn save-btn">
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;
