// controllers/chatController.js
const Chat = require("../models/Chat");
const Product = require("../models/productModel");
const User = require("../models/User");

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

exports.addMessage = async (req, res) => {
  try {
    const { productId, message, sender, replyTo } = req.body;
    if (!productId || !message || !sender) {
      return res.status(400).json({
        message: "productId, sender và message là bắt buộc",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const user = await User.findById(sender);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Tạo tin nhắn mới, nếu có replyTo thì thêm thông tin của tin nhắn gốc
    const newMessage = { sender, message };
    if (replyTo) {
      newMessage.replyTo = replyTo;
    }

    let chat = await Chat.findOne({ productId });

    if (chat) {
      if (!chat.participants.includes(sender)) {
        chat.participants.push(sender);
      }
      chat.messages.push(newMessage);
    } else {
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
