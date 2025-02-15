//utils/tokenEncryption.js

import CryptoJS from "crypto-js";

const secretKey = process.env.REACT_APP_TOKEN_SECRET || "your-secret-key"; // Cấu hình key an toàn

export const encryptToken = (token) => {
  return CryptoJS.AES.encrypt(token, secretKey).toString();
};

export const decryptToken = (encryptedToken) => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
