import React, { useState, useEffect } from "react";
import "../styles/CustomerList.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const apiBaseUrl = import.meta.env.VITE_API_URL;

import {
  FiSearch,
  FiEye,
  FiEdit2,
  FiDollarSign,
  FiChevronRight,
  FiDelete,
  FiCalendar,
  FiFilter,
  FiX,
  FiActivity,
  FiMessageCircle,
  FiPhoneForwarded,
  FiAward,
  FiAlertCircle,
  FiPlay,
  FiClipboard,
  FiRepeat,
} from "react-icons/fi";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null,
    month: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Prepare query params
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search,
      };

      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom.toISOString().split("T")[0];
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo.toISOString().split("T")[0];
      }
      if (filters.month) {
        params.month = filters.month;
      }

      const response = await axios.get(`${apiBaseUrl}/api/customers`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setCustomers(response.data.customers);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        pages: response.data.pages,
      });
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch customers"
      );
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, search, filters]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on new search
  };

  const handleDateFilterChange = (dates) => {
    const [start, end] = dates;
    setFilters((prev) => ({
      ...prev,
      dateFrom: start,
      dateTo: end,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleMonthFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      month: e.target.value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      month: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleNavigatepayment = async (id) => {

    try {
      const token = localStorage.getItem("token"); //  Get token from localStorage
      //`http://localhost:8080/api/customers/${id}` ye purana hai
      const res = await axios.get(`${apiBaseUrl}/api/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // 🛡️ Send token in header
        },
      });

      navigate("/dashboard/addPayments", { state: { customer: res.data } }); // 👈 pass customer data via route
    } catch (err) {
      console.error("Failed to fetch customer:", err);
    }
  };

  //to send reminders
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

  const handleNavigateview = async (id) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${apiBaseUrl}/api/customers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    navigate(`/dashboard/customerDetail/${id}`, {
      state: { customer: res.data.customer, payments: res.data.payments },
    });
  };

  const handleAddCustomers = (customer) => {
    navigate("/dashboard/customers", { state: { customer } });
  };

  const handleNavigateedit = (customerId) => {
    navigate(`/dashboard/EditCustomer/${customerId}`);
  };

  //to delete
  const handleDeleteCustomer = async (customerId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token"); // or sessionStorage.getItem('token')

      const res = await fetch(
        `${apiBaseUrl}/api/customers/customers/${customerId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Send the token
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        //alert(data.message);
        toast.success("customer and his paymnet history deleted");

        setCustomers((prev) => prev.filter((c) => c._id !== customerId));
      } else {
        alert(data.message || "Failed to delete customer.");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  //to handle all epports
  const handleExportAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiBaseUrl}/api/export/customers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "all-customers.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("❌ Failed to export all customers.");
      console.error(err);
    }
  };

  return (
    <div className="customer-list-container">
      {/* we will work later on it  */}
      {/* <button 
  onClick={handleExportAll}
  className="export-all-btn"
  title="Export All Customers Data"
>
  <i className="fas fa-file-export"></i>
  <span>Export All</span>
</button> */}

      <div className="customer-list-header">
        <h2>Customer Management</h2>

        <div className="controls-container">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-box"
              placeholder="Search customers..."
              value={search}
              onChange={handleSearch}
            />
          </div>

          {/* <button
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> {showFilters ? "Hide Filters" : "Filters"}
          </button> */}
        </div>

        {/* {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>
                <FiCalendar className="filter-icon" />
                Date Range:
              </label>
              <DatePicker
                selectsRange
                startDate={filters.dateFrom}
                endDate={filters.dateTo}
                onChange={handleDateFilterChange}
                isClearable
                placeholderText="Select date range"
                className="date-picker"
              />
            </div>

            <div className="filter-group">
              <label>
                <FiCalendar className="filter-icon" />
                Month:
              </label>
              <input
                type="month"
                value={filters.month}
                onChange={handleMonthFilterChange}
                className="month-picker"
              />
            </div>

            <button className="clear-filters-btn" onClick={clearFilters}>
              <FiX /> Clear Filters
            </button>
          </div>
        )} */}
      </div>

      {loading ? (
        <div className="loading-state">Loading customers...</div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchCustomers}>Retry</button>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Next Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">
                      <div className="empty-state">
                        <p>No customers found</p>
                        <small>Try adjusting your search or filters</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => {
                    const remaining = cust.totalAmount - cust.paidAmount;
                    const isPaidFull = remaining <= 0;

                    return (
                      <tr key={cust._id}>
                        <td className="customer-name">
                          <div className="avatar">{cust.name.charAt(0)}</div>
                          <div>
                            <p className="name">{cust.name}</p>
                            <small className="text-muted">
                              ID: {cust._id.substring(0, 6)}
                            </small>
                          </div>
                        </td>
                        <td className="contact">
                          <p style={{ color: "grey" }}>{cust.phone}</p>
                          <small className="text-muted">India</small>
                        </td>

                        <td className="amount" style={{ color: "gray" }}>
                          {cust.address}
                        </td>

                        <td className="amount" style={{ color: "gray" }}>
                          ₹{cust.totalAmount.toLocaleString()}
                        </td>
                        <td className="amount paid">
                          ₹{cust.paidAmount.toLocaleString()}
                        </td>
                        <td className="amount remaining">
                          ₹{remaining.toLocaleString()}
                        </td>
                        <td className="payment-date">
                          {isPaidFull ? (
                            <span className="badge success">Completed</span>
                          ) : (
                            <>
                              <p style={{ color: "grey" }}>
                                <span
                                  className="truncate-text"
                                  title={new Date(
                                    cust.nextPaymentDate
                                  ).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                >
                                  {new Date(
                                    cust.nextPaymentDate
                                  ).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              </p>

                              <small style={{ color: "red" }}>
                                {new Date(
                                  cust.nextPaymentDate
                                ).toLocaleDateString() ===
                                new Date().toLocaleDateString()
                                  ? "Today"
                                  : `${Math.ceil(
                                      (new Date(cust.nextPaymentDate) -
                                        new Date()) /
                                        (1000 * 60 * 60 * 24)
                                    )} days`}
                              </small>
                            </>
                          )}



                        </td>
                        <td className="actions">
                          <div className="tooltip">
                            <button
                              className="action-btn view"
                              onClick={() => handleNavigateview(cust._id)}
                            >
                              <FiEye />
                            </button>
                            <span className="tooltiptext">View Details</span>
                          </div>

                          <div className="tooltip">
                            <button
                              className="action-btn edit"
                              onClick={() => handleNavigateedit(cust._id)}
                            >
                              <FiEdit2 />
                            </button>
                            <span className="tooltiptext">Edit Customer</span>
                          </div>

                          {!isPaidFull && (
                            <div className="tooltip">
                              <button
                                className="action-btn pay"
                                onClick={() => handleNavigatepayment(cust._id)}
                              >
                                <FiDollarSign />
                              </button>
                              <span className="tooltiptext">Add Payment</span>
                            </div>
                          )}

                          <div className="tooltip">
                            <button
                              className="action-btn add"
                              onClick={() => handleAddCustomers(cust)}
                            >
                              <FiRepeat />
                            </button>
                            <span className="tooltiptext">Update Customer</span>
                          </div>

                          <div className="tooltip">
                            <button
                              className="action-btn reminder"
                              onClick={() => sendReminder(cust._id)}
                            >
                              <FiPhoneForwarded />
                            </button>
                            <span className="tooltiptext">Send Reminder</span>
                          </div>

                          <div className="tooltip">
                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteCustomer(cust._id)}
                            >
                              <FiDelete />
                            </button>
                            <span className="tooltiptext">Delete Customer</span>
                          </div>
                        </td>



                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <div className="summary">
              Showing {customers.length} of {pagination.total} customers
              {filters.dateFrom || filters.dateTo || filters.month ? (
                <span className="filter-indicator"> (filtered)</span>
              ) : null}
            </div>
            <div className="pagination">
              <button
                className={`page-btn ${
                  pagination.page === 1 ? "disabled" : ""
                }`}
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${
                      pagination.page === pageNum ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className={`page-btn ${
                  pagination.page === pagination.pages ? "disabled" : ""
                }`}
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerList;
