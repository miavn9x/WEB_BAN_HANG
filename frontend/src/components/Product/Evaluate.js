import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Container, Card, InputGroup, FormControl } from "react-bootstrap";
import styles from "../../styles/Evaluate.module.css";
import {jwtDecode} from "jwt-decode"; // Sử dụng default export

// Hàm lấy thông tin người dùng từ token (token có payload: { userId, role })
const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken; // decodedToken chứa { userId, role }
    } catch (err) {
      console.error("Token không hợp lệ:", err);
      localStorage.removeItem("token");
      return null;
    }
  }
  return null;
};

const Evaluate = ({ productId }) => {
  const [chat, setChat] = useState(null); // Lưu đối tượng chat (bao gồm mảng messages)
  const [newMessageText, setNewMessageText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Sử dụng ref cho khung chat để cuộn nội bộ
  const chatBoxRef = useRef(null);

  // Lấy thông tin người dùng khi component mount
  useEffect(() => {
    const user = getCurrentUser();
    console.log("Current User:", user);
    setCurrentUser(user);
  }, []);

  // Hàm fetch cuộc trò chuyện dựa trên productId và userId
  const fetchChat = useCallback(() => {
    if (currentUser && productId) {
      axios
        .get("/api/chats/private", {
          params: {
            productId,
            userId: currentUser.userId,
          },
        })
        .then((res) => {
          setChat(res.data);
        })
        .catch((err) => console.error("Error fetching chat:", err));
    }
  }, [productId, currentUser]);

  // Fetch chat khi currentUser thay đổi và tự động refresh mỗi 2 giây
  useEffect(() => {
    if (currentUser) {
      fetchChat();
      const interval = setInterval(fetchChat, 2000);
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchChat]);

  // Hàm tự động cuộn xuống cuối khung chat (chỉ cuộn khung chat, không cuộn cả trang)
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = chatBoxRef.current;
      const isNearBottom = scrollHeight - scrollTop <= clientHeight + 100;
      if (isNearBottom) {
        chatBoxRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  // Xử lý gửi tin nhắn
  const handleSubmit = async () => {
    if (!currentUser) {
      console.error("Không tìm thấy người dùng. Vui lòng đăng nhập.");
      return;
    }
    const text = newMessageText.trim();
    if (!text) return;
    setNewMessageText(""); // Xóa nội dung input sau khi gửi

    const payload = {
      productId,
      userId: currentUser.userId,
      sender: currentUser.userId,
      message: text,
    };

    try {
      const res = await axios.post("/api/chats/private", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // Backend trả về đối tượng chat đã được cập nhật
      setChat(res.data);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Nếu chưa đăng nhập
  if (!currentUser) {
    return (
      <Container>
        <h4>Vui lòng đăng nhập để tiếp tục.</h4>
      </Container>
    );
  }

  return (
    <Card className={styles.customMessageBox}>
      <Card.Header className={styles.customMessageHeader}>
        <h5>Trò chuyện sản phẩm</h5>
      </Card.Header>
      <Card.Body>
        {/* Khung tin nhắn: đặt chiều cao cố định và overflow để chỉ cuộn khung chat */}
        <div
          className={styles.messagesArea}
          ref={chatBoxRef}
          style={{ maxHeight: "480px", overflowY: "auto" }}
        >
          {chat && chat.messages && chat.messages.length > 0 ? (
            chat.messages.map((msg) => {
              // Kiểm tra tin nhắn gửi đi (outgoing) nếu sender của tin nhắn khớp với currentUser
              const isOutgoing =
                currentUser &&
                ((msg.sender && msg.sender._id === currentUser.userId) ||
                  msg.sender === currentUser.userId);

              return (
                <div
                  key={msg._id}
                  className={`${styles.messageItem} ${
                    isOutgoing ? styles.outgoing : styles.incoming
                  }`}
                >
                  <div className={styles.messageContent}>
                    <strong>
                      {msg.sender && msg.sender.firstName
                        ? `${msg.sender.firstName} ${msg.sender.lastName}`
                        : "Người dùng"}
                    </strong>
                    <p>{msg.message}</p>
                    <small>{new Date(msg.createdAt).toLocaleString()}</small>
                  </div>
                </div>
              );
            })
          ) : (
            <p>Chưa có tin nhắn nào.</p>
          )}
        </div>
        <InputGroup className={styles.inputArea}>
          <FormControl
            placeholder="Nhập tin nhắn..."
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          <InputGroup.Text onClick={handleSubmit} style={{ cursor: "pointer" }}>
            Gửi
          </InputGroup.Text>
        </InputGroup>
      </Card.Body>
    </Card>
  );
};

export default Evaluate;
