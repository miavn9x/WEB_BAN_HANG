// controllers/chatController.js
const Chat = require("../models/Chat");
const Product = require("../models/productModel");
const User = require("../models/User");

/**
 * Lấy cuộc trò chuyện dựa theo productId (dành cho người dùng)
 * Lưu ý: Với thiết kế mới, cuộc trò chuyện được xác định bởi productId,
 * do đó không cần truyền userId trong query.
 */
exports.getChat = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ message: "productId là bắt buộc" });
    }

    const chat = await Chat.findOne({ productId }).populate(
      "messages.sender",
      "firstName lastName role"
    );

    if (!chat) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cuộc trò chuyện cho sản phẩm này" });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Tạo cuộc trò chuyện mới hoặc thêm tin nhắn vào cuộc trò chuyện đã có.
 * - Nếu cuộc trò chuyện theo productId tồn tại: kiểm tra xem sender có trong participants chưa,
 *   nếu chưa thì thêm vào, sau đó push tin nhắn mới vào mảng messages.
 * - Nếu không, tạo một cuộc trò chuyện mới với sender là người tham gia đầu tiên.
 */
exports.addMessage = async (req, res) => {
  try {
    const { productId, message, sender } = req.body;
    if (!productId || !message || !sender) {
      return res.status(400).json({
        message: "productId, sender và message là bắt buộc",
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Kiểm tra người dùng có tồn tại không
    const user = await User.findById(sender);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const newMessage = { sender, message };

    // Tìm cuộc trò chuyện theo productId (không dựa vào userId nữa)
    let chat = await Chat.findOne({ productId });

    if (chat) {
      // Nếu sender chưa có trong participants, thêm sender vào danh sách
      if (!chat.participants.includes(sender)) {
        chat.participants.push(sender);
      }
      chat.messages.push(newMessage);
    } else {
      // Tạo cuộc trò chuyện mới với sender là người tham gia đầu tiên
      chat = new Chat({
        productId,
        participants: [sender],
        messages: [newMessage],
      });
    }
    const savedChat = await chat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Lấy tất cả các cuộc trò chuyện cho 1 sản phẩm (dành cho admin)
 * Trong phiên bản này, các cuộc trò chuyện được xác định bởi productId,
 * nên có thể có nhiều cuộc trò chuyện nếu cần (tùy vào thiết kế).
 * Nếu chỉ có 1 cuộc trò chuyện duy nhất cho mỗi sản phẩm, có thể sử dụng getChat.
 */
exports.getChatsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: "productId là bắt buộc" });
    }
    const chats = await Chat.find({ productId })
      .populate("participants", "firstName lastName email")
      .populate("messages.sender", "firstName lastName role");
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
