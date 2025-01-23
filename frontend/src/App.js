import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/header/header";
import ProductPage from "./components/Product/ProductPage";
import Home from "./pages/Home";
import Listing from "./components/Product/listing";
import ProductItem from "./components/Product/ProductItem";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/Auth/ForgotPassword/ResetPassword";
import Logout from "./pages/Auth/Login/Logout";
import Error403 from "./components/Error403/Error403";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute
import "./styles/App.css";
import AddProduct from "./components/Product/AddProduct";
import { jwtDecode } from "jwt-decode";
import React from "react";
import QuantityBox from "./components/Product/QuantityBox";
import LoginMenu from "./pages/Auth/Login/LoginMenu";

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Giải mã token nhưng không lưu thông tin vào biến decoded nếu không cần thiết
        jwtDecode(token);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    }
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        {/* Các Route công khai */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/t" element={<ProductItem />} />
        <Route path="/danh-sach-san-pham" element={<Listing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dang-xuat" element={<Logout />} />
        <Route path="/menu-login" element={<LoginMenu />} />

        {/* Các Route bảo vệ cho cả user và admin */}
        <Route
          path="/user-or-admin/*"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} requiredRole="user">
              <Routes>
                <Route path="user-dashboard" element={<QuantityBox />} />
                <Route path="user-products" element={<ProductPage />} />
                {/* Các route khác dành cho user */}
              </Routes>
            </PrivateRoute>
          }
        />

        {/* Các Route bảo vệ dành cho admin */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRole="admin"
            >
              <Routes>
                <Route path="user-management" element={<QuantityBox />} />
                <Route path="add-product" element={<AddProduct />} />
                {/* Các route khác dành cho admin */}
              </Routes>
            </PrivateRoute>
          }
        />

        {/* Route lỗi khi không có quyền truy cập */}
        <Route path="/Error403" element={<Error403 />} />
      </Routes>
    </Router>
  );
}

export default App;
