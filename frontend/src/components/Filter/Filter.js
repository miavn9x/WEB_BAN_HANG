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

const Filter = ({ onFilterChange }) => {
  //   const handleChange = (e) => {
  //     const { id, checked, type, name } = e.target;
  //     if (onFilterChange) {
  //       onFilterChange({
  //         filterId: id,
  //         isChecked: checked,
  //         filterType: type,
  //         filterName: name,
  //       });
  //     }
  //   };

  return (
    <div className="filter-content">
      <div className="filter-section">
        <h6>Mức Giá</h6>
        <Form>
          <Form.Check
            type="radio"
            label="dưới 500.000đ"
            name="price"
            id="price2"
          />
          <Form.Check
            type="radio"
            label="dưới 1.000.000đ"
            name="price"
            id="price3"
          />

          <Form.Check
            type="radio"
            label="Trên 1.000.000đ"
            name="price"
            id="price7"
          />
        </Form>

        <h6>
          <br />
          Loại sản phẩm
        </h6>
        <Form>
          <Form.Label>
            <FaBabyCarriage /> Sữa bột cao cấp
          </Form.Label>
          <Form.Check
            type="checkbox"
            label="Từ 0-6 tháng"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Từ 6-12 tháng"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Từ 1-3 tuổi"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Từ 3-5 tuổi"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check type="checkbox" label="Sữa bột organic" id="type5" />
          <Form.Check
            type="checkbox"
            label="Tăng đề kháng"
            name="price"
            id="price"
            // onChange={handleChange}
          />

          <Form.Label>
            <FaGlassWhiskey /> Sữa tươi dinh dưỡng
          </Form.Label>
          <Form.Check
            type="checkbox"
            label="cho mẹ bầu"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="tăng canxi cho bà bầu"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="cho mẹ sau sinh"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="cho bé từ 1 tuổi"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="tăng chiều cao cho bé 3-5 tuổi"
            name="price"
            id="price"
            // onChange={handleChange}
          />

          <Form.Label>
            <FaTags /> Bỉm & tã em bé
          </Form.Label>
          <Form.Check
            type="checkbox"
            label="NB < 5 Kg"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="S 4-8 Kg"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="M 5-11 Kg"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="L 9-14 Kg"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="XL 12-18 Kg"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="XXL 13-25 Kg"
            name="price"
            id="price"
            // onChange={handleChange}
          />

          <Form.Label>
            <FaPuzzlePiece /> Đồ chơi em bé
          </Form.Label>
          <Form.Check
            type="checkbox"
            label="Đồ Chơi Bé Gái"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Đồ Chơi Bé Trai"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Sách, Học Tập"
            name="price"
            id="price"
            // onChange={handleChange}
          />

          <Form.Check
            type="checkbox"
            label="Đồ Chơi Sơ Sinh"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Scooter, Vận động"
            name="price"
            id="price"
            // onChange={handleChange}
          />

          <Form.Label>
            <FaHome /> Chăm sóc gia đình
          </Form.Label>
          <Form.Check
            type="checkbox"
            label="Chăm sóc da bầu (chống rạn)"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check type="checkbox" label="Dầu massage bầu" id="type25" />
          <Form.Check
            type="checkbox"
            label="Kem dưỡng da cho bé"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Dầu tắm gội cho bé"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Phấn rôm chống hăm"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Nhiệt kế & Máy hút mũi"
            name="price"
            id="price"
            // onChange={handleChange}
          />

          <Form.Label>
            <FaTshirt /> Thời trang mẹ và bé
          </Form.Label>
          <Form.Check
            type="checkbox"
            label="Đồ bầu theo tháng (1-8 tháng)"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check type="checkbox" label="Váy bầu công sở" id="type31" />
          <Form.Check type="checkbox" label="Đồ sau sinh" id="type32" />
          <Form.Check
            type="checkbox"
            label="Quần áo sơ sinh (0-12 tháng)"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Quần áo bé 1-3 tuổi"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Quần áo bé 3-5 tuổi"
            name="price"
            id="price"
            // onChange={handleChange}
          />

          <Form.Label>
            <FaCapsules /> Dinh dưỡng bà bầu
          </Form.Label>
          <Form.Check
            type="checkbox"
            label="Vitamin tổng hợp cho bà bầu"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Sắt và axit folic"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="Canxi và Vitamin D3"
            name="price"
            id="price"
            // onChange={handleChange}
          />
          <Form.Check type="checkbox" label="Omega 3 và DHA" id="type39" />
          <Form.Check
            type="checkbox"
            label="Sữa bầu công thức đặc biệt"
            name="price"
            id="price"
            // onChange={handleChange}
          />
        </Form>
      </div>
    </div>
  );
};

export default Filter;
