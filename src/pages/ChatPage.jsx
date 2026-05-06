import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .chat-root {
    display: flex;
    height: 100vh;
    background: #07070f;
    font-family: 'DM Sans', sans-serif;
    color: #e8e8f5;
    overflow: hidden;
  }

  .sidebar {
    width: 260px;
    flex-shrink: 0;
    background: #0c0c18;
    border-right: 1px solid rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-brand {
    padding: 20px 18px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .brand-icon {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    box-shadow: 0 4px 14px rgba(99,102,241,0.35);
    flex-shrink: 0;
  }
  .brand-text {
    font-family: 'Syne', sans-serif;
    font-size: 17px; font-weight: 800;
    color: #f0f0ff; letter-spacing: -0.3px;
  }
  .brand-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 6px rgba(34,197,94,0.6);
    margin-left: auto; flex-shrink: 0;
  }

  .sidebar-me {
    margin: 14px 12px 0;
    padding: 12px;
    background: rgba(99,102,241,0.07);
    border: 1px solid rgba(99,102,241,0.12);
    border-radius: 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .me-ava {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
    overflow: hidden;
  }
  .me-ava img { width: 100%; height: 100%; object-fit: cover; }
  .me-name { font-size: 13px; font-weight: 600; color: #d0d0f0; }
  .me-tag  { font-size: 10px; color: #6366f1; opacity: 0.85; }
  .me-dot  {
    width: 8px; height: 8px; border-radius: 50%;
    background: #22c55e; margin-left: auto; flex-shrink: 0;
    box-shadow: 0 0 5px rgba(34,197,94,0.5);
  }

  .new-dm-btn {
    margin: 10px 12px 0;
    width: calc(100% - 24px);
    padding: 8px;
    background: rgba(99,102,241,0.1);
    border: 1px dashed rgba(99,102,241,0.25);
    border-radius: 10px;
    color: #818cf8;
    font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .new-dm-btn:hover {
    background: rgba(99,102,241,0.18);
    border-color: rgba(99,102,241,0.4);
    color: #a5b4fc;
  }

  .section-label {
    font-size: 10px; font-weight: 600; letter-spacing: 1.2px;
    color: rgba(255,255,255,0.2); text-transform: uppercase;
    padding: 14px 18px 6px;
  }

  .dm-list { flex: 1; overflow-y: auto; padding-bottom: 8px; }
  .dm-list::-webkit-scrollbar { width: 0; }

  .dm-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; margin: 0 6px;
    border-radius: 10px; cursor: pointer;
    transition: background 0.15s; position: relative;
  }
  .dm-item:hover { background: rgba(255,255,255,0.04); }
  .dm-item.active { background: rgba(99,102,241,0.1); }
  .dm-item.active::before {
    content: '';
    position: absolute; left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 60%;
    background: linear-gradient(180deg, #6366f1, #8b5cf6);
    border-radius: 0 3px 3px 0;
  }

  .dm-ava {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #9090b8;
    flex-shrink: 0; position: relative; overflow: hidden;
  }
  .dm-ava img { width: 100%; height: 100%; object-fit: cover; }
  .dm-ava.online::after {
    content: '';
    position: absolute; bottom: -2px; right: -2px;
    width: 10px; height: 10px; border-radius: 50%;
    background: #22c55e; border: 2px solid #0c0c18;
  }

  .dm-info { flex: 1; min-width: 0; }
  .dm-name {
    font-size: 13px; font-weight: 500; color: #9090b8;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color 0.15s;
  }
  .dm-item.active .dm-name, .dm-item:hover .dm-name { color: #d0d0f0; }
  .dm-preview {
    font-size: 11px; color: rgba(255,255,255,0.2);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-top: 2px;
  }

  .dm-unread {
    min-width: 18px; height: 18px; border-radius: 9px;
    background: #6366f1; color: #fff;
    font-size: 10px; font-weight: 700; padding: 0 4px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .sidebar-bottom {
    padding: 12px;
    border-top: 1px solid rgba(255,255,255,0.04);
  }
  .signout-btn {
    width: 100%; padding: 9px;
    background: transparent;
    border: 1px solid rgba(239,68,68,0.15);
    border-radius: 10px;
    color: rgba(239,68,68,0.7);
    font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .signout-btn:hover {
    background: rgba(239,68,68,0.08);
    border-color: rgba(239,68,68,0.3);
    color: #f87171;
  }

  .chat-main {
    flex: 1; display: flex; flex-direction: column;
    overflow: hidden; background: #09091a;
  }

  .chat-header {
    padding: 0 24px; height: 58px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(9,9,26,0.98); flex-shrink: 0;
  }
  .header-left { display: flex; align-items: center; gap: 12px; }
  .header-contact-ava {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: #9090b8;
    position: relative; flex-shrink: 0; overflow: hidden;
  }
  .header-contact-ava img { width: 100%; height: 100%; object-fit: cover; }
  .header-contact-ava.online::after {
    content: '';
    position: absolute; bottom: -2px; right: -2px;
    width: 10px; height: 10px; border-radius: 50%;
    background: #22c55e; border: 2px solid #09091a;
  }
  .header-contact-name {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; color: #e0e0fa;
  }
  .header-contact-status  { font-size: 11.5px; color: #22c55e; margin-top: 1px; }
  .header-contact-offline { font-size: 11.5px; color: rgba(255,255,255,0.25); margin-top: 1px; }

  .header-right { display: flex; align-items: center; gap: 8px; }
  .header-badge {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px; padding: 4px 10px;
  }
  .console-toggle-btn {
    padding: 6px 12px; background: transparent;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px; color: rgba(255,255,255,0.3);
    font-size: 12px; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.15s;
  }
  .console-toggle-btn:hover { border-color: rgba(99,102,241,0.3); color: #818cf8; }
  .console-toggle-btn.on {
    border-color: rgba(99,102,241,0.35); color: #818cf8;
    background: rgba(99,102,241,0.06);
  }

  .empty-state {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 10px;
  }
  .empty-state-icon { font-size: 48px; opacity: 0.2; }
  .empty-state-text { font-size: 14px; color: rgba(255,255,255,0.2); text-align: center; line-height: 1.6; }

  .messages-area {
    flex: 1; overflow-y: auto;
    padding: 24px 24px 12px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .messages-area::-webkit-scrollbar { width: 4px; }
  .messages-area::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.07); border-radius: 4px;
  }

  .date-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 16px 0 12px;
  }
  .date-divider::before, .date-divider::after {
    content: ''; flex: 1; height: 1px;
    background: rgba(255,255,255,0.06);
  }
  .date-divider span { font-size: 11px; color: rgba(255,255,255,0.2); font-weight: 500; }

  .msg-group {
    display: flex; gap: 12px; padding: 3px 0;
    animation: msgIn 0.22s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .msg-group.own { flex-direction: row-reverse; }

  .msg-ava {
    width: 34px; height: 34px; border-radius: 10px;
    background: rgba(255,255,255,0.07);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #9090b8;
    flex-shrink: 0; align-self: flex-end; overflow: hidden;
  }
  .msg-ava img { width: 100%; height: 100%; object-fit: cover; }
  .msg-group.own .msg-ava {
    background: linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5));
    color: #fff;
  }

  .msg-body { max-width: 60%; display: flex; flex-direction: column; gap: 3px; }
  .msg-group.own .msg-body { align-items: flex-end; }

  .msg-meta {
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 3px; padding: 0 4px;
  }
  .msg-group.own .msg-meta { flex-direction: row-reverse; }
  .msg-sender { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.45); }
  .msg-time   { font-size: 10.5px; color: rgba(255,255,255,0.2); }

  .msg-bubble {
    padding: 11px 15px; border-radius: 16px;
    line-height: 1.55; font-size: 14px; word-break: break-word;
  }
  .msg-bubble.other {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
    color: #d8d8f0; border-bottom-left-radius: 5px;
  }
  .msg-bubble.own {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff; border-bottom-right-radius: 5px;
    box-shadow: 0 4px 20px rgba(99,102,241,0.3);
  }
  .msg-bubble.failed {
    background: rgba(239,68,68,0.15) !important;
    border: 1px solid rgba(239,68,68,0.3) !important;
    box-shadow: none !important;
  }

  .msg-status {
    font-size: 10px; color: rgba(255,255,255,0.25);
    padding: 0 4px; display: flex; align-items: center; gap: 4px;
  }
  .msg-status.failed { color: #f87171; cursor: pointer; }
  .msg-status.failed:hover { color: #fca5a5; }

  .msg-empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px; padding-bottom: 60px;
  }
  .msg-empty-icon { font-size: 40px; opacity: 0.3; }
  .msg-empty-text { font-size: 14px; color: rgba(255,255,255,0.2); text-align: center; line-height: 1.6; }

  .input-area {
    padding: 12px 20px 16px;
    background: rgba(9,9,26,0.98);
    border-top: 1px solid rgba(255,255,255,0.04);
    flex-shrink: 0;
  }
  .input-box {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 6px 6px 6px 16px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input-box:focus-within {
    border-color: rgba(99,102,241,0.4);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
  }
  .msg-input {
    flex: 1; background: transparent; border: none; outline: none;
    color: #e0e0f5; font-size: 14px; font-family: 'DM Sans', sans-serif;
    resize: none; line-height: 1.5; padding: 6px 0; max-height: 120px;
  }
  .msg-input::placeholder { color: rgba(255,255,255,0.2); }
  .send-btn {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; color: #fff; font-size: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(99,102,241,0.3);
  }
  .send-btn:hover { transform: scale(1.06); box-shadow: 0 6px 20px rgba(99,102,241,0.45); }
  .send-btn:active { transform: scale(0.96); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .input-hint { font-size: 11px; color: rgba(255,255,255,0.15); text-align: center; margin-top: 7px; }

  .console-panel {
    height: 170px; background: #050508;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex; flex-direction: column; flex-shrink: 0;
  }
  .console-header {
    padding: 7px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    display: flex; align-items: center; gap: 6px;
    background: #070710;
  }
  .c-dot { width: 10px; height: 10px; border-radius: 50%; }
  .c-red    { background: #ff5f57; }
  .c-yellow { background: #febc2e; }
  .c-green  { background: #28c840; }
  .console-label { font-size: 11px; color: rgba(255,255,255,0.2); margin-left: 4px; letter-spacing: 0.5px; }
  .console-logs {
    flex: 1; overflow-y: auto; padding: 8px 14px;
    display: flex; flex-direction: column; gap: 2px;
  }
  .console-logs::-webkit-scrollbar { width: 0; }
  .log-line {
    font-family: 'Courier New', monospace; font-size: 11px;
    display: flex; gap: 10px; line-height: 1.6;
  }
  .log-ts    { color: rgba(255,255,255,0.15); flex-shrink: 0; }
  .log-info  { color: #60a5fa; }
  .log-error { color: #f87171; }
  .log-warn  { color: #fbbf24; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; backdrop-filter: blur(4px);
  }
  .modal-box {
    background: #0f0f1e;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 28px 24px;
    width: 320px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    animation: slideUp 0.25s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 700; color: #e0e0fa;
    margin-bottom: 16px;
  }
  .modal-input {
    width: 100%; padding: 11px 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #e0e0f5;
    font-size: 14px; font-family: 'DM Sans', sans-serif;
    outline: none; box-sizing: border-box;
    transition: border-color 0.2s;
  }
  .modal-input:focus { border-color: rgba(99,102,241,0.5); }
  .modal-input::placeholder { color: rgba(255,255,255,0.2); }
  .modal-error { font-size: 12px; color: #f87171; margin-top: 8px; }
  .modal-actions {
    display: flex; gap: 8px; margin-top: 16px;
  }
  .modal-cancel {
    flex: 1; padding: 10px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; color: rgba(255,255,255,0.4);
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
  }
  .modal-cancel:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); }
  .modal-confirm {
    flex: 1; padding: 10px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; border-radius: 10px; color: #fff;
    font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
  }
  .modal-confirm:hover { opacity: 0.9; }
  .modal-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// ── Avatar component — handles both URL and initials ─────
function Avatar({ url, initials, className = "" }) {
  const [imgError, setImgError] = useState(false);
  if (url && !imgError) {
    return (
      <div className={className}>
        <img src={url} alt={initials} onError={() => setImgError(true)} />
      </div>
    );
  }
  return <div className={className}>{initials}</div>;
}

// ── Message Bubble ───────────────────────────────────────
function MessageBubble({ message, isOwn, onRetry }) {
  const time = new Date(message.timestamp).toLocaleTimeString("en", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  const isFailed   = message.status === "failed";
  const isSending  = message.status === "sending";

  return (
    <div className={`msg-group ${isOwn ? "own" : ""}`}>
      <Avatar
        url={message.senderAvatarUrl}
        initials={message.senderAvatar}
        className="msg-ava"
      />
      <div className="msg-body">
        <div className="msg-meta">
          <span className="msg-sender">{isOwn ? "You" : message.senderName}</span>
          <span className="msg-time">{time}</span>
        </div>
        <div className={`msg-bubble ${isOwn ? "own" : "other"} ${isFailed ? "failed" : ""}`}>
          {message.content}
        </div>
        {isOwn && (
          <div className={`msg-status ${isFailed ? "failed" : ""}`}>
            {isSending && "⏳ Sending..."}
            {isFailed  && <span onClick={() => onRetry(message.id, message.content)}>⚠ Failed — Retry karein</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Console Panel ────────────────────────────────────────
function ConsolePanel({ logs }) {
  const endRef = useRef(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [logs]);
  return (
    <div className="console-panel">
      <div className="console-header">
        <div className="c-dot c-red" />
        <div className="c-dot c-yellow" />
        <div className="c-dot c-green" />
        <span className="console-label">CONSOLE</span>
      </div>
      <div className="console-logs">
        {logs.map((log, i) => (
          <div key={i} className={`log-line log-${log.type}`}>
            <span className="log-ts">{log.time}</span>
            <span>{log.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

// ── New DM Modal ─────────────────────────────────────────
function NewDMModal({ onClose, onStart }) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleStart = async () => {
    const parsed = parseInt(userId.trim());
    if (!userId.trim() || isNaN(parsed)) {
      setError("Valid User ID daalo (number hona chahiye)");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onStart(parsed);
      onClose();
    } catch (err) {
      setError(err.message || "User nahi mila ya koi error aaya");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">✉️ New Direct Message</div>
        <input
          className="modal-input"
          placeholder="User ID daalo (e.g. 3)"
          value={userId}
          onChange={(e) => { setUserId(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          autoFocus
        />
        {error && <div className="modal-error">⚠ {error}</div>}
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-confirm" onClick={handleStart} disabled={loading}>
            {loading ? "Shuru ho raha..." : "Start Chat"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ChatPage ─────────────────────────────────────────
export default function ChatPage() {
  const { user, signOut } = useAuth();
  const {
    contacts,
    activeDMId,
    dmMessages,
    messagesLoading,
    conversationsLoading,
    getLastMessage,
    getUnreadCount,
    sendMessage,
    retryMessage,
    switchDM,
    startDM,
  } = useChat();

  const [input, setInput]             = useState("");
  const [sending, setSending]         = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [showConsole, setShowConsole] = useState(false);
  const [showNewDM, setShowNewDM]     = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  // Console interceptor — mount once only
  useEffect(() => {
    const orig = { log: console.log, error: console.error, warn: console.warn };
    const addLog = (text, type = "info") => {
      const time = new Date().toLocaleTimeString("en", { hour12: false });
      setConsoleLogs((p) => [...p.slice(-199), { text, type, time }]);
    };
    console.log   = (...a) => { orig.log(...a);   addLog(a.map(String).join(" "), "info");  };
    console.error = (...a) => { orig.error(...a); addLog(a.map(String).join(" "), "error"); };
    console.warn  = (...a) => { orig.warn(...a);  addLog(a.map(String).join(" "), "warn");  };
    orig.log(`[INIT] NexChat ready — user: ${user?.username} | id: ${user?.id}`);
    return () => {
      console.log   = orig.log;
      console.error = orig.error;
      console.warn  = orig.warn;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dmMessages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await sendMessage(text);
    } catch {
      // error already shown on bubble
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const activeContact = contacts.find((c) => c.id === activeDMId);

  const getPreview = (contact) => {
    const last = getLastMessage(contact.id);
    if (!last) return "Koi message nahi abhi";
    const text = last.body || last.content || "";
    return text.length > 30 ? text.slice(0, 30) + "…" : text;
  };

  // Derive my own initials/avatar from user object
  const myInitials  = user?.username?.slice(0, 2).toUpperCase() || "ME";
  const myAvatarUrl = user?.avatarUrl || null;

  return (
    <>
      <style>{css}</style>
      <div className="chat-root">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">💬</div>
            <span className="brand-text">NexChat</span>
            <div className="brand-dot" />
          </div>

          <div className="sidebar-me">
            <Avatar url={myAvatarUrl} initials={myInitials} className="me-ava" />
            <div>
              <div className="me-name">{user?.username}</div>
              <div className="me-tag">#{String(user?.id ?? "").slice(-6)}</div>
            </div>
            <div className="me-dot" />
          </div>

          <button className="new-dm-btn" onClick={() => setShowNewDM(true)}>
            ✉️ New Message
          </button>

          <div className="section-label">Direct Messages</div>

          <div className="dm-list">
            {conversationsLoading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                Loading...
              </div>
            ) : contacts.length === 0 ? (
              <div style={{ padding: "20px 16px", color: "rgba(255,255,255,0.2)", fontSize: 12, textAlign: "center", lineHeight: 1.6 }}>
                Koi conversation nahi<br />"New Message" press karo
              </div>
            ) : contacts.map((contact) => {
              const unread = getUnreadCount(contact.id);
              return (
                <div
                  key={contact.id}
                  className={`dm-item ${activeDMId === contact.id ? "active" : ""}`}
                  onClick={() => switchDM(contact.id)}
                >
                  <Avatar
                    url={contact.avatarUrl}
                    initials={contact.avatar}
                    className={`dm-ava ${contact.online ? "online" : ""}`}
                  />
                  <div className="dm-info">
                    <div className="dm-name">{contact.username}</div>
                    <div className="dm-preview">{getPreview(contact)}</div>
                  </div>
                  {unread > 0 && <div className="dm-unread">{unread > 99 ? "99+" : unread}</div>}
                </div>
              );
            })}
          </div>

          <div className="sidebar-bottom">
            <button className="signout-btn" onClick={signOut}>↩ Sign Out</button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="chat-main">
          {!activeDMId ? (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <div className="empty-state-text">
                Koi conversation select karein<br />ya naya message shuru karein
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="chat-header">
                <div className="header-left">
                  <Avatar
                    url={activeContact?.avatarUrl}
                    initials={activeContact?.avatar}
                    className={`header-contact-ava ${activeContact?.online ? "online" : ""}`}
                  />
                  <div>
                    <div className="header-contact-name">{activeContact?.username}</div>
                    {activeContact?.online
                      ? <div className="header-contact-status">● Active now</div>
                      : <div className="header-contact-offline">● Offline</div>
                    }
                  </div>
                </div>
                <div className="header-right">
                  <div className="header-badge">
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: activeContact?.online ? "#22c55e" : "#555" }} />
                    Direct Message
                  </div>
                  <button
                    className={`console-toggle-btn ${showConsole ? "on" : ""}`}
                    onClick={() => setShowConsole((v) => !v)}
                  >
                    ⌨ {showConsole ? "Hide Console" : "Console"}
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-area">
                {messagesLoading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                    Messages load ho rahe hain...
                  </div>
                ) : dmMessages.length === 0 ? (
                  <div className="msg-empty">
                    <div className="msg-empty-icon">💬</div>
                    <div className="msg-empty-text">
                      {activeContact?.username} ke saath abhi koi message nahi<br />
                      Pehla message bhejein!
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="date-divider"><span>Today</span></div>
                    {dmMessages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={String(msg.senderId) === String(user?.id)}
                        onRetry={retryMessage}
                      />
                    ))}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="input-area">
                <div className="input-box">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={`${activeContact?.username ?? ""} ko message karein...`}
                    className="msg-input"
                    rows={1}
                  />
                  <button className="send-btn" onClick={handleSend} disabled={sending || !input.trim()}>
                    ➤
                  </button>
                </div>
                <div className="input-hint">Enter to send · Shift+Enter for new line</div>
              </div>

              {showConsole && <ConsolePanel logs={consoleLogs} />}
            </>
          )}
        </main>
      </div>

      {showNewDM && (
        <NewDMModal
          onClose={() => setShowNewDM(false)}
          onStart={startDM}
        />
      )}
    </>
  );
}