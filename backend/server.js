const express = require('express');
const cors = require('cors');
const Datastore = require('nedb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// データベース設定（メッセージ保存用）
const db = new Datastore({ filename: path.join(__dirname, 'messages.db'), autoload: true });

// ミドルウェア設定
app.use(cors());
app.use(express.json());

// メッセージ一覧を取得するAPI
app.get('/api/messages', (req, res) => {
  db.find({}).sort({ timestamp: 1 }).exec((err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'メッセージの取得に失敗しました' });
    }
    res.json(messages);
  });
});

// 新しいメッセージを投稿するAPI
app.post('/api/messages', (req, res) => {
  const { username, message } = req.body;
  
  if (!username || !message) {
    return res.status(400).json({ error: 'ユーザー名とメッセージは必須です' });
  }
  
  const newMessage = {
    username,
    message,
    timestamp: new Date()
  };
  
  db.insert(newMessage, (err, doc) => {
    if (err) {
      return res.status(500).json({ error: 'メッセージの保存に失敗しました' });
    }
    res.status(201).json(doc);
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 バックエンドサーバーがポート${PORT}で起動しました`);
  console.log(`📡 API エンドポイント:`);
  console.log(`   GET  http://localhost:${PORT}/api/messages - メッセージ一覧取得`);
  console.log(`   POST http://localhost:${PORT}/api/messages - メッセージ投稿`);
});