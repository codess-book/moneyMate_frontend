import React, { useEffect, useState, useMemo } from "react";
import { FaBox, FaHistory, FaSearch, FaSpinner, FaInbox } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import "../styles/logistic.css;"
import "../styles/supplier.css"

// import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000/api/inventory";

export default function SupplierHistoryPage() {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load all inventory items
  useEffect(() => {
    setLoadingItems(true);
    fetch(`${API_URL}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        if (data.length > 0) {
          setSelectedItemId(data[0]._id);
          setSelectedItemName(data[0].item?.name || data[0].item_name);
        }
        setLoadingItems(false);
      })
      .catch(() => setLoadingItems(false));
  }, []);

  // Load Supplier History
  useEffect(() => {
    if (!selectedItemId) return;
    setLoadingHistory(true);
    fetch(`${API_URL}/supplier-history/${selectedItemId}`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoadingHistory(false);
      })
      .catch(() => setLoadingHistory(false));
  }, [selectedItemId]);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      (item.item?.name || item.item_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

 return (
  <div className="supplier-history-container">
    <header className="page-header">
      <h1 className="page-title">Supplier History</h1>
      <p className="page-subtitle">Track every harvest purchase</p>
    </header>

    <div className="dashboard-layout">
      {/* LEFT PANEL — ITEMS LIST */}
      <div className="items-panel">
        <div className="panel-header">
          <h2 className="panel-title">
            <span className="icon">📦</span> Items
          </h2>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="items-list-container">
          {loadingItems ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading items...</p>
            </div>
          ) : (
            <div className="items-list">
              {filteredItems.length === 0 ? (
                <div className="empty-state">
                  <p>No items found</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className={`item-card ${selectedItemId === item._id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedItemId(item._id);
                      setSelectedItemName(
                        item.item?.name || item.item_name || "Item"
                      );
                    }}
                  >
                    <div className="item-info">
                      <h3 className="item-name">
                        {item.item?.name || item.item_name}
                      </h3>
                      <p className="item-id">ID: {item._id}</p>
                    </div>
                    <div className="item-arrow">
                      <span>→</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — SUPPLIER HISTORY */}
      <div className="history-panel">
        <div className="panel-header">
          <h2 className="panel-title">
            <span className="icon">⏳</span> Purchase History — {selectedItemName}
          </h2>
        </div>

        <div className="history-container">
          {loadingHistory ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <p>No history available for this item.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => (
                    <tr key={idx}>
                      <td className="supplier-cell">
                        <span className="supplier-name">{h.supplierName}</span>
                      </td>
                      <td className="phone-cell">
                        <a href={`tel:${h.supplierPhone}`} className="phone-link">
                          {h.supplierPhone}
                        </a>
                      </td>
                      <td className="address-cell">{h.supplierAddress}</td>
                      <td className="price-cell">${h.boughtPrice}</td>
                      <td className="qty-cell">{h.quantityAdded}</td>
                      <td className="date-cell">
                        {new Date(h.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}