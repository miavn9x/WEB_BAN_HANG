import React, { useState, useEffect } from "react";

const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.length > 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSuggestions = async (input) => {
    try {
      const response = await fetch(`/api/suggestions?query=${input}`);
      if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Lỗi lấy gợi ý:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Tìm kiếm Sản phẩm</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Nhập tên sản phẩm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          style={{ padding: "10px", width: "300px", fontSize: "16px" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            marginLeft: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Tìm kiếm
        </button>
      </form>

      {suggestions.length > 0 && (
        <ul
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            listStyle: "none",
          }}
        >
          {suggestions.map((s, index) => (
            <li
              key={index}
              style={{ cursor: "pointer", padding: "5px 0" }}
              onClick={() => setQuery(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}

      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>Lỗi: {error}</p>}

      {!loading && !error && products.length > 0 && (
        <div>
          <h2>Kết quả Tìm kiếm</h2>
          <ul>
            {products.map((product) => (
              <li key={product._id}>{product.name}</li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p>Không có sản phẩm nào được tìm thấy.</p>
      )}
    </div>
  );
};

export default ProductSearch;
