import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "../../styles/post-detail.css";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
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
  }, [id]);

  useEffect(() => {
    if (post && post.productId) {
      fetch(`/api/products/related?productId=${post.productId}`)
        .then((res) => res.json())
        .then((data) => {
          setRelatedProducts(data.products || []);
          setLoadingRelated(false);
        })
        .catch((err) => {
          console.error("Error fetching related products:", err);
          setLoadingRelated(false);
        });
    } else {
      setLoadingRelated(false);
    }
  }, [post]);

  if (loadingPost) return <p>Đang tải bài viết...</p>;
  if (!post) return <p>Bài viết không tồn tại.</p>;

  return (
    <div className="post-detail container my-4">
      <Link to="/PostsList" className="btn btn-secondary mb-3">
        Quay lại danh sách
      </Link>
      <div className="row">
        <div className="col-12 col-md-9">
          <h1 className="mb-4">{post.title}</h1>

          
   

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="mt-4">
              <h5>Thẻ:</h5>
              <ul className="list-inline ">
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
                  to={`/products/${product._id}`}
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
