// components/Filter/Filter.jsx
import React from "react";
import { Form } from "react-bootstrap";
import {
  FaBaby,
  FaBabyCarriage,
  FaCapsules,
  FaGlassWhiskey,
  FaHome,
  FaPuzzlePiece,
  FaTags,
  FaTshirt,
  FaUtensils,
} from "react-icons/fa";

// Cập nhật các danh mục và tùy chọn con (theo đúng tên ở CarouselAndMenu)
const categoryOptions = {
  "Sữa bột cao cấp": [
    "Sữa bột cho bé 0-6 tháng",
    "Sữa bột cho bé 6-12 tháng",
    "Sữa bột cho bé 1-3 tuổi",
    "Sữa bột cho bé 3-5 tuổi",
    "Sữa bột organic",
    "Sữa non tăng đề kháng",
  ],
  "Sữa tươi dinh dưỡng": [
    "Sữa tươi cho mẹ bầu",
    "Sữa tươi tăng canxi cho bà bầu",
    "Sữa tươi cho mẹ sau sinh",
    "Sữa tươi cho bé từ 1 tuổi",
    "Sữa tươi tăng chiều cao cho bé 3-5 tuổi",
  ],
  "Bỉm & tã em bé": [
    "Bỉm sơ sinh (< 5kg)",
    "Bỉm size S (4-8kg)",
    "Bỉm size M (6-11kg)",
    "Bỉm size L (9-14kg)",
    "Bỉm size XL (12-17kg)",
    "Bỉm quần cho bé tập đi",
  ],
  "Đồ chơi phát triển": [
    "Đồ chơi bé gái",
    "Đồ chơi bé trai",
    "Sách, học tập",
    "Đồ chơi sơ sinh",
    "Scooter, vận động",
  ],
  "Chăm sóc mẹ và bé": [
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
  "Ăn dặm cho bé": [
    "Bột ăn dặm 6-8 tháng",
    "Bột ăn dặm 8-12 tháng",
    "Cháo ăn dặm 12-24 tháng",
    "Bánh ăn dặm",
    "Vitamin & Khoáng chất ăn dặm",
    "Dụng cụ ăn dặm",
  ],
  "Dinh dưỡng cho bé": [
    "Vitamin tổng hợp cho bé 0-12 tháng",
    "Vitamin cho bé 1-3 tuổi",
    "Vitamin cho bé 3-5 tuổi",
    "Men vi sinh cho bé",
    "Kẽm & Sắt cho bé",
    "DHA cho bé",
  ],
  "Đồ dùng thiết yếu": [
    "Máy hút sữa & Phụ kiện",
    "Bình sữa & Núm ti",
    "Máy tiệt trùng & Hâm sữa",
    "Nôi & Cũi cho bé",
    "Xe đẩy & Địu",
    "Ghế ăn & Ghế rung",
  ],
};

// Hàm trả về icon tương ứng với danh mục
const getCategoryIcon = (categoryName) => {
  switch (categoryName) {
    case "Sữa bột cao cấp":
      return <FaBabyCarriage style={{ marginRight: "8px" }} />;
    case "Sữa tươi dinh dưỡng":
      return <FaGlassWhiskey style={{ marginRight: "8px" }} />;
    case "Bỉm & tã em bé":
      return <FaTags style={{ marginRight: "8px" }} />;
    case "Đồ chơi phát triển":
      return <FaPuzzlePiece style={{ marginRight: "8px" }} />;
    case "Chăm sóc mẹ và bé":
      return <FaHome style={{ marginRight: "8px" }} />;
    case "Thời trang mẹ và bé":
      return <FaTshirt style={{ marginRight: "8px" }} />;
    case "Dinh dưỡng bà bầu":
      return <FaCapsules style={{ marginRight: "8px" }} />;
    case "Ăn dặm cho bé":
      return <FaUtensils style={{ marginRight: "8px" }} />;
    case "Dinh dưỡng cho bé":
      return <FaCapsules style={{ marginRight: "8px" }} />;
    case "Đồ dùng thiết yếu":
      return <FaBaby style={{ marginRight: "8px" }} />;
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
