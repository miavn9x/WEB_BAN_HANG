import React, { useState, useEffect } from "react";
import { PiMinusBold } from "react-icons/pi";
import { TfiPlus } from "react-icons/tfi";

const QuantityBox = ({ maxQuantity, quantity, setQuantity }) => {
  const [inputVal, setInputVal] = useState(quantity || 1); // Giữ giá trị ban đầu từ props

  useEffect(() => {
    setInputVal(quantity); // Đồng bộ hóa với state từ cha
  }, [quantity]);

  const minus = () => {
    if (inputVal > 1) {
      setInputVal(inputVal - 1); // Cập nhật giá trị state nội bộ
      setQuantity(inputVal - 1); // Cập nhật giá trị cho cha
    }
  };

  const plus = () => {
    if (inputVal < maxQuantity) {
      setInputVal(inputVal + 1); // Cập nhật giá trị state nội bộ
      setQuantity(inputVal + 1); // Cập nhật giá trị cho cha
    }
  };

  const numberprocessing = (e) => {
    const value = e.target.value;

    if (value === "" || /^[0-9\b]+$/.test(value)) {
      const newVal = Math.max(1, Math.min(maxQuantity, value)); // Giới hạn giá trị
      setInputVal(newVal); // Cập nhật giá trị state nội bộ
      setQuantity(newVal); // Cập nhật giá trị cho cha
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
