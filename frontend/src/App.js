import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/header/header";
import ProductPage from "./components/Product/ProductPage";
import "./styles/App.css";
import Home from "./pages/Home";
import Listing from "./components/Product/listing";
import ProductItem from "./components/Product/ProductItem";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/Auth/ForgotPassword/ResetPassword";
import Logout from "./pages/Auth/Login/Logout";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/t" element={<ProductItem />} />
        <Route path="/danh-sach-san-pham" exact={true} element={<Listing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dang-xuat" element={<Logout/>} />
      </Routes>
    </Router>
  );
}

// Example Home component (you can define your own)

export default App;
