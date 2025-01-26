import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Không dùng alias ở đây.
import Header from "./components/header/header";
import Listing from "./components/Product/listing";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import PrivateRoute from "./components/PrivateRoute";
import Error403 from "./components/Error403/Error403";
import "./styles/App.css";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/Auth/ForgotPassword/ResetPassword";
import ProductPage from "./components/Product/ProductPage";
import AddProduct from "./pages/Auth/Admin/AddProduct/AddProduct";
import ProductEdit from "./pages/Auth/Admin/AddProduct/ProductEdit";
import AccountList from "./pages/Auth/Admin/AccountList/AccountList";
import UserPage from "./pages/Auth/Admin/AccountList/UserPage";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUserRole(decoded.role);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem("token");
          setUserRole(null);
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Header userRole={userRole} isAuthenticated={isAuthenticated} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/danh-sach-san-pham" element={<Listing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/danh-sach-san-pham" element={<Listing />} />
        {/* Protected Routes - User & admin */}
        <Route
          path="/thong-tin-ca-nhan"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <UserPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/danh-sach-yeu-thich"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              {/* <Favorites /> */}
            </PrivateRoute>
          }
        />

        <Route
          path="/gio-hang"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              {/* <Cart /> */}
            </PrivateRoute>
          }
        />
        <Route
          path="/thanh-toan"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              {/* <Checkout /> */}
            </PrivateRoute>
          }
        />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRole="admin"
            >
              <Routes>
                <Route path="user-management" element={<AccountList />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="edit-product" element={<ProductEdit />} />
              </Routes>
            </PrivateRoute>
          }
        />

        {/* Error Routes */}
        <Route path="/Error403" element={<Error403 />} />
        <Route path="*" element={<Navigate to="/Error403" replace />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
