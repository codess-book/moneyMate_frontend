import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaClipboardList,
  FaSeedling,
  FaTag,
  FaWarehouse,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/logistic.css";

const API_URL = "http://localhost:5000/api/inventory";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loadingSupplier, setLoadingSupplier] = useState(false);

  const[isadditem,setIsAddItem]=useState(false);
  

  const fetchSupplierByPhone = async (phone) => {
    // Only run when EDITING
    if (!editingId) return;

    // Only call API when full phone is typed
    if (phone.length !== 10) return;

    setLoadingSupplier(true);

    try {
      const res = await fetch(`${API_URL}/item/${editingId}/supplier/${phone}`);

      if (res.ok) {
        const data = await res.json();
        console.log(data, "data");

        const supplier = data.supplier;

        // last purchase entry
        const lastPurchase =
          supplier.purchaseHistory[supplier.purchaseHistory.length - 1];

        setForm((prev) => ({
          ...prev,
          supplier_name: supplier.supplierName,
          address: supplier.supplierAddress,
          bought_price: lastPurchase.boughtPrice,
          supplier_quantity: "",
        }));

        toast.success("Supplier exists");
      } else {
        // Supplier not found
        setForm((prev) => ({
          ...prev,
          supplier_name: "",
          address: "",
          bought_price: "",
          supplier_quantity: "",
        }));

        toast.info("New supplier");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error fetching supplier");
    }

    setLoadingSupplier(false);
  };

  const [form, setForm] = useState({
    item_name: "",
    quantity: "",
    stockAlert: "",
    price: "",
    supplier_name: "",
    phone: "",
    category: "",
    address: "",
    bought_price: "",
    supplier_quantity: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch(API_URL + "/allItems");
      const data = await res.json();
      setItems(data.items);
    } catch (err) {
      toast.error("Failed to load inventory!");
    }
  };

  

  useEffect(() => {
    fetchItems();
  }, []);

  // Handler to open the modal for a new item, resetting the form
  const handleAddItemClick = () => {
   setIsAddItem(true)
    setForm({
      item_name: "",
      quantity: "",
      stockAlert: "",
      price: "",
      supplier_name: "",
      phone: "",
      address: "",
      bought_price: "",
      supplier_quantity: "",
    });
    setEditingId(null);
    setShowModal(true);
  };

  // Handler to close the modal and reset form/editing state
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({
      item_name: "",
      quantity: "",
      stockAlert: "",
      price: "",
      supplier_name: "",
      phone: "",
      address: "",
      bought_price: "",
      supplier_quantity: "",
    });
  };

  // Add or update item (with optional supplier info)
  const handleSubmit = async (e) => {
    e.preventDefault();
    form.supplier_quantity=form.quantity
    console.log("here",form.supplier_quantity)
    const {
      item_name,
      quantity,
      stockAlert,
      price,
      supplier_name,
      phone,
      category,
      address,
      bought_price,
      supplier_quantity,
    } = form;
    // console.log(supplier_name, "supplier");

    // if (
    //   !item_name ||
    //   quantity === "" ||
    //   stockAlert === "" ||
    //   price === "" ||
    //   supplier_name === ""
    // ) {
    //   toast.warn("⚠️ Please fill all product inventory and pricing fields!");
    //   return;
    // }

    const hasSupplierInfo =
      supplier_name ||
      phone ||
      address ||
      bought_price !== "" ;
      // supplier_quantity !== "";

    if (hasSupplierInfo) {
      // if (!supplier_quantity || Number(supplier_quantity) <= 0) {
      //   toast.warn("⚠️ Please enter valid supplier quantity to add");
      //   return;
      // }
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    const initialQuantity = method === "POST" ? Number(quantity) : 0;
    console.log(initialQuantity, "initial");
    const payload = {
      name: item_name,
      quantity: initialQuantity,
      stockAlert: Number(stockAlert),
      price: Number(price),
      category: form.category,
    };

    if (hasSupplierInfo) {
      if (method === "PUT") {
        payload.quantity =
          Number(items.find((item) => item._id === editingId)?.quantity || 0) +
          Number(supplier_quantity);
      }

      payload.supplier = {
        name: supplier_name,
        phone,
        address,
        boughtPrice: Number(bought_price),
        quantityAdded: Number(supplier_quantity),
      };
    } else if (method === "PUT") {
      payload.quantity = Number(quantity);
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        handleCloseModal();
        fetchItems();
        setIsAddItem(false)
        toast.success(
          editingId ? "✅ Item Updated Successfully!" : "🎉 Item Added!"
        );
      } else {
        toast.error("❌ Something went wrong!");
      }
    } catch {
      setIsAddItem(false)
      toast.error("❌ Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    toast.info(
      <div className="flex flex-col items-start">
        <p className="font-semibold">Are you sure you want to delete?</p>
        <div className="mt-2 flex gap-3">
          <button
            onClick={async () => {
              await fetch(`${API_URL}/${id}`, { method: "DELETE" });
              fetchItems();
              toast.dismiss();
              toast.success("🗑️ Item Deleted");
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-md"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-700 text-white px-3 py-1 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  const handleEdit = (item) => {
    setForm({
      item_name: item.name || item.item?.name || "",
      quantity: item.currentStock || "",
      stockAlert: item.lowStockAlert || "",
      price: item.price || "",
      supplier_name: "",
      category: item.category,
      phone: "",
      address: "",
      bought_price: "",
      supplier_quantity: "",
    });
    setEditingId(item._id);
    setShowModal(true);
  };

  return (
    // Main Container
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 md:px-8 py-12  text-gray-900 relative">
      <ToastContainer position="top-right" autoClose={2000} theme="light" />

      {/* Animation Style */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.3s ease-out forwards;
        }
      `}</style>

      <div className="w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 pb-4 border-b border-gray-200">
          {/* Header styling refined */}
          <h1 className="text-3xl sm:text-4xl font-bold text-green flex items-center gap-4 mb-4 sm:mb-0">
            <span className="text-green text-2xl">
              <FaClipboardList />
            </span>
            Farm Inventory Management
          </h1>
          {/* Add New Item Button uses a modern blue accent */}
          <button
            onClick={handleAddItemClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all text-lg flex items-center gap-2"
          >
            <FaPlus /> Add New Item
          </button>
        </div>

        {/* Inventory Card Grid View */}
        <div className="stock-overview">
          <div className="section-header">
            <FaWarehouse className="section-icon" />
            <h2>Current Stock Overview</h2>
          </div>

          {items.length > 0 ? (
            <div className="stock-grid">
              {items.map((item) => {
                const isLowStock = item.quantity <= item.stockAlert;
                const isOutOfStock = item.quantity === 0;
                const stockPercentage = Math.min(
                  (item.quantity / (item.stockAlert * 3)) * 100,
                  100
                );

                return (
                  <div
                    key={item._id}
                    className={`stock-card ${isLowStock ? "low-stock" : ""} ${
                      isOutOfStock ? "out-of-stock" : ""
                    }`}
                  >
                    {/* Header */}
                    <div className="card-header">
                      <div className="item-info">
                        <h3 className="item-name">{item.name}</h3>
                        <p className="text-sm">{item.category}</p>
                        <div className="stock-status">
                          <span
                            className={`status-badge ${
                              isOutOfStock
                                ? "out-of-stock"
                                : isLowStock
                                ? "low-stock"
                                : "in-stock"
                            }`}
                          >
                            {isOutOfStock
                              ? "Out of Stock"
                              : isLowStock
                              ? "Low Stock"
                              : "In Stock"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="card-content">
                      {/* Stock Level */}
                      <div className="stock-level">
                        <div className="stock-info">
                          <span className="stock-label">Stock Level</span>
                          <span className="stock-quantity">
                            {item.currentStock} units
                          </span>
                        </div>

                        {/* Stock progress bar */}
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${
                              isOutOfStock
                                ? "out-of-stock"
                                : isLowStock
                                ? "low-stock"
                                : "in-stock"
                            }`}
                            style={{ width: `${stockPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="item-details">
                        <div className="detail-item">
                          <div className="detail-label">
                            <FaWarehouse className="detail-icon" />
                            <span>Current Stock</span>
                          </div>
                          <span className="detail-value">
                            {item.currentStock}
                          </span>
                        </div>

                        <div className="detail-item">
                          <div className="detail-label">
                            <FaTag className="detail-icon" />
                            <span>Price</span>
                          </div>
                          <span className="detail-value">
                            ₹{Number(item.price).toFixed(2)}
                          </span>
                        </div>

                        <div className="detail-item">
                          <div className="detail-label">
                            <FaBoxOpen className="detail-icon" />
                            <span>Alert Level</span>
                          </div>
                          <span className="detail-value">
                            {item.lowStockAlert}
                          </span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="card-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(item)}
                        >
                          <FaEdit className="btn-icon" />
                          Edit
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(item._id)}
                        >
                          <FaTrash className="btn-icon" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-content">
                <div className="empty-icon">
                  <FaWarehouse />
                </div>
                <h3>No farm products in stock</h3>
                <p>Get started by adding your first inventory item</p>
                <button className="btn-primary" onClick={handleAddItemClick}>
                  <FaPlus className="btn-icon" />
                  Add New Item
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Item Modal (Kept the highly polished form from the last step) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title">
                <FaSeedling className="modal-icon" />
                <h2>
                  {editingId
                    ? "Update Product & Stock"
                    : "New Farm Product Entry"}
                </h2>
              </div>
              <button
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Product Inventory & Pricing */}
              <fieldset className="form-section">
                <legend className="section-legend">
                  <FaBoxOpen className="section-icon" />
                  Product Inventory & Pricing
                </legend>

                <div className="form-grid">
                  {/* Item Name */}
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Organic Wheat Seeds"
                      value={form.item_name}
                      onChange={(e) =>
                        setForm({ ...form, item_name: e.target.value })
                      }
                      required
                      disabled={!!editingId}
                    />
                  </div>

                  {/* Category */}
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Pesticides">Pesticides</option>
                      <option value="Fertilizers">Fertilizers</option>
                      <option value="Cattle Feed">Cattle Feed</option>
                      <option value="Seeds">Seeds</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  {/* Selling Price */}
                  <div className="form-group">
                    <label className="form-label">Selling Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>

                  {/* Current Quantity */}
                  <div className="form-group">
                    <label className="form-label">Current Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="0"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quantity:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      required
                      disabled={!!editingId}
                    />
                    {!!editingId && (
                      <p className="form-note">
                        Edit mode: Current stock cannot be changed directly. Use
                        "Quantity to Add".
                      </p>
                    )}
                  </div>

                  {/* Low Stock Alert */}
                  <div className="form-group">
                    <label className="form-label">Low Stock Alert Level</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="5"
                      value={form.stockAlert}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          stockAlert:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </fieldset>

              {/* Replenish & Supplier */}
              <fieldset className="form-section">
                <legend className="section-legend">
                  <FaPlus className="section-icon" />
                  Replenish Stock & Supplier Details
                </legend>

                <div className="form-grid">
                  {/* Phone */}
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    {/* <input
                      type="tel"
                      className="form-input"
                      placeholder="Phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    /> */}

                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Phone"
                      value={form.phone}
                      onChange={(e) => {
                        const phone = e.target.value;

                        setForm({ ...form, phone });

                        if (phone.length === 10) {
                          fetchSupplierByPhone(phone);
                        }

                        if (phone.length < 10) {
                          // clear auto-filled fields
                          setForm((prev) => ({
                            ...prev,
                            supplier_name: "",
                            address: "",
                            bought_price: "",
                            supplier_quantity: "",
                          }));
                        }
                      }}
                    />
                  </div>

                  {/* Supplier Name */}
                  <div className="form-group">
                    <label className="form-label">Supplier Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Supplier Name"
                      value={form.supplier_name}
                      onChange={(e) =>
                        setForm({ ...form, supplier_name: e.target.value })
                      }
                      disabled={loadingSupplier}
                    />
                  </div>

                  {/* Cost Per Unit */}
                  <div className="form-group">
                    <label className="form-label">Cost Per Unit (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={form.bought_price}
                      disabled={loadingSupplier}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          bought_price:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  {/* Quantity to Add */}
                 

               {!isadditem &&
                  <div className="form-group">
                    <label className="form-label">Quantity to Add Now</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="0"
                      value={form.supplier_quantity}
                      disabled={loadingSupplier}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          supplier_quantity:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                    />
                  </div>

                    }
                  {/* Address */}
                  <div className="form-group full-width">
                    <label className="form-label">Supplier Address</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Full Address"
                      value={form.address}
                      disabled={loadingSupplier}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Submit Button */}
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingId
                    ? "Update Item & Stock"
                    : "Confirm & Add Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
