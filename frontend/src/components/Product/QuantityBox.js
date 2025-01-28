import React, { useState } from "react";
import { PiMinusBold } from "react-icons/pi";
import { TfiPlus } from "react-icons/tfi";

const QuantityBox = ({ maxQuantity }) => {
  const [inputVal, setInputVal] = useState(1);

  const minus = () => {
    if (inputVal > 1) {
      // Đảm bảo số lượng không nhỏ hơn 1
      setInputVal(inputVal - 1);
    }
  };

  const plus = () => {
    if (inputVal < maxQuantity) {
      // Giới hạn theo maxQuantity (số lượng tồn kho)
      setInputVal(inputVal + 1);
    }
  };

  const numberprocessing = (e) => {
    const value = e.target.value;

    // Kiểm tra xem giá trị có hợp lệ và không vượt quá maxQuantity
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      const newVal = Math.max(1, Math.min(maxQuantity, value)); // Giới hạn giá trị trong khoảng 1 đến maxQuantity
      setInputVal(newVal);
    }
  };

  return (
    <div className="quantityDrop d-flex align-items-center">
      <button className="btn-minus" onClick={minus}>
        <PiMinusBold />
      </button>
      <input
        type="text"
        value={inputVal}
        className="quantity-input"
        onChange={numberprocessing}
      />
      <button className="btn-plus" onClick={plus}>
        <TfiPlus />
      </button>
    </div>
  );
};

export default QuantityBox;
