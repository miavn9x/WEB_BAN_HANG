import React, { useState } from "react";
import { Helmet } from "react-helmet";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import "../../styles/StoreLocator.css"; // Import file CSS riêng

const StoreLocator = () => {
  // Dữ liệu quận, huyện theo tỉnh thành
  const locations = {
    "TP.Hồ Chí Minh": [
      "Quận 1",
      "Quận 3",
      "Quận 5",
      "Quận 7",
      "Quận 10",
      "Quận Bình Thạnh",
      "Quận Tân Bình",
      "Quận Thủ Đức",
      "Quận Phú Nhuận",
      "Quận Gò Vấp",
    ],
  };

  // Thông tin địa chỉ và hotline của các cửa hàng
  const storeAddresses = {
    "TP.Hồ Chí Minh": {
      "Quận 1": {
        address: "123 Đường Nguyễn Huệ, Quận 1, TP.Hồ Chí Minh",
        hotline: "0909.123.456",
        link: "https://www.google.com/maps?q=123+Nguyễn+Huệ,+Quận+1,+TP.HCM",
      },
      "Quận 3": {
        address: "456 Đường Lê Văn Sỹ, Quận 3, TP.Hồ Chí Minh",
        hotline: "0909.654.321",
        link: "https://www.google.com/maps?q=456+Lê+Văn+Sỹ,+Quận+3,+TP.HCM",
      },
      "Quận 5": {
        address: "789 Đường Trần Hưng Đạo, Quận 5, TP.Hồ Chí Minh",
        hotline: "0909.789.012",
        link: "https://www.google.com/maps?q=789+Trần+Hưng+Đạo,+Quận+5,+TP.HCM",
      },
      "Quận 7": {
        address: "101 Đường Nguyễn Văn Linh, Quận 7, TP.Hồ Chí Minh",
        hotline: "0909.321.654",
        link: "https://www.google.com/maps?q=101+Nguyễn+Văn+Linh,+Quận+7,+TP.HCM",
      },
      "Quận 10": {
        address: "202 Đường 3/2, Quận 10, TP.Hồ Chí Minh",
        hotline: "0909.234.567",
        link: "https://www.google.com/maps?q=202+Đường+3/2,+Quận+10,+TP.HCM",
      },
      "Quận Bình Thạnh": {
        address: "303 Đường Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP.Hồ Chí Minh",
        hotline: "0909.345.678",
        link: "https://www.google.com/maps?q=303+Xô+Viết+Nghệ+Tĩnh,+Quận+Bình+Thạnh,+TP.HCM",
      },
      "Quận Tân Bình": {
        address: "404 Đường Hoàng Văn Thụ, Quận Tân Bình, TP.Hồ Chí Minh",
        hotline: "0909.456.789",
        link: "https://www.google.com/maps?q=404+Hoàng+Văn+Thụ,+Quận+Tân+Bình,+TP.HCM",
      },
      "Quận Thủ Đức": {
        address: "505 Đường Võ Văn Ngân, TP Thủ Đức, TP.Hồ Chí Minh",
        hotline: "0909.567.890",
        link: "https://www.google.com/maps?q=505+Võ+Văn+Ngân,+Thủ+Đức,+TP.HCM",
      },
      "Quận Phú Nhuận": {
        address: "606 Đường Phan Xích Long, Quận Phú Nhuận, TP.Hồ Chí Minh",
        hotline: "0909.678.901",
        link: "https://www.google.com/maps?q=606+Phan+Xích+Long,+Quận+Phú+Nhuận,+TP.HCM",
      },
      "Quận Gò Vấp": {
        address: "707 Đường Quang Trung, Quận Gò Vấp, TP.Hồ Chí Minh",
        hotline: "0909.789.123",
        link: "https://www.google.com/maps?q=707+Quang+Trung,+Quận+Gò+Vấp,+TP.HCM",
      },
    },
  };

  // State cho các dropdown
  const [province, setProvince] = useState("TP.Hồ Chí Minh");
  const [store, setStore] = useState(locations[province][0]);
  const [storeAddress, setStoreAddress] = useState(
    storeAddresses[province][store]
  );

  // Handle sự kiện thay đổi tỉnh thành
  const handleProvinceChange = (e) => {
    const selectedProvince = e.target.value;
    setProvince(selectedProvince);
    setStore(locations[selectedProvince][0]); // Đặt lại quận huyện mặc định khi chọn tỉnh thành
    setStoreAddress(
      storeAddresses[selectedProvince][locations[selectedProvince][0]]
    ); // Cập nhật địa chỉ và hotline
  };

  // Handle sự kiện thay đổi cửa hàng
  const handleStoreChange = (e) => {
    const selectedStore = e.target.value;
    setStore(selectedStore);
    setStoreAddress(storeAddresses[province][selectedStore]);
  };

  // SEO Meta Tags
  const pageTitle = "Tìm cửa hàng gần bạn - Go Book";
  const pageDescription =
    "Tìm các cửa hàng của Go Book tại TP.Hồ Chí Minh, dễ dàng tra cứu địa chỉ và hotline. Hãy đến thăm chúng tôi ngay!";
  const pageImage = "/default-image.jpg"; // Bạn có thể thay đổi thành hình ảnh của cửa hàng

  return (
    <div className="store-locator my-5">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
      </Helmet>

      <div className="container">
        <div className="row">
          {/* Cột tìm kiếm cửa hàng */}
          <div className="col-lg-4 col-md-4 col-12 mb-4">
            <div className="card">
              <h5 className="card-title">Tìm cửa hàng Go Book</h5>
              <div className="mb-3">
                <label htmlFor="province" className="form-label">
                  Chọn tỉnh thành phố
                </label>
                <select
                  className="form-select"
                  id="province"
                  value={province}
                  onChange={handleProvinceChange}
                >
                  <option value="TP.Hồ Chí Minh">TP.Hồ Chí Minh</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="store" className="form-label">
                  Chọn cửa hàng
                </label>
                <select
                  className="form-select"
                  id="store"
                  value={store}
                  onChange={handleStoreChange}
                >
                  {locations[province].map((storeLocation, index) => (
                    <option key={index} value={storeLocation}>
                      {storeLocation}
                    </option>
                  ))}
                </select>
              </div>
              <div className="contact-info">
                <FontAwesomeIcon icon={faMapMarkerAlt} /> Địa chỉ liên hệ
              </div>
              <div className="contact-details">
                <p>{storeAddress.address}</p>
                <p>Hotline: {storeAddress.hotline}</p>
                <a
                  href={storeAddress.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem trên bản đồ
                </a>
              </div>
            </div>
          </div>

          {/* Cột bản đồ (9 cột) */}
          <div className="col-lg-8 col-md-8 col-12 mb-4">
            <div className="map-container">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  storeAddress.address
                )}&output=embed`}
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen
                title="Bản đồ vị trí cửa hàng"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLocator;
