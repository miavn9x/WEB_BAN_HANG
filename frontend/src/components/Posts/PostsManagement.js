// PostsManagement.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PostsManagement = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        console.error("Error fetching posts");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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

  return (
    <div className="container">
      <h3 className="my-3">Quản Lý Bài Viết</h3>
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
          {posts.map((post) => (
            <tr key={post._id}>
              <td>{post.title}</td>
              <td>{post.tags.join(", ")}</td>
              <td>{post.productId}</td>
              <td>{new Date(post.date).toLocaleString()}</td>
              <td>
                <Link
                  className="btn btn-sm btn-primary me-2"
                  to={`/admin/add-bai-viet?id=${post._id}`}
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
  );
};

export default PostsManagement;
