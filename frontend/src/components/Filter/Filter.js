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

// Hàm để chọn biểu tượng cho từng danh mục
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

const Filter = ({ onFilterChange, filters }) => {
  const handleFilterChange = (filterData) => {
    const filterInfo = {
      filterId: filterData.filterId,
      isChecked: filterData.isChecked,
      filterType: filterData.filterType,
      filterName: filterData.filterName,
      categoryName: filterData.categoryName,
      categoryGeneric: filterData.categoryGeneric,
    };
    onFilterChange(filterInfo);
  };

  return (
    <div className="filter-content">
      {/* Bộ lọc giá */}
      <div className="filter-section">
        <h6>Mức Giá</h6>
        <Form>
          {["Dưới 500.000đ", "Dưới 1.000.000đ", "Trên 1.000.000đ"].map(
            (label, index) => (
              <Form.Check
                key={`price-${index}`}
                type="radio"
                label={label}
                id={`price-${index}`}
                name="price"
                aria-label={label}
                onChange={() =>
                  handleFilterChange({
                    filterId: `price-${index}`,
                    isChecked: true,
                    filterType: "radio",
                    filterName: "price",
                  })
                }
              />
            )
          )}
        </Form>
      </div>

      {/* Bộ lọc danh mục */}
      <div className="filter-section">
        <h6>Loại sản phẩm</h6>
        <Form>
          {Object.keys(categoryOptions).map((categoryName) => (
            <div key={categoryName}>
              <Form.Label>
                {getCategoryIcon(categoryName)}
                {categoryName}
              </Form.Label>
              {categoryOptions[categoryName].map((option, index) => (
                <Form.Check
                  key={`${categoryName}-${index}`}
                  type="checkbox"
                  label={option}
                  id={`${categoryName}-${index}`}
                  checked={filters?.categories?.has(`${categoryName}-${index}`)} // Check if the category is selected
                  aria-label={option}
                  onChange={(e) =>
                    handleFilterChange({
                      filterId: `${categoryName}-${index}`,
                      isChecked: e.target.checked,
                      filterType: "checkbox",
                      filterName: "categories",
                      categoryName,
                      categoryGeneric: option,
                    })
                  }
                />
              ))}
            </div>
          ))}
        </Form>
      </div>
    </div>
  );
};

export default Filter;
