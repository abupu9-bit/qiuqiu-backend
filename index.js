import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

let users = {};

app.get("/", (req, res) => {
  res.send("Backend QiuQiu BOT aktif ✅");
});

app.post("/api/register", (req, res) => {
  const { userId, ref } = req.body;

  if (!users[userId]) {
    users[userId] = {
      coins: 100,
      referrals: 0
    };

    if (ref && users[ref]) {
      users[ref].coins += 50;
      users[ref].referrals += 1;
    }
  }

  res.json({ success: true, user: users[userId] });
});

app.post("/api/spin", (req, res) => {
  const { userId } = req.body;

  if (!users[userId]) {
    return res.status(400).json({ error: "User belum terdaftar" });
  }

  const reward = Math.floor(Math.random() * 50) + 10;
  users[userId].coins += reward;

  res.json({
    reward,
    coins: users[userId].coins
  });
});

app.get("/api/leaderboard", (req, res) => {
  const leaderboard = Object.entries(users)
    .map(([id, data]) => ({
      userId: id,
      coins: data.coins,
      referrals: data.referrals
    }))
    .sort((a, b) => b.coins - a.coins)
    .slice(0, 10);

  res.json(leaderboard);
});

app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});
