import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../../styles/Salecart.css";

function Salecart() {
  const [userCoupons, setUserCoupons] = useState([]); // Lưu trữ danh sách mã đã nhận của người dùng
  const [loading, setLoading] = useState(true); // Trạng thái tải

  const coupons = [
    {
      image:
        "https://res.cloudinary.com/div27nz1j/image/upload/v1739776309/coupon_1_img_medium_pmyslz.webp",
      code: "Giảm 25K",
      description: "Tất cả đơn hàng trên 300K",
    },
    {
      image:
        "https://res.cloudinary.com/div27nz1j/image/upload/v1739776309/coupon_1_img_medium_pmyslz.webp",
      code: "Giảm 30K",
      description: "Đơn hàng trên 500K",
    },
    {
      image:
        "https://res.cloudinary.com/div27nz1j/image/upload/v1739776309/coupon_1_img_medium_pmyslz.webp",
      code: "Giảm 70K",
      description: "Đơn hàng trên 2.000.000",
    },
    {
      image:
        "https://res.cloudinary.com/div27nz1j/image/upload/v1739779804/Screenshot_2025-02-17_150919_xoigyz.png",
      code: "FREESHIP",
      description: "Đơn online trên 1.000.000",
    },
  ];

  // Lấy danh sách mã giảm giá người dùng đã nhận từ server
  useEffect(() => {
    const fetchUserCoupons = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/coupons/my-coupons", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          // Lọc các mã giảm giá còn hiệu lực
          const validCoupons = data.coupons.filter(
            (coupon) => new Date(coupon.expiryDate) > new Date()
          );
          setUserCoupons(validCoupons);
        } else {
          alert(data.message || "Lỗi khi lấy danh sách mã giảm giá");
        }
      } catch (error) {
        console.error("Lỗi:", error);
        alert("Không thể kết nối đến server!");
      } finally {
        setLoading(false);
      }
    };

    fetchUserCoupons();
  }, []);

  // Hàm xử lý khi người dùng nhấn nhận mã
  const handleClaimCoupon = async (couponCode) => {
    if (userCoupons.some((coupon) => coupon.couponCode === couponCode)) {
      alert("Bạn đã nhận mã này, không thể nhận thêm mã.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
      }

      const response = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Thêm token vào headers
        },
        body: JSON.stringify({ couponCode }),
      });

      const data = await response.json();
      if (response.ok) {
        // Cập nhật lại danh sách mã sau khi nhận thành công
        setUserCoupons((prevCoupons) => [...prevCoupons, { couponCode }]);
        alert(`Nhận mã ${couponCode} thành công!`);
      } else {
        alert(data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không thể kết nối đến server!");
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <Container>
      <Row>
        {coupons.map((coupon, idx) => (
          <Col key={idx} xs={12} sm={6} md={6} lg={3}>
            <Card className={`${styles.couponCard} mb-4`}>
              <Card.Body className="d-flex flex-row align-items-center">
                <Image
                  src={coupon.image}
                  alt="Coupon"
                  roundedCircle
                  width={80}
                  height={80}
                  className="mb-0"
                />
                <div className="text-left ms-3">
                  <Card.Title className="text-danger">{coupon.code}</Card.Title>
                  <Card.Text>{coupon.description}</Card.Text>
                  <div className="d-flex justify-content-center mt-3">
                    <Button
                      variant="danger"
                      onClick={() => handleClaimCoupon(coupon.code)}
                      disabled={userCoupons.some(
                        (coupon) => coupon.couponCode === coupon.code
                      )} // Disable nút khi đã nhận mã
                      style={{
                        opacity: userCoupons.some(
                          (coupon) => coupon.couponCode === coupon.code
                        )
                          ? 0.5
                          : 1, // Làm mờ nút khi đã nhận mã
                      }}
                    >
                      {userCoupons.some(
                        (coupon) => coupon.couponCode === coupon.code
                      )
                        ? "Đã nhận"
                        : "Nhận"}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Salecart;
