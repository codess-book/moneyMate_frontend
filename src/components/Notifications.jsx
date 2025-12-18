
import { useNavigate, useOutletContext } from "react-router-dom";
import { FiTrash2, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import "../styles/notifications.css"

const apiBaseUrl = import.meta.env.VITE_API_URL;

const Notifications = () => {
  const {
    notifications,
    removeNotification,
    markNotificationRead,
  } = useOutletContext();

  const navigate = useNavigate();

  /* ---------------- DELETE ---------------- */
  const handleIgnore = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${apiBaseUrl}/api/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        removeNotification(notificationId);
        toast.info("Notification removed");
      } else {
        toast.error("Failed to delete notification");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  /* ---------------- MARK READ ---------------- */
  const handleMarkRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${apiBaseUrl}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        markNotificationRead(notificationId);
        toast.success("Marked as read");
      } else {
        toast.error("Failed to mark as read");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  /* ---------------- NAVIGATE ---------------- */
  const handleCheck = (notificationId) => {
    navigate(`/dashboard/logistics?notificationId=${notificationId}`);
  };

  /* ---------------- EMPTY STATE ---------------- */
  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 text-gray-500">
        <span className="text-5xl mb-4">🔕</span>
        <p className="text-lg font-semibold">No notifications</p>
        <p className="text-sm">You’re all caught up</p>
      </div>
    );
  }

  return (
  <div className="notifications-container">
  <div className="notifications-header">
    <div className="notifications-icon">
      <FiCheckCircle />
    </div>
    <div>
      <h2>Notifications</h2>
      <p className="notifications-subtitle">Manage your inventory alerts and updates</p>
    </div>
  </div>

  <div className="notifications-list">
    {notifications.length === 0 ? (
      <div className="empty-state">
        <div className="empty-icon">🔕</div>
        <h3>No notifications yet</h3>
        <p>All caught up! You'll see alerts here when needed.</p>
      </div>
    ) : (
      notifications.map((n) => (
        <div
          key={n._id}
          className={`notification-card ${n.isRead ? 'read' : 'unread'}`}
        >
          {!n.isRead && <div className="status-indicator"></div>}
          {n.isRead && <div className="status-indicator read"></div>}

          <div className="notification-content">
            <div className={`notification-icon ${n.isRead ? 'read' : 'unread'}`}>
              <FiArrowRight />
            </div>
            
            <div className="notification-details">
              <h3 className="notification-title">Low Stock Alert</h3>
              <p className="notification-message">
                {n.name} - {n.message}
              </p>
              
              <div className="notification-info">
                <div className="info-item">
                  <span className="info-label">Current Stock:</span>
                  <span className="info-value">{Number(n.currentStock).toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Alert Level:</span>
                  <span className="info-value">{n.lowStockAlert}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Item ID:</span>
                  <span className="info-value">{n.itemId}</span>
                </div>
              </div>
              
              <div className="notification-time">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="notification-actions">
            {!n.isRead && (
              <button
                className="action-btn mark-read-btn"
                onClick={() => handleMarkRead(n._id)}
              >
                <FiCheckCircle size={16} />
                Mark read
              </button>
            )}
            
            <button
              className="action-btn delete-btn"
              onClick={() => handleIgnore(n._id)}
              title="Delete notification"
            >
              <FiTrash2 />
            </button>
            
            <button
              className="action-btn open-btn"
              onClick={() => handleCheck(n._id)}
              title="Open item details"
            >
              <FiArrowRight />
            </button>
          </div>

          {n.isRead && <span className="read-badge">Read</span>}
        </div>
      ))
    )}
  </div>
</div>

  );
};

export default Notifications;
