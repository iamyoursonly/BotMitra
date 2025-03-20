require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const express = require("express");

// Load environment variables before using them
const TOKEN = process.env.TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.SERVER_URL; // Needed for webhook

if (!TOKEN || !MONGO_URI || !SERVER_URL) {
  console.error("❌ Missing environment variables.");
  process.exit(1);
}

// Initialize Telegram Bot
const bot = new TelegramBot(TOKEN, { polling: false }); // Disable polling for webhook

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Initialize Express
const app = express();
app.use(express.json());

// Set up Webhook
bot.setWebHook(`${SERVER_URL}/webhook/${TOKEN}`)
  .then(() => console.log("✅ Webhook set successfully"))
  .catch((err) => console.error("❌ Webhook Error:", err));

// Webhook Route
app.post(`/webhook/${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Handle /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome! In My Telegram Bot.");
});
// ✅ Define Feedback Schema
const feedbackSchema = new mongoose.Schema({
    userId: Number,
    username: String,
    feedback: String,
    date: { type: Date, default: Date.now }
});
const Feedback = mongoose.model("Feedback", feedbackSchema);

// ✅ Inline Buttons
const options = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "📁 View Portfolio", url: "https://basic-portfolio-xi.vercel.app/" }],
            [{ text: "📄 Download Resume", url: "https://basic-portfolio-xi.vercel.app/my-cv.pdf" }],
            [
                { text: "📧 Contact", callback_data: "contact" },
                { text: "🔗 Socials", callback_data: "socials" }
            ],
            [{ text: "❓ Ask a Question", callback_data: "ask_question" }],
            [{ text: "📝 Give Feedback", callback_data: "give_feedback" }]
        ]
    }
};

// 🎨 Welcome Message with Image
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name;

    bot.sendMessage(chatId, `👋 Hello ${name}! Welcome to My BotMitra! 🚀\nClick below to explore:`, options);
});

// 📞 Handling Inline Buttons Clicks
bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;

    if (query.data === "contact") {
        bot.sendMessage(chatId, "📧 Email: mishraamit@gmail.com\n📞 Phone: +91 7348433729");
    } else if (query.data === "socials") {
        bot.sendMessage(chatId, "🔗 LinkedIn: [My LinkedIn](https://www.linkedin.com/in/mishraamitjnp/)\n📸 Instagram: [My Instagram](https://instagram.com/mishraamitjnp)", { parse_mode: "Markdown" });
    } else if (query.data === "ask_question") {
        bot.sendMessage(chatId, "🤖 Please type your question below:");
    } else if (query.data === "give_feedback") {
        bot.sendMessage(chatId, "📝 Please type your feedback below:");
    }
    bot.answerCallbackQuery(query.id);
});

// 📝 Collecting Feedback
bot.on("message", async (msg) => {
    if (!msg.text.startsWith("/")) {
        const feedback = new Feedback({
            userId: msg.from.id,
            username: msg.from.username || "Anonymous",
            feedback: msg.text
        });

        try {
            await feedback.save();
            bot.sendMessage(msg.chat.id, "🙏 Thanks for your feedback! We appreciate it. 🚀");
        } catch (error) {
            console.error("❌ Feedback Save Error:", error);
            bot.sendMessage(msg.chat.id, "⚠️ Oops! Something went wrong.");
        }
    }
});


// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
