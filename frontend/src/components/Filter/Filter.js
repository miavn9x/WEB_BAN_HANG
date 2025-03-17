import React from "react";
import { Form } from "react-bootstrap";
import {
  FaBookOpen,
  FaBrain,
  FaChild,
  FaHistory,
  FaLanguage,
  FaMoneyBillWave,
  FaPaintBrush,
  FaSchool,
} from "react-icons/fa";

// Cập nhật các danh mục và tùy chọn con (theo đúng tên ở CarouselAndMenu)
 const categoryOptions = {
   "Văn Học": [
     "Tiểu Thuyết",
     "Truyện Ngắn - Tản Văn",
     "Light Novel",
     "Ngôn Tình",
     "Tác Phẩm Kinh Điển",
     "Thơ",
   ],
   "Kinh Tế": [
     "Nhân Vật - Bài Học Kinh Doanh",
     "Quản Trị - Lãnh Đạo",
     "Marketing - Bán Hàng",
     "Phân Tích Kinh Tế",
     "Đầu Tư Tài Chính",
     "Khởi Nghiệp",
   ],
   "Tâm Lý - Kỹ Năng Sống": [
     "Kỹ Năng Sống",
     "Rèn Luyện Nhân Cách",
     "Tâm Lý",
     "Sách Cho Tuổi Mới Lớn",
     "Hôn Nhân - Gia Đình",
     "Sách Self-Help",
   ],
   "Nuôi Dạy Con": [
     "Cẩm Nang Làm Cha Mẹ",
     "Phương Pháp Giáo Dục Trẻ",
     "Phát Triển Trí Tuệ Cho Trẻ",
     "Phát Triển Kỹ Năng Cho Trẻ",
     "Thai Giáo",
     "Sức Khỏe Trẻ Em",
   ],
   "Sách Thiếu Nhi": [
     "Manga - Comic",
     "Kiến Thức Bách Khoa",
     "Sách Tranh Kỹ Năng Sống",
     "Vừa Học - Vừa Chơi",
     "Truyện Cổ Tích",
     "Truyện Tranh",
   ],
   "Tiểu Sử - Hồi Ký": [
     "Câu Chuyện Cuộc Đời",
     "Chính Trị",
     "Kinh Tế",
     "Nghệ Thuật - Giải Trí",
     "Tự Truyện",
     "Nhân Vật Lịch Sử",
   ],
   "Giáo Khoa - Tham Khảo": [
     "Sách Giáo Khoa",
     "Sách Tham Khảo",
     "Luyện Thi THPT Quốc Gia",
     "Mẫu Giáo",
     "Sách Ôn Thi Đại Học",
     "Sách Bài Tập",
   ],
   "Sách Học Ngoại Ngữ": [
     "Tiếng Anh",
     "Tiếng Nhật",
     "Tiếng Hoa",
     "Tiếng Hàn",
     "Tiếng Pháp",
     "Tiếng Đức",
   ],
 };

// Hàm trả về icon tương ứng với danh mục
const getCategoryIcon = (categoryName) => {
  switch (categoryName) {
    case "Văn Học":
      return <FaBookOpen style={{ marginRight: "8px" }} />;
    case "Kinh Tế":
      return <FaMoneyBillWave style={{ marginRight: "8px" }} />;
    case "Tâm Lý - Kỹ Năng Sống":
      return <FaBrain style={{ marginRight: "8px" }} />;
    case "Nuôi Dạy Con":
      return <FaChild style={{ marginRight: "8px" }} />;
    case "Sách Thiếu Nhi":
      return <FaPaintBrush style={{ marginRight: "8px" }} />;
    case "Tiểu Sử - Hồi Ký":
      return <FaHistory style={{ marginRight: "8px" }} />;
    case "Giáo Khoa - Tham Khảo":
      return <FaSchool style={{ marginRight: "8px" }} />;
    case "Sách Học Ngoại Ngữ":
      return <FaLanguage style={{ marginRight: "8px" }} />;
    default:
      return null;
  }
};


const priceOptions = [
  { label: "Dưới 500.000đ", filterId: "price-500000", maxPrice: 500000 },
  { label: "Dưới 1.000.000đ", filterId: "price-1000000", maxPrice: 1000000 },
  { label: "Trên 1.000.000đ", filterId: "price-gt-1000000", minPrice: 1000000 },
];

const Filter = ({ onFilterChange, filters }) => {
  const handleFilterChange = (filterData) => {
    // Gọi callback truyền dữ liệu filter lên component cha
    onFilterChange(filterData);
  };

  return (
    <div className="filter-content">
      <div className="filter-section">
        <h6>Mức Giá</h6>
        <Form>
          {priceOptions.map((option) => (
            <Form.Check
              key={option.filterId}
              type="radio"
              label={option.label}
              id={option.filterId}
              name="price"
              aria-label={option.label}
              checked={filters.price?.filterId === option.filterId}
              onChange={() =>
                handleFilterChange({
                  filterId: option.filterId,
                  filterType: "radio",
                  filterName: "price",
                  maxPrice: option.maxPrice || null,
                  minPrice: option.minPrice || null,
                })
              }
            />
          ))}
        </Form>
      </div>

      {/* Bộ lọc loại sản phẩm */}
      <div className="filter-section">
        <h6>Loại sản phẩm</h6>
        <Form>
          {Object.keys(categoryOptions).map((categoryName) => (
            <div key={categoryName}>
              <Form.Label>
                {getCategoryIcon(categoryName)}
                {categoryName}
              </Form.Label>
              {categoryOptions[categoryName].map((option) => {
                // Mã hóa filterId dưới dạng "Tên danh mục|Tùy chọn con"
                const filterId = `${categoryName}|${option}`;
                // Kiểm tra xem đã có lựa chọn cho danh mục này chưa
                const isChecked = filters.categories[categoryName] === filterId;
                return (
                  <Form.Check
                    key={filterId}
                    type="checkbox"
                    label={option}
                    id={filterId}
                    checked={isChecked}
                    aria-label={option}
                    onChange={(e) =>
                      handleFilterChange({
                        filterType: "categoryExclusive",
                        categoryName,
                        filterId,
                        isChecked: e.target.checked,
                        categoryGeneric: option,
                      })
                    }
                  />
                );
              })}
            </div>
          ))}
        </Form>
      </div>
    </div>
  );
};

export default Filter;