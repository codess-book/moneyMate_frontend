import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Edit, Trash2, Search } from "lucide-react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaClipboardList,
  FaSeedling,
  FaTag,
  FaCheck,
  FaWarehouse,
} from "react-icons/fa";
import "../styles/logistic.css";

const API = import.meta.env.VITE_API_URL;

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSupplier, setLoadingSupplier] = useState(false);
  const [isadditem, setIsAddItem] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    unit: "",
    status: "",
    stock: "", // low | high
  });

  const fetchSupplierByPhone = async (phone) => {
    // Only run when EDITING
    if (!editingId) return;

    // Only call API when full phone is typed
    if (phone.length !== 10) return;

    setLoadingSupplier(true);

    try {
      const res = await fetch(
        `${API}/api/inventory/item/${editingId}/supplier/${phone}`
      );

      if (res.ok) {
        const data = await res.json();

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

  // 🔥 Fetch items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/inventory/allItems`, {
        params: {
          page,
          limit: 10,
          search: filters.search,
          category: filters.category,
          unit: filters.unit,
          status: filters.status,
        },
      });

      let fetchedItems = data.items;

      // Low / High stock filter (client side)
      if (filters.stock) {
        fetchedItems = fetchedItems.filter((item) =>
          filters.stock === "low"
            ? item.currentStock <= item.lowStockAlert
            : item.currentStock > item.lowStockAlert
        );
      }

      setItems(fetchedItems);
      setTotalPages(data.metadata.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, filters]);

  const handleAddItemClick = () => {
    setIsAddItem(true);
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
    // form.supplier_quantity=form.quantity
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
      supplier_name || phone || address || bought_price !== "";
    // supplier_quantity !== "";

    // if (hasSupplierInfo) {
    //   // if (!supplier_quantity || Number(supplier_quantity) <= 0) {
    //   //   toast.warn("⚠️ Please enter valid supplier quantity to add");
    //   //   return;
    //   // }
    // }

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API}/api/inventory/${editingId}`
      : `${API}/api/inventory`;

    const initialQuantity = method === "POST" ? Number(quantity) : 0;
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
        setIsAddItem(false);
        toast.success(
          editingId ? "✅ Item Updated Successfully!" : "🎉 Item Added!"
        );
      } else {
        toast.error("❌ Something went wrong!");
      }
    } catch (err) {
      console.log("ADD ITEM ERROR 👉", err);
      setIsAddItem(false);
      const errorMessage =
        err.response?.data?.message || err.message || "Something went wrong";

      toast.error(errorMessage);
    }
    // } catch {
    //   setIsAddItem(false);
    //   toast.error("❌ Something went wrong!");
    // }
  };

  // ❌ Delete item
  const handleDelete = async (id) => {
    toast.info(
      <div className="flex flex-col items-start">
        <p className="font-semibold">Are you sure you want to delete?</p>
        <div className="mt-2 flex gap-3">
          <button
            onClick={async () => {
              await fetch(`${API}/api/inventory/${id}`, { method: "DELETE" });
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

  // edit
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
    <div className="inventory-container">
      {/* Header */}
      <div className="inventory-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📦 Inventory Management</h1>
            <p>Manage your farm products and stock levels efficiently</p>
          </div>
          <button className="add-item-btn" onClick={handleAddItemClick}>
            <FaPlus /> Add New Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="search">🔍 Search Items</label>
            <input
              id="search"
              type="text"
              placeholder="Search by name..."
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          <div className="filter-group">
            <label htmlFor="category">📂 Category</label>
            <select
              id="category"
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            >
              <option value="">All Categories</option>
              <option value="Seeds">🌱 Seeds</option>
              <option value="Fertilizers">🧪 Fertilizers</option>
              <option value="Pesticides">⚠️ Pesticides</option>
              <option value="Others">📦 Others</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="unit">⚖️ Unit</label>
            <select
              id="unit"
              onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
            >
              <option value="">All Units</option>
              <option value="kg">KG</option>
              <option value="packet">Packet</option>
              <option value="liter">Liter</option>
              <option value="piece">Piece</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="stock">📊 Stock Status</label>
            <select
              id="stock"
              onChange={(e) =>
                setFilters({ ...filters, stock: e.target.value })
              }
            >
              <option value="">All Stock</option>
              <option value="low">⚠️ Low Stock</option>
              <option value="high">✅ High Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="table-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No items found</h3>
            <p>Try adjusting your filters or add a new item</p>
            <button
              className="add-item-btn"
              onClick={handleAddItemClick}
              style={{ marginTop: "1rem" }}
            >
              <FaPlus /> Add Your First Item
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Price (₹)</th>
                  <th>Current Stock</th>
                  <th>Low Stock Alert</th>
                  <th>Status</th>
                  <th>Stock Level</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td data-label="Name">
                      <strong>{item.name}</strong>
                    </td>
                    <td data-label="Category">
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td data-label="Unit">{item.unit}</td>
                    <td data-label="Price">₹{item.price.toLocaleString()}</td>
                    <td data-label="Current Stock">
                      <span className="stock-count">{item.currentStock}</span>
                    </td>
                    <td data-label="Low Stock Alert">{item.lowStockAlert}</td>
                    <td data-label="Status">
                      <span
                        className={`status-badge status-${item.status.toLowerCase()}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td data-label="Stock Level">
                      <span
                        className={
                          item.currentStock <= item.lowStockAlert
                            ? "stock-low"
                            : "stock-high"
                        }
                      >
                        {item.currentStock <= item.lowStockAlert
                          ? "⚠️ Low Stock"
                          : "✅ High Stock"}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(item)}
                          aria-label="Edit item"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(item._id)}
                          aria-label="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {items.length > 0 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>

          <span className="page-info">
            Page {page} of {totalPages}
            <span style={{ marginLeft: "0.5rem", color: "#94a3b8" }}>
              ({items.length} items)
            </span>
          </span>

          <button
            className="pagination-btn"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-icon-container">
                  <FaSeedling />
                </div>
                <div className="modal-title-section">
                  <h2>
                    {editingId
                      ? "Update Product & Stock"
                      : "New Farm Product Entry"}
                  </h2>
                  <p>
                    {editingId
                      ? "Edit existing inventory item"
                      : "Add new item to your inventory"}
                  </p>
                </div>
              </div>
              <button
                className="close-button"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Product Inventory & Pricing */}
              <fieldset className="modal-fieldset">
                <legend className="modal-legend">
                  <FaBoxOpen className="section-icon" />
                  Product Inventory & Pricing
                </legend>

                <div className="form-grid">
                  {/* Item Name */}
                  <div className="form-group">
                    <label className="form-label required">Product Name</label>
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
                      autoFocus
                    />
                  </div>

                  {/* Category */}
                  <div className="form-group">
                    <label className="form-label required">Category</label>
                    <select
                      className="form-select"
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
                    <label className="form-label required">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-input"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      required
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>

                  {/* Current Quantity */}
                  <div className="form-group">
                    <label className="form-label required">
                      Current Stock Quantity
                    </label>
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
                      onWheel={(e) => e.target.blur()}
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
                    <label className="form-label required">
                      Low Stock Alert Level
                    </label>
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
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Replenish & Supplier */}
              <fieldset className="modal-fieldset">
                <legend className="modal-legend">
                  <FaPlus className="section-icon" />
                  Replenish Stock & Supplier Details
                </legend>

                {loadingSupplier && (
                  <div className="loading-overlay">
                    <div className="spinner"></div>
                  </div>
                )}

                <div className="form-grid">
                  {/* Phone */}
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Enter 10-digit phone number"
                      value={form.phone}
                      onChange={(e) => {
                        const phone = e.target.value;
                        setForm({ ...form, phone });

                        if (phone.length === 10) {
                          fetchSupplierByPhone(phone);
                        }

                        if (phone.length < 10) {
                          setForm((prev) => ({
                            ...prev,
                            supplier_name: "",
                            address: "",
                            bought_price: "",
                            supplier_quantity: "",
                          }));
                        }
                      }}
                      maxLength="10"
                      pattern="[0-9]{10}"
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
                      step="1"
                      className="form-input"
                      placeholder="0"
                      value={form.bought_price}
                      disabled={loadingSupplier}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          bought_price:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>

                  {/* Quantity to Add */}
                  {!isadditem && (
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
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          })
                        }
                        onWheel={(e) => e.target.blur()}
                      />
                    </div>
                  )}

                  {/* Address */}
                  <div className="form-group full-width">
                    <label className="form-label">Supplier Address</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Enter full address"
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
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loadingSupplier}
                >
                  {loadingSupplier ? (
                    <>
                      <div
                        className="spinner"
                        style={{ width: "1.25rem", height: "1.25rem" }}
                      ></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <FaCheck className="button-icon" />
                      {editingId
                        ? "Update Item & Stock"
                        : "Confirm & Add Inventory"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
