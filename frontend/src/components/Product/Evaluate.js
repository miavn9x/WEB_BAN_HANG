// src/components/Product/Evaluate.js
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

// Lấy thông tin user từ localStorage.
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
    userId: "60d0fe4f5311236168a109cb",
    firstName: "Nguyễn",
    lastName: "Văn A",
  };
};

// Hàm phụ trợ lấy id của đối tượng user.
const getUserId = (user) => {
  if (!user) return "";
  if (typeof user === "object") {
    if (user._id) return user._id.toString();
    if (user.userId) return user.userId.toString();
  }
  return user.toString();
};

// Hàm hỗ trợ lấy tên đầy đủ của người dùng.
const getFullName = (user, currentUser) => {
  if (!user) return "Unknown";
  const userIdFromApi = getUserId(user);
  if (userIdFromApi === currentUser.userId) {
    return `${currentUser.firstName} ${currentUser.lastName}`;
  }
  if (typeof user === "object" && user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return "Admin";
};

// Hàm tạo snippet nội dung tin được trả lời (lấy 50 ký tự đầu).
const getReplySnippet = (message) => {
  if (!message) return "";
  const text = message.questionText || message.answerText || "";
  return text.length > 50 ? text.substring(0, 50) + "..." : text;
};

const Evaluate = () => {
  const productId = "60d0fe4f5311236168a109ca";
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  // replyTo: { type: "question" | "answer", questionId, message }
  const [replyTo, setReplyTo] = useState(null);
  // Lưu id của tin nhắn đang hover (cho cả câu hỏi và câu trả lời)
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  const currentUser = getCurrentUser();
  const containerRef = useRef(null);
  const longPressTimer = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);

  // Hàm cuộn xuống cuối danh sách tin nhắn nếu người dùng đang gần bottom.
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
  }, [questions]);

  const handleMouseUp = () => {
    clearTimeout(longPressTimer.current);
  };

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await axios.get(`/api/products/${productId}/questions`);
      setQuestions(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách câu hỏi:", err);
    }
  }, [productId]);

  // Polling: gọi API mỗi 5 giây.
  useEffect(() => {
    fetchQuestions();
    const intervalId = setInterval(() => {
      fetchQuestions();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [fetchQuestions]);

  // Xử lý click ngoài để hủy chế độ trả lời.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setReplyTo(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm gửi tin nhắn (optimistic update).
  const handleSubmit = async () => {
    if (!newQuestionText.trim()) return;
    if (replyTo) {
      // Tạo đối tượng tạm cho câu trả lời, bao gồm thuộc tính replyTo.
      const tempAnswer = {
        _id: `temp-${Date.now()}`,
        userId: currentUser.userId,
        answerText: newQuestionText,
        createdAt: new Date().toISOString(),
        pending: true,
        replyTo: replyTo.message, // Lưu thông tin tin nhắn được trả lời.
      };
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q._id === replyTo.questionId
            ? { ...q, answers: [...(q.answers || []), tempAnswer] }
            : q
        )
      );
      try {
        const res = await axios.post(
          `/api/questions/${replyTo.questionId}/answers`,
          {
            userId: currentUser.userId,
            answerText: newQuestionText,
            replyTo: replyTo.message,
          }
        );
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) => {
            if (q._id === replyTo.questionId) {
              return {
                ...q,
                answers: q.answers.map((a) =>
                  a._id === tempAnswer._id ? res.data : a
                ),
              };
            }
            return q;
          })
        );
        setReplyTo(null);
        setNewQuestionText("");
      } catch (err) {
        console.error("handleSubmit (reply) error:", err);
      }
    } else {
      const tempQuestion = {
        _id: `temp-${Date.now()}`,
        userId: currentUser.userId,
        questionText: newQuestionText,
        createdAt: new Date().toISOString(),
        answers: [],
        pending: true,
      };
      setQuestions((prev) => [...prev, tempQuestion]);
      try {
        const res = await axios.post(`/api/products/${productId}/questions`, {
          userId: currentUser.userId,
          questionText: newQuestionText,
        });
        setQuestions((prev) =>
          prev.map((q) => (q._id === tempQuestion._id ? res.data : q))
        );
        setNewQuestionText("");
      } catch (err) {
        console.error("handleSubmit (question) error:", err);
      }
    }
  };

  return (
    <Container className="mt-4" ref={containerRef}>
      {/* Phần đánh giá tổng quan */}
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
                <Button
                  className={`${styles.btnCustom} ms-2`}
                  variant="outline-primary"
                >
                  4 <i className="fas fa-star" />
                </Button>
                <Button
                  className={`${styles.btnCustom} ms-2`}
                  variant="outline-primary"
                >
                  3 <i className="fas fa-star" />
                </Button>
                <Button
                  className={`${styles.btnCustom} ms-2`}
                  variant="outline-primary"
                >
                  2 <i className="fas fa-star" />
                </Button>
                <Button
                  className={`${styles.btnCustom} ms-2`}
                  variant="outline-primary"
                >
                  1 <i className="fas fa-star" />
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Phần đánh giá sản phẩm mẫu */}
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

      {/* Phần Hỏi – Đáp */}
      <Card className={styles.customQuestionBox}>
        <Card.Header className={styles.customQuestionHeader}>
          Hỏi Đáp
        </Card.Header>
        <Card.Body>
          <div className={styles.messagesArea} ref={messagesAreaRef}>
            {questions.map((q) => {
              const questionUserId = getUserId(q.userId);
              const isSender = questionUserId === currentUser.userId;
              return (
                <div
                  key={q._id}
                  className={styles.chatMessage}
                  onMouseEnter={() => setHoveredMessageId(q._id)}
                  onMouseLeave={() => {
                    setHoveredMessageId(null);
                    clearTimeout(longPressTimer.current);
                  }}
                  onMouseDown={() => {
                    if (!isSender) {
                      longPressTimer.current = setTimeout(() => {
                        setReplyTo({
                          type: "question",
                          questionId: q._id,
                          message: q,
                        });
                      }, 2000);
                    }
                  }}
                  onMouseUp={handleMouseUp}
                >
                  <div
                    className={
                      isSender ? styles.chatBubbleUser : styles.chatBubbleOther
                    }
                    style={{
                      textAlign: isSender ? "right" : "left",
                      marginLeft: isSender ? "auto" : "0",
                      marginRight: isSender ? "0" : "auto",
                      position: "relative",
                    }}
                  >
                    <p>
                      {isSender ? (
                        <>
                          {q.questionText}{" "}
                          <strong>
                            : {getFullName(q.userId, currentUser)}
                          </strong>
                        </>
                      ) : (
                        <>
                          <strong>{getFullName(q.userId, currentUser)}:</strong>{" "}
                          {q.questionText}
                        </>
                      )}
                    </p>
                    {!isSender &&
                      (hoveredMessageId === q._id ||
                        (replyTo && replyTo.message._id === q._id)) && (
                        <div
                          className={styles.replyButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (replyTo && replyTo.message._id === q._id) {
                              setReplyTo(null);
                            } else {
                              setReplyTo({
                                type: "question",
                                questionId: q._id,
                                message: q,
                              });
                            }
                          }}
                        >
                          {replyTo && replyTo.message._id === q._id
                            ? "Hủy"
                            : "Trả lời"}
                        </div>
                      )}
                    <div className={styles.chatTimestamp}>
                      {new Date(q.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {q.answers &&
                    q.answers.map((ans) => {
                      const answerUserId = getUserId(ans.userId);
                      const isAnswerSender =
                        answerUserId === currentUser.userId;
                      return (
                        <div
                          key={ans._id}
                          className={styles.chatMessage}
                          onMouseEnter={() => setHoveredMessageId(ans._id)}
                          onMouseLeave={() => {
                            setHoveredMessageId(null);
                            clearTimeout(longPressTimer.current);
                          }}
                          onMouseDown={() => {
                            if (!isAnswerSender) {
                              longPressTimer.current = setTimeout(() => {
                                setReplyTo({
                                  type: "answer",
                                  questionId: q._id,
                                  message: ans,
                                });
                              }, 2000);
                            }
                          }}
                          onMouseUp={handleMouseUp}
                        >
                          <div
                            className={
                              isAnswerSender
                                ? styles.chatBubbleUser
                                : styles.chatBubbleOther
                            }
                            style={{
                              textAlign: isAnswerSender ? "right" : "left",
                              marginLeft: isAnswerSender ? "auto" : "0",
                              marginRight: isAnswerSender ? "0" : "auto",
                              position: "relative",
                            }}
                          >
                            {/* Nếu tin nhắn có thuộc tính replyTo, hiển thị inline snippet bên trên nội dung */}
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
                                <>
                                  {ans.answerText}{" "}
                                  <strong>
                                    : {getFullName(ans.userId, currentUser)}
                                  </strong>
                                </>
                              ) : (
                                <>
                                  <strong>
                                    {getFullName(ans.userId, currentUser)}:
                                  </strong>{" "}
                                  {ans.answerText}
                                </>
                              )}
                            </p>
                            {!isAnswerSender &&
                              (hoveredMessageId === ans._id ||
                                (replyTo &&
                                  replyTo.message._id === ans._id)) && (
                                <div
                                  className={styles.replyButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      replyTo &&
                                      replyTo.message._id === ans._id
                                    ) {
                                      setReplyTo(null);
                                    } else {
                                      setReplyTo({
                                        type: "answer",
                                        questionId: q._id,
                                        message: ans,
                                      });
                                    }
                                  }}
                                >
                                  {replyTo && replyTo.message._id === ans._id
                                    ? "Hủy"
                                    : "Trả lời"}
                                </div>
                              )}
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
            <div ref={messagesEndRef} />
          </div>

          {/* Khu vực nhập tin nhắn */}
          <div className={styles.inputArea}>
            <InputGroup className={styles.customQuestionInputGroup}>
              <FormControl
                className={styles.customQuestionInput}
                placeholder={
                  replyTo ? "Nhập câu trả lời..." : "Gửi câu hỏi cho admin"
                }
                aria-label="Gửi tin nhắn"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
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
