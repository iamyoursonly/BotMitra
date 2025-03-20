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
  bot.sendMessage(msg.chat.id, "Welcome! Your bot is up and running.");
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
