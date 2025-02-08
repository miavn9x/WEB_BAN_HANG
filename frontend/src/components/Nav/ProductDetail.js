// import React, { useRef, useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import "./Test.css";
// import Slider from "react-slick";
// import InnerImageZoom from "react-inner-image-zoom";
// import QuantityBox from "./QuantityBox";
// import { formatter } from "../../utils/fomater"; // Sử dụng formatter từ ghi nhớ 2

// const ProductDetail = () => {
//   const { id } = useParams(); // Lấy id sản phẩm từ URL
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showMore, setShowMore] = useState(false);

//   const zoomSliderBig = useRef();
//   const zoomSlider = useRef();

//   // Cấu hình slider
//   const settings = {
//     dots: false,
//     infinite: false,
//     speed: 700,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//   };

//   const settings1 = {
//     dots: false,
//     infinite: false,
//     speed: 500,
//     slidesToShow: 4,
//     slidesToScroll: 1,
//     arrows: true,
//   };

//   // Fetch dữ liệu sản phẩm
//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await axios.get(`/api/products/${id}`);
//         setProduct(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError("Không thể tải thông tin sản phẩm");
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [id]);

//   if (loading) return <div>Đang tải...</div>;
//   if (error) return <div>{error}</div>;
//   if (!product) return <div>Không tìm thấy sản phẩm</div>;

//   const goTo = (index) => {
//     zoomSlider.current.slickGoTo(index);
//     zoomSliderBig.current.slickGoTo(index);
//   };

//   return (
//     <div className="container mt-4">
//       <div className="row">
//         <div className="col-lg-9 col-md-8">
//           <div className="card mb-4">
//             <div className="card-body">
//               <div className="row product__modal__content">
//                 {/* Phần hình ảnh */}
//                 <div className="col-lg-5 col-md-12 col-12 mb-3 mb-md-0">
//                   <div className="product__modal__zoom position-relative">
//                     {product.discountPercentage > 0 && (
//                       <div className="badge badge-primary p-2 fs-6 product__discount">
//                         -{product.discountPercentage}%
//                       </div>
//                     )}
//                     <Slider
//                       {...settings}
//                       className="zoomSliderBig"
//                       ref={zoomSliderBig}
//                     >
//                       {product.images.map((image, index) => (
//                         <div key={index} className="item">
//                           <InnerImageZoom
//                             zoomType="hover"
//                             zoomScale={1}
//                             src={image}
//                           />
//                         </div>
//                       ))}
//                     </Slider>
//                   </div>

//                   {/* Thumbnails */}
//                   <div className="thumbnail-container">
//                     <Slider
//                       {...settings1}
//                       className="zoomSlider"
//                       ref={zoomSlider}
//                     >
//                       {product.images.map((image, index) => (
//                         <div key={index} className="item">
//                           <img
//                             src={image}
//                             className="w-100"
//                             alt={`${product.name} - ${index + 1}`}
//                             onClick={() => goTo(index)}
//                           />
//                         </div>
//                       ))}
//                     </Slider>
//                   </div>
//                 </div>

//                 {/* Phần thông tin sản phẩm */}
//                 <div className="col-lg-7 col-md-12 d-flex flex-column">
//                   <h1 className="product-title">{product.name}</h1>
//                   <div className="d-flex align-items-center">
//                     <label className="me-2">Thương hiệu: {product.brand}</label>
//                   </div>

//                   <div className="rating mb-3">
//                     <p className="text-muted">
//                       Đánh giá: {product.rating}
//                       {/* Hiển thị sao dựa trên rating */}
//                     </p>
//                   </div>

//                   <div className="description-preview">
//                     <p className="text-muted">Chi tiết sản phẩm:</p>
//                     <div className={showMore ? "" : "description-truncate"}>
//                       {product.description}
//                     </div>
//                   </div>

//                   <div className="product__price w-100">
//                     <div className="quantity-wrapper mb-2">
//                       <div className="d-flex align-items-center">
//                         <label className="me-2">Số lượng:</label>
//                         <QuantityBox maxQuantity={product.remainingStock} />
//                       </div>
//                     </div>

//                     <div className="price-wrapper">
//                       <div className="d-flex mx-5 justify-content-center">
//                         {product.discountPercentage > 0 && (
//                           <p className="price me-5 text-muted mb-0">
//                             <del>{formatter(product.originalPrice)}</del>
//                           </p>
//                         )}
//                         <p className="price text-danger mb-0 fs-3">
//                           {formatter(product.priceAfterDiscount)}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <button className="btn btn-primary btn-lg mt-auto mb-3 w-100">
//                     MUA NGAY
//                   </button>
//                   <button className="btn btn-outline-secondary btn-lg w-100">
//                     THÊM VÀO GIỎ
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Mô tả chi tiết */}
//           <div className="product-description">
//             <h2>Mô tả sản phẩm</h2>
//             <div className={showMore ? "show-more" : ""}>
//               {product.description}
//             </div>
//             <button
//               className="btn btn-outline-primary mt-3"
//               onClick={() => setShowMore(!showMore)}
//             >
//               {showMore ? "Thu gọn" : "Xem thêm"}
//             </button>
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div className="col-lg-3 col-md-4">
//           {/* Có thể thêm sản phẩm liên quan hoặc đang giảm giá ở đây */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetail;
