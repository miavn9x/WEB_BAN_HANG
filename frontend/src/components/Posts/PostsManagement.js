import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "../../styles/PostsManagement.css";

// Hàm chuyển đổi tiêu đề bài viết thành slug
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



const PostsManagement = () => {
  const [posts, setPosts] = useState([]);
  // State mapping từ productId sang tên sản phẩm
  const [productNames, setProductNames] = useState({});

  // Pagination: mỗi trang hiển thị 10 bài viết
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(posts.length / itemsPerPage);

  // Hàm fetch thông tin sản phẩm dựa trên danh sách productIds
  const fetchProductNames = async (productIds) => {
    const mapping = {};
    await Promise.all(
      productIds.map(async (id) => {
        try {
          const res = await fetch(`/api/products/${id}`);
          if (res.ok) {
            const productData = await res.json();
            // Giả sử API trả về { product: { _id, name, ... } }
            if (productData.product) {
              mapping[id] = productData.product.name;
            }
          }
        } catch (error) {
          console.error(`Error fetching product ${id}:`, error);
        }
      })
    );
    setProductNames(mapping);
  };

  // Sử dụng useCallback để định nghĩa hàm fetchPosts có giá trị ổn định
  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        // Lấy danh sách productId duy nhất từ các bài viết
        const productIds = [
          ...new Set(data.posts.map((post) => post.productId)),
        ];
        await fetchProductNames(productIds);
      } else {
        console.error("Error fetching posts");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }, []);

  // Gọi fetchPosts khi component mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Hàm xử lý xóa bài viết
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      try {
        const response = await fetch(`/api/posts/${id}`, { method: "DELETE" });
        if (response.ok) {
          setPosts(posts.filter((post) => post._id !== id));
        } else {
          console.error("Error deleting post");
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  // Lấy danh sách bài viết của trang hiện tại
  const currentPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="posts-management container">
      <h4 className="my-3">Quản Lý Bài Viết</h4>
      {/* Bọc bảng trong div.table-responsive để bảng hiển thị tốt trên thiết bị nhỏ */}
      <div style={{ height: "50vh", overflowY: "auto" }}>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Tiêu Đề</th>
                <th>Tags</th>
                <th>Sản Phẩm</th>
                <th>Ngày</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.map((post) => (
                <tr key={post._id}>
                  <td
                    style={{
                      maxWidth: "100px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {post.title}
                  </td>
                  <td>{post.tags.join(", ")}</td>
                  <td
                    style={{
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {productNames[post.productId] || post.productId}
                  </td>
                  <td>{new Date(post.date).toLocaleString()}</td>
                  <td>
                    <Link
                      className="btn btn-sm me-2 btn-secondary"
                      to={`/admin/add-bai-viet/${slugify(post.title)}-${
                        post._id
                      }`}
                    >
                      Sửa
                    </Link>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(post._id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-3 flex-nowrap">
          <button
            className="btn btn-secondary btn-sm me-2"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Trước
          </button>
          <span>
            Trang {currentPage} của {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm ms-2"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default PostsManagement;
