import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "../styles/supplierDetails.css";

// const API_URL = "http://localhost:5000/api/inventory";
const API_URL = import.meta.env.VITE_API_URL;

export default function SupplierDetailPage() {
  const { phone } = useParams();
  const location = useLocation();

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
        <h1>{supplier.supplierName}</h1>
        <p className="sub">Complete Supplier Overview</p>
      </header>

      {/* Supplier Basic Info */}
      <section className="supplier-info-card">
        <h2>Supplier Information</h2>

        <div className="info-grid">
          <p>
            <strong>Phone:</strong>{" "}
            <a href={`tel:${supplier.supplierPhone}`}>
              {supplier.supplierPhone}
            </a>
          </p>
          <p><strong>Address:</strong> {supplier.supplierAddress}</p>
          <p><strong>Total Supplied Stock:</strong> {supplier.totalSuppliedStock} units</p>
          <p><strong>Total Transactions:</strong> {supplier.purchaseHistory.length}</p>
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
                  <td>
                    {new Date(p.date).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
