import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/header/header";
import ProductPage from "./components/Product/ProductPage";
import "./styles/App.css";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/products" element={<ProductPage />} />{" "}
      </Routes>
    </Router>
  );
}

// Example Home component (you can define your own)
function Home() {
  return <div>Welcome to the Home Page</div>;
}

export default App;
