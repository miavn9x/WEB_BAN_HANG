import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/header/header";
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
import Cart from "./components/Product/Cart";
import Test from "./components/Product/Test";
import ProductItem from "./components/Product/ProductItem";
import Checkout from "./components/Product/Checkout";
import OrderHistory from "./components/Product/OrderHistory";
import Orders from "./pages/Auth/Admin/AdminOrders/Orders";
import StoreLocator from "./components/map/StoreLocator";
import MyEditor from "./pages/Auth/Admin/MyEditor/MyEditor";
import Info from "./components/Nav/Info";
import PostDetail from "./components/Posts/PostDetail";
import PostsList from "./components/Posts/PostsList";
import AutoLogout from "./pages/Auth/Login/AutoLogout";
import PostsManagement from "./components/Posts/PostsManagement";
import { Helmet } from "react-helmet"; // Thêm Helmet để tối ưu SEO
import Evaluate from "./components/Product/Evaluate";
import NotificationIcon from "./components/Nav/NotificationIcon";

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
      <AutoLogout />
      <Header userRole={userRole} isAuthenticated={isAuthenticated} />

      {/* Thêm SEO Meta Tags */}
      <Helmet>
        <title>Chuỗi hệ thống siêu thị mẹ và bé - BabyMart.vn</title>
        <meta
          name="description"
          content="Mua sắm sản phẩm chất lượng với dịch vụ tốt nhất tại cửa hàng trực tuyến của chúng tôi."
        />
        <meta
          property="og:title"
          content="Chuỗi hệ thống siêu thị mẹ và bé - BabyMart.vn"
        />
        <meta
          property="og:description"
          content="Mua sắm sản phẩm chất lượng với dịch vụ tốt nhất tại cửa hàng trực tuyến của chúng tôi."
        />
        <meta property="og:image" content="/path/to/your/image.jpg" />
        <meta property="og:url" content={window.location.href} />
        <meta
          name="twitter:title"
          content="Chuỗi hệ thống siêu thị mẹ và bé - BabyMart.vn"
        />
        <meta
          name="twitter:description"
          content="Mua sắm sản phẩm chất lượng với dịch vụ tốt nhất tại cửa hàng trực tuyến của chúng tôi."
        />
        <meta name="twitter:image" content="/path/to/your/image.jpg" />
      </Helmet>

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/product/:id" element={<Test />} />
        <Route path="/product/:productId" element={<ProductItem />} />
        <Route path="/gio-hang" element={<Cart />} />
        <Route path="/thanh-toan" element={<Checkout />} />
        <Route path="/OrderHistory" element={<OrderHistory />} />
        <Route path="/shop-map" element={<StoreLocator />} />
        <Route path="/gioi-thieu" element={<Info />} />
        <Route path="/PostsList" element={<PostsList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/test" element={<Evaluate />} />
        <Route path="/1" element={<NotificationIcon />} />

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
                <Route path="/quan-ly-don-hang" element={<Orders />} />
                <Route path="/add-bai-viet" element={<MyEditor />} />
                <Route path="posts-management" element={<PostsManagement />} />
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
