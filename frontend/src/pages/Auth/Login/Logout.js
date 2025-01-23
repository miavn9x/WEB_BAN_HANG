import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa token và thông tin user khỏi localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Chuyển hướng về trang login
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="btn btn-outline-danger"
      style={{ border: "none" }}
    >
      Đăng xuất
    </button>
  );
};

export default Logout;
