// import React, { useEffect, useState } from "react";
// import ProductItem from "./ProductItem";
// import axios from "axios";

// // import "../../styles/listing.css";

// const Listing = ({ category, sortBy, limit }) => {
//   const [products, setProducts] = useState([]); // State lưu danh sách sản phẩm
//   const [loading, setLoading] = useState(true); // State lưu trạng thái đang tải

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true); // Bắt đầu tải sản phẩm
//       try {
//         let url = `/api/products`; // URL cơ bản để lấy sản phẩm
//         if (category) {
//           url = `${url}/category/${category}`; // Lọc sản phẩm theo category nếu có
//         }

//         const response = await axios.get(url);
//         let fetchedProducts = response.data.products;

//         if (!fetchedProducts || fetchedProducts.length === 0) {
//           setLoading(false);
//           return;
//         }

//         // Sắp xếp sản phẩm nếu cần
//         if (sortBy === "discountPercentage") {
//           fetchedProducts = fetchedProducts.sort(
//             (a, b) => b.discountPercentage - a.discountPercentage
//           );
//         } else if (sortBy === "random") {
//           fetchedProducts = fetchedProducts.sort(() => Math.random() - 0.5);
//         }

//         // Giới hạn số lượng sản phẩm nếu cần
//         if (limit) {
//           fetchedProducts = fetchedProducts.slice(0, limit);
//         }

//         setProducts(fetchedProducts); // Cập nhật state với danh sách sản phẩm đã lọc
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [category, sortBy, limit]);

//   if (loading) {
//     return <div>Đang tải...</div>;
//   }
//   return (
//     <>
//       <div className="products__container">
//         {products && products.length > 0 ? (
//           products.map((product) => (
//             <ProductItem key={product._id} product={product} />
//           ))
//         ) : (
//           <div>Không có sản phẩm nào</div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Listing;
