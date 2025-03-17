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
import { Helmet } from "react-helmet";
import Evaluate from "./components/Product/Evaluate";
import NotificationModal from "./components/Nav/NotificationModal";
import ProductModals from "./components/Product/ProductModals";
import ScrollToTopButton from "./pages/ScrollToTopButton";
import { useDispatch } from "react-redux";
import {
  fetchCart,
  loadCartFromLocalStorage,
} from "./redux/actions/cartActions";
import Dashboard from "./pages/Auth/Admin/AdminOrders/Dashboard";
import Salecart from "./components/Product/Salecart";
import Dashboardwarehouse from "./pages/Auth/Admin/AdminOrders/Dashboardwarehouse";
import DashboardAccountant from "./pages/Auth/Admin/AdminOrders/DashboardAccountant";
import ChatButton from "./components/Carousel/ChatButton";
import AdsBanner from "./components/Product/AdsBanner";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchCart());
    } else {
      dispatch(loadCartFromLocalStorage());
    }
  }, [dispatch]);

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
      <ChatButton />
      <ScrollToTopButton />
      <AdsBanner
        imageUrl="https://res.cloudinary.com/div27nz1j/image/upload/v1740391271/e1c95a7e024623979c_kzrsze.png"
        redirectUrl="http://localhost:3000/posts/quy-dinh-chung-ve-mua-hang-tai-gobook-67a4709e8cb516e37058c69a"
        bannerId="gobook-ads"
      />

      <Header userRole={userRole} isAuthenticated={isAuthenticated} />
      <Helmet>
        <title>Chuỗi hệ thống cửa hàng sách - Go Book</title>
        <meta
          name="description"
          content="Mua sắm sách chất lượng cao, đa dạng thể loại với dịch vụ chuyên nghiệp tại Go Book."
        />
        <meta
          property="og:title"
          content="Chuỗi hệ thống cửa hàng sách - Go Book"
        />
        <meta
          property="og:description"
          content="Mua sắm sách chất lượng cao, đa dạng thể loại với dịch vụ chuyên nghiệp tại Go Book."
        />
        <meta property="og:image" content="/path/to/your/gobook-image.jpg" />
        <meta property="og:url" content={window.location.href} />
        <meta
          name="twitter:title"
          content="Chuỗi hệ thống cửa hàng sách - Go Book"
        />
        <meta
          name="twitter:description"
          content="Mua sắm sách chất lượng cao, đa dạng thể loại với dịch vụ chuyên nghiệp tại Go Book."
        />
        <meta name="twitter:image" content="/path/to/your/gobook-image.jpg" />
      </Helmet>
      <Routes>
        {/* Public Routes */}
        <Route path="/test" element={<Evaluate />} />
        <Route path="/1" element={<NotificationModal />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/product/:slug" element={<ProductModals />} />
        <Route path="/product/:productId" element={<ProductItem />} />
        <Route path="/shop-map" element={<StoreLocator />} />
        <Route path="/gioi-thieu" element={<Info />} />
        <Route path="/posts/:slug" element={<PostDetail />} />
        <Route path="/posts-list" element={<PostsList />} />

        {/* Protected Routes cho người dùng đã đăng nhập */}
        <Route
          path="/thong-tin-ca-nhan"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <UserPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/gio-hang"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/thanh-toan"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route
          path="/order-history"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <OrderHistory />
            </PrivateRoute>
          }
        />

        <Route path="/sale" element={<Salecart />} />

        {/* Routes dành cho Admin */}
        <Route
          path="/admin/user-management"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRoles={["admin"]}
            >
              <AccountList />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/management"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRoles={["admin"]}
            >
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Routes dành cho Warehouse (đăng/sửa sản phẩm) */}
        <Route
          path="/add-product"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRoles={["admin", "warehouse"]}
            >
              <AddProduct />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-product"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRoles={["admin", "warehouse"]}
            >
              <ProductEdit />
            </PrivateRoute>
          }
        />
        <Route
          path="/product-warehouse"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRoles={["admin", "warehouse"]}
            >
              <Dashboardwarehouse />
            </PrivateRoute>
          }
        />

        {/* Routes dành cho Accountant (quản lý đơn hàng, xác nhận đơn hàng) */}
        <Route
          path="/DashboardAccountant"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRoles={["admin", "accountant"]}
            >
              <DashboardAccountant />
            </PrivateRoute>
          }
        />
        <Route
          path="/quan-ly-don-hang"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRoles={["admin", "accountant"]}
            >
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="/order_Dashboard"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRoles={["admin", "accountant"]}
            >
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Routes dành cho Posts (đăng bài, sửa bài viết) */}
        <Route
          path="/posts/create"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRoles={["admin", "posts"]}
            >
              <MyEditor />
            </PrivateRoute>
          }
        />
        {/* Route dành cho chỉnh sửa bài viết */}
        <Route
          path="/posts/management/:slugId"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRoles={["admin", "posts"]}
            >
              <MyEditor />
            </PrivateRoute>
          }
        />
        <Route
          path="/posts/management"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              requiredRoles={["admin", "posts"]}
            >
              <PostsManagement />
            </PrivateRoute>
          }
        />

        <Route path="/Error403" element={<Error403 />} />
        <Route path="*" element={<Navigate to="/Error403" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
