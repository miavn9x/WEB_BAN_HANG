import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Spinner } from "react-bootstrap";
import "../../styles/post-detail.css";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Tách dấu khỏi ký tự
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu kết hợp
    .replace(/đ/g, "d") // Chuyển 'đ' thành 'd'
    .trim()
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w-]+/g, "") // Loại bỏ ký tự không hợp lệ
    .replace(/--+/g, "-") // Loại bỏ dấu gạch ngang thừa
    .replace(/^-+/, "") // Loại bỏ dấu gạch ngang ở đầu chuỗi
    .replace(/-+$/, ""); // Loại bỏ dấu gạch ngang ở cuối chuỗi
}

const PostDetail = () => {
  // Nhận tham số URL chứa cả slug và id, ví dụ: "ten-bai-viet-607c191e810c19729de860ea"
  const { slug } = useParams();
  const postId = slug.substring(slug.lastIndexOf("-") + 1);

  const [post, setPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // Fetch bài viết theo id
  useEffect(() => {
    fetch(`/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Post data:", data);
        setPost(data);
        setLoadingPost(false);
      })
      .catch((err) => {
        console.error("Error fetching post:", err);
        setLoadingPost(false);
      });
  }, [postId]);

  // Fetch sản phẩm liên quan
  useEffect(() => {
    if (!post) return;

    const fetchProducts = (url) => {
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setRelatedProducts(data.products || []);
          setLoadingRelated(false);
        })
        .catch((err) => {
          console.error("Error fetching products:", err);
          setLoadingRelated(false);
        });
    };

    if (post.productId) {
      fetch(`/api/products/${post.productId}`)
        .then((res) => res.json())
        .then((data) => {
          if (
            data &&
            data.product &&
            data.product.category &&
            data.product.category.generic
          ) {
            const generic = data.product.category.generic;
            const url = `/api/products?categoryGeneric=${encodeURIComponent(
              generic
            )}&limit=6&sortBy=random`;
            fetchProducts(url);
          } else {
            fetchProducts(`/api/products?sortBy=random&limit=6`);
          }
        })
        .catch((err) => {
          console.error("Error fetching product details:", err);
          fetchProducts(`/api/products?sortBy=random&limit=6`);
        });
    } else {
      fetchProducts(`/api/products?sortBy=random&limit=6`);
    }
  }, [post]);

  if (loadingPost) {
    return (
      <div className="loading-container text-center my-5">
        <Spinner
          animation="border"
          variant="success"
          className="loading-spinner"
        />
        <div>Đang tải bài viết...</div>
      </div>
    );
  }

  if (!post) return <p>Bài viết không tồn tại.</p>;

  // SEO Meta Tags
  const postUrl = window.location.href;
  const postTitle = post.title || "No title";
  const postDescription =
    post.description ||
    (post.content
      ? post.content.substring(0, 150) + "..."
      : "No description available");
  const postImage = post.image || "/default-image.jpg";

  return (
    <div className="post-detail container my-4">
      <Helmet>
        <title>{`${postTitle} - BabyMart.vn`}</title>
        <meta name="description" content={postDescription} />
        <meta property="og:title" content={postTitle} />
        <meta property="og:description" content={postDescription} />
        <meta property="og:image" content={postImage} />
        <meta property="og:url" content={postUrl} />
        <meta name="twitter:title" content={postTitle} />
        <meta name="twitter:description" content={postDescription} />
        <meta name="twitter:image" content={postImage} />
      </Helmet>

      <Link to="/posts-list" className="btn btn-secondary mb-3">
        Quay lại danh sách
      </Link>
      <div className="row">
        <div className="col-12 col-md-9">
          <h1 className="mb-4">{post.title}</h1>
          {post.content ? (
            <div
              className="post-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p>Không có nội dung để hiển thị.</p>
          )}
          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="mt-4">
              <h5>Thẻ:</h5>
              <ul className="list-inline">
                {post.tags.map((tag, index) => (
                  <li
                    key={index}
                    className="list-inline-item badge bg-info text-dark me-2"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3 text-muted">
            Ngày đăng: {new Date(post.date).toLocaleString()}
          </p>
        </div>

        <div className="col-12 col-md-3">
          <h4 className="mb-3">Sản phẩm liên quan</h4>
          {loadingRelated ? (
            <p>Đang tải sản phẩm liên quan...</p>
          ) : relatedProducts && relatedProducts.length > 0 ? (
            <div className="list-group">
              {relatedProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${slugify(product.name)}-${product._id}`}
                  className="list-group-item list-group-item-action d-flex align-items-center"
                >
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="related-product-img"
                    />
                  )}
                  <span>{product.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p>Không có sản phẩm liên quan.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
