import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaBoxOpen } from "react-icons/fa";
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
      toast.warn("⚠️ Please fill all item fields!");
      return;
    }

    const hasSupplierInfo =
      supplier_name ||
      phone ||
      address ||
      bought_price !== "" ||
      supplier_quantity !== "";

    if (hasSupplierInfo) {
      if (!supplier_quantity || supplier_quantity <= 0) {
        toast.warn("⚠️ Please enter valid supplier quantity");
        return;
      }
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    const payload = {
      name: item_name,
      quantity: Number(quantity),
      stockAlert: Number(stockAlert),
      price: Number(price),
    };

    if (hasSupplierInfo) {
      payload.supplier = {
        name: supplier_name,
        phone,
        address,
        boughtPrice: Number(bought_price),
        quantityAdded: Number(supplier_quantity),
      };
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
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
        setShowModal(false);
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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#121212] flex flex-col items-center px-6 py-10 text-gray-100 relative">
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
            <FaBoxOpen className="text-cyan-400" /> Inventory Dashboard
          </h1>
          <button
            onClick={() => {
              setShowModal(true);
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
            }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-md flex items-center gap-2 transition-all"
          >
            <FaPlus /> Add Item
          </button>
        </div>
        {/* Inventory Table */}
        <div className="overflow-hidden rounded-2xl shadow-xl border border-gray-800 bg-[#121212]/80 backdrop-blur-xl">
          <table className="w-full text-base md:text-lg">
            <thead className="bg-gradient-to-r from-cyan-600 to-blue-700 text-left text-white">
              <tr>
                <th className="py-4 px-6 font-semibold">Item Name</th>
                <th className="py-4 px-6 font-semibold">Quantity</th>
                <th className="py-4 px-6 font-semibold">Stock Alert</th>
                <th className="py-4 px-6 font-semibold">Price</th>
                <th className="py-4 px-6 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item._id}
                    className={`border-t border-gray-800 transition ${
                      item.quantity <= item.stockAlert ? "bg-red-900/40" : "hover:bg-gray-800/40"
                    }`}
                  >
                    <td className="py-4 px-6 capitalize">{item.item_name || item.item?.name}</td>
                    <td className="py-4 px-6">{item.quantity}</td>
                    <td
                      className={`py-4 px-6 font-semibold ${
                        item.quantity <= item.stockAlert ? "text-red-400" : "text-yellow-400"
                      }`}
                    >
                      {item.stockAlert}
                    </td>
                    <td className="py-4 px-6">${item.price}</td>
                    <td className="py-3 px-6 flex justify-center gap-5">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-400 hover:text-red-300 transition flex items-center gap-1"
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400 italic">
                    No items found 🕊️
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="w-full max-w-2xl bg-[#121212]/95 border border-gray-700 rounded-2xl shadow-2xl p-8 animate-pop relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => {
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
              }}
              className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl font-bold"
            >
              ✕
            </button>
            <h2 className="text-3xl font-semibold mb-6 text-cyan-400 text-center">
              {editingId ? "✏️ Edit Item" : "➕ Add New Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2 text-base">Item Name</label>
                  <input
                    type="text"
                    placeholder="Enter item name"
                    value={form.item_name}
                    onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                    className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
                    required
                    disabled={!!editingId} // disable editing item name during edit
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-base">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 20"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-base">Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={form.stockAlert}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stockAlert: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-base">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 99.99"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Supplier Details Section */}
              <div className="mt-8 border-t border-gray-700 pt-6">
                <h3 className="text-xl font-semibold text-green-400 mb-4">Supplier Details (optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 mb-2 text-base">Supplier Name</label>
                    <input
                      type="text"
                      placeholder="Supplier Name"
                      value={form.supplier_name}
                      onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                      className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-base">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-400 mb-2 text-base">Address</label>
                    <textarea
                      placeholder="Supplier Address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500 resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-base">Bought Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Bought Price"
                      value={form.bought_price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          bought_price: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-base">Quantity Added</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Quantity to add"
                      value={form.supplier_quantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          supplier_quantity: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-8 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all"
              >
                {editingId ? "Update Item" : "Add Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
