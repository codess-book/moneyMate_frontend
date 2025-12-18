import React, { useState } from "react";
import "../styles/AdminPanle.css";
import {
  FiUsers,
  FiDollarSign,
  FiClock,
  FiAlertCircle,
  FiEye,
  FiPlus,
  FiList,
  FiFileText,
  FiDownload,
  FiSend,
} from "react-icons/fi";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const apiBaseUrl = import.meta.env.VITE_API_URL;

const AdminPanel = () => {
  const [customerSummary, setCustomerSummary] = useState("");
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState("false");

  const Navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${apiBaseUrl}/api/dashboard/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCustomerSummary(response.data);
      } catch (error) {
        console.error(
          "Error fetching profile:",
          error.response?.data || error.message
        );
      }
    };

    fetchData();
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchUpcomingPayments = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/dashboard/upcoming`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUpcoming(res.data); // make sure res.data is the array
      } catch (err) {
        console.error("Error fetching upcoming payments:", err);
      }
    };

    fetchUpcomingPayments();
  }, []);

  //  Conditional rendering below all hooks
  if (!customerSummary) return <p>Loading dashboard...</p>;

  const sendReminder = async (customerId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${apiBaseUrl}/api/customers/reminder/${customerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //alert("📨 Reminder sent successfully!");
      toast.success("📨 Reminder sent successfully!");
    } catch (err) {
      console.error("Reminder send error:", err);
      alert("❌ Failed to send reminder");
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your business</p>
      </div>

      {loading && <p>Loading...</p>}

      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon customers">
            <FiUsers />
          </div>
          <div className="card-content">
            <h3>Total Customers</h3>
            <p>{customerSummary.totalCustomers}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon paid" style={{ color: "white" }}>
            <FiDollarSign />
          </div>
          <div className="card-content">
            <h3>Total Paid</h3>
            <p>₹{customerSummary.totalPaid.toLocaleString()}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon remaining" style={{ color: "white" }}>
            <FiAlertCircle />
          </div>
          <div className="card-content">
            <h3>Total Remaining</h3>
            <p>₹{customerSummary.totalRemaining.toLocaleString()}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon upcoming">
            <FiClock />
          </div>
          <div className="card-content">
            <h3>Upcoming Payments</h3>
            <p>{customerSummary.upcomingPayments}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Upcoming Payments</h2>
          <span className="badge">{upcoming.length} pending</span>
        </div>

        <div className="reminders-table">
          <div className="table-header">
            <div className="header-cell customer">Customer</div>
            <div className="header-cell contact">Contact</div>
            <div className="header-cell amount">Amount Due</div>
            <div className="header-cell date">Due Date</div>
            <div className="header-cell action">Action</div>
          </div>

          {upcoming.map((reminder, idx) => (
            <div className="table-row" key={idx}>
              <div className="table-cell customer-cell">
                <div className="avatar">{reminder.name.charAt(0)}</div>
                <div>
                  <p className="name">{reminder.name}</p>
                  {/*<small className="text-muted">Due in {reminder.daysLeft} days</small>*/}
                </div>
              </div>
              <div className="table-cell contact-cell">{reminder.phone}</div>
              <div className="table-cell amount-cell due">
                ₹{reminder.dueAmount}
              </div>
              <div className="table-cell date-cell">
                {new Date(reminder.dueDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="table-cell action-cell">
                <button
                  className="action-btn-pannel view"
                  onClick={() => Navigate("/dashboard/viewCustomers")}
                >
                  <FiEye className="btn-icon" />{" "}
                  <span className="btn-text">View</span>
                </button>
                <button
                  className="action-btn-pannel"
                  onClick={() => sendReminder(reminder._id)} // Use reminder._id
                >
                  <FiSend className="btn-icon" /> <span>Send Reminder</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button
            className="action-btn-panel primary"
            onClick={() => Navigate("/dashboard/customers")}
          >
            <FiPlus className="btn-icon" /> <span>Add Customer</span>
          </button>
          <button
            className="action-btn-panel"
            onClick={() => Navigate("/dashboard/viewCustomers")}
          >
            <FiList className="btn-icon" /> <span>View All</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
