import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Spinner, Alert, Table } from "react-bootstrap";
import "../../../styles/AccountList.css";

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editableAccount, setEditableAccount] = useState(null);

  // Fetch account list
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập lại");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setError(
        error.response?.data?.message || "Lỗi khi tải danh sách tài khoản"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle edit mode
  const handleEdit = (account) => {
    setEditableAccount({
      ...account,
      firstName: account.firstName || "",
      lastName: account.lastName || "",
      email: account.email || "",
      phone: account.phone || "",
      role: account.role || "",
    });
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setEditableAccount((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle update submission
  const handleUpdate = async () => {
    if (!editableAccount) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập lại");
      return;
    }

    try {
      const response = await axios.put(
        `/api/users/${editableAccount._id}`,
        {
          firstName: editableAccount.firstName,
          lastName: editableAccount.lastName,
          email: editableAccount.email,
          phone: editableAccount.phone,
          role: editableAccount.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account._id === editableAccount._id ? response.data.user : account
        )
      );

      setEditableAccount(null);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Update error:", error);
      alert(error.response?.data?.message || "Lỗi khi cập nhật thông tin");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập lại");
      return;
    }

    try {
      await axios.delete(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAccounts((prevAccounts) =>
        prevAccounts.filter((account) => account._id !== id)
      );
      alert("Xóa tài khoản thành công!");
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Lỗi khi xóa tài khoản");
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Quản lý tài khoản</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Email</th>
                <th>Họ và tên</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account._id}>
                  <td>
                    {editableAccount?._id === account._id ? (
                      <input
                        type="email"
                        className="form-control"
                        value={editableAccount.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                    ) : (
                      account.email
                    )}
                  </td>
                  <td>
                    {editableAccount?._id === account._id ? (
                      <div className="d-flex gap-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Họ"
                          value={editableAccount.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tên"
                          value={editableAccount.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      `${account.firstName} ${account.lastName}`
                    )}
                  </td>
                  <td>
                    {editableAccount?._id === account._id ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editableAccount.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    ) : (
                      account.phone
                    )}
                  </td>
                  <td>
                    {editableAccount?._id === account._id ? (
                      <select
                        className="form-control"
                        value={editableAccount.role}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      account.role
                    )}
                  </td>
                  <td>
                    {editableAccount?._id === account._id ? (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={handleUpdate}
                          className="me-2"
                        >
                          Lưu
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditableAccount(null)}
                        >
                          Hủy
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEdit(account)}
                          className="me-2"
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(account._id)}
                        >
                          Xóa
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AccountList;
