import React, { useEffect, useState, useMemo } from "react";
import "../styles/supplier.css";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function SupplierHistoryPage() {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  //   Fetch All Items

  useEffect(() => {
    setLoadingItems(true);

    fetch(`${API_URL}/api/inventory/allItems`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);

        if (data.items.length > 0 > 0) {
          setSelectedItemId(data.items[0]._id);
          setSelectedItemName(data.items[0].name);
        }

        setLoadingItems(false);
      })
      .catch(() => setLoadingItems(false));
  }, []);

  // console.log(items, "items");

  useEffect(() => {
    if (!selectedItemId || items.length === 0) return;

    setLoadingHistory(true);

    // find the selected item from the already fetched items list
    const selected = items.find((item) => item._id === selectedItemId);
    // console.log(selected, "selected");
    if (selected) {
      setHistory(selected.suppliers || []);
      setSelectedItemName(selected.name);
    }

    setLoadingHistory(false);
  }, [selectedItemId, items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h2 className="panel-title">📦 Items</h2>
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
                      className={`item-card ${
                        selectedItemId === item._id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedItemId(item._id);
                        setSelectedItemName(item.name);
                      }}
                    >
                      <div className="item-info">
                        <h3 className="item-name">{item.name}</h3>
                        <p className="item-id"> {item.category}</p>
                      </div>
                      <div className="item-arrow">→</div>
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
              ⏳ Purchase History — {selectedItemName}
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
                      <th>Last Purchase Price</th>
                      <th>Total Qty Supplied</th>
                      <th>Last Purchase Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.map((h, idx) => (
                      <tr
                        key={idx}
                        className="clickable-row"
                        onClick={() => {
                          navigate(`/dashboard/supplier/${h.supplierPhone}`, {
                            state: { supplier: h },
                          });
                        }}
                      >
                        <td>{h.supplierName}</td>
                        <td>
                          <a href={`tel:${h.supplierPhone}`}>
                            {h.supplierPhone}
                          </a>
                        </td>
                        <td>{h.supplierAddress}</td>
                        <td>
                          ₹
                          {
                            h.purchaseHistory[h.purchaseHistory.length - 1]
                              .boughtPrice
                          }
                        </td>
                        <td>{h.totalSuppliedStock}</td>
                        <td>
                          {new Date(
                            h.purchaseHistory[h.purchaseHistory.length - 1].date
                          ).toLocaleDateString("en-IN")}
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
