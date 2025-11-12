import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaClipboardList, FaSeedling, FaTag, FaWarehouse } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/api/inventory";

export default function Inventory() {
  const [items, setItems] = useState([]);

  // Form state for add/edit item including supplier details
  const [form, setForm] = useState({
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

  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      toast.error("Failed to load inventory!");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handler to open the modal for a new item, resetting the form
  const handleAddItemClick = () => {
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
    const {
      item_name,
      quantity,
      stockAlert,
      price,
      supplier_name,
      phone,
      address,
      bought_price,
      supplier_quantity,
    } = form;

    if (!item_name || quantity === "" || stockAlert === "" || price === "") {
      toast.warn("⚠️ Please fill all product inventory and pricing fields!");
      return;
    }

    const hasSupplierInfo =
      supplier_name ||
      phone ||
      address ||
      bought_price !== "" ||
      supplier_quantity !== "";

    if (hasSupplierInfo) {
      if (!supplier_quantity || Number(supplier_quantity) <= 0) {
        toast.warn("⚠️ Please enter valid supplier quantity to add");
        return;
      }
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    const initialQuantity = method === "POST" ? Number(quantity) : 0; 
    
    const payload = {
      name: item_name,
      quantity: initialQuantity, 
      stockAlert: Number(stockAlert),
      price: Number(price),
    };

    if (hasSupplierInfo) {
      if (method === "PUT") {
        payload.quantity = Number(items.find(item => item._id === editingId)?.quantity || 0) + Number(supplier_quantity);
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
        toast.success(editingId ? "✅ Item Updated Successfully!" : "🎉 Item Added!");
      } else {
        toast.error("❌ Something went wrong!");
      }
    } catch {
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
          <button onClick={() => toast.dismiss()} className="bg-gray-700 text-white px-3 py-1 rounded-md">
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  const handleEdit = (item) => {
    setForm({
      item_name: item.item_name || item.item?.name || "",
      quantity: item.quantity || "",
      stockAlert: item.stockAlert || "",
      price: item.price || "",
      supplier_name: "",
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 md:px-8 py-12 text-gray-900 relative">
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 flex items-center gap-4 mb-4 sm:mb-0">
            <span className="text-blue-600 text-5xl">
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
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-3">
            <FaWarehouse className="text-green-600" /> Current Stock Overview
          </h2>
          
          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => {
                const isLowStock = item.quantity <= item.stockAlert;
                return (
                  // Inventory Card
                  <div 
                    key={item._id} 
                    className={`bg-white p-6 rounded-xl shadow-lg border-t-4 transition-all hover:shadow-xl ${
                      isLowStock ? "border-red-500 hover:border-red-600" : "border-green-500 hover:border-green-600"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      {/* Item Name */}
                      <h3 className="text-xl font-bold capitalize text-gray-800 leading-snug">{item.item_name || item.item?.name}</h3>
                      
                      {/* Low Stock Badge */}
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
                        isLowStock 
                          ? "bg-red-500 text-white animate-pulse" 
                          : "bg-green-100 text-green-700"
                      }`}>
                        {isLowStock ? 'LOW STOCK!' : 'In Stock'}
                      </span>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      {/* Current Stock */}
                      <div className="flex justify-between items-center text-gray-600">
                        <span className="font-medium flex items-center gap-2"><FaWarehouse className="text-blue-500" /> Current Stock:</span>
                        <span className="text-2xl font-extrabold text-gray-900">{item.quantity}</span>
                      </div>
                      
                      {/* Price */}
                      <div className="flex justify-between items-center text-gray-600">
                        <span className="font-medium flex items-center gap-2"><FaTag className="text-yellow-500" /> Selling Price:</span>
                        <span className="text-xl font-bold text-green-600">₹{Number(item.price).toFixed(2)}</span>
                      </div>

                      {/* Stock Alert Level */}
                      <div className="flex justify-between items-center text-gray-600">
                        <span className="font-medium flex items-center gap-2"><FaBoxOpen className="text-orange-500" /> Stock Alert At:</span>
                        <span className="text-lg font-semibold text-orange-500">{item.stockAlert}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1 font-medium text-sm p-2 rounded-lg border border-blue-200 hover:bg-blue-50"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-800 transition flex items-center gap-1 font-medium text-sm p-2 rounded-lg border border-red-200 hover:bg-red-50"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
              <p className="text-2xl text-gray-500 font-semibold mb-3">No farm products currently in stock. 🌾</p>
              <p className="text-gray-400">Click "Add New Item" to start managing your inventory!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Item Modal (Kept the highly polished form from the last step) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl relative overflow-hidden max-h-[95vh] text-gray-900 border-4 border-blue-500 animate-fadeInScale">
            {/* Modal Header */}
            <div className="bg-blue-600 p-5 flex justify-between items-center shadow-lg">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <FaSeedling className="text-3xl text-yellow-300" /> {editingId ? "Update Product & Stock" : "New Farm Product Entry"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200 text-3xl font-light p-1 rounded-full hover:bg-blue-700/50 transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
              {/* Product Inventory & Pricing Section - Fieldset for clear grouping */}
              <fieldset className="border p-6 rounded-xl border-gray-300 shadow-sm">
                <legend className="text-xl font-bold text-blue-700 px-3 flex items-center gap-3">
                  <FaBoxOpen className="text-2xl" /> Product Inventory & Pricing
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4">
                  
                  {/* Item Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Organic Wheat Seeds"
                      value={form.item_name}
                      onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
                      required
                      disabled={!!editingId}
                    />
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Selling Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value === "" ? "" : Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                      required
                    />
                  </div>

                  {/* Current Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value === "" ? "" : Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
                      required
                      disabled={!!editingId}
                    />
                     {!!editingId && <p className="mt-1 text-xs text-gray-500 italic">Edit mode: Current stock cannot be directly changed here. Use the "Quantity to Add" field to replenish stock.</p>}
                  </div>

                  {/* Low Stock Alert Level */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Low Stock Alert Level</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="5"
                      value={form.stockAlert}
                      onChange={(e) =>
                        setForm({ ...form, stockAlert: e.target.value === "" ? "" : Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                      required
                    />
                  </div>
                </div>
              </fieldset>

              {/* Replenish Stock & Supplier Details Section - Fieldset for clear grouping */}
              <fieldset className="border p-6 rounded-xl border-gray-300 shadow-sm">
                <legend className="text-xl font-bold text-green-700 px-3 flex items-center gap-3">
                  <FaPlus className="text-2xl" /> Replenish Stock & Supplier Details
                  <span className="text-sm font-medium text-gray-500 ml-4">(Optional - Use for stock additions)</span>
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4">

                  {/* Supplier Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier Name</label>
                    <input
                      type="text"
                      placeholder="Supplier Name"
                      value={form.supplier_name}
                      onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-green-500 focus:border-green-500 placeholder-gray-400"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-green-500 focus:border-green-500 placeholder-gray-400"
                    />
                  </div>
                  
                  {/* Cost Per Unit (Bought Price) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Per Unit (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.bought_price}
                      onChange={(e) =>
                        setForm({ ...form, bought_price: e.target.value === "" ? "" : Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-green-500 focus:border-green-500 placeholder-gray-400"
                    />
                  </div>

                  {/* Quantity to Add Now */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity to Add Now</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.supplier_quantity}
                      onChange={(e) =>
                        setForm({ ...form, supplier_quantity: e.target.value === "" ? "" : Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-green-500 focus:border-green-500 placeholder-gray-400"
                    />
                  </div>

                  {/* Supplier Address - Spans two columns */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier Address</label>
                    <textarea
                      placeholder="Full Address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-green-500 focus:border-green-500 placeholder-gray-400 resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Confirm Button - Large and prominent */}
              <button
                type="submit"
                className="mt-10 w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all"
              >
                {editingId ? "Update Item & Stock" : "Confirm & Add Inventory"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}