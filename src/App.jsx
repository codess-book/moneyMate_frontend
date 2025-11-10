import { useState } from "react";
import ProtectedRoute from "./components/AdminProtectedroute";
import "./App.css";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import Login from "./components/Login";
import { Navigate } from "react-router-dom";
import Dashboard from "./components/dashboard";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import AdminPanel from "./components/AdminPannel";
import AddCustomer from "./components/AddCustomer";
import CustomerList from "./components/CustomerList";
import CustomerDetail from "./components/CustomerDetails";
import AddPayment from "./components/AddPayment";
import EditCustomer from "./components/EditCustomer";
import PaymentHistory from "./components/PaymentHistory";
import DashChart from "./components/Chart";
import AddItem from "./components/AddItems";
import BillManager from "./components/BillManager";
import { useEffect } from "react";
import useServiceWorkerUpdate from "./hooks/useServiceWorkerUpdate";
import NetworkToast from "./components/NetworkToast";

function App() {
  const [count, setCount] = useState(0);

  const { isUpdateAvailable, updateServiceWorker } = useServiceWorkerUpdate();

  useEffect(() => {
    if (isUpdateAvailable) {
      toast.info(" New update available! Click to refresh.", {
        onClick: updateServiceWorker,
        autoClose: false,
      });
    }
  }, [isUpdateAvailable]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={1000} />

      {/*<Login/>*/}

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<AdminPanel />} />
            <Route path="customers" element={<AddCustomer />} />
            <Route path="viewCustomers" element={<CustomerList />}></Route>
            <Route
              path="customerDetail/:id"
              element={<CustomerDetail />}
            ></Route>
            <Route path="addPayments" element={<AddPayment />}></Route>
            <Route path="EditCustomer/:id" element={<EditCustomer />}></Route>
            <Route path="PaymentHistory" element={<PaymentHistory />}></Route>
            <Route path="DasHChart" element={<DashChart />}></Route>
            <Route path="addItems" element={<AddItem />}></Route>
            <Route path="billManager" element={<BillManager />}></Route>
          </Route>
        </Route>

        {/* Agar koi aur path hai, toh login ya home pe redirect kar sakte ho */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NetworkToast />
    </>
  );
}

export default App;
