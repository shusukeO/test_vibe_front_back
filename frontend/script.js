// バックエンドのAPIエンドポイント
const API_BASE_URL =
  window.location.hostname === "onrender.com"
    ? "https://vibe-chat-backend-3699.onrender.com/api"
    : "http://localhost:3000/api"; // ←Renderの実際のURLに変更

// DOM要素の取得
const messagesContainer = document.getElementById("messagesContainer");
const messageForm = document.getElementById("messageForm");
const usernameInput = document.getElementById("usernameInput");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const loadingMessage = document.getElementById("loadingMessage");
const connectionStatus = document.getElementById("connectionStatus");
const statusDot = connectionStatus.querySelector(".status-dot");
const statusText = connectionStatus.querySelector(".status-text");

// アプリケーション初期化
document.addEventListener("DOMContentLoaded", () => {
  checkConnection();
  loadMessages();
  setupEventListeners();
});

// バックエンドとの接続確認
async function checkConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`);
    if (response.ok) {
      updateConnectionStatus(true, "バックエンドと接続済み");
    } else {
      throw new Error("API接続エラー");
    }
  } catch (error) {
    updateConnectionStatus(false, "バックエンドとの接続に失敗");
    console.error("接続エラー:", error);
  }
}

// 接続ステータスの更新
function updateConnectionStatus(isConnected, message) {
  if (isConnected) {
    statusDot.classList.add("connected");
    statusText.textContent = message;
  } else {
    statusDot.classList.remove("connected");
    statusText.textContent = message;
  }
}

// イベントリスナーの設定
function setupEventListeners() {
  // フォーム送信イベント
  messageForm.addEventListener("submit", handleMessageSubmit);

  // エンターキーでメッセージ送信
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessageSubmit(e);
    }
  });

  // ユーザー名をローカルストレージに保存
  usernameInput.addEventListener("input", () => {
    localStorage.setItem("chatUsername", usernameInput.value);
  });

  // 保存されたユーザー名を復元
  const savedUsername = localStorage.getItem("chatUsername");
  if (savedUsername) {
    usernameInput.value = savedUsername;
  }
}

// メッセージ一覧の読み込み
async function loadMessages() {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const messages = await response.json();
    displayMessages(messages);
  } catch (error) {
    console.error("メッセージ読み込みエラー:", error);
    showError(
      "メッセージの読み込みに失敗しました。バックエンドサーバーが起動しているか確認してください。"
    );
  }
}

// メッセージの表示
function displayMessages(messages) {
  // ローディング表示を削除
  loadingMessage.style.display = "none";

  // 既存のメッセージをクリア
  const existingMessages = messagesContainer.querySelectorAll(".message");
  existingMessages.forEach((msg) => msg.remove());

  if (messages.length === 0) {
    showEmptyState();
    return;
  }

  // メッセージを表示
  messages.forEach((message) => {
    const messageElement = createMessageElement(message);
    messagesContainer.appendChild(messageElement);
  });

  // 最新メッセージまでスクロール
  scrollToBottom();
}

// メッセージ要素の作成
function createMessageElement(message) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";

  const timestamp = new Date(message.timestamp).toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  messageDiv.innerHTML = `
        <div class="message-header">
            <span class="username">${escapeHtml(message.username)}</span>
            <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-text">${escapeHtml(message.message)}</div>
    `;

  return messageDiv;
}

// メッセージ送信の処理
async function handleMessageSubmit(e) {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const message = messageInput.value.trim();

  if (!username || !message) {
    alert("ユーザー名とメッセージを入力してください");
    return;
  }

  // 送信ボタンを無効化
  sendButton.disabled = true;
  sendButton.innerHTML = "<span>送信中...</span>";

  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // メッセージ入力をクリア
    messageInput.value = "";

    // メッセージ一覧を再読み込み
    await loadMessages();
  } catch (error) {
    console.error("メッセージ送信エラー:", error);
    alert("メッセージの送信に失敗しました。もう一度お試しください。");
  } finally {
    // 送信ボタンを有効化
    sendButton.disabled = false;
    sendButton.innerHTML = '<span>送信</span><div class="button-shine"></div>';
    messageInput.focus();
  }
}

// 空の状態を表示
function showEmptyState() {
  const emptyDiv = document.createElement("div");
  emptyDiv.className = "loading";
  emptyDiv.innerHTML =
    "📝 まだメッセージがありません。<br>最初のメッセージを送信してみましょう！";
  messagesContainer.appendChild(emptyDiv);
}

// エラー表示
function showError(errorMessage) {
  loadingMessage.style.display = "none";
  const errorDiv = document.createElement("div");
  errorDiv.className = "loading";
  errorDiv.style.color = "#ef4444";
  errorDiv.innerHTML = `❌ ${errorMessage}`;
  messagesContainer.appendChild(errorDiv);
}

// 最下部にスクロール
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// HTMLエスケープ（XSS対策）
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// 定期的にメッセージを更新（簡易リアルタイム機能）
setInterval(() => {
  loadMessages();
}, 5000); // 5秒ごとに更新
