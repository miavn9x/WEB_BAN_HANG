import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation, useNavigate } from "react-router-dom";
import { formatter } from "../../utils/fomater";

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderId, setOrderId] = useState(""); // Mã đơn hàng
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData || {};

  // Hàm tạo mã đơn hàng duy nhất
  const generateOrderId = () => {
    const timestamp = new Date().getTime(); // Lấy thời gian hiện tại
    const randomString = Math.random().toString(36).substring(2, 10); // Tạo chuỗi ngẫu nhiên
    return `ORD-${timestamp}-${randomString}`; // Kết hợp cả hai để tạo mã duy nhất
  };

  // Tạo mã đơn hàng ngay khi component được render
  useEffect(() => {
    const newOrderId = generateOrderId();
    setOrderId(newOrderId); // Cập nhật mã đơn hàng vào state
  }, []);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  // Checkout.js
  const handleCompleteOrder = async (event) => {
    event.preventDefault();

    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập để đặt hàng!");
        navigate("/login");
        return;
      }

      const orderDetails = {
        orderId,
        items: orderData.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        totalAmount: orderData.totalAmount,
        paymentMethod,
        userInfo: {
          fullName: orderData.userInfo?.fullName,
          phone: orderData.userInfo?.phone,
          address: orderData.userInfo?.address,
        },
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderDetails),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Đặt hàng thành công! Mã đơn hàng của bạn là: ${orderId}`);
        // Xóa giỏ hàng sau khi đặt hàng thành công
        localStorage.removeItem("cart");
        navigate("/order-history");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
    }
  };
  return (
    <Container style={{ maxWidth: "500px" }}>
      <Row>
        <Col>
          <div
            className="order-summary"
            style={{
              border: "1px solid #ddd",
              borderRadius: "5px",
              padding: "20px",
              marginTop: "20px",
            }}
          >
            <h5>Thông tin khách hàng</h5>
            <p> Họ và Tên: {orderData.userInfo?.fullName}</p>
            <p> Số điện thoại: {orderData.userInfo?.phone}</p>
            <p> Địa Chỉ: {orderData.userInfo?.address}</p>
            <h6 className="text-center">Chi tiết đơn hàng</h6>
            {orderData.items?.map((item) => (
              <div key={item.product._id} className="product-item mb-3">
                <div className="d-flex align-items-center">
                  <img
                    src={item.product.images?.[0]}
                    alt={item.product.name}
                    style={{ width: "50px", marginRight: "10px" }}
                  />
                  <div>
                    <p className="mb-1">{item.product.name}</p>
                    <p className="mb-1">Số lượng: {item.quantity}</p>
                    <p className="mb-0">
                      Đơn giá: {formatter(item.product.priceAfterDiscount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="order-summary-totals mt-3">
              <div className="d-flex justify-content-between">
                <span>Tạm tính:</span>
                <span>{formatter(orderData.subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Phí vận chuyển:</span>
                <span>{formatter(orderData.shippingFee)}</span>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <strong>Tổng cộng:</strong>
                <strong className="text-danger">
                  {formatter(orderData.totalAmount)}
                </strong>
              </div>
            </div>

            <p className="text-star mt-3">
              Mã đơn hàng của bạn:{" "}
              <strong style={{ color: "red" }}>{orderId}</strong>
            </p>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <div
            className="payment-method"
            style={{
              border: "1px solid #ddd",
              borderRadius: "5px",
              padding: "20px",
              marginTop: "20px",
            }}
          >
            <h5>Phương thức thanh toán</h5>
            <Form onSubmit={handleCompleteOrder}>
              <Form.Check
                className="mt-4"
                type="radio"
                id="cod"
                name="paymentMethod"
                label={
                  <>
                    <img
                      alt="COD icon"
                      src="https://hstatic.net/0/0/global/design/seller/image/payment/cod.svg?v=6"
                      style={{
                        marginRight: "10px",
                        width: "30px",
                        height: "auto",
                      }}
                    />
                    Thanh toán khi giao hàng (COD)
                  </>
                }
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={handlePaymentMethodChange}
              />
              <Form.Check
                className="mt-4"
                type="radio"
                id="bank"
                name="paymentMethod"
                label={
                  <>
                    <img
                      alt="Bank icon"
                      src="https://chiasevaytien.com/pictures/images/12-2020/08/logo-mb-bank-3.webp"
                      style={{
                        marginRight: "10px",
                        width: "50px",
                        height: "auto",
                      }}
                    />
                    Chuyển khoản qua ngân hàng
                  </>
                }
                value="bank"
                checked={paymentMethod === "bank"}
                onChange={handlePaymentMethodChange}
              />
              {paymentMethod === "bank" && (
                <div className="bank-details mt-4 justify-content-center">
                  <p>
                    <strong>Thông tin chuyển khoản ngân hàng:</strong>
                  </p>
                  <p>Ngân hàng: MB Bank</p>
                  <p>Số tài khoản: 79575566778899</p>
                  <p>Chủ tài khoản: Nguyễn Thanh Tùng</p>
                  <p>Nội dung: Thanh toán đơn hàng mã số:</p>
                  <h6 style={{ color: "red" }}>{orderId}</h6>
                  <div>
                    <img
                      alt="QR Code"
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1738137720/z6272568037456_c205caf6088472a6e94074f7e4615792_nklven.png"
                      style={{ width: "150px", height: "auto" }}
                    />
                    <p>Quét mã QR để thanh toán</p>
                  </div>
                </div>
              )}
              <hr />
              <div>Quý khách quyển khoản với nỗi dung mã đơn hàng</div>
              <hr />
              <div className="d-flex justify-content-between mt-4">
                <Button variant="link" href="#" className="btn btn-link">
                  Giỏ hàng
                </Button>
                <Button
                  variant="primary"
                  className="ms-auto btn-complete"
                  type="submit"
                >
                  Hoàn tất đơn hàng
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
