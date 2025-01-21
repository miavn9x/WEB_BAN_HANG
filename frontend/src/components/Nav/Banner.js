import React from "react";
import "../../styles/Banner.css"; // Nhập tệp CSS để áp dụng kiểu dáng

const Banner = () => {
  return (
    <div className="banner-container">
      <img
        src="https://res.cloudinary.com/div27nz1j/image/upload/v1737477990/s3vtwiab22kya9fkuvmb.png"
        alt="PC"
        className="banner-image banner-pc"
      />
      <img
        src="https://res.cloudinary.com/div27nz1j/image/upload/v1737478761/s2muitgb5lgdzqfioemm.png"
        alt="iPad"
        className="banner-image banner-ipad"
      />
      <img
        src="https://res.cloudinary.com/div27nz1j/image/upload/v1737478284/w4cmbo5tbchq9cr0h8kn.webp"
        alt="Mobile"
        className="banner-image banner-mobile"
      />
    </div>
  );
};

export default Banner;
