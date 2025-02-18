import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  Container,
  Card,
  InputGroup,
  FormControl,
  Button,
} from "react-bootstrap";
import styles from "../../styles/Evaluate.module.css";
import { jwtDecode } from "jwt-decode";

// Hàm lấy thông tin người dùng từ token
const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.user; // Trả về thông tin người dùng từ token
    } catch (err) {
      console.error("Token không hợp lệ:", err);
      localStorage.removeItem("token"); // Xóa token nếu không hợp lệ
      return null;
    }
  }
  return null;
};

const Evaluate = ({ productId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Kiểm tra và cập nhật lại currentUser mỗi khi component render
  useEffect(() => {
    const user = getCurrentUser();
    console.log("Current User:", user); // Kiểm tra thông tin người dùng
    setCurrentUser(user); // Cập nhật trạng thái currentUser
  }, []); // Chỉ chạy một lần khi component mount

  // Fetch messages for the product when the component mounts or the current user changes
  const fetchMessages = useCallback(() => {
    if (currentUser) {
      axios
        .get(`/api/messages/${currentUser.userId}/${productId}`)
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("Error fetching messages:", err));
    }
  }, [productId, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000); // Lấy tin nhắn mới mỗi 2 giây
      return () => clearInterval(interval); // Dọn dẹp khi component bị unmount
    }
  }, [currentUser, fetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom(); // Tự động cuộn xuống khi có tin nhắn mới
  }, [messages]);

  // Handle message submit
  const handleSubmit = async () => {
    if (!currentUser) {
      console.error("Không tìm thấy người dùng. Vui lòng đăng nhập.");
      return;
    }

    const text = newMessageText.trim();
    if (!text) return;
    setNewMessageText(""); // Clear input field after submitting

    const payload = {
      productId,
      text,
      replyTo: replyTo ? replyTo._id : null,
    };

    try {
      const res = await axios.post("/api/messages", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessages((prev) => [
        ...prev,
        res.data.productMessages[res.data.productMessages.length - 1]
          .messages[0],
      ]);
      setReplyTo(null); // Clear reply state
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleReply = (message) => {
    setReplyTo(message); // Set reply message
  };

  // Kiểm tra nếu chưa đăng nhập
  if (!currentUser) {
    return (
      <Container>
        <h4>Vui lòng đăng nhập để tiếp tục.</h4>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className={styles.customMessageBox}>
        <Card.Header className={styles.customMessageHeader}>
          <h5>Trò chuyện sản phẩm</h5>
        </Card.Header>
        <Card.Body>
          <div className={styles.messagesArea}>
            {messages.map((message) => (
              <div key={message._id} className={styles.messageItem}>
                <div className={styles.messageContent}>
                  <strong>
                    {message.userId.firstName} {message.userId.lastName}
                  </strong>
                  <p>{message.text}</p>
                  {message.replyTo && (
                    <div className={styles.replySnippet}>
                      Trả lời: <em>{message.replyTo.text}</em>
                    </div>
                  )}
                  <small>{new Date(message.createdAt).toLocaleString()}</small>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleReply(message)}
                >
                  Trả lời
                </Button>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <InputGroup className={styles.inputArea}>
            <FormControl
              placeholder={replyTo ? "Nhập câu trả lời..." : "Nhập tin nhắn..."}
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            <InputGroup.Text
              onClick={handleSubmit}
              style={{ cursor: "pointer" }}
            >
              Gửi
            </InputGroup.Text>
          </InputGroup>
          {replyTo && (
            <div className={styles.replyInfo}>
              Đang trả lời tin nhắn của:{" "}
              <strong>
                {replyTo.userId.firstName} {replyTo.userId.lastName}
              </strong>
              <Button variant="link" size="sm" onClick={() => setReplyTo(null)}>
                Hủy
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Evaluate;
