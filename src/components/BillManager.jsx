////// BillManager.jsx
////import React, { useEffect, useState } from "react";
//import React, { useEffect, useState } from "react";
//import EditBillModal from "./EditBill"; // make sure the path is correct
//import "../styles/BillManager.css";

//function BillManager() {
//  const [bills, setBills] = useState([]);
//  const [editModalOpen, setEditModalOpen] = useState(false);
//  const [selectedBill, setSelectedBill] = useState(null);
//  const [statusFilter, setStatusFilter] = useState("all");
//  const [search, setSearch] = useState("");
//  const [page, setPage] = useState(1);
//  const [totalPages, setTotalPages] = useState(1);
//  const [limit] = useState(10);

//  const token = localStorage.getItem("token");
//  const BASE_URL = "http://localhost:8080/api";

//  useEffect(() => {
//    fetchBills();
//  }, [statusFilter, search, page]);

//  const fetchBills = async () => {
//    try {
//      const res = await fetch(
//        `${BASE_URL}/payment/today-pending/?status=${statusFilter}&name=${search}&page=${page}&limit=${limit}`,
//        {
//          headers: { Authorization: `Bearer ${token}` }
//        }
//      );
//      const data = await res.json();
//      if (data.success) {
//        setBills(data.data);
//        setTotalPages(Math.ceil(data.total / limit));
//      }
//    } catch (err) {
//      console.error("Error fetching bills:", err);
//    }
//  };

//  const handleEdit = (bill) => {
//    setSelectedBill(bill);
//    setEditModalOpen(true);
//  };

//const handleResend = async (id) => {
//  try {
//    const res = await fetch(`${BASE_URL}/payment/${id}/send-again`, {
//      method: "POST",
//      headers: { Authorization: `Bearer ${token}` }
//    });
//    const data = await res.json();
//    alert(data.message);
//  } catch (err) {
//    console.error("Resend failed:", err);
//  }
//};

////const handleResendAll = async (customerId) => {

////  try {
////    const res = await fetch(`${BASE_URL}/payment/${customerId}/resend-all`, {
////      method: "POST",
////      headers: { Authorization: `Bearer ${token}` }
////    });
////    const data = await res.json();
////    alert(data.message);
////  } catch (err) {
////    console.error("Resend All failed:", err);
////  }
////};


//  return (
//    <div className="bill-container">
//      <h2 className="title">🧾 Aaj ke Bills</h2>

//      <div className="filters">
//        <input
//          type="text"
//          placeholder="Search by name..."
//          value={search}
//          onChange={(e) => {
//            setSearch(e.target.value);
//            setPage(1);
//          }}
//        />

//        <select
//          value={statusFilter}
//          onChange={(e) => {
//            setStatusFilter(e.target.value);
//            setPage(1);
//          }}
//        >
//          <option value="all">All</option>
//          <option value="pending">Pending</option>
//          <option value="sent">Sent</option>
//          <option value="failed">Failed</option>
//          <option value="updated">Updated</option>
//        </select>
//      </div>

//      {bills.length === 0 ? (
//        <p className="no-bills">📭 No bills for today.</p>
//      ) : (
//        <table className="bill-table">
//          <thead>
//            <tr>
//              <th>Name</th>
//              <th>Amount Paid</th>
//              <th>Items</th>
//              <th>Status</th>
//              <th>Actions</th>
//            </tr>
//          </thead>
//          <tbody>
//            {bills.map((bill) => (
//              <tr key={bill._id}>
//                <td>{bill.customerName || bill.name}</td>
//                <td>₹{bill.amountPaid}</td>
//                <td>{bill.items.map(i => `${i.name} (${i.quantity})`).join(", ")}</td>
//                <td>
//                  <span className={`status ${bill.billStatus}`}>
//                    {bill.billStatus.toUpperCase()}
//                  </span>
//                </td>
//                <td>
//                  <button onClick={() => handleEdit(bill)} className="btn edit">Edit</button>
//                 <button onClick={() => handleResend(bill._id)} className="btn resend">Resend</button>
//  {/*<button   onClick={() =>
//    handleResendAll(typeof bill.userId === "string" ? bill.userId : bill.userId._id)
//  } className="btn resendAll">Resend All</button>*/}
//                </td>
//              </tr>
//            ))}
//          </tbody>
//        </table>
//      )}

//      {/* ✅ Modal render outside table */}
//      {editModalOpen && selectedBill && (
//        <EditBillModal
//          bill={selectedBill}
//          onClose={() => setEditModalOpen(false)}
//          onUpdate={() => {
//            setEditModalOpen(false);
//            fetchBills(); // ✅ reload only updated list
//          }}
//        />
//      )}
//    </div>
//  );
//}

//export default BillManager;



import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditBillModal from "./EditBill";
import "../styles/BillManager.css";
import { FiBookmark, FiDatabase } from "react-icons/fi";
import debounce from "lodash.debounce";
const apiBaseUrl = import.meta.env.VITE_API_URL;


function BillManager() {
  const [bills, setBills] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
const [debouncedSearch, setDebouncedSearch] = useState("");  
const token = localStorage.getItem("token");
  const BASE_URL =  `${apiBaseUrl}/api`  ;


  useEffect(() => {
  const handler = debounce(() => setDebouncedSearch(search), 500);
  handler();
  return () => handler.cancel();
}, [search]);


  useEffect(() => {
    fetchBills();
  }, [statusFilter, debouncedSearch, page]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/payment/today-pending/?date=${date}&status=${statusFilter}&name=${debouncedSearch}&page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      if (data.success) {
        setBills(data.data);
        setTotalPages(Math.ceil(data.total / limit));
      }
    } catch (err) {
      toast.error("Failed to fetch bills");
      //console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bill) => {
    setSelectedBill(bill);
    setEditModalOpen(true);
  };

  const handleResend = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/payment/${id}/send-again`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      toast.success(data.message);
      fetchBills(); // Refresh list
    } catch (err) {
      toast.error("Resend failed");
      console.error("Resend failed:", err);
    }
  };

  return (
    <div className="bill-manager-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="header-section">
        <h2>
            {/*<FiDatabase><span></span></FiDatabase>*/}
             Today's Bills</h2>
        <div className="controls">
          <input
            type="text"
            placeholder="Search customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            //  setPage(1);
            }}
            className="search-input"
          />
       <input type="date"
       className="status-filter"
       onChange={(e) => setDate(e.target.value)} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="updated">Updated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : bills.length === 0 ? (
        <div className="empty-state">
          <img src="/empty-bills.svg" alt="No bills" width={120} />
          <p>No bills found for today</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="bills-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount Paid</th>
                  <th className="hide-on-mobile">Items</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill._id}>
                    <td>{bill.customerName || bill.name}</td>
                    <td>₹{bill.amountPaid.toFixed(2)}</td>
                    <td className="hide-on-mobile">
                      {bill.items.slice(0, 2).map((i) => (
                        <span key={i._id} className="item-tag">
                          {i.name} ({i.quantity})
                        </span>
                      ))}
                      {bill.items.length > 2 && (
                        <span className="more-items">+{bill.items.length - 2} more</span>
                      )}
                    </td>
                    <td>
                      <span className={`ss ${bill.billStatus}`}>
                        {bill.billStatus}
                      </span>
                    </td>
                    <td className="actions">
                      <button 
                        onClick={() => handleEdit(bill)} 
                        className="action-btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleResend(bill._id)}
                        className="action-btn resend"
                      >
                        Resend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {editModalOpen && selectedBill && (
        <EditBillModal
          bill={selectedBill}
          onClose={() => setEditModalOpen(false)}
          onUpdate={() => {
            setEditModalOpen(false);
            fetchBills();
            toast.success("Bill updated successfully");
          }}
        />
      )}
    </div>
  );
}

export default BillManager;