// import React, { useState, useEffect } from "react";
// import { useRef } from "react";
// import { useLocation } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import "../styles/AddCustomer.css";
// const apiBaseUrl = import.meta.env.VITE_API_URL;

// import {
//   FiUser,
//   FiPhone,
//   FiHome,
//   FiDollarSign,
//   FiCalendar,
//   FiPlus,
//   FiTrash2,
//   FiShoppingCart,
//   FiCreditCard,
// } from "react-icons/fi";
// import axios from "axios";
// import { toast } from "react-toastify";
// import CreatableSelect from "react-select/creatable";

// const AddCustomer = () => {
//   // Customer basic info state
//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     address: "",
//     paymentDate: new Date().toISOString().split("T")[0],
//     nextPaymentDate: "",
//     paidAmount: 0,
//   });

//   //another time when the customer comes for a payment
//   const location = useLocation();
//   const customer = location.state?.customer;
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (customer) {
//       setFormData((prev) => ({
//         ...prev,
//         name: customer.name || "",
//         phone: customer.phone || "",
//         address: customer.address || "",
//       }));

//       // Optionally set ID if you want to update later
//       //setCustomerId(customer._id || null);
//     }
//   }, [customer]);

//   const customStyles = {
//     control: (base, state) => ({
//       ...base,
//       width: "100%",
//       fontWeight: "600",
//       fontSize: "16px",
//       color: "#2c2c2c",
//       borderColor: state.isFocused ? "#4f46e5" : "#d1d5db",
//       boxShadow: state.isFocused ? "0 0 0 2px rgba(79, 70, 229, 0.2)" : "none",
//       "&:hover": {
//         borderColor: "#4f46e5",
//       },
//       backgroundColor: "#f9fafb",
//       minHeight: "44px",
//       paddingLeft: "8px",
//       paddingRight: "8px",
//       borderRadius: "8px",
//     }),
//     menu: (base) => ({
//       ...base,
//       fontWeight: "600",
//       fontSize: "15px",
//       color: "#333",
//       zIndex: 9999,
//       borderRadius: "8px",
//       marginTop: "4px",
//       boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//     }),
//     option: (base, state) => ({
//       ...base,
//       fontSize: "15px",
//       backgroundColor: state.isFocused ? "#4f46e5" : "#fff",
//       color: state.isFocused ? "#fff" : "#333",
//       fontWeight: "600",
//       cursor: "pointer",
//       padding: "10px 16px",
//       "&:active": {
//         backgroundColor: "#4f46e5",
//       },
//     }),
//     singleValue: (base) => ({
//       ...base,
//       color: "#2c2c2c",
//       fontWeight: "600",
//       fontSize: "15px",
//     }),
//     input: (base) => ({
//       ...base,
//       color: "#2c2c2c",
//       fontWeight: "600",
//       fontSize: "15px",
//     }),
//     placeholder: (base) => ({
//       ...base,
//       fontWeight: "500",
//       color: "#9ca3af",
//       fontSize: "15px",
//     }),
//   };

//   // Items state
//   const inputRefs = useRef({});
//   const [itemOptions, setItemOptions] = useState([]);
//   const [itemInputValues, setItemInputValues] = useState({});
//   const [items, setItems] = useState([
//     { name: "", quantity: 0, pricePerUnit: 0, totalPrice: 0 },
//   ]);
//   const [allItems, setAllItems] = useState([]);
//   const [categoryOptions, setCategoryOptions] = useState([]);

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [balanceAmount, setBalanceAmount] = useState(0);
//   const [disableNextDate, setDisableNextDate] = useState(false);
//   const [printData, setPrintData] = useState(null);
//   const printRef = useRef();

//   // Fetch item dropdown options
//   useEffect(() => {
//     axios
//       .get(`${apiBaseUrl}/api/inventory/allItems`)

//       .then((res) => {
//         const allItems = res.data.items;

//         setAllItems(allItems);

//         const categories = [...new Set(allItems.map((i) => i.category))];
//         setCategoryOptions(categories.map((c) => ({ label: c, value: c })));
//       })
//       .catch((err) => console.error("Error loading items:", err));
//   }, []);

//   // Calculate totals whenever items or paid amount changes
//   useEffect(() => {
//     const calculatedTotal = items.reduce(
//       (sum, item) => sum + item.quantity * item.pricePerUnit,
//       0
//     );
//     setTotalAmount(calculatedTotal);

//     const remaining = calculatedTotal - formData.paidAmount;
//     setBalanceAmount(remaining);

//     if (remaining <= 0) {
//       setDisableNextDate(true);
//       setFormData((prev) => ({ ...prev, nextPaymentDate: "" }));
//     } else {
//       setDisableNextDate(false);
//     }
//   }, [items, formData.paidAmount]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: name === "paidAmount" ? parseFloat(value) || 0 : value,
//     }));
//   };

//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...items];
//     if (field === "name") {
//       updatedItems[index].name = value;
//     } else {
//       updatedItems[index][field] = parseFloat(value) || 0;
//       updatedItems[index].totalPrice =
//         updatedItems[index].quantity * updatedItems[index].pricePerUnit;
//     }
//     setItems(updatedItems);
//   };

//   const addItem = () => {
//     setItems([
//       ...items,
//       { name: "", quantity: 1, pricePerUnit: 0, totalPrice: 0 },
//     ]);
//   };

//   const removeItem = (index) => {
//     if (items.length <= 1) return;
//     const updatedItems = [...items];
//     updatedItems.splice(index, 1);
//     setItems(updatedItems);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);

//     const invalidItems = items.some(
//       (item) =>
//         !item.name?.trim() || item.quantity <= 0 || item.pricePerUnit < 0
//     );

//     if (invalidItems) {
//       setError("Please fill all item fields with valid values");
//       setIsLoading(false);
//       return;
//     }

//     if (formData.paidAmount < 0 || formData.paidAmount > totalAmount) {
//       setError("Paid amount must be between 0 and total amount");
//       setIsLoading(false);
//       return;
//     }

//     const token = localStorage.getItem("token");
//     if (!token) {
//       setError("Authentication token not found. Please login again.");
//       setIsLoading(false);
//       return;
//     }
//     //addeed new
//     let nextPaymentDate = formData.nextPaymentDate;

//     if (!nextPaymentDate && balanceAmount > 0) {
//       const paymentDateObj = new Date(formData.paymentDate);
//       paymentDateObj.setMonth(paymentDateObj.getMonth() + 1);
//       nextPaymentDate = paymentDateObj.toISOString().split("T")[0];
//     }

//     try {
//       const payload = {
//         ...formData,
//         nextPaymentDate,
//         items: items.map((item) => ({
//           name: item.name,
//           quantity: item.quantity,
//           pricePerUnit: item.pricePerUnit,
//         })),
//         totalAmount,
//         balanceAmount,
//       };

//       const response = await axios.post(
//         `${apiBaseUrl}/api/customers/add`,
//         payload,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.data) {
//         const savedCustomer = response.data.customer;

//         // Prepare bill data
//         const billData = {
//           farm: {
//             name: "Arya Krishi Farm",
//             address: "Put your address here",
//             phone: "Your Mobile Number",
//             gst: "Your GST Number (optional)",
//           },
//           customer: {
//             name: formData.name,
//             phone: formData.phone,
//             address: formData.address,
//           },
//           items,
//           totalAmount,
//           paidAmount: formData.paidAmount,
//           balanceAmount,
//           paymentDate: formData.paymentDate,
//           nextPaymentDate,
//           createdAt: new Date(),
//           billNo: savedCustomer._id.slice(-6).toUpperCase(),
//         };

//         // Set data for printing
//         setPrintData(billData);

//         // Give React time to render hidden print UI
//         setTimeout(() => {
//           if (printRef.current) {
//             window.print();
//           }
//         }, 300);

//         // Toast + navigation
//         if (response.data?.message.includes("updated")) {
//           toast.info("Customer updated successfully");
//         } else {
//           toast.success("New customer added successfully");
//         }

//         // Reset form
//         setFormData({
//           name: "",
//           phone: "",
//           address: "",
//           paymentDate: new Date().toISOString().split("T")[0],
//           nextPaymentDate: "",
//           paidAmount: 0,
//         });
//         setItems([{ name: "", quantity: 1, pricePerUnit: 0 }]);

//         // Navigate AFTER print
//         setTimeout(() => {
//           navigate("/dashboard/viewCustomers");
//         }, 500);
//       }
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || err.message || "Failed to add customer";
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="customer-management">
//       {/* Hidden Print Section */}
//       <div className="print-section">
//         <div
//           ref={printRef}
//           id="print-bill"
//           style={{
//             position: "relative",
//             padding: "20px",
//             fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
//             width: "100%",
//             maxWidth: "600px",
//             margin: "0 auto",
//             backgroundColor: "#fff",
//             boxShadow: "0 0 20px rgba(0,0,0,0.05)",
//             borderRadius: "12px",
//             overflow: "hidden",
//           }}
//         >
//           {/* Background Watermark */}
//           <div
//             style={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               width: "300px",
//               height: "300px",
//               opacity: 0.03,
//               zIndex: 0,
//               // border: 1px solid FaBlackTie,
//               pointerEvents: "none",
//               backgroundImage: "/logo.png",
//               backgroundSize: "contain",
//               backgroundRepeat: "no-repeat",
//               backgroundPosition: "center",
//             }}
//           />

//           {/* Header Section */}
//           <div
//             style={{
//               position: "relative",
//               zIndex: 1,
//               textAlign: "center",
//               marginBottom: "24px",
//               paddingBottom: "20px",
//               borderBottom: "1px solid #eaeaea",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 marginBottom: "12px",
//               }}
//             >
//               <div
//                 style={{
//                   width: "40px",
//                   height: "40px",
//                   // backgroundColor: "#2e7d32",
//                   borderRadius: "8px",
//                   marginRight: "12px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <img src="/logo.png"></img>
//               </div>
//               <h2
//                 style={{
//                   margin: 0,
//                   fontSize: "24px",
//                   fontWeight: "700",
//                   color: "#1a1a1a",
//                   letterSpacing: "-0.5px",
//                 }}
//               >
//                 Arya Krishi Seva Kendra
//               </h2>
//             </div>

//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 flexWrap: "wrap",
//                 gap: "16px",
//                 fontSize: "14px",
//                 color: "#666",
//               }}
//             >
//               <div style={{ display: "flex", alignItems: "center" }}>
//                 <span style={{ marginRight: "6px" }}></span>
//                 <span>Village / Market Road</span>
//               </div>
//               <div style={{ display: "flex", alignItems: "center" }}>
//                 <span style={{ marginRight: "6px" }}></span>
//                 <span>70003 15367</span>
//               </div>
//             </div>
//           </div>

//           {/* Customer Details */}
//           <div
//             style={{
//               position: "relative",
//               zIndex: 1,
//               backgroundColor: "#f8f9fa",
//               padding: "16px",
//               borderRadius: "8px",
//               marginBottom: "20px",
//               border: "1px solid #eaeaea",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "flex-start",
//                 flexWrap: "wrap",
//               }}
//             >
//               <div>
//                 <h3
//                   style={{
//                     margin: "0 0 12px 0",
//                     fontSize: "16px",
//                     fontWeight: "600",
//                     color: "#2e7d32",
//                   }}
//                 >
//                   Customer Details
//                 </h3>
//                 <div
//                   style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     gap: "6px",
//                   }}
//                 >
//                   <div style={{ display: "flex", alignItems: "center" }}>
//                     <span style={{ fontWeight: "500", minWidth: "80px" }}>
//                       Name:
//                     </span>
//                     <span>Rajesh Agro</span>
//                   </div>
//                   <div style={{ display: "flex", alignItems: "center" }}>
//                     <span style={{ fontWeight: "500", minWidth: "80px" }}>
//                       Phone:
//                     </span>
//                     <span>9778899001</span>
//                   </div>
//                   <div style={{ display: "flex", alignItems: "center" }}>
//                     <span style={{ fontWeight: "500", minWidth: "80px" }}>
//                       Address:
//                     </span>
//                     <span>Market Street, Village</span>
//                   </div>
//                 </div>
//               </div>

//               <div
//                 style={{
//                   backgroundColor: "#e8f5e9",
//                   padding: "8px 12px",
//                   borderRadius: "6px",
//                   marginTop: "8px",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontSize: "13px",
//                     color: "#2e7d32",
//                     fontWeight: "500",
//                   }}
//                 >
//                   Next Payment Date
//                 </div>
//                 <div style={{ fontSize: "14px", fontWeight: "600" }}>
//                   21/12/2025
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Items Table */}
//           <div
//             style={{
//               position: "relative",
//               zIndex: 1,
//               marginBottom: "20px",
//               overflowX: "auto",
//             }}
//           >
//             <table
//               style={{
//                 width: "100%",
//                 borderCollapse: "collapse",
//                 fontSize: "14px",
//                 minWidth: "550px",
//               }}
//             >
//               <thead>
//                 <tr
//                   style={{
//                     backgroundColor: "#2e7d32",
//                     color: "white",
//                   }}
//                 >
//                   <th
//                     style={{
//                       textAlign: "left",
//                       padding: "12px 8px",
//                       fontWeight: "600",
//                       fontSize: "13px",
//                     }}
//                   >
//                     Item
//                   </th>
//                   <th
//                     style={{
//                       padding: "12px 8px",
//                       fontWeight: "600",
//                       fontSize: "13px",
//                     }}
//                   >
//                     Category
//                   </th>
//                   <th
//                     style={{
//                       padding: "12px 8px",
//                       fontWeight: "600",
//                       fontSize: "13px",
//                     }}
//                   >
//                     Qty
//                   </th>
//                   <th
//                     style={{
//                       padding: "12px 8px",
//                       fontWeight: "600",
//                       fontSize: "13px",
//                     }}
//                   >
//                     Price/Unit
//                   </th>
//                   <th
//                     style={{
//                       padding: "12px 8px",
//                       fontWeight: "600",
//                       fontSize: "13px",
//                     }}
//                   >
//                     GST %
//                   </th>
//                   <th
//                     style={{
//                       padding: "12px 8px",
//                       fontWeight: "600",
//                       fontSize: "13px",
//                       textAlign: "right",
//                     }}
//                   >
//                     Total
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {[
//                   {
//                     name: "Fertilizer Pack",
//                     category: "Fertilizers",
//                     quantity: 5,
//                     pricePerUnit: 450,
//                     taxableAmount: 2250,
//                     gstRate: 5,
//                     gstAmount: 112.5,
//                     totalAmount: 2362.5,
//                   },
//                   {
//                     name: "Crop Protection Spray",
//                     category: "Pesticides",
//                     quantity: 2,
//                     pricePerUnit: 1200,
//                     taxableAmount: 2400,
//                     gstRate: 18,
//                     gstAmount: 432,
//                     totalAmount: 2832,
//                   },
//                   {
//                     name: "Seed Packet",
//                     category: "Seeds",
//                     quantity: 10,
//                     pricePerUnit: 150,
//                     taxableAmount: 1500,
//                     gstRate: 0,
//                     gstAmount: 0,
//                     totalAmount: 1500,
//                   },
//                   {
//                     name: "Garden Hoe",
//                     category: "Tools",
//                     quantity: 2,
//                     pricePerUnit: 850,
//                     taxableAmount: 1700,
//                     gstRate: 12,
//                     gstAmount: 204,
//                     totalAmount: 1904,
//                   },
//                 ].map((it, i) => (
//                   <tr
//                     key={i}
//                     style={{
//                       borderBottom: "1px solid #f0f0f0",
//                       backgroundColor: i % 2 === 0 ? "#fafafa" : "white",
//                     }}
//                   >
//                     <td
//                       style={{
//                         padding: "12px 8px",
//                         fontWeight: "500",
//                       }}
//                     >
//                       {it.name}
//                     </td>
//                     <td
//                       style={{
//                         padding: "12px 8px",
//                         color: "#666",
//                         fontSize: "13px",
//                       }}
//                     >
//                       {it.category}
//                     </td>
//                     <td
//                       style={{
//                         padding: "12px 8px",
//                         textAlign: "center",
//                       }}
//                     >
//                       {it.quantity}
//                     </td>
//                     <td
//                       style={{
//                         padding: "12px 8px",
//                         textAlign: "right",
//                       }}
//                     >
//                       ₹{it.pricePerUnit}
//                     </td>
//                     <td
//                       style={{
//                         padding: "12px 8px",
//                         textAlign: "center",
//                         color: it.gstRate > 0 ? "#d32f2f" : "#2e7d32",
//                         fontWeight: "500",
//                       }}
//                     >
//                       {it.gstRate}%
//                     </td>
//                     <td
//                       style={{
//                         padding: "12px 8px",
//                         textAlign: "right",
//                         fontWeight: "600",
//                       }}
//                     >
//                       ₹{it.totalAmount}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Summary */}
//           <div
//             style={{
//               position: "relative",
//               zIndex: 1,
//               backgroundColor: "#f8f9fa",
//               padding: "20px",
//               borderRadius: "8px",
//               marginBottom: "20px",
//               border: "1px solid #eaeaea",
//             }}
//           >
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
//                 gap: "12px",
//               }}
//             >
//               <div style={{ textAlign: "center" }}>
//                 <div
//                   style={{
//                     fontSize: "13px",
//                     color: "#666",
//                     marginBottom: "4px",
//                   }}
//                 >
//                   Sub Total
//                 </div>
//                 <div style={{ fontSize: "16px", fontWeight: "600" }}>₹7850</div>
//               </div>
//               <div style={{ textAlign: "center" }}>
//                 <div
//                   style={{
//                     fontSize: "13px",
//                     color: "#666",
//                     marginBottom: "4px",
//                   }}
//                 >
//                   Total GST
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "16px",
//                     fontWeight: "600",
//                     color: "#d32f2f",
//                   }}
//                 >
//                   ₹748.5
//                 </div>
//               </div>
//               <div
//                 style={{
//                   textAlign: "center",
//                   backgroundColor: "#e8f5e9",
//                   padding: "8px",
//                   borderRadius: "6px",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontSize: "13px",
//                     color: "#2e7d32",
//                     marginBottom: "4px",
//                     fontWeight: "500",
//                   }}
//                 >
//                   Grand Total
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "18px",
//                     fontWeight: "700",
//                     color: "#2e7d32",
//                   }}
//                 >
//                   ₹8598.5
//                 </div>
//               </div>
//               <div style={{ textAlign: "center" }}>
//                 <div
//                   style={{
//                     fontSize: "13px",
//                     color: "#666",
//                     marginBottom: "4px",
//                   }}
//                 >
//                   Paid Amount
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "16px",
//                     fontWeight: "600",
//                     color: "#2e7d32",
//                   }}
//                 >
//                   ₹6000
//                 </div>
//               </div>
//               <div style={{ textAlign: "center" }}>
//                 <div
//                   style={{
//                     fontSize: "13px",
//                     color: "#666",
//                     marginBottom: "4px",
//                   }}
//                 >
//                   Balance
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "16px",
//                     fontWeight: "600",
//                     color: "#d32f2f",
//                   }}
//                 >
//                   ₹2598.5
//                 </div>
//               </div>
//             </div>

//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginTop: "16px",
//                 paddingTop: "16px",
//                 borderTop: "1px dashed #ddd",
//               }}
//             >
//               <div style={{ fontSize: "13px", color: "#666" }}>
//                 Bill Date: {new Date().toLocaleDateString("en-IN")}
//               </div>
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   fontSize: "13px",
//                   color: "#666",
//                 }}
//               >
//                 <span style={{ marginRight: "6px" }}>Bill No:</span>
//                 <span style={{ fontWeight: "500" }}>AKSK-2024-0012</span>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div
//             style={{
//               position: "relative",
//               zIndex: 1,
//               textAlign: "center",
//               padding: "24px",
//               background: "linear-gradient(135deg, #f5f5f5 0%, #e8f5e9 100%)",
//               borderRadius: "12px",
//               fontSize: "13px",
//               color: "#555",
//               border: "1px solid #e0e0e0",
//             }}
//           >
//             <div
//               style={{
//                 marginBottom: "16px",
//                 fontWeight: "700",
//                 color: "#2e7d32",
//                 fontSize: "14px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: "8px",
//               }}
//             >
//               <span>📞</span>
//               <span>संपर्क: 70003 15367</span>
//             </div>

//             <div
//               style={{
//                 marginBottom: "12px",
//                 lineHeight: "1.6",
//                 backgroundColor: "rgba(255,255,255,0.7)",
//                 padding: "12px",
//                 borderRadius: "8px",
//                 borderLeft: "4px solid #2e7d32",
//               }}
//             >
//               नोट: कृपया अपनी शेष राशि अगली नियत तिथि से पहले का भुगतान करें।
//               आपका व्यवसाय हमारे लिए महत्वपूर्ण है। धन्यवाद!
//             </div>

//             <div
//               style={{
//                 fontStyle: "italic",
//                 lineHeight: "1.6",
//                 marginBottom: "16px",
//                 color: "#666",
//               }}
//             >
//               हमारे पास सभी कृषि संबंधी आवश्यकताएँ उपलब्ध हैं। कृपया हमारी सेवा
//               का लाभ उठाएँ।
//             </div>

//             {/* QR Code Section */}
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 gap: "20px",
//                 flexWrap: "wrap",
//               }}
//             >
//               <div
//                 style={{
//                   width: "100px",
//                   height: "100px",
//                   backgroundColor: "white",
//                   borderRadius: "12px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: "10px",
//                   color: "#888",
//                   textAlign: "center",
//                   padding: "8px",
//                   border: "2px solid #e0e0e0",
//                   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//                   fontWeight: "600",
//                 }}
//               >
//                 <div>
//                   <div style={{ fontSize: "24px", marginBottom: "4px" }}>
//                     📱
//                   </div>
//                   Scan for
//                   <br />
//                   Digital Payment
//                 </div>
//               </div>

//               <div
//                 style={{
//                   textAlign: "left",
//                   fontSize: "12px",
//                   color: "#666",
//                   maxWidth: "200px",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontWeight: "700",
//                     marginBottom: "6px",
//                     color: "#2e7d32",
//                   }}
//                 >
//                   Payment Methods:
//                 </div>
//                 <div>✓ UPI / QR Code</div>
//                 <div>✓ Cash</div>
//                 <div>✓ Bank Transfer</div>
//                 <div>✓ Credit/Debit Card</div>
//               </div>
//             </div>

//             {/* Final Thank You */}
//             <div
//               style={{
//                 marginTop: "16px",
//                 padding: "8px",
//                 backgroundColor: "#2e7d32",
//                 color: "white",
//                 borderRadius: "6px",
//                 fontWeight: "700",
//                 fontSize: "12px",
//               }}
//             >
//               Thank you for your business! 🙏
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Form Section */}
//       <div className="form-container">
//         <div className="form-header">
//           <h2>Add / Update Customer</h2>
//           <p>Fill in the details to create a new customer record</p>
//           {error && <div className="error-message">{error}</div>}
//         </div>

//         <form onSubmit={handleSubmit} className="customer-form">
//           <div className="form-grid">
//             {/* Customer Details Section */}
//             <div className="form-section">
//               <h3 className="section-title">Customer Information</h3>

//               <div className="input-group">
//                 <label className="input-label">
//                   <FiUser className="input-icon" /> Customer Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   required
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="Enter full name"
//                   className="form-input"
//                 />
//               </div>

//               <div className="input-group">
//                 <label className="input-label">
//                   <FiPhone className="input-icon" /> Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   required
//                   value={formData.phone}
//                   onChange={handleChange}
//                   placeholder="Enter phone number"
//                   className="form-input"
//                 />
//               </div>

//               <div className="input-group">
//                 <label className="input-label">
//                   <FiHome className="input-icon" /> Address
//                 </label>
//                 <textarea
//                   name="address"
//                   required
//                   value={formData.address}
//                   onChange={handleChange}
//                   placeholder="Enter complete address"
//                   rows="3"
//                   className="form-textarea"
//                 />
//               </div>
//             </div>

//             {/* Items Section */}
//             <div className="form-section">
//               <div className="section-header">
//                 <h3 className="section-title">
//                   <FiShoppingCart className="input-icon" /> Items / Services
//                 </h3>
//               </div>

//               <div className="items-container">
//                 {items.map((item, index) => (
//                   <div key={index} className="item-card">
//                     <div className="item-header">
//                       <div className="item-name-group">
//                         <CreatableSelect
//                           styles={customStyles}
//                           isClearable
//                           options={itemOptions}
//                           inputValue={itemInputValues[index] ?? ""}
//                           placeholder="Select or type item name"
//                           onInputChange={(inputVal, { action }) => {
//                             if (action === "input-change") {
//                               setItemInputValues((prev) => ({
//                                 ...prev,
//                                 [index]: inputVal,
//                               }));
//                             }
//                           }}
//                           onChange={(option) => {
//                             const selectedValue = option?.value ?? "";
//                             setItemInputValues((prev) => ({
//                               ...prev,
//                               [index]: selectedValue,
//                             }));
//                             handleItemChange(index, "name", selectedValue);
//                             setTimeout(() => {
//                               const input = inputRefs.current[index];
//                               if (input) {
//                                 input.focus();
//                               }
//                             }, 50);
//                           }}
//                           onBlur={() => {
//                             const typed = itemInputValues[index]?.trim();
//                             if (typed) handleItemChange(index, "name", typed);
//                           }}
//                           className="item-select"
//                         />

//                         <input
//                           ref={(el) => (inputRefs.current[index] = el)}
//                           type="text"
//                           value={items[index]?.name || ""}
//                           onChange={(e) =>
//                             handleItemChange(index, "name", e.target.value)
//                           }
//                           placeholder="Item details"
//                           className="item-details-input"
//                         />
//                       </div>

//                       <button
//                         type="button"
//                         onClick={() => removeItem(index)}
//                         disabled={items.length <= 1}
//                         className="remove-item-btn"
//                         aria-label="Remove item"
//                       >
//                         <FiTrash2 />
//                       </button>
//                     </div>

//                     <div className="item-details-grid">
//                       <div className="detail-group">
//                         <label className="detail-label">Quantity</label>
//                         <input
//                           type="text"
//                           value={item.quantity}
//                           onChange={(e) =>
//                             handleItemChange(index, "quantity", e.target.value)
//                           }
//                           placeholder="0"
//                           required
//                           className="detail-input"
//                         />
//                       </div>

//                       <div className="detail-group">
//                         <label className="detail-label">Price (₹)</label>
//                         <input
//                           type="text"
//                           value={item.pricePerUnit}
//                           onChange={(e) =>
//                             handleItemChange(
//                               index,
//                               "pricePerUnit",
//                               e.target.value
//                             )
//                           }
//                           placeholder="0.00"
//                           required
//                           className="detail-input"
//                         />
//                       </div>

//                       <div className="detail-group">
//                         <label className="detail-label">Total</label>
//                         <div className="total-display">
//                           ₹{(item.quantity * item.pricePerUnit).toFixed(2)}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <button type="button" onClick={addItem} className="add-item-btn">
//                 <FiPlus /> Add Item
//               </button>
//             </div>

//             {/* Payment Section */}
//             <div className="form-section">
//               <h3 className="section-title">Payment Information</h3>

//               <div className="payment-grid">
//                 <div className="input-group">
//                   <label className="input-label">
//                     <FiCalendar className="input-icon" /> Payment Date
//                   </label>
//                   <input
//                     type="date"
//                     name="paymentDate"
//                     required
//                     value={formData.paymentDate}
//                     onChange={handleChange}
//                     className="form-input"
//                   />
//                 </div>

//                 <div className="input-group">
//                   <label className="input-label">
//                     <FiCalendar className="input-icon" /> Next Payment Date
//                   </label>
//                   <input
//                     type="date"
//                     name="nextPaymentDate"
//                     value={formData.nextPaymentDate}
//                     onChange={handleChange}
//                     disabled={disableNextDate}
//                     required={disableNextDate}
//                     className="form-input"
//                   />
//                   {disableNextDate && (
//                     <div className="success-message">
//                       🎉 Full payment received!
//                     </div>
//                   )}
//                 </div>

//                 <div className="input-group">
//                   <label className="input-label">
//                     <FiCreditCard className="input-icon" /> Paid Amount (₹)
//                   </label>
//                   <input
//                     type="text"
//                     name="paidAmount"
//                     value={formData.paidAmount}
//                     onChange={handleChange}
//                     placeholder="0.00"
//                     className="form-input"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Summary Section */}
//             <div className="summary-section">
//               <div className="summary-card">
//                 <h4 className="summary-title">Payment Summary</h4>
//                 <div className="summary-item">
//                   <span>Total Amount:</span>
//                   <span className="summary-value">
//                     ₹{totalAmount.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="summary-item">
//                   <span>Paid Amount:</span>
//                   <span className="summary-value">₹{formData.paidAmount}</span>
//                 </div>
//                 <div className="summary-item highlight">
//                   <span>Balance Amount:</span>
//                   <span className="summary-value">
//                     ₹{balanceAmount.toFixed(2)}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Submit Section */}
//             <div className="submit-section">
//               <button type="submit" disabled={isLoading} className="submit-btn">
//                 {isLoading ? (
//                   <div className="loading-spinner">
//                     <div className="spinner"></div>
//                     Processing...
//                   </div>
//                 ) : (
//                   <>
//                     <FiPlus className="btn-icon" />
//                     {formData.name ? "Update Customer" : "Add Customer"}
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddCustomer;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import {
  FiUser,
  FiPhone,
  FiHome,
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiCalendar,
  FiCreditCard,
} from "react-icons/fi";

const AddCustomer = () => {
  const apiBaseUrl = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const customer = location.state?.customer;
  const printRef = useRef();

  // ==========================================
  // FORM STATE
  // ==========================================
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentDate: new Date().toISOString().split("T")[0],
    nextPaymentDate: "",
    paidAmount: 0,
  });

  // ==========================================
  // ITEMS STATE WITH GST
  // ==========================================
  const [items, setItems] = useState([
    {
      category: "",
      name: "",
      quantity: "",
      pricePerUnit: "",
      unit: "",
      gstRate: 0, // Default no GST
      taxableAmount: 0,
      gstAmount: 0,
      totalAmount: 0,
    },
  ]);

  const [allProducts, setAllProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  // ==========================================
  // LOAD CUSTOMER DATA (IF UPDATING)
  // ==========================================
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
      }));
    }
  }, [customer]);

  // ==========================================
  // FETCH INVENTORY PRODUCTS
  // ==========================================
  useEffect(() => {
    setLoadingProducts(true);
    axios
      .get(`${apiBaseUrl}/api/inventory/allItems`)
      .then((res) => {
        const products = res.data.items;
        setAllProducts(products);

        // Extract unique categories
        const categories = [
          ...new Set(products.map((p) => p.category).filter(Boolean)),
        ];
        setCategoryOptions(categories.map((c) => ({ value: c, label: c })));
      })
      .catch((err) => {
        console.error("Error loading items:", err);
        toast.error("Failed to load products");
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  // ==========================================
  // GST CALCULATION HELPER (MATCHING BACKEND)
  // ==========================================
  const calculateItemTotals = (item) => {
    const quantity = Number(item.quantity) || 0;
    const pricePerUnit = Number(item.pricePerUnit) || 0;
    const gstRate = Number(item.gstRate) || 0;

    // Calculate with proper rounding (matching backend exactly)
    const taxableAmount = Math.round(quantity * pricePerUnit * 100) / 100;
    const gstAmount =
      gstRate > 0 ? Math.round(taxableAmount * gstRate * 100) / 10000 : 0;
    const totalAmount = Math.round((taxableAmount + gstAmount) * 100) / 100;

    return { taxableAmount, gstAmount, totalAmount };
  };

  // ==========================================
  // CALCULATE GRAND TOTALS
  // ==========================================
  const grandSubTotal = items.reduce(
    (sum, item) => sum + (item.taxableAmount || 0),
    0
  );
  const grandGST = items.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
  const grandTotal = items.reduce(
    (sum, item) => sum + (item.totalAmount || 0),
    0
  );
  const balanceAmount = grandTotal - formData.paidAmount;

  // ==========================================
  // HANDLE CATEGORY CHANGE
  // ==========================================
  const handleCategoryChange = (index, selectedOption) => {
    const category = selectedOption?.value || "";

    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = {
        ...newItems[index],
        category,
        name: "", // Reset product
        pricePerUnit: "",
        unit: "",
      };
      return newItems;
    });
  };

  // ==========================================
  // HANDLE PRODUCT SELECTION (AUTO-FILL)
  // ==========================================
  const handleProductChange = (index, selectedOption) => {
    const productName = selectedOption?.value || "";

    // Find product in inventory
    const product = allProducts.find((p) => p.name === productName);

    setItems((prev) => {
      const newItems = [...prev];

      if (product) {
        // Auto-fill from inventory
        newItems[index] = {
          ...newItems[index],
          itemId: product._id,
          name: product.name,
          pricePerUnit: product.price || "",
          unit: product.unit || "",
          category: product.category,
        };
      } else {
        // Manual entry
        newItems[index] = {
          ...newItems[index],
          name: productName,
        };
      }

      // Recalculate totals
      const calculated = calculateItemTotals(newItems[index]);
      newItems[index] = { ...newItems[index], ...calculated };

      return newItems;
    });
  };

  // ==========================================
  // HANDLE FIELD CHANGE
  // ==========================================
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };

      // Recalculate when quantity, price, or GST changes
      if (["quantity", "pricePerUnit", "gstRate"].includes(field)) {
        const calculated = calculateItemTotals(newItems[index]);
        newItems[index] = { ...newItems[index], ...calculated };
      }

      return newItems;
    });
  };

  // ==========================================
  // ADD / REMOVE ITEMS
  // ==========================================
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        category: "",
        name: "",
        quantity: "",
        pricePerUnit: "",
        unit: "",
        gstRate: 0,
        taxableAmount: 0,
        gstAmount: 0,
        totalAmount: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "paidAmount" ? parseFloat(value) || 0 : value,
    }));
  };
  const validateForm = () => {
    // Check required fields
    if (
      !formData.name?.trim() ||
      !formData.phone?.trim() ||
      !formData.address?.trim()
    ) {
      return "Please fill all customer details";
    }

    // Validate phone format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      return "Please enter a valid 10-digit phone number";
    }

    // Check items
    if (items.length === 0) {
      return "Please add at least one item";
    }

    const invalidItem = items.find(
      (item) =>
        !item.name?.trim() ||
        !item.category?.trim() ||
        Number(item.quantity) <= 0 ||
        Number(item.pricePerUnit) < 0
    );

    if (invalidItem) {
      return "Please check all item fields - name, category, quantity (>0), and price (≥0) are required";
    }

    return null;
  };

  // ==========================================
  // SUBMIT FORM
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent rapid double submission
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      toast.warning("Please wait before submitting again");
      return;
    }
    setLastSubmitTime(now);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    // Validation
    // const invalidItems = items.some(
    //   (item) =>
    //     !item.name?.trim() ||
    //     !item.category?.trim() || // ✅ Check category
    //     item.quantity <= 0 ||
    //     item.pricePerUnit < 0
    // );
    // if (invalidItems) {
    //   setError("Please fill all item fields with valid values");
    //   setIsLoading(false);
    //   return;
    // }

    if (formData.paidAmount < 0 || formData.paidAmount > grandTotal) {
      setError("Paid amount must be between 0 and total amount");
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setIsLoading(false);
      return;
    }

    // Auto next payment date
    let nextPaymentDate = formData.nextPaymentDate;
    if (!nextPaymentDate && balanceAmount > 0) {
      const paymentDateObj = new Date(formData.paymentDate);
      paymentDateObj.setMonth(paymentDateObj.getMonth() + 1);
      nextPaymentDate = paymentDateObj.toISOString().split("T")[0];
    }

    try {
      const payload = {
        ...formData,
        nextPaymentDate,
        items: items.map((item) => ({
          category: item.category || "General", // ✅ Add category
          name: item.name,
          quantity: Number(item.quantity),
          pricePerUnit: Number(item.pricePerUnit),
          gstRate: Number(item.gstRate) || 0,
          unit: item.unit || "",
        })),
      };

      const response = await axios.post(
        `${apiBaseUrl}/api/customers/add`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        const savedCustomer = response.data.customer;

        // Prepare bill data for printing
        const billData = {
          customer: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
          },
          items,
          subTotal: grandSubTotal,
          totalGST: grandGST,
          grandTotal,
          paidAmount: formData.paidAmount,
          balanceAmount,
          paymentDate: formData.paymentDate,
          nextPaymentDate,
          billNo: savedCustomer._id.slice(-6).toUpperCase(),
        };

        setPrintData(billData);

        console.log("billdata", billData);

        // Print
        setTimeout(() => {
          if (printRef.current) {
            window.print();
          }
        }, 300);

        // Toast
        toast.success(
          response.data?.message.includes("updated")
            ? "Customer updated successfully"
            : "New customer added successfully"
        );

        // Reset form
        setFormData({
          name: "",
          phone: "",
          address: "",
          paymentDate: new Date().toISOString().split("T")[0],
          nextPaymentDate: "",
          paidAmount: 0,
        });
        setItems([
          {
            category: "",
            name: "",
            quantity: "",
            pricePerUnit: "",
            unit: "",
            gstRate: 0,
            taxableAmount: 0,
            gstAmount: 0,
            totalAmount: 0,
          },
        ]);

        // Navigate
        setTimeout(() => {
          navigate("/dashboard/viewCustomers");
        }, 500);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add customer";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // CUSTOM SELECT STYLES
  // ==========================================
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#4f46e5" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(79, 70, 229, 0.2)" : "none",
      "&:hover": { borderColor: "#4f46e5" },
      minHeight: "44px",
      borderRadius: "8px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    }),
  };

  // console.log("printdata", printData);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="customer-management">
      {/* PRINT SECTION */}

      {printData && (
        <div
          className="print-section"
          style={{ visibility: "hidden", position: "absolute", top: 0 }}
        >
          <div ref={printRef} style={{ padding: "20px", fontFamily: "Arial" }}>
            <h2>Arya Krishi Seva Kendra</h2>
            <p>Bill No: {printData.billNo}</p>

            <h3>Customer: {printData.customer.name}</h3>
            <p>Phone: {printData.customer.phone}</p>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>GST%</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {printData.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.pricePerUnit}</td>
                    <td>{item.gstRate}%</td>
                    <td>₹{item.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: "20px" }}>
              <p>Subtotal: ₹{printData.subTotal.toFixed(2)}</p>
              <p>Total GST: ₹{printData.totalGST.toFixed(2)}</p>
              <p>
                <strong>Grand Total: ₹{printData.grandTotal.toFixed(2)}</strong>
              </p>
              <p>Paid: ₹{printData.paidAmount}</p>
              <p>Balance: ₹{printData.balanceAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN FORM */}
      <div className="form-container">
        <div className="form-header">
          <h2>Add / Update Customer</h2>
          {error && <div className="error-message">{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className="customer-form">
          {/* CUSTOMER INFO */}
          <div className="form-section">
            <h3 className="section-title">Customer Information</h3>

            <div className="input-group">
              <label className="input-label">
                <FiUser /> Customer Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <FiPhone /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={(e) => {
                  let val = e.target.value;

                  // Remove all non-numeric characters
                  val = val.replace(/\D/g, "");

                  // Limit to max 10 digits
                  if (val.length > 10) val = val.slice(0, 10);

                  handleChange({
                    target: {
                      name: "phone",
                      value: val,
                    },
                  });
                }}
                placeholder="Enter phone number"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <FiHome /> Address
              </label>
              <textarea
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                rows="3"
                className="form-textarea"
              />
            </div>
          </div>

          {/* ITEMS WITH GST */}
          <div className="form-section">
            <h3 className="section-title">
              <FiShoppingCart /> Items / Services
            </h3>

            {items.map((item, index) => {
              // Filter products by category
              const filteredProducts = item.category
                ? allProducts.filter((p) => p.category === item.category)
                : allProducts;

              // const productOptions = filteredProducts.map((p) => ({

              //   value: p.name,
              //   label: `${p.name} - ₹${p.price || 0}/${p.unit || "unit"}`,
              // }));
              const productOptions = filteredProducts.map((p) => ({
                value: p._id,
                label: `${p.name} - ₹${p.price}/${p.unit}`,
                product: p,
              }));

              return (
                <div key={index} className="item-card">
                  <div className="item-header">
                    <span>Item {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                      className="remove-item-btn"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  {/* Category */}
                  <div className="detail-group">
                    <label className="detail-label">Category</label>
                    <CreatableSelect
                      styles={customStyles}
                      isClearable
                      options={categoryOptions}
                      value={
                        categoryOptions.find(
                          (c) => c.value === item.category
                        ) || null
                      }
                      onChange={(option) => handleCategoryChange(index, option)}
                      placeholder="Select category"
                    />
                  </div>

                  {/* Product */}
                  <div className="detail-group">
                    <label className="detail-label">Product</label>
                    <CreatableSelect
                      styles={customStyles}
                      isClearable
                      options={productOptions}
                      value={
                        productOptions.find((p) => p.value === item.name) ||
                        null
                      }
                      onChange={(option) => handleProductChange(index, option)}
                      placeholder="Select product"
                      isDisabled={!item.category}
                    />
                  </div>

                  {/* Details Grid */}
                  <div className="item-details-grid">
                    <div className="detail-group">
                      <label className="detail-label">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        placeholder="0"
                        className="detail-input"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="detail-group">
                      <label className="detail-label">Unit</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) =>
                          handleItemChange(index, "unit", e.target.value)
                        }
                        placeholder="kg/pcs"
                        className="detail-input"
                      />
                    </div>

                    <div className="detail-group">
                      <label className="detail-label">Price/Unit (₹)</label>
                      <input
                        type="number"
                        value={item.pricePerUnit}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "pricePerUnit",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        className="detail-input"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="detail-group">
                      <label className="detail-label">GST %</label>
                      <select
                        value={item.gstRate}
                        onChange={(e) =>
                          handleItemChange(index, "gstRate", e.target.value)
                        }
                        className="detail-input"
                      >
                        <option value="0">No GST (0%)</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="item-calculations">
                    <div>Taxable: ₹{item.taxableAmount.toFixed(2)}</div>
                    <div>GST: ₹{item.gstAmount.toFixed(2)}</div>
                    <div>
                      <strong>Total: ₹{item.totalAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}

            <button type="button" onClick={addItem} className="add-item-btn">
              <FiPlus /> Add Item
            </button>
          </div>

          {/* PAYMENT INFO */}
          <div className="form-section">
            <h3 className="section-title">Payment Information</h3>

            <div className="payment-grid">
              <div className="input-group">
                <label className="input-label">
                  <FiCalendar /> Payment Date
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  required
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FiCalendar /> Next Payment Date
                </label>
                <input
                  type="date"
                  name="nextPaymentDate"
                  value={formData.nextPaymentDate}
                  onChange={handleChange}
                  disabled={balanceAmount <= 0}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FiCreditCard /> Paid Amount (₹)
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="form-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="summary-section">
            <div className="summary-card">
              <h4>Payment Summary</h4>
              <div className="summary-item">
                <span>Subtotal:</span>
                <span>₹{grandSubTotal.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Total GST:</span>
                <span>₹{grandGST.toFixed(2)}</span>
              </div>
              <div className="summary-item highlight">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Paid Amount:</span>
                <span>₹{formData.paidAmount}</span>
              </div>
              <div className="summary-item highlight">
                <span>Balance:</span>
                <span>₹{balanceAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="submit-section">
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? "Processing..." : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
