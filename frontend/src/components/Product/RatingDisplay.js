import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import styles from "../../styles/Evaluate.module.css";
import Evaluate from "./Evaluate";

// Hàm tiện ích render sao theo rating
const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <>
      {Array.from({ length: fullStars }).map((_, i) => (
        <i key={`full-${i}`} className="fas fa-star text-warning" />
      ))}
      {hasHalfStar && (
        <i key="half" className="fas fa-star-half-alt text-warning" />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <i key={`empty-${i}`} className="fas fa-star text-muted" />
      ))}
    </>
  );
};

const RatingDisplay = ({ product, filter, setFilter }) => {
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchFilteredReviews = async () => {
      setLoading(true);
      try {
        const validReviews = (product?.reviews || []).filter(
          (review) =>
            review?.rating > 2 &&
            typeof review.reviewText === "string" &&
            review.reviewText.trim().length >= 3
        );

        // Sắp xếp và lọc
        let processedReviews = [...validReviews];
        if (filter === "latest") {
          processedReviews.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        } else if (typeof filter === "number") {
          processedReviews = processedReviews.filter(
            (review) => Math.round(review.rating) === filter
          );
        }

        // Gọi API phân tích
        const analysisResults = await Promise.allSettled(
          processedReviews.map(async (review) => {
            try {
              const response = await axios.post(
                "/api/ai/analyze-review",
                { text: review.reviewText },
                {
                  timeout: 1000,
                  signal: abortController.signal,
                }
              );
              return response.data.isNegative ? null : review;
            } catch (error) {
              console.error("Lỗi phân tích:", review._id, error.response?.data);
              return review; // Giữ lại nếu có lỗi
            }
          })
        );

        // Lọc kết quả
        const finalReviews = analysisResults
          .filter((result) => result.status === "fulfilled" && result.value)
          .map((result) => result.value);

        setFilteredReviews(finalReviews);
      } catch (error) {
        console.error("Lỗi hệ thống:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredReviews();
    return () => abortController.abort();
  }, [product?.reviews, filter]);

  return (
    <Card className={`p-4 ${styles.ratingBox}`}>
      <Card.Title className="fw-bold">Đánh Giá</Card.Title>
      <Row className="align-items-center">
        <Col md={4} className="text-center text-md-start">
          <div className={styles.ratingValue}>
            {(product?.rating || 5.0).toFixed(1)}/5.0
          </div>
          <div className={styles.ratingStars}>
            {renderStars(product?.rating || 5.0)}
          </div>
          <div className={styles.ratingCount}>
            Có <strong>{product?.reviews?.length || 0}</strong> lượt đánh giá
          </div>
        </Col>
        <Col md={6} className="text-center">
          <Button
            className={`${styles.btnCustom} ${
              filter === "latest" ? styles.btnCustomActive : ""
            }`}
            variant="primary"
            onClick={() => setFilter("latest")}
          >
            Mới nhất
          </Button>
          <Button
            className={`${styles.btnCustom} ms-2 ${
              filter === "mostBought" ? styles.btnCustomActive : ""
            }`}
            variant="secondary"
            onClick={() => setFilter("mostBought")}
          >
            Đã mua nhiều lần
          </Button>
          <Row className="mt-3">
            <Col className="text-center">
              {[5, 4, 3, 2, 1].map((star) => (
                <Button
                  key={star}
                  className={`${styles.btnCustom} ms-2 ${
                    filter === star ? styles.btnCustomActive : ""
                  }`}
                  variant="outline-primary"
                  onClick={() => setFilter(star)}
                >
                  {star} <i className="fas fa-star" />
                </Button>
              ))}
            </Col>
          </Row>
        </Col>
      </Row>

      {loading && (
        <Row className="mt-4">
          <Col className="text-center">
            <Spinner animation="border" variant="primary" />
            <p>Đang phân tích đánh giá...</p>
          </Col>
        </Row>
      )}

      <Row className="mt-4">
        {!loading && filteredReviews.length > 0 ? (
          filteredReviews.map((review, index) => (
            <Col xs={12} key={index}>
              <Card className="border rounded bg-white mb-3">
                <Card.Body className="p-3">
                  <div className="d-flex flex-column flex-md-row">
                    <div className="me-md-3 text-md-start text-center">
                      <span className="fw-bold d-block">
                        {review.userId?.name || "Người dùng ẩn danh"}
                      </span>
                      <div className={styles.ratingStars}>
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <div className="flex-grow-1 text-md-start text-center mt-2 mt-md-0">
                      <p className="mb-0">{review.reviewText}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : !loading ? (
          <Col xs={12}>
            <p className="text-muted"></p>
          </Col>
        ) : null}
      </Row>
      <Evaluate/>
    </Card>
  );
};

export default RatingDisplay;
