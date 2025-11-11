import React, { useEffect, useState } from "react";
import { FaBox, FaHistory } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/api/inventory";

export default function SupplierHistoryPage() {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch all inventory items on mount
  useEffect(() => {
    fetch(`${API_URL}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        if (data.length > 0) {
          setSelectedItemId(data[0]._id);
          setSelectedItemName(data[0].item.name || data[0].item_name || "Item");
        }
      })
      .catch(() => toast.error("Failed to load inventory items"));
  }, []);

  // Fetch supplier history when selectedItemId changes
  useEffect(() => {
    if (!selectedItemId) return;
 console.log(selectedItemId)
    setLoadingHistory(true);
    fetch(`${API_URL}/supplier-history/${selectedItemId}`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoadingHistory(false);
      })
      .catch(() => {
        toast.error("Failed to load supplier history");
        setLoadingHistory(false);
      });
  }, [selectedItemId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-6 flex flex-col md:flex-row max-w-7xl mx-auto gap-6">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* Left panel: Items list */}
      <div className="md:w-1/3 bg-gray-900 rounded-xl shadow-lg p-4 flex flex-col">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-cyan-400">
          <FaBox /> Inventory Items
        </h2>
        <ul className="flex-1 overflow-y-auto divide-y divide-gray-700">
          {items.length === 0 && (
            <li className="py-4 text-center text-gray-500 italic">
              No inventory items found
            </li>
          )}
          {items.map((item) => {
            const itemName = item.item?.name || item.item_name || "Unnamed";
            const isSelected = selectedItemId === item._id;
            return (
              <li
                key={item._id}
                className={`cursor-pointer px-4 py-3 rounded-lg mb-1 ${
                  isSelected
                    ? "bg-cyan-600 text-white font-semibold shadow-lg"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => {
                  setSelectedItemId(item._id);
                  setSelectedItemName(itemName);
                }}
              >
                {itemName}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right panel: Supplier history */}
      <div className="md:w-2/3 bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-green-400">
          <FaHistory /> Supplier History for{" "}
          <span className="ml-2 text-cyan-400">{selectedItemName}</span>
        </h2>

        {loadingHistory ? (
          <p className="text-center text-gray-400 mt-10">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-center text-gray-400 italic mt-10">
            No supplier history found for this item.
          </p>
        ) : (
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full text-left text-gray-100 border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 font-semibold">Supplier Name</th>
                  <th className="py-3 px-4 font-semibold">Phone</th>
                  <th className="py-3 px-4 font-semibold">Address</th>
                  <th className="py-3 px-4 font-semibold">Bought Price ($)</th>
                  <th className="py-3 px-4 font-semibold">Quantity Added</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr
                    key={entry._id}
                    className="border-b border-gray-700 hover:bg-gray-700 transition"
                  >
                    <td className="py-3 px-4">{entry.supplierName}</td>
                    <td className="py-3 px-4">{entry.supplierPhone}</td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {entry.supplierAddress || "-"}
                    </td>
                    <td className="py-3 px-4">${entry.boughtPrice.toFixed(2)}</td>
                    <td className="py-3 px-4">{entry.quantityAdded}</td>
                    <td className="py-3 px-4">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
