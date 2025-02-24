const Filter = require("bad-words");
const Sentiment = require("sentiment");

const filter = new Filter();

// Danh sách từ khóa tiêu cực mở rộng, bao gồm các từ chửi bậy, tục tĩu và từ miêu tả chất lượng sản phẩm kém
const negativeKeywords = [
  // Các từ có dấu (nguyên bản)
  "địt",
  "lồn",
  "cặc",
  "buồi",
  "đụ",
  "đéo",
  "mẹ kiếp",
  "khốn nạn",
  "đồ khốn",
  "con đĩ",
  "đụ má",
  "mẹ nó",
  "điếm",
  "đĩ",
  "tịt",
  "mẹ mày",
  "bồ điếm",
  "cút",
  "đồ ngu",
  "đần",
  "đần vãi",
  "vãi",
  "thối nát",
  "tệ",
  "rác",
  "dở",
  "kinh khủng",
  "khủng khiếp",
  "chán",
  "tồi tệ",
  "dở hơi",
  "vớ vẩn",
  "chán ngấy",
  "chán thật",
  "thối",
  "vô dụng",
  "đáng chê",
  "thảm hại",
  "tệ hại",
  "bất mãn",
  "thất vọng",
  "đồ điên",
  "đồ khùng",
  "lỗ cái",
  "đéo được",
  "đéo chịu",
  // Các từ mô tả tiêu cực về sản phẩm (có dấu)
  "xấu",
  "hỏng",
  "kém",
  "bẩn",
  "lỗi",
  "không tốt",
  "không ổn",
  "dở tệ",
  "không đáng mua",
  "đắt xài",
  "kém chất lượng",
  "đáng tiếc",
  "sập",
  "hư",
  "sai lệch",
  "đáng xấu hổ",
  "đáng ghét",
  "kinh tởm",
  "vô giá trị",
  "thất bại",
  // Các từ không dấu và viết tắt (dạng viết thường)
  "dit",
  "lon",
  "cac",
  "buoi",
  "du",
  "deo",
  "me kiep",
  "khon nan",
  "do khon",
  "con di",
  "du ma",
  "me no",
  "diem",
  "di",
  "tit",
  "me may",
  "bo diem",
  "cut",
  "do ngu",
  "dan",
  "dan vai",
  "vai",
  "thoi nat",
  "te",
  "rac",
  "do",
  "kinh khung",
  "khung khihep",
  "chan",
  "toi te",
  "do hoy",
  "vo van",
  "chan ngay",
  "chan that",
  "thoi",
  "vo dung",
  "dang che",
  "tham hai",
  "te hai",
  "bat man",
  "that vong",
  "do dien",
  "do khung",
  "lo cai",
  "deo duoc",
  "deo chiu",
  // Các từ không dấu mở rộng cho sản phẩm tiêu cực
  "xau",
  "hong",
  "kem",
  "ban",
  "loi",
  "khong tot",
  "khong on",
  "do te",
  "khong dang mua",
  "dat xai",
  "kem chat luong",
  "dang tiec",
  "that vong",
  "sap",
  "hu",
  "sai lech",
  "dang xau ho",
  "dang ghet",
  "kinh toam",
  "vo gia tri",
  "te hai",
  "that bai",
];

filter.addWords(...negativeKeywords);

const sentiment = new Sentiment();

exports.analyzeReview = (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: "Text đánh giá là bắt buộc." });
  }

  // Chuẩn hóa văn bản về chữ thường
  const normalizedText = text.toLowerCase();

  // Sử dụng bad‑words để kiểm tra
  const containsProfanity = filter.isProfane(normalizedText);
  const containsNegativeKeyword = negativeKeywords.some((keyword) =>
    normalizedText.includes(keyword)
  );

  const sentimentResult = sentiment.analyze(normalizedText);
  const isNegativeSentiment = sentimentResult.score < 0;

  // Ghi log để debug (có thể tạm thời xóa khi triển khai production)

//   console.log("Text:", normalizedText);
//   console.log("containsProfanity:", containsProfanity);
//   console.log("containsNegativeKeyword:", containsNegativeKeyword);
//   console.log("sentiment score:", sentimentResult.score);

  // Đánh dấu tiêu cực nếu có từ khóa tiêu cực hoặc cảm xúc âm
  const isNegative = containsNegativeKeyword || isNegativeSentiment;

  res.json({ isNegative });
};
