import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const apiBaseUrl = import.meta.env.VITE_API_URL;
import socket from "../socket"; // adjust path if needed

import {
  FiHome,
  FiUsers,
  FiCreditCard,
  FiMenu,
  FiX,
  FiSearch,
  FiBell,
  FiUser,
  FiLogOut,
  FiBarChart2,
  FiTruck,
  FiInbox,
  FiEdit2,
  FiPlusCircle,
  FiUserPlus,
  FiDribbble,
  FiDollarSign
} from "react-icons/fi";
import "../styles/Dashboard.css";
import { Outlet } from "react-router-dom";
import { TbPlant2 } from 'react-icons/tb';
import AddCustomer from "./AddCustomer";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [admin, setAdmin] = useState({ name: "", photo: "" }); // 👈 Admin state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiBaseUrl}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        }
        
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();
  }, []);
  
  useEffect(() => {
    socket.on("connect", () => {
      ("🟢 Socket connected:", socket.id);
    });

    socket.on("low-stock-alert", (data) => {
      ("🔔 Low stock alert received:", data);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    return () => {
      socket.off("low-stock-alert");
    };
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, [notifications]);

  // Handler to remove notification by id (will be passed down)
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  // Handler to mark notification read locally and optionally call backend (implement in Notifications component)
 const markNotificationRead = (id) => {
  setNotifications((prev) =>
    prev.map((n) => (n._id === id ? { ...n, read: true } : n))
  );
};



  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  // Toggle sidebar on desktop
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  // Fetch admin profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiBaseUrl}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setAdmin(data);
        } else {
          console.error(data.message || "Failed to fetch admin");
        }
      } catch (err) {
        console.error("Error fetching admin profile:", err);
      }
    };

    fetchAdminProfile();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="navbar neon-border flex items-center justify-between px-4">
        {/* LEFT SECTION */}
        {/* SIDEBAR TOGGLE BTN */}

        <div className="navbar-left flex items-center gap-4">
          {/* ⭐ BRAND LOGO (NEW) */}
          <button
            className="menu-toggle neon-button-icon"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <div className="farm-brand flex items-center gap-2">
            <TbPlant2 className="farm-logo text-green text-2xl md:text-3xl" />

            {/* brand text - mobile hidden */}
            <span className="brand-text text-green text-lg font-semibold hidden sm:block">
            ARYA KRISHI SEVA KENDRA
            </span>
          </div>

        </div>

        {/* RIGHT SECTION */}
        <div className="navbar-right flex items-center gap-4">
          {/* Notifications */}

          <button className="notification-btn neon-button-icon relative" onClick={() => {
            navigate("/dashboard/notifications");
          }}>
            <FiBell size={20} />

            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "11px",
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          {/* <div className="user-profile flex items-center gap-2">
            <img
              src={admin.photo}
              alt="Admin Avatar"
              className="avatar-img"
              crossOrigin="anonymous"
              style={{ width: "30px", height: "30px", borderRadius: "50%" }}
            />
            <span className="username text-white hidden sm:block">
              {admin.name}
            </span>
          </div> */}

          {/* Logout */}
          <button
            className="logout-btn neon-button-icon"
            onClick={handleLogout}
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Toggle (only visible on small screens) */}
      <button
        className="mobile-menu-toggle neon-button-icon"
        onClick={toggleMobileMenu}
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? "open" : "closed"} ${mobileMenuOpen ? "mobile-open" : ""
          }`}
      >
        {/* <div className="sidebar-header">
          <h1 className="brand-text text-white text-lg font-semibold hidden sm:block">MoneyMate</h1>
        </div> */}
        <nav className="sidebar-nav">
          <ul>
            <li
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""
                }`}
              onClick={() => {
                setActiveTab("dashboard");
                setMobileMenuOpen(false);
                navigate("/dashboard");
              }}
            >
              <FiHome className="nav-icon" />
              <span className="brand-text text-green text-sm font-semibold  sm:block">DASHBOARD</span>
            </li>

            <li
              className={`nav-item ${activeTab === "customers" ? "active" : ""
                }`}
              onClick={() => {
                setActiveTab("customers");
                setMobileMenuOpen(false);
                navigate("/dashboard/customers"); // 👈 Navigate to route
              }}
            >
              <FiUserPlus className="nav-icon" />
              <span className="brand-text text-green text-sm font-semibold  sm:block">ADD FARMERS</span>
            </li>

            <li
              className={`nav-item ${activeTab === "viewcustomers" ? "active" : ""
                }`}
              onClick={() => {
                setActiveTab("viewcustomers");
                setMobileMenuOpen(false);
                navigate("/dashboard/viewCustomers");
              }}
            >
              <FiUsers className="nav-icon" />
              <span className="brand-text text-green text-sm font-semibold  sm:block">VIEW FARMERS</span>
            </li>

            <li
              className={`nav-item ${activeTab === "logistics" ? "active" : ""
                }`}
              onClick={() => {
                setActiveTab("logistics");
                setMobileMenuOpen(false);
                navigate("/dashboard/logistics");
              }}
            >
              <FiTruck className="nav-icon" />
              <span className="brand-text text-green text-sm font-semibold  sm:block">INVENTORY</span>
            </li>

            <li
              className={`nav-item ${activeTab === 'supplier' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('supplier');
                setMobileMenuOpen(false);
                navigate('/dashboard/supplier');
              }}
            >
              <FiDollarSign className="nav-icon" />
              <span className="brand-text text-green text-sm font-semibold ">SUPPLIER</span>
            </li>

            {/* <li 
              className={`nav-item ${activeTab === 'BillManager' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('BillManager');
                setMobileMenuOpen(false);
                 navigate('/dashboard/billManager');
              }}
            >
              <FiDribbble className="nav-icon" />
              <span className="nav-text">Bill Manager</span>
            </li> */}

            {/* <li
              className={`nav-item ${activeTab === "addItems" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("addItems");
                setMobileMenuOpen(false);
                navigate("/dashboard/addItems");
              }}
            >
              <FiEdit2 className="nav-icon" />
              <span className="nav-text">Add Items</span>
            </li> */}

            <li
              className={`nav-item ${activeTab === "DasHChart" ? "active" : ""
                }`}
              onClick={() => {
                setActiveTab("DasHChart");
                setMobileMenuOpen(false);
                navigate("/dashboard/DasHChart");
              }}
            >
              <FiBarChart2 className="nav-icon" />
              <span className="brand-text text-green text-sm font-semibold  ">VIEW ANALYTICS</span>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer font-semibold">
         
          <p>
            © {new Date().getFullYear()} CODES.BOOK • CULTIVATING SUCCESS
            TOGETHER 🌾
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`main-content ${sidebarOpen ? "sidebar-open" : "sidebar-closed"
          }`}
      >
        {/* <Outlet /> */}
        <Outlet context={{ notifications, setNotifications, removeNotification, markNotificationRead }} />

      </main>
    </div>
  );
};

export default Dashboard;

