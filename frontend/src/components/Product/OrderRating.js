import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import Rating from "@mui/material/Rating";

const OrderRating = ({ productIds, initialRating = 0, onSuccess }) => {
  const [rating, setRating] = useState(initialRating);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) {
      alert("Vui lòng chọn số sao từ 1 đến 5");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Gửi đánh giá cho tất cả các sản phẩm trong đơn hàng
      const reviewPromises = productIds.map((productId) =>
        fetch(`/api/products/${productId}/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, reviewText }),
        })
      );

      const responses = await Promise.all(reviewPromises);

      // Kiểm tra từng phản hồi
      for (const response of responses) {
        const data = await response.json();
        if (!data.success) {
          alert(data.message || "Có lỗi xảy ra khi gửi đánh giá");
          setLoading(false);
          return;
        }
      }

      alert("Cảm ơn bạn đã đánh giá sản phẩm!");
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        mt: 3,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Đánh giá sản phẩm trong đơn hàng
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
        <Rating
          name="order-rating"
          value={rating}
          onChange={(event, newValue) => setRating(newValue)}
          precision={1}
          size="large"
          readOnly={submitted}
        />
        {rating ? (
          <Typography variant="body1" sx={{ ml: 2 }}>
            {rating} sao
          </Typography>
        ) : null}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        (Chọn từ 1 đến 5 sao)
      </Typography>
      <TextField
        label="Nội dung đánh giá"
        multiline
        rows={4}
        variant="outlined"
        fullWidth
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        sx={{ mt: 2 }}
        disabled={submitted}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading || submitted}
        sx={{ mt: 2, borderRadius: 2, py: 1.5 }}
        fullWidth
      >
        {submitted
          ? "Đã gửi đánh giá"
          : loading
          ? "Đang gửi..."
          : "Gửi đánh giá"}
      </Button>
    </Paper>
  );
};

export default OrderRating;
