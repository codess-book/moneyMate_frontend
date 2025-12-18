// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { FiTrash2, FiArrowRight } from "react-icons/fi";
// import { useOutletContext } from "react-router-dom";
// import { FiTrash2, FiArrowRight, FiCheckCircle } from "react-icons/fi";
// import { toast } from "react-toastify";

// const apiBaseUrl = import.meta.env.VITE_API_URL;

// const Notifications = () => {
//   const {
//     notifications,
//     removeNotification,
//     markNotificationRead,
//   } = useOutletContext();

//   const navigate = useNavigate();

//   // Delete notification on backend then update frontend
//   const handleIgnore = async (itemId) => {
//     (itemId,"deleteItemId")
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${apiBaseUrl}/api/notifications/${itemId}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.ok) {
//         removeNotification(itemId);
//       } else {
//         console.error("Failed to delete notification");
//       }
//     } catch (err) {
//       console.error("Error deleting notification", err);
//     }
//   };

//   // Mark notification read on backend then update frontend
//   const handleMarkRead = async (itemId) => {
//     (itemId,"itemId")
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${apiBaseUrl}/api/notifications/${itemId}/read`, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.ok) {
//         markNotificationRead(itemId);
//       } else {
//         console.error("Failed to mark notification read");
//       }
//     } catch (err) {
//       console.error("Error marking notification read", err);
//     }
//   };

//   const handleCheck = (itemId) => {
//     navigate(`/dashboard/logistics?itemId=${itemId}`);
//   };

//   if (!notifications || notifications.length === 0) {
//     return (
//       <div className="p-6 text-center text-gray-500">🎉 No notifications</div>
//     );
//   }
// (notifications)

//   return (
//   <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//     <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//       🔔 Notifications
//     </h2>

//     <div className="space-y-4">
//       {notifications.map((n) => (
//         <div
//           key={n._id}  // ✅ FIXED
//           className={`relative bg-white rounded-xl shadow-md p-5 flex justify-between items-center
//             border-l-4 transition-all duration-200 hover:shadow-lg
//             ${n.read ? "border-gray-300 opacity-80" : "border-red-500"}
//           `}
//         >
//           {/* LEFT CONTENT */}
//           <div className="flex gap-4 items-start">
//             <div className="text-red-500 text-xl">⚠️</div>

//             <div>
//               <p className="font-semibold text-lg text-gray-800">
//                 Low Stock Alert
//               </p>

//               <p className="text-sm text-gray-600">
//                 <span className="font-medium">{n.name}</span>
//               </p>

//               <p className="text-xs text-gray-500 mt-1">
//                 Stock: <b>{n.currentStock}</b> • Alert at:{" "}
//                 <b>{n.lowStockAlert}</b>
//               </p>
//             </div>
//           </div>

//           {/* ACTIONS */}
//           <div className="flex gap-2 items-center">
//             {!n.read && (
//               <button
//                 onClick={() => {
//                   handleMarkRead(n._id);
//                   toast.success("Notification marked as read");
//                 }}
//                 className="flex items-center gap-1 px-3 py-1.5 text-sm
//                   bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
//               >
//                 <FiCheckCircle />
//                 Read
//               </button>
//             )}

//             <button
//               onClick={() => {
//                 handleIgnore(n._id);
//                 toast.info("Notification removed");
//               }}
//               className="p-2 rounded-lg text-red-500 hover:bg-red-100 transition"
//               title="Delete"
//             >
//               <FiTrash2 />
//             </button>

//             <button
//               onClick={() => handleCheck(n._id)}
//               className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition"
//               title="Check Item"
//             >
//               <FiArrowRight />
//             </button>
//           </div>

//           {/* READ BADGE */}
//           {n.read && (
//             <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
//               Read
//             </span>
//           )}
//         </div>
//       ))}
//     </div>
//   </div>
// );
// };

// export default Notifications;


import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FiTrash2, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";

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
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
  <h2 className="text-3xl font-semibold mb-8 flex items-center gap-3 text-slate-800">
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
      <FiCheckCircle />
    </span>
    Notifications
  </h2>

  <div className="space-y-5 max-w-5xl">
    {notifications.map((n) => (
      <div
        key={n._id}
        className={`relative flex items-center justify-between rounded-2xl p-6
          backdrop-blur-md transition-all duration-300
          border shadow-sm hover:shadow-xl hover:-translate-y-0.5
          ${
            n.read
              ? "bg-white/70 border-slate-200"
              : "bg-white border-red-200 ring-1 ring-red-100"
          }
        `}
      >
        {/* Accent bar */}
        {!n.read && (
          <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl bg-gradient-to-b from-red-500 to-orange-400" />
        )}

        {/* LEFT */}
        <div className="flex gap-5 items-start">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl
              ${
                n.read
                  ? "bg-slate-100 text-slate-500"
                  : "bg-red-50 text-red-600"
              }
            `}
          >
            <FiArrowRight size={18} />
          </div>

          <div>
            <p className="text-base font-semibold text-slate-800">
              Low Stock Alert
            </p>

            <p className="text-sm text-slate-600 mt-0.5">
              {n.name}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Stock{" "}
              <span className="font-semibold text-slate-700">
                {Number(n.currentStock).toFixed(2)}
              </span>{" "}
              · Threshold{" "}
              <span className="font-semibold text-slate-700">
                {n.lowStockAlert}
              </span>
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          {!n.read && (
            <button
              onClick={() => handleMarkRead(n._id)}
              className="rounded-lg px-4 py-2 text-sm font-medium
                text-emerald-700 bg-emerald-50
                hover:bg-emerald-100 transition"
            >
              Mark read
            </button>
          )}

          <button
            onClick={() => handleIgnore(n._id)}
            className="rounded-lg p-2 text-slate-500
              hover:text-red-600 hover:bg-red-50 transition"
            title="Delete"
          >
            <FiTrash2 size={18} />
          </button>

          <button
            onClick={() => handleCheck(n._id)}
            className="rounded-lg p-2 text-slate-500
              hover:text-indigo-600 hover:bg-indigo-50 transition"
            title="Open"
          >
            <FiArrowRight size={18} />
          </button>
        </div>

        {/* READ BADGE */}
        {n.read && (
          <span className="absolute top-4 right-4 text-[11px]
            px-2 py-0.5 rounded-full
            bg-slate-100 text-slate-500">
            Read
          </span>
        )}
      </div>
    ))}
  </div>
</div>

  );
};

export default Notifications;
