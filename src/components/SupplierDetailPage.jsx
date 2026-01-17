import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/supplierDetails.css";
import {
  
  FiChevronRight,

} from "react-icons/fi";
import { Navigate } from "react-router-dom";

// const API_URL = "http://localhost:5000/api/inventory";
const API_URL = import.meta.env.VITE_API_URL;

export default function SupplierDetailPage() {
  const { phone } = useParams();
  const location = useLocation();
  const navigate= useNavigate();

  // Supplier passed through React Router state
  const passedSupplier = location.state?.supplier;

  const [supplier, setSupplier] = useState(passedSupplier || null);
  const [loading, setLoading] = useState(!passedSupplier);
  // if supplier passed → no loading

  useEffect(() => {
    // If we already received supplier as state, no need for API call
    if (passedSupplier) return;

    // Otherwise fetch from API
    fetch(`${API_URL}/api/inventory/supplierByPhone/${phone}`)
      .then((res) => res.json())
      .then((data) => {
        setSupplier(data.supplier);
        setLoading(false);
      });
  }, [phone, passedSupplier]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!supplier) return <h2>No Supplier Found</h2>;

  return (
    <div className="supplier-detail-container">
      <header className="supplier-header">
        <button onClick={() => navigate(-1)} className="back-btn">
                  <FiChevronRight className="btn-icon" /> Back
                </button>
      

        <div className="form-header">
          <h2>COMPLETE SUPPLIER OVERVIEW </h2>
          <p>Here you can see complete detail of supplier !!</p>
        </div>
          <h2 className="upperCase">{supplier.supplierName}</h2>
      </header>

      {/* Supplier Basic Info */}
      <section className="supplier-info-card">
        <h2>Supplier Information</h2>

        <div className="info-grid-new">
          <p>
            <strong  >Supplier Name:</strong> {supplier.supplierName}
          </p>
          <p>

            <strong>Phone:</strong>{" "}
            <a href={`tel:${supplier.supplierPhone}`}>
              {supplier.supplierPhone}
            </a>
          </p>
          <p>
            <strong>Address:</strong> {supplier.supplierAddress}
          </p>
          <p>
            <strong>Total Supplied Stock:</strong> {supplier.totalSuppliedStock}{" "}
            units
          </p>
          <p>
            <strong>Total Transactions:</strong>{" "}
            {supplier.purchaseHistory.length}
          </p>
        </div>
      </section>

      {/* Purchase History */}
      <section className="purchase-history-card">
        <h2>Purchase History</h2>

        <table className="purchase-table">
          <thead>
            <tr>
              <th>Price</th>
              <th>Quantity</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {supplier.purchaseHistory
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((p, idx) => (
                <tr key={idx}>
                  <td>₹{p.boughtPrice}</td>
                  <td>{p.quantityAdded}</td>
                  <td>{new Date(p.date).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
