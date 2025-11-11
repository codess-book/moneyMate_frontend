import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const apiBaseUrl = import.meta.env.VITE_API_URL;
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
  FiInbox,
  FiEdit2,
  FiPlusCircle,
  FiUserPlus,
  FiDribbble
} from 'react-icons/fi';
import '../styles/Dashboard.css';
import { Outlet } from 'react-router-dom';
import AddCustomer from './AddCustomer';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [admin, setAdmin] = useState({ name: '', photo: '' }); // 👈 Admin state
  const navigate = useNavigate();


  const handleLogout=()=>{

    localStorage.removeItem('token');
    navigate('/');
  }
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
        const res = await fetch(`${apiBaseUrl}/api/admin/profile`    , {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setAdmin(data);
          console.log(data.photo);
          
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
      <nav className="navbar neon-border">
        <div className="navbar-left">
          <button 
            className="menu-toggle neon-button-icon" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          
        </div>
        <div className="navbar-right">
          <button className="notification-btn neon-button-icon">
            <FiBell size={20} />
            {/*<span className="notification-badge">3</span>*/}
          </button>
    {/* ✅ Admin profile */}
    <div className="user-profile">
      <div className="user-avatar">
        <img 
          src={admin.photo} 
          alt="Admin Avatar" 
          className="avatar-img"
            crossOrigin="anonymous" 
          style={{ width: '30px', height: '30px', borderRadius: '50%' }}
        />
      </div>
      <span className="username"  
      style={{color:"white"}}
      >{admin.name}</span>
    </div>

          <button className="logout-btn neon-button-icon"
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
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="neon-text">MoneyMate</h1>
        </div>
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
              <span className="nav-text">Dashboard</span>
            </li>

             <li 
              className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('customers');
                setMobileMenuOpen(false);
                navigate('/dashboard/customers'); // 👈 Navigate to route
              }}
            >
              <FiUserPlus className="nav-icon" />
              <span className="nav-text">Add Customers</span>
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
              <span className="nav-text">View Customers</span>
            </li>


             <li 
              className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('inventory');
                setMobileMenuOpen(false);
                navigate('/dashboard/inventory'); // 👈 Navigate to route
              }}
            >
              <FiUserPlus className="nav-icon" />
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
              <FiDribbble className="nav-icon" />
              <span className="nav-text">Bill Manager</span>
            </li>


            <li 
              className={`nav-item ${activeTab === 'addItems' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('addItems');
                setMobileMenuOpen(false);
                 navigate('/dashboard/addItems');
              }}
            >
              <FiEdit2 className="nav-icon" />
              <span className="nav-text">Add Items</span>
            </li>

            <li 
              className={`nav-item ${activeTab === 'DasHChart' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('DasHChart');
                setMobileMenuOpen(false);
                 navigate('/dashboard/DasHChart');
              }}
            >
              <FiBarChart2 className="nav-icon" />
              <span className="nav-text">View Analytics</span>
            </li>
            
            <li 
              className={`nav-item ${activeTab === 'SupplierHistoryPage' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('SupplierHistoryPage');
                setMobileMenuOpen(false);
                 navigate('/dashboard/SupplierHistoryPage');
              }}
            >
              <FiBarChart2 className="nav-icon" />
              <span className="nav-text">Supplier</span>
            </li>
           
          </ul>
        </nav>
        <div className="sidebar-footer glow">
          <p>© {new Date().getFullYear()} From Passion to Product • Made by Team codesbook with 💙</p>
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