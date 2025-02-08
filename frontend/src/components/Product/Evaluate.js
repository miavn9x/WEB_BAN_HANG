import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import styles from "../../styles/Evaluate.module.css";

// Lấy thông tin người dùng (từ localStorage hoặc dữ liệu giả)
const getCurrentUser = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (!user.userId && user._id) {
      user.userId = user._id;
    }
    return user;
  }
  return {
    userId: "60d0fe4f5311236168a109cb", // Dữ liệu giả
    firstName: "Nguyễn",
    lastName: "Văn A",
  };
};

const getUserId = (user) => {
  if (!user) return "";
  if (typeof user === "object") {
    if (user._id) return user._id.toString();
    if (user.userId) return user.userId.toString();
  }
  return user.toString();
};

const getFullName = (user, currentUser) => {
  if (!user) return "Unknown";
  const userIdFromApi = getUserId(user);
  if (userIdFromApi === currentUser.userId) {
    return `${currentUser.lastName} ${currentUser.firstName}`;
  }
  if (typeof user === "object" && user.lastName && user.firstName) {
    return `${user.lastName} ${user.firstName}`;
  }
  return "Unknown";
};

const getReplySnippet = (replyData) => {
  if (!replyData) return "";
  const text = replyData.text || "";
  return text.length > 50 ? text.substring(0, 50) + "..." : text;
};

const getReplyToId = (replyTo) => {
  if (!replyTo) return null;
  if (typeof replyTo === "object" && replyTo._id) {
    return replyTo._id.toString();
  }
  return replyTo.toString();
};


const getThreadAnswers = (question, messages) => {
  const threadAnswers = [];
  const addAnswers = (parentId) => {
    messages.forEach((m) => {
      if (m.type === "answer" && getReplyToId(m.replyTo) === parentId) {
        threadAnswers.push(m);
        addAnswers(m._id.toString());
      }
    });
  };
  addAnswers(question._id.toString());
  // Sắp xếp theo thời gian tăng dần
  threadAnswers.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return threadAnswers;
};

const Evaluate = ({ productId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  // replyTo: lưu đối tượng tin nhắn (câu hỏi hoặc câu trả lời) mà người dùng đang phản hồi
  const [replyTo, setReplyTo] = useState(null);

  const currentUser = getCurrentUser();
  const containerRef = useRef(null);
  const messagesAreaRef = useRef(null);
  

  // Hàm tự động scroll xuống dưới khung tin nhắn
  const scrollToBottom = () => {
    if (messagesAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesAreaRef.current;
      if (scrollHeight - scrollTop - clientHeight < 50) {
        messagesAreaRef.current.scrollTop = scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  
  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(`/api/products/${productId}/messages`);
      let msgs = res.data.messages || [];
      // Xử lý populate cho replyTo
      msgs = msgs.map((message) => {
        if (message.replyTo) {
          // Nếu replyTo chưa được populate, tìm tin gốc trong mảng
          const replyId =
            typeof message.replyTo === "object"
              ? message.replyTo._id
              : message.replyTo;
          const original = msgs.find((m) => m._id === replyId);
          if (original) {
            return {
              ...message,
              replyTo: {
                _id: original._id,
                text: original.text,
                userId: original.userId,
                createdAt: original.createdAt,
              },
            };
          }
        }
        return message;
      });
      setMessages(msgs);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách tin nhắn:", err);
    }
  }, [productId]);

  useEffect(() => {
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 2000);
    return () => clearInterval(intervalId);
  }, [fetchMessages]);

  // Gửi tin nhắn (câu hỏi hoặc câu trả lời)
  const handleSubmit = async () => {
    const content = newMessageText.trim();
    if (!content) return;
    setNewMessageText("");

    const newMessageData = {
      userId: currentUser.userId,
      text: content,
      createdAt: new Date().toISOString(),
      type: replyTo ? "answer" : "question",
      // Nếu có trả lời, gửi replyTo là _id của tin gốc
      replyTo: replyTo ? replyTo._id : null,
    };

    // Optimistic update: thêm tin nhắn tạm thời vào UI
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      userId: {
        _id: currentUser.userId,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      },
      ...newMessageData,
      pending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await axios.post(
        `/api/products/${productId}/messages`,
        newMessageData
      );
      setMessages(res.data.messages);
      setReplyTo(null);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const threads = messages
    .filter((m) => m.type === "question")
    .map((q) => {
      const answers = getThreadAnswers(q, messages);
      const questionTime = new Date(q.createdAt).getTime();
      const answerTimes = answers.map((a) => new Date(a.createdAt).getTime());
      const lastUpdated =
        answerTimes.length > 0
          ? Math.max(questionTime, ...answerTimes)
          : questionTime;
      return { ...q, answers, lastUpdated };
    });

  const sortedThreads = threads.sort((a, b) => b.lastUpdated - a.lastUpdated);
  const visibleThreads = sortedThreads.slice(0, 5);

  return (
    <Container className="mt-4" ref={containerRef}>
        <Card className={`p-4 ${styles.ratingBox}`}>
        <Card.Title className="fw-bold">Đánh Giá</Card.Title>
        <Row className="align-items-center">
          <Col md={4} className="text-center text-md-start">
            <div className={styles.ratingValue}>5.0/5.0</div>
            <div className={styles.ratingStars}>
              <i className="fas fa-star" />
              <i className="fas fa-star" />
              <i className="fas fa-star" />
              <i className="fas fa-star" />
              <i className="fas fa-star" />
            </div>
            <div className={styles.ratingCount}>
              Có <strong>133</strong> lượt đánh giá
            </div>
          </Col>
          <Col md={6} className="text-center">
            <Button
              className={`${styles.btnCustom} ${styles.btnCustomActive}`}
              variant="primary"
            >
              Mới nhất
            </Button>
            <Button className={`${styles.btnCustom} ms-2`} variant="secondary">
              Đã mua nhiều lần
            </Button>
            <Row className="mt-3">
              <Col className="text-center">
                <Button className={styles.btnCustom} variant="outline-primary">
                  5 <i className="fas fa-star" />
                </Button>
                <Button className={`${styles.btnCustom} ms-2`} variant="outline-primary">
                  4 <i className="fas fa-star" />
                </Button>
                <Button className={`${styles.btnCustom} ms-2`} variant="outline-primary">
                  3 <i className="fas fa-star" />
                </Button>
                <Button className={`${styles.btnCustom} ms-2`} variant="outline-primary">
                  2 <i className="fas fa-star" />
                </Button>
                <Button className={`${styles.btnCustom} ms-2`} variant="outline-primary">
                  1 <i className="fas fa-star" />
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Phần đánh giá mẫu */}
      <Row className="mt-4">
        <Col xs={12}>
          <Card className="border rounded bg-white">
            <Card.Body className="p-3">
              <div className="d-flex flex-column">
                <span className="fw-bold">Nguyễn An</span>
                <div className={styles.ratingStars}>
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                </div>
                <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                  05/02/2025 08:24
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Hiển thị tin nhắn */}
      <Card className={styles.customQuestionBox}>
        <Card.Header className={styles.customQuestionHeader}>
          <span>Hỏi – Đáp</span>
        </Card.Header>
        <Card.Body>
          <div className={styles.messagesArea} ref={messagesAreaRef}>
            {visibleThreads.map((q) => {
              const isSender = getUserId(q.userId) === currentUser.userId;
              return (
                <div key={q._id} className={styles.chatMessage}>
                  {/* Hiển thị câu hỏi */}
                  <div
                    className={
                      isSender ? styles.chatBubbleUser : styles.chatBubbleOther
                    }
                  >
                    <p>
                      {isSender ? (
                        <strong>{getFullName(q.userId, currentUser)}</strong>
                      ) : (
                        <strong>{getFullName(q.userId, currentUser)}:</strong>
                      )}
                    </p>
                    <p>{q.text}</p>
                    <div
                      className={styles.replyButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Nếu đang chọn trả lời câu hỏi này rồi => hủy
                        if (replyTo && replyTo._id === q._id) {
                          setReplyTo(null);
                        } else {
                          setReplyTo(q);
                        }
                      }}
                    >
                      {replyTo && replyTo._id === q._id ? "Hủy" : "Trả lời"}
                    </div>
                    <div className={styles.chatTimestamp}>
                      {new Date(q.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Hiển thị danh sách các tin trả lời thuộc thread này */}
                  {q.answers &&
                    q.answers.map((ans) => {
                      const isAnswerSender =
                        getUserId(ans.userId) === currentUser.userId;
                      return (
                        <div key={ans._id} className={styles.chatMessage}>
                          <div
                            className={
                              isAnswerSender
                                ? styles.chatBubbleUser
                                : styles.chatBubbleOther
                            }
                          >
                            {/* Nếu tin trả lời có replyTo (đã được populate) thì hiển thị inline reply */}
                            {ans.replyTo && (
                              <div className={styles.inlineReply}>
                                <small>
                                  Trả lời{" "}
                                  {getFullName(ans.replyTo.userId, currentUser)}
                                  : {getReplySnippet(ans.replyTo)}
                                </small>
                              </div>
                            )}
                            <p>
                              {isAnswerSender ? (
                                <strong>
                                  {getFullName(ans.userId, currentUser)}
                                </strong>
                              ) : (
                                <strong>
                                  {getFullName(ans.userId, currentUser)}:
                                </strong>
                              )}
                            </p>
                            <p>{ans.text}</p>
                            <div
                              className={styles.replyButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Khi nhấn "Trả lời" ở tin trả lời, set replyTo là tin đó
                                if (replyTo && replyTo._id === ans._id) {
                                  setReplyTo(null);
                                } else {
                                  setReplyTo(ans);
                                }
                              }}
                            >
                              {replyTo && replyTo._id === ans._id
                                ? "Hủy"
                                : "Trả lời"}
                            </div>
                            <div className={styles.chatTimestamp}>
                              {new Date(ans.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
          <div className={styles.inputArea}>
            <InputGroup className={styles.customQuestionInputGroup}>
              <FormControl
                className={styles.customQuestionInput}
                placeholder={
                  replyTo ? "Nhập câu trả lời..." : "Gửi câu hỏi cho admin"
                }
                aria-label="Gửi tin nhắn"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
              />
              <InputGroup.Text
                style={{ cursor: "pointer" }}
                onClick={handleSubmit}
              >
                <i className="fas fa-paper-plane" />
              </InputGroup.Text>
            </InputGroup>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Evaluate;
