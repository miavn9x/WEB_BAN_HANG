import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Helmet } from "react-helmet";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/PostsList.css"; // Import file CSS dành riêng cho trang này

// Component hiển thị mỗi bài viết nổi bật (TIN NỔI BẬT)
const SidebarPostItem = ({ post }) => (
  <Col lg={12} className="sidebar-col mb-4">
    <Link to={`/posts/${post._id}`} className="posts-list-sidebar-link">
      <div className="posts-list-sidebar-item">
        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="img-fluid" />
        )}
        <div className="sidebar-text">{post.title}</div>
      </div>
    </Link>
  </Col>
);

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách bài viết từ API
  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        const sortedPosts = data.posts.sort((a, b) => {
          const aTags = Array.isArray(a.tags) ? a.tags : [];
          const bTags = Array.isArray(b.tags) ? b.tags : [];
          const aPriority = aTags.includes("#baimoi") ? 0 : 1;
          const bPriority = bTags.includes("#baimoi") ? 0 : 1;
          return aPriority - bPriority;
        });
        setPosts(sortedPosts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setError("Có lỗi xảy ra khi tải bài viết.");
        setLoading(false);
      });
  }, []);

  // Lọc ra các bài viết có tag "#noibat" cho mục TIN NỔI BẬT
  const highlightPosts = posts.filter(
    (post) => post.tags && post.tags.includes("#noibat")
  );

  // SEO Meta Tags
  const pageTitle = "Danh Sách Bài Viết";
  const pageDescription =
    "Xem danh sách bài viết mới nhất và nổi bật trên trang của chúng tôi.";

  if (loading) return <p>Đang tải danh sách bài viết...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="posts-list-page">
      <Helmet>
        <title>{pageTitle} - BabyMart.vn</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <Container>
        {/* Tiêu đề trang */}
        <Row className="my-4">
          <Col>
            {/* <h3 className="posts-list-title">{pageTitle}</h3> */}
          </Col>
        </Row>

        <Row>
          {/* Cột chính chứa danh sách bài viết */}
          <Col xs={12} lg={9}>
            <Row>
              {posts.length === 0 ? (
                <Col>
                  <p>Không có bài viết nào.</p>
                </Col>
              ) : (
                posts.map((post) => (
                  <Col lg={4} className="posts-list-col mb-4" key={post._id}>
                    <Link to={`/posts/${post._id}`} className="posts-list-link">
                      <Card className="posts-list-card">
                        {post.imageUrl && (
                          <Card.Img
                            variant="top"
                            src={post.imageUrl}
                            className="posts-list-card-img"
                            loading="lazy" // Lazy load hình ảnh
                          />
                        )}
                        <Card.Body>
                          <Card.Title className="posts-list-card-title">
                            {post.title}
                          </Card.Title>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>
                ))
              )}
            </Row>
          </Col>

          {/* Cột sidebar TIN NỔI BẬT */}
          <Col xs={12} lg={3}>
            <h4 className="posts-list-sidebar-title">TIN NỔI BẬT</h4>
            <Row>
              {highlightPosts.length === 0 ? (
                <Col>
                </Col>
              ) : (
                highlightPosts.map((post) => (
                  <SidebarPostItem key={post._id} post={post} />
                ))
              )}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PostsList;
