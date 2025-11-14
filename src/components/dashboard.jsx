import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiMenu, 
  FiX,
  FiBell,
  FiLogOut,
  FiBarChart2,
  FiEdit2,
  FiUserPlus,
  FiDribbble,
  FiTruck,
  FiPackage,
  FiDollarSign,
  FiCloudRain,
  FiSettings
} from 'react-icons/fi';
import { TbPlant2 } from 'react-icons/tb';
import '../styles/Dashboard.css';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [admin, setAdmin] = useState({ name: '', photo: '' });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
      <nav className="navbar">
        <div className="navbar-left">
          <button 
            className="menu-toggle" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          
          <div className="farm-brand">
            <TbPlant2 className="farm-logo" />
            <span className="brand-text">Arya Krishi Farm</span>
          </div>
        </div>
        
        <div className="navbar-right">
          <button className="notification-btn">
            <FiBell size={18} />
          </button>
          
          {/* <div className="user-profile">
            <div className="user-avatar">
              <img 
                src={admin.photo} 
                alt="Admin Avatar" 
                className="avatar-img"
                crossOrigin="anonymous" 
              />
            </div>
            <span className="username">{admin.name}</span>
          </div> */}

          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleMobileMenu}
      >
        {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* <div className="sidebar-header">
          <h1>🌱 Farm Dashboard</h1>
        </div> */}
        
        <nav className="sidebar-nav">
          <ul>
            <li 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
                navigate('/dashboard'); 
              }}
            >
              <FiHome className="nav-icon" />
              <span className="nav-text">Farm Overview</span>
            </li>

            <li 
              className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('customers');
                setMobileMenuOpen(false);
                navigate('/dashboard/customers');
              }}
            >
              <FiUserPlus className="nav-icon" />
              <span className="nav-text">Add Farmers</span>
            </li>

            <li 
              className={`nav-item ${activeTab === 'viewcustomers' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('viewcustomers');
                setMobileMenuOpen(false);
                navigate('/dashboard/viewCustomers');
              }}
            >
              <FiUsers className="nav-icon" />
              <span className="nav-text">View Farmers</span>
            </li>

           

            {/* <li 
              className={`nav-item ${activeTab === 'addItems' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('addItems');
                setMobileMenuOpen(false);
                navigate('/dashboard/addItems');
              }}
            >
              <FiPackage className="nav-icon" />
              <span className="nav-text">Crop Inventory</span>
            </li> */}

            <li 
              className={`nav-item ${activeTab === 'DasHChart' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('DasHChart');
                setMobileMenuOpen(false);
                navigate('/dashboard/DasHChart');
              }}
            >
              <FiBarChart2 className="nav-icon" />
              <span className="nav-text">Farm Analytics</span>
            </li>

            <li 
              className={`nav-item ${activeTab === 'logistics' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('logistics');
                setMobileMenuOpen(false);
                navigate('/dashboard/logistics');
              }}
            >
              <FiTruck className="nav-icon" />
              <span className="nav-text">Inventory</span>
            </li>
             <li 
              className={`nav-item ${activeTab === 'BillManager' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('BillManager');
                setMobileMenuOpen(false);
                navigate('/dashboard/billManager');
              }}
            >
              <FiDollarSign className="nav-icon" />
              <span className="nav-text">Payment Manager</span>
            </li>
             <li 
              className={`nav-item ${activeTab === 'setting' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('setting');
                setMobileMenuOpen(false);
                navigate('/dashboard/logistics');
              }}
            >
              <FiSettings className="nav-icon" />
              <span className="nav-text">Setting</span>
            </li>

            {/* <li 
              className={`nav-item ${activeTab === 'weather' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('weather');
                setMobileMenuOpen(false);
                navigate('/dashboard/weather');
              }}
            >
              <FiCloudRain className="nav-icon" />
              <span className="nav-text">Weather Forecast</span>
            </li> */}
          </ul>


            <li 
              className={`nav-item ${activeTab === 'supplier' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('supplier');
                setMobileMenuOpen(false);
                navigate('/dashboard/supplier');
              }}
            >
              <FiDollarSign className="nav-icon" />
              <span className="nav-text">Supplier</span>
            </li>
        </nav>
        
        <div className="sidebar-footer">
          <p>© {new Date().getFullYear()} codes.book • Cultivating Success Together 🌾</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet /> 
      </main>
    </div>
  );
};

export default Dashboard;