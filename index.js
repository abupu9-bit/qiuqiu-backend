import TelegramBot from "node-telegram-bot-api";

// ===== ENV =====
const TOKEN = process.env.BOT_TOKEN;
const BOT_NAME = process.env.BOT_NAME;
const BOT_USERNAME = process.env.BOT_USERNAME;

console.log("BOT USERNAME =", BOT_USERNAME);

// ===== BOT INIT =====
const bot = new TelegramBot(TOKEN, { polling: true });

// ===== MEMORY DB (SIMPLE) =====
const users = {};

// ===== /start =====
bot.onText(/\/start(?:\s+(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const referrerId = match[1];

  if (!users[userId]) {
    users[userId] = {
      chip: 1000,
      refCount: 0,
    };

    // referral reward
    if (referrerId && referrerId !== userId && users[referrerId]) {
      users[referrerId].chip += 500;
      users[referrerId].refCount += 1;

      bot.sendMessage(
        referrerId,
        `🎉 Kamu dapat +500 chip!\n👥 Total referral: ${users[referrerId].refCount}`
      );
    }
  }

  bot.sendMessage(
    chatId,
    `🎮 *${BOT_NAME}*

Ini adalah game hiburan (bukan judi).
Kumpulkan chip, ajak teman, dan main seru 😄

💰 Chip kamu: ${users[userId].chip}`,
    { parse_mode: "Markdown" }
  );
});

// ===== /ref =====
bot.onText(/\/ref/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();

  if (!users[userId]) {
    bot.sendMessage(chatId, "Ketik /start dulu");
    return;
  }

  const link = `https://t.me/${BOT_USERNAME}?start=${userId}`;

  bot.sendMessage(
    chatId,
    `👥 *Referral kamu*
${link}

🎁 Bonus: +500 chip per referral
👤 Total referral: ${users[userId].refCount}`,
    { parse_mode: "Markdown" }
  );
});

// ===== /chip =====
bot.onText(/\/chip/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();

  if (!users[userId]) {
    bot.sendMessage(chatId, "Ketik /start dulu");
    return;
  }

  bot.sendMessage(
    chatId,
    `💰 Chip kamu sekarang: ${users[userId].chip}`
  );
});

// ===== BOT READY =====
console.log("Bot is running...");
