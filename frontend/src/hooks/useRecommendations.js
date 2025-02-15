import { useEffect, useState } from "react";

const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetch("/api/recommendations", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setRecommendations(data.recommendations))
      .catch((err) => console.error("Lỗi khi lấy đề xuất:", err));
  }, []);

  return recommendations;
};

export default useRecommendations;
