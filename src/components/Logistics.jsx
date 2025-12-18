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
  FaWarehouse,
} from "react-icons/fa";
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
        // console.log(data, "data");

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

      console.log("data", data);
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
    console.log("here", form.supplier_quantity);
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
      supplier_name || phone || address || bought_price !== "";
    // supplier_quantity !== "";

    if (hasSupplierInfo) {
      // if (!supplier_quantity || Number(supplier_quantity) <= 0) {
      //   toast.warn("⚠️ Please enter valid supplier quantity to add");
      //   return;
      // }
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API}/api/inventory/${editingId}`
      : `${API}/api/inventory`;

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
        setIsAddItem(false);
        toast.success(
          editingId ? "✅ Item Updated Successfully!" : "🎉 Item Added!"
        );
      } else {
        toast.error("❌ Something went wrong!");
      }
    } catch {
      setIsAddItem(false);
      toast.error("❌ Something went wrong!");
    }
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
    console.log("hitt");
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
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Items</h1>

      {/* 🔍 Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            className="pl-8 border rounded-md p-2 w-full"
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Category */}
        <select
          className="border rounded-md p-2"
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Seeds">Seeds</option>
          <option value="Fertilizers">Fertilizers</option>
          <option value="Pesticides">Pesticides</option>
          <option value="Others">Others</option>
        </select>

        {/* Unit */}
        <select
          className="border rounded-md p-2"
          onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
        >
          <option value="">All Units</option>
          <option value="kg">KG</option>
          <option value="packet">Packet</option>
        </select>

        {/* Stock */}
        <select
          className="border rounded-md p-2"
          onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
        >
          <option value="">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="high">High Stock</option>
        </select>
      </div>
      <div>
        <button
          onClick={handleAddItemClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all text-lg flex items-center gap-2"
        >
          <FaPlus /> Add New Item
        </button>
      </div>

      {/* 📦 Items List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white border rounded-2xl p-4 shadow-sm space-y-2"
            >
              {/* Title + Badge */}
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">{item.name}</h2>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.currentStock <= item.lowStockAlert
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {item.currentStock <= item.lowStockAlert
                    ? "Low Stock"
                    : "High Stock"}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                {item.category} • {item.unit}
              </p>

              <p className="text-sm font-medium">
                Price per unit {item.price}₹
              </p>
              <p className="text-sm">Current stock: {item.currentStock}</p>
              <p className="text-sm">low stock alert: {item.lowStockAlert}</p>
              <p className="text-sm">status: {item.status}</p>
              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="p-2 border rounded-md hover:bg-gray-100"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={() => handleDelete(item._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⏭ Pagination */}
      <div className="flex justify-center items-center gap-4">
        <button
          className="px-3 py-1 border rounded-md disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span className="text-sm">
          Page {page} / {totalPages}
        </span>

        <button
          className="px-3 py-1 border rounded-md disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* edit form editing items */}
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
                      // step="0.01"

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
                      onWheel={(e) => e.target.blur()}
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
                      onWheel={(e) => e.target.blur()}
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
                      // step="0.01"
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
