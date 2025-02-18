// import React, { useState, useEffect } from "react";
// import { Button } from "@mui/material";
// import { Link } from "react-router-dom";
// import { Card, Col } from "react-bootstrap";
// import "../../styles/PostsList.css"; // Ensure this path is correct for styles

// const Tests = () => {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch the posts (similar to the PostsList component)
//   useEffect(() => {
//     fetch("/api/posts")
//       .then((res) => res.json())
//       .then((data) => {
//         setPosts(data.posts);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching posts:", err);
//         setError("Có lỗi xảy ra khi tải bài viết.");
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <p>Đang tải bài viết...</p>;
//   if (error) return <p>{error}</p>;

//   // Limit the number of posts to 12
//   const limitedPosts = posts.slice(0, 12);

//   return (
//     <>
//       <div className="container content__wrapper">
//         <div className="row mb-3">
//           <div className="text-center text-md-start">
//             <h4 className="Flash__sale fs-5">Bài viết</h4>
//           </div>
//         </div>
//         <div className="container">
//           <div className="row">
//             {/* Cột hiển thị bài viết */}
//             {limitedPosts.length === 0 ? (
//               <Col>
//                 <p>Không có bài viết nào.</p>
//               </Col>
//             ) : (
//               limitedPosts.map((post) => (
//                 <Col
//                   xs={6}
//                   sm={4}
//                   md={3}
//                   lg={3}
//                   className="mb-4"
//                   key={post._id}
//                 >
//                   <Link to={`/posts/${post._id}`} className="posts-list-link">
//                     <Card className="posts-list-card">
//                       {post.imageUrl && (
//                         <Card.Img
//                           variant="top"
//                           src={post.imageUrl}
//                           className="posts-list-card-img"
//                           loading="lazy" // Lazy load hình ảnh
//                         />
//                       )}
//                       <Card.Body>
//                         <Card.Title className="posts-list-card-title">
//                           {post.title}
//                         </Card.Title>
//                       </Card.Body>
//                     </Card>
//                   </Link>
//                 </Col>
//               ))
//             )}
//           </div>
//         </div>
//         <div className="footer text-center mt-4">
//           <Button className="btn btn-lg">
//             <Link
//               to="/PostsList"
//               style={{ textDecoration: "none", color: "inherit" }}
//             >
//               Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
//             </Link>
//           </Button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Tests;
