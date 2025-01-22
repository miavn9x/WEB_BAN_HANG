import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/header/header";
import ProductPage from "./components/Product/ProductPage";
import "./styles/App.css";
import Home from "./pages/Home";
import Listing from "./components/Product/listing";
import ProductItem from "./components/Product/ProductItem";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/t" element={<ProductItem />} />
        <Route path="/danh-sach-san-pham" exact={true} element={<Listing />} />
      </Routes>
    </Router>
  );
}

// Example Home component (you can define your own)

export default App;
