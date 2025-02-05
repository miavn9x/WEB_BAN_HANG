// components/Filter/Filter.jsx
import React from "react";
import { Form } from "react-bootstrap";
import {
  FaBabyCarriage,
  FaCapsules,
  FaGlassWhiskey,
  FaHome,
  FaPuzzlePiece,
  FaTags,
  FaTshirt,
} from "react-icons/fa";

// Định nghĩa các danh mục và các tùy chọn con
const categoryOptions = {
  "Sữa bột cao cấp": [
    "Từ 0-6 tháng",
    "Từ 6-12 tháng",
    "Từ 1-3 tuổi",
    "Từ 3-5 tuổi",
    "Sữa bột organic",
    "Tăng đề kháng",
  ],
  "Sữa dinh dưỡng": [
    "Cho mẹ bầu",
    "Tăng canxi cho bà bầu",
    "Cho mẹ sau sinh",
    "Cho bé từ 1 tuổi",
    "Tăng chiều cao cho bé 3-5 tuổi",
  ],
  "Bỉm & Tã em bé": [
    "NB < 5 Kg",
    "S 4-8 Kg",
    "M 5-11 Kg",
    "L 9-14 Kg",
    "XL 12-18 Kg",
    "XXL 13-25 Kg",
  ],
  "Đồ chơi em bé": [
    "Đồ chơi bé gái",
    "Đồ chơi bé trai",
    "Sách, học tập",
    "Đồ chơi sơ sinh",
    "Scooter, vận động",
  ],
  "Chăm sóc gia đình": [
    "Chăm sóc da bầu (chống rạn)",
    "Dầu massage bầu",
    "Kem dưỡng da cho bé",
    "Dầu tắm gội cho bé",
    "Phấn rôm chống hăm",
    "Nhiệt kế & Máy hút mũi",
  ],
  "Thời trang mẹ và bé": [
    "Đồ bầu theo tháng (1-8 tháng)",
    "Váy bầu công sở",
    "Đồ sau sinh",
    "Quần áo sơ sinh (0-12 tháng)",
    "Quần áo bé 1-3 tuổi",
    "Quần áo bé 3-5 tuổi",
  ],
  "Dinh dưỡng bà bầu": [
    "Vitamin tổng hợp cho bà bầu",
    "Sắt và axit folic",
    "Canxi và Vitamin D3",
    "Omega 3 và DHA",
    "Sữa bầu công thức đặc biệt",
  ],
};

// Hàm trả về icon tương ứng với danh mục
const getCategoryIcon = (categoryName) => {
  switch (categoryName) {
    case "Sữa bột cao cấp":
      return <FaBabyCarriage style={{ marginRight: "8px" }} />;
    case "Sữa dinh dưỡng":
      return <FaGlassWhiskey style={{ marginRight: "8px" }} />;
    case "Bỉm & Tã em bé":
      return <FaTags style={{ marginRight: "8px" }} />;
    case "Đồ chơi em bé":
      return <FaPuzzlePiece style={{ marginRight: "8px" }} />;
    case "Chăm sóc gia đình":
      return <FaHome style={{ marginRight: "8px" }} />;
    case "Thời trang mẹ và bé":
      return <FaTshirt style={{ marginRight: "8px" }} />;
    case "Dinh dưỡng bà bầu":
      return <FaCapsules style={{ marginRight: "8px" }} />;
    default:
      return null;
  }
};

// Định nghĩa các option giá
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
      {/* Bộ lọc mức giá */}
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

      {/* Bộ lọc danh mục (chỉ cho phép chọn duy nhất 1 option cho mỗi danh mục) */}
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
                // Mã hóa thông tin filter: "Tên danh mục|Tùy chọn con"
                const filterId = `${categoryName}|${option}`;
                // Kiểm tra xem trong filters.categories (dạng object) đã có lựa chọn cho categoryName này chưa
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
