import TelegramBot from "node-telegram-bot-api";

const BOT_USERNAME = process.env.BOT_USERNAME;
console.log("FINAL BOT USERNAME =", BOT_USERNAME);

const token = process.env.BOT_TOKEN;
const BOT_NAME = process.env.BOT_NAME;
const BOT_USERNAME = process.env.BOT_USERNAME;

const bot = new TelegramBot(token, { polling: true });

let users = {};

// /start + referral
bot.onText(/\/start(?:\s+(\d+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const ref = match[1];

  if (!users[userId]) {
    users[userId] = {
      chip: 1000,
      lastDaily: 0,
      refCount: 0
    };

    // referral bonus
    if (ref && users[ref] && ref !== userId) {
      users[ref].chip += 500;
      users[ref].refCount += 1;
    }
  }

  bot.sendMessage(
    chatId,
`🃏 Selamat datang di *${BOT_NAME}*!

💰 Chip: ${users[userId].chip}

Perintah:
/spin
/daily
/ref
/leaderboard`,
    { parse_mode: "Markdown" }
  );
});

// /spin
bot.onText(/\/spin/, (msg) => {
  const userId = msg.from.id.toString();
  const chatId = msg.chat.id;

  if (!users[userId]) {
    bot.sendMessage(chatId, "Ketik /start dulu");
    return;
  }

  const win = Math.random() > 0.5;

  if (win) {
    const gain = Math.floor(Math.random() * 500) + 200;
    users[userId].chip += gain;
    bot.sendMessage(chatId, `🎉 WIN!\n+${gain} Chip`);
  } else {
    const lose = Math.floor(Math.random() * 300) + 100;
    users[userId].chip = Math.max(0, users[userId].chip - lose);
    bot.sendMessage(chatId, `💀 LOSE!\n-${lose} Chip`);
  }
});

// /daily
bot.onText(/\/daily/, (msg) => {
  const userId = msg.from.id.toString();
  const chatId = msg.chat.id;

  if (!users[userId]) {
    bot.sendMessage(chatId, "Ketik /start dulu");
    return;
  }

  const now = Date.now();

  if (now - users[userId].lastDaily < 86400000) {
    bot.sendMessage(chatId, "⏳ Daily sudah diambil hari ini");
    return;
  }

  users[userId].lastDaily = now;
  users[userId].chip += 2000;

  bot.sendMessage(chatId, "🎁 Daily reward +2000 Chip");
});

// /ref
bot.onText(/\/ref/, (msg) => {
  const userId = msg.from.id.toString();

  if (!users[userId]) {
    bot.sendMessage(msg.chat.id, "Ketik /start dulu");
    return;
  }

  // 🔍 CEK ENV
  console.log("BOT_USERNAME ENV =", process.env.BOT_USERNAME);

  const link = `https://t.me/${process.env.BOT_USERNAME}?start=${userId}`;

  bot.sendMessage(
    msg.chat.id,
`👥 *Referral kamu*
${link}

🎁 Bonus referral: +500 Chip`,
    { parse_mode: "Markdown" }
  );
});

// /leaderboard
bot.onText(/\/leaderboard/, (msg) => {
  const lb = Object.entries(users)
    .sort((a, b) => b[1].chip - a[1].chip)
    .slice(0, 5)
    .map((u, i) => `${i + 1}. ${u[0]} — ${u[1].chip} 💰`)
    .join("\n");

  bot.sendMessage(
    msg.chat.id,
`🏆 *LEADERBOARD*\n\n${lb || "Belum ada data"}`,
    { parse_mode: "Markdown" }
  );
});

console.log("Bot running:", BOT_NAME);
