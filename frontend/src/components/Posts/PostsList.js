import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/PostsList.css"; // Import file CSS dành riêng cho trang này

// Component hiển thị mỗi bài viết nổi bật (TIN NỔI BẬT)
const SidebarPostItem = ({ post }) => (
  // Chỉ định thuộc tính lg cho màn hình lớn, gán lớp custom để override responsive ở CSS
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

  // Lấy danh sách bài viết từ API
  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        // Sắp xếp danh sách bài viết sao cho những bài có thẻ "#baimoi" xuất hiện đầu tiên
        const sortedPosts = data.posts.sort((a, b) => {
          // Nếu bài viết có tags là mảng các chuỗi hoặc mảng các object
          const aTags = Array.isArray(a.tags) ? a.tags : [];
          const bTags = Array.isArray(b.tags) ? b.tags : [];

          // Xét nếu bài có thẻ "#baimoi" thì ưu tiên đưa lên đầu
          const aPriority = aTags.includes("#baimoi") ? 0 : 1;
          const bPriority = bTags.includes("#baimoi") ? 0 : 1;
          return aPriority - bPriority;
        });

        setPosts(sortedPosts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      });
  }, []);

  // Lọc ra các bài viết có tag "#noibat" cho mục TIN NỔI BẬT
  const highlightPosts = posts.filter(
    (post) => post.tags && post.tags.includes("#noibat")
  );

  if (loading) {
    return <p>Đang tải danh sách bài viết...</p>;
  }

  return (
    <div className="posts-list-page">
      <Container>
        {/* Tiêu đề trang */}
        <Row className="my-4">
          <Col>
            <h1 className="posts-list-title">Danh Sách Bài Viết</h1>
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
                  // Chỉ định thuộc tính lg cho màn hình lớn (3 bài/ hàng),
                  // và gán lớp posts-list-col để điều chỉnh qua CSS cho màn hình từ 768 đến 430 và ≤430.
                  <Col lg={4} className="posts-list-col mb-4" key={post._id}>
                    <Link to={`/posts/${post._id}`} className="posts-list-link">
                      <Card className="posts-list-card">
                        {post.imageUrl && (
                          <Card.Img
                            variant="top"
                            src={post.imageUrl}
                            className="posts-list-card-img"
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
                  <p>Không có bài viết nổi bật.</p>
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
