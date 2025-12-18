import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "../styles/AddCustomer.css";

const apiBaseUrl = import.meta.env.VITE_API_URL;
const InvoicePage = () => {
  const { invoiceNo } = useParams();
  const [invoice, setInvoice] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchInvoice = async () => {
      const res = await fetch(`${apiBaseUrl}/api/invoice/${invoiceNo}`);
      const data = await res.json();
      setInvoice(data);
    };
    fetchInvoice();
  }, [invoiceNo]);

  if (!invoice) return <p>Loading...</p>;

  return (
    <div ref={printRef} className="invoice-container">
      {/* Header */}

      <header className="invoice-header first-page-header">
        <div className="header-top">
          <div className="company-info">
            {/* Logo को सिर्फ यहाँ add करें */}
            <div className="logo-section">
              <img
                src="/logo.png"
                alt="आर्य कृषि सेवा केंद्र"
                className="header-logo"
              />
              <h1 className="company-name">आर्य कृषि सेवा केंद्र</h1>
            </div>

            <div className="company-details">
              <p className="company-tagline">किसानों का विश्वसनीय साथी</p>
              <p className="company-address">
                जावरा बायपास रोड, आर्य पेट्रोल पंप के पास, नागदा
              </p>
              <div className="contact-details">
                <span>📞 +91 7000315367</span>
                {/* <span>📧 contact@aryakrishi.com</span> */}
                {/* <span>🌐 www.aryakrishi.com</span> */}
              </div>
            </div>
          </div>

          <div className="invoice-info">
            <h2 className="invoice-title">TAX INVOICE</h2>
            <div className="invoice-meta">
              <div className="meta-item">
                {/* <span className="meta-label">Invoice No:</span> */}
                <span className="meta-value">
                  Invoice No: {invoice.invoiceNo}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Invoice Date:</span>
                <span className="meta-value">
                  Date:{" "}
                  {new Date(invoice.paymentDate).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">GSTIN:</span>
                <span className="meta-value">XXAAAAA0000A1Z5</span>
              </div>
            </div>
          </div>
        </div>

        <div className="header-divider"></div>

        <div className="customer-info-section">
          <div className="bill-to">
            <h3>Bill To:</h3>
            <div className="customer-details">
              <p>
                <strong>{invoice.customerName}</strong>
              </p>
              <p>{invoice.phone}</p>
              <p className="address">{invoice.address}</p>
            </div>
          </div>

          <div className="delivery-info">
            <h3>Delivery Info:</h3>
            <p>
              <strong>Delivery Date:</strong>{" "}
              {new Date().toLocaleDateString("en-IN")}
            </p>
            <p>
              <strong>Payment Terms:</strong> भुगतान की तिथि बिल में उल्लिखित
              है, कृपया समय पर भुगतान कर सहयोग करें।
            </p>
          </div>
        </div>
      </header>

      {/* Items */}
      <div className="items-table-container">
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th style={{ width: "4%" }}>#</th>
              <th style={{ width: "32%" }}>Item Description</th>
              <th style={{ width: "8%" }} className="text-center">
                Qty
              </th>
              <th style={{ width: "8%" }} className="text-center">
                Unit
              </th>
              <th style={{ width: "10%" }} className="text-right">
                Unit Price (₹)
              </th>

              <th style={{ width: "10%" }} className="text-right">
                Taxable Amt (without GST) (₹)
              </th>
              <th style={{ width: "8%" }} className="text-center">
                GST %
              </th>
              <th style={{ width: "10%" }} className="text-right">
                GST Amt (₹)
              </th>
              <th style={{ width: "10%" }} className="text-right">
                Total (with GST)(₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.name}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-center">{item.unit}</td>

                <td className="text-right">₹{item.pricePerUnit.toFixed(2)}</td>
                <td className="text-right">
                  ₹{(item.totalAmount / (1 + item.gstRate / 100)).toFixed(2)}
                </td>
                <td className="text-center">{item.gstRate}%</td>
                <td className="text-right">
                  ₹
                  {(
                    item.totalAmount -
                    item.totalAmount / (1 + item.gstRate / 100)
                  ).toFixed(2)}
                </td>
                <td className="text-right">₹{item.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* footer */}
      <footer className="invoice-summary">
        <div className="summary-left">
          <div className="payment-instructions">
            {/* <h4>Payment Instructions:</h4> */}
            <ul>
              {/* <li>Please pay within 30 days of invoice date</li> */}
              <li>
                ✅ <strong>100% शुद्ध व प्रमाणित बीज व उर्वरक</strong> -
                गुणवत्ता की गारंटी
              </li>
              <li>
                ✅ <strong>मिट्टी परीक्षण सुविधा</strong> - उपज बढ़ाने के लिए
                वैज्ञानिक सलाह
              </li>
              {/* <li>
                      ✅ <strong>किसान कल्याण कार्ड</strong> - विशेष छूट व लाभ
                      के लिए पंजीकरण कराएं
                    </li> */}
              {/* <li>
                      ✅ <strong>फसल बीमा सहायता</strong> - प्राकृतिक आपदा से
                      सुरक्षा
                    </li> */}
              <li>
                ✅ <strong>मौसम आधारित सलाह</strong> - मौसम पूर्वानुमान व खेती
                संबंधी सुझाव
              </li>
              <li>
                ✅ <strong>24x7 किसान हेल्पलाइन</strong> - 📞 +91-7000315367
              </li>
            </ul>

            <div className="signature-section">
              <p>🌾 किसान हमारी पहचान, खुशहाली हमारा मिशन 🌾</p>
              <div className="signature-line"></div>
              <p>
                {" "}
                "हम प्रतिज्ञा करते हैं कि आर्य कृषि सेवा केंद्र केवल एक दुकान
                नहीं, बल्कि किसानों की प्रगति का साथी है। हमारी प्रत्येक उत्पाद
                व सेवा किसान के समृद्ध भविष्य के लिए समर्पित है।"
              </p>
            </div>
          </div>
        </div>
        {/* Summary */}
        <div className="summary-right">
          <div className="amounts-summary">
            <div className="summary-row">
              <span>Sub Total (without GST):</span>
              <span>₹{invoice.subTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Total GST:</span>
              <span>₹{invoice.totalGST.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>
                <strong>Grand Total:</strong>
              </span>
              <span>₹{invoice.grandTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Amount paid:</span>
              <span>₹{invoice.paidAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row due-row">
              <span>
                <strong>Balance Due:</strong>
              </span>
              <span>₹{invoice.dueAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Next PaymentDate:</span>
              <span>
                {invoice.nextPaymentDate && (
                  <p>
                    {/* Next Payment Date:{" "} */}
                    {new Date(invoice.nextPaymentDate).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                )}{" "}
              </span>
            </div>

            {/*
         
            <p>Paid: ₹{invoice.paidAmount.toFixed(2)}</p>
            <p>Due: ₹{invoice.dueAmount.toFixed(2)}</p>
            {invoice.nextPaymentDate && (
              <p>
                Next Payment Date:{" "}
                {new Date(invoice.nextPaymentDate).toLocaleDateString("en-IN")}
              </p>
            )} */}
          </div>

          <div className="qr-section">
            {/* <div className="qr-placeholder">
              <p>Payment QR Code</p>
              <div className="qr-box"> */}
            {/* Your QR code image here */}
            {/* <img src="/path-to-qr.png" alt="Payment QR Code" />
              </div>
              <p className="qr-note">Scan to pay via UPI</p>
            </div> */}
          </div>
        </div>
      </footer>
      {/* </div> */}
    </div>
  );
};

export default InvoicePage;
