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

// Component hiển thị nội dung tin nhắn ẩn/hiện
const CollapsibleText = ({ text, maxLength = 100 }) => {
  const [expanded, setExpanded] = useState(false);
  // Ép về chuỗi an toàn
  const safeText = text ? text.toString() : "";
  if (!safeText) return null;

  // Kiểm tra xem nội dung có vượt quá maxLength không
  const shouldTruncate = safeText.length > maxLength;
  // Nếu nội dung dài và chưa mở rộng thì cắt bớt
  const displayText =
    expanded || !shouldTruncate
      ? safeText
      : safeText.substring(0, maxLength) + "...";

  return (
    <span>
      {displayText}{" "}
      {shouldTruncate && (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setExpanded(!expanded);
          }}
          style={{
            color: "blue",
            textDecoration: "underline",
            marginLeft: "4px",
          }}
        >
          {expanded ? "Ẩn bớt" : "Xem thêm"}
        </a>
      )}
    </span>
  );
};

// Các hàm hỗ trợ
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
};

const getReplySnippet = (message) => {
  if (!message) return "";
  const text = message.questionText || message.answerText || "";
  return text.length > 50 ? text.substring(0, 50) + "..." : text;
};

const Evaluate = ({ productId }) => {
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  // Chỉ hiển thị tối đa 5 cuộc trò chuyện
  const MAX_THREADS = 5;

  const currentUser = getCurrentUser();
  const containerRef = useRef(null);
  const longPressTimer = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);

  // Hàm cuộn xuống cuối danh sách tin nhắn (nếu cần)
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

  const clearLongPress = () => {
    clearTimeout(longPressTimer.current);
  };

  const initiateLongPress = (callback, e) => {
    e.preventDefault();
    longPressTimer.current = setTimeout(callback, 2000);
  };

  // Lấy danh sách câu hỏi theo productId
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await axios.get(`/api/products/${productId}/questions`);
      setQuestions(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách câu hỏi:", err);
    }
  }, [productId]);

  useEffect(() => {
    fetchQuestions();
    const intervalId = setInterval(() => {
      fetchQuestions();
    }, 2000);
    return () => clearInterval(intervalId);
  }, [fetchQuestions]);

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

  // Xử lý gửi câu hỏi hoặc trả lời, kèm theo productId
  const handleSubmit = async () => {
    const content = newQuestionText.trim();
    if (!content) return;
    setNewQuestionText("");

    // Nếu là trả lời
    if (replyTo) {
      const tempAnswer = {
        _id: `temp-${Date.now()}`,
        userId: {
          _id: currentUser.userId,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
        },
        answerText: content,
        createdAt: new Date().toISOString(),
        pending: true,
        replyTo: replyTo.message,
        productId, // Đính kèm ID sản phẩm
      };

      // Cập nhật tạm thời vào danh sách câu hỏi
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q._id === replyTo.questionId
            ? { ...q, answers: [...(q.answers || []), tempAnswer] }
            : q
        )
      );
      try {
        const res = await axios.post(
          // Nếu backend có thể xử lý, bạn có thể đổi endpoint thành dạng: /api/products/${productId}/questions/${replyTo.questionId}/answers
          `/api/questions/${replyTo.questionId}/answers`,
          {
            productId, // Đính kèm ID sản phẩm
            userId: currentUser.userId,
            answerText: content,
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
      } catch (err) {
        console.error("handleSubmit (reply) error:", err);
      }
    } else {
      // Gửi câu hỏi mới, đính kèm luôn productId
      const tempQuestion = {
        _id: `temp-${Date.now()}`,
        userId: currentUser.userId,
        questionText: content,
        createdAt: new Date().toISOString(),
        answers: [],
        pending: true,
        productId, // Đính kèm ID sản phẩm
      };
      setQuestions((prev) => [...prev, tempQuestion]);
      try {
        const res = await axios.post(`/api/products/${productId}/questions`, {
          productId, // Đính kèm ID sản phẩm
          userId: currentUser.userId,
          questionText: content,
        });
        setQuestions((prev) =>
          prev.map((q) => (q._id === tempQuestion._id ? res.data : q))
        );
      } catch (err) {
        console.error("handleSubmit (question) error:", err);
        setNewQuestionText(content);
      }
    }
  };

  // --- XỬ LÝ CUỘC TRÒ CHUYỆN ---
  // Mỗi thread là một câu hỏi kèm theo các câu trả lời, tính toán trường lastUpdated
  const conversationThreads = questions.map((q) => {
    const questionTime = new Date(q.createdAt).getTime();
    const answerTimes = (q.answers || []).map((ans) =>
      new Date(ans.createdAt).getTime()
    );
    const lastUpdated =
      answerTimes.length > 0
        ? Math.max(questionTime, ...answerTimes)
        : questionTime;
    return { ...q, lastUpdated };
  });
  // Sắp xếp theo lastUpdated giảm dần (thread mới nhất đứng đầu)
  const sortedThreads = conversationThreads.sort(
    (a, b) => b.lastUpdated - a.lastUpdated
  );
  // Chỉ lấy tối đa MAX_THREADS thread mới nhất
  const visibleThreads = sortedThreads.slice(0, MAX_THREADS);

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
          <span>Hỏi Đáp</span>
        </Card.Header>
        <Card.Body>
          <div className={styles.messagesArea} ref={messagesAreaRef}>
            {visibleThreads.map((q) => {
              const questionUserId = getUserId(q.userId);
              const isSender = questionUserId === currentUser.userId;
              return (
                <div
                  key={q._id}
                  className={styles.chatMessage}
                  onMouseEnter={() => setHoveredMessageId(q._id)}
                  onMouseLeave={() => {
                    setHoveredMessageId(null);
                    clearLongPress();
                  }}
                  onMouseDown={(e) => {
                    if (!isSender) {
                      initiateLongPress(() => {
                        setReplyTo({
                          type: "question",
                          questionId: q._id,
                          message: q,
                        });
                      }, e);
                    }
                  }}
                  onMouseUp={clearLongPress}
                  onTouchStart={(e) => {
                    if (!isSender) {
                      initiateLongPress(() => {
                        setReplyTo({
                          type: "question",
                          questionId: q._id,
                          message: q,
                        });
                      }, e);
                    }
                  }}
                  onTouchEnd={clearLongPress}
                  onContextMenu={(e) => e.preventDefault()}
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
                          <CollapsibleText
                            text={q.questionText}
                            maxLength={100}
                          />{" "}
                          <strong>
                            : {getFullName(q.userId, currentUser)}
                          </strong>
                        </>
                      ) : (
                        <>
                          <strong>{getFullName(q.userId, currentUser)}:</strong>{" "}
                          <CollapsibleText
                            text={q.questionText}
                            maxLength={100}
                          />
                        </>
                      )}
                    </p>
                    {!isSender && (
                      <div
                        className={styles.replyButton}
                        style={{
                          opacity:
                            hoveredMessageId === q._id ||
                            (replyTo && replyTo.message._id === q._id)
                              ? 1
                              : 0,
                          transition: "opacity 0.3s ease",
                          pointerEvents:
                            hoveredMessageId === q._id ||
                            (replyTo && replyTo.message._id === q._id)
                              ? "auto"
                              : "none",
                        }}
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
                            clearLongPress();
                          }}
                          onMouseDown={(e) => {
                            if (!isAnswerSender) {
                              initiateLongPress(() => {
                                setReplyTo({
                                  type: "answer",
                                  questionId: q._id,
                                  message: ans,
                                });
                              }, e);
                            }
                          }}
                          onMouseUp={clearLongPress}
                          onTouchStart={(e) => {
                            if (!isAnswerSender) {
                              initiateLongPress(() => {
                                setReplyTo({
                                  type: "answer",
                                  questionId: q._id,
                                  message: ans,
                                });
                              }, e);
                            }
                          }}
                          onTouchEnd={clearLongPress}
                          onContextMenu={(e) => e.preventDefault()}
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
                                  <CollapsibleText
                                    text={ans.answerText}
                                    maxLength={100}
                                  />{" "}
                                  <strong>
                                    : {getFullName(ans.userId, currentUser)}
                                  </strong>
                                </>
                              ) : (
                                <>
                                  <strong>
                                    {getFullName(ans.userId, currentUser)}:
                                  </strong>{" "}
                                  <CollapsibleText
                                    text={ans.answerText}
                                    maxLength={100}
                                  />
                                </>
                              )}
                            </p>
                            {!isAnswerSender && (
                              <div
                                className={styles.replyButton}
                                style={{
                                  opacity:
                                    hoveredMessageId === ans._id ||
                                    (replyTo && replyTo.message._id === ans._id)
                                      ? 1
                                      : 0,
                                  transition: "opacity 0.3s ease",
                                  pointerEvents:
                                    hoveredMessageId === ans._id ||
                                    (replyTo && replyTo.message._id === ans._id)
                                      ? "auto"
                                      : "none",
                                }}
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
