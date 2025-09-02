import React, { useEffect, useRef, useState } from "react";
import { Send, UserCircle2, Users, Shield } from "lucide-react";
import io from "socket.io-client";

// ชี้ไปยังโดเมนที่คุณโฮสต์เซิร์ฟเวอร์
const SOCKET_URL = import.meta?.env?.VITE_SOCKET_URL || "https://YOUR-SOCKET-SERVER";
const HISTORY_URL = `${SOCKET_URL}/history`; // REST ดึงประวัติ

const DEFAULT_ROOMS = [
  { key: "global", label: "ห้องกลาง" },
];

export default function ChatPage({ user }) {
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [activeRoom, setActiveRoom] = useState("global");
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // สร้าง JWT จากระบบล็อกอินของคุณ (ตัวอย่างเดโมเท่านั้น!)
  // ควรได้ token นี้มาตั้งแต่ตอน login แล้วเก็บใน localStorage
  const token = localStorage.getItem("chatJWT");

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // connect socket
  useEffect(() => {
    const s = io(`${SOCKET_URL}/chat`, {
      transports: ["websocket", "polling"],
      auth: { token }, // ใส่ JWT ที่ออกจาก backend คุณ
      withCredentials: true
    });

    s.on("connect", () => {
      // สร้างรายชื่อห้องเริ่มต้นตามสิทธิ์ (ตัวอย่าง)
      const today = new Date().toISOString().slice(0,10).replace(/-/g,"");
      const dynamicRooms = [
        { key: "global", label: "ห้องกลาง" },
        ...(user?.affiliation ? [{ key: `unit-${user.affiliation}`, label: `สังกัด: ${user.affiliation}` }] : []),
        ...(user?.deph ? [{ key: `dept-${user.deph}`, label: `แผนก: ${user.deph}` }] : []),
        ...(user?.onDuty ? [{ key: `duty-${today}`, label: `เวรวันนี้ (${today})` }] : []),
      ];
      setRooms(dynamicRooms);
      setActiveRoom("global");
      // โหลดประวัติของห้องแรก
      fetch(`${HISTORY_URL}?room=global&limit=50`).then(r => r.json()).then(setMessages).catch(()=>{});
    });

    s.on("message", (msg) => {
      setMessages(prev => (msg.room === activeRoom ? [...prev, msg] : prev));
    });

    s.on("typing", ({ room, userId, name, typing }) => {
      if (room !== activeRoom) return;
      setTypingUsers(prev => {
        const clone = { ...prev };
        if (typing) clone[userId] = name;
        else delete clone[userId];
        return clone;
      });
    });

    s.on("disconnect", () => {});

    setSocket(s);
    return () => s.disconnect();
  }, []); // eslint-disable-line

  // เปลี่ยนห้อง
  const switchRoom = async (roomKey) => {
    setActiveRoom(roomKey);
    // ขอ server join เพิ่ม (เผื่อเป็นห้องไม่ได้ join อัตโนมัติ)
    socket?.emit("join", roomKey);
    const hist = await fetch(`${HISTORY_URL}?room=${encodeURIComponent(roomKey)}&limit=50`).then(r => r.json()).catch(()=>[]);
    setMessages(hist);
    setTypingUsers({});
  };

  // ส่งข้อความ
  const send = () => {
    if (!text.trim() || !socket) return;
    const payload = { room: activeRoom, text: text.trim(), clientId: `${Date.now()}` };
    socket.emit("message", payload);
    setText("");
    // แสดงทันที (optimistic) จะให้รอ server echo กลับก็ได้
    // setMessages(prev => [...prev, { ...payload, senderId: user?.id, senderName: user?.firstname, createdAt: Date.now() }]);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    } else {
      // typing indicator
      socket?.emit("typing", { room: activeRoom, typing: true });
      // หยุด typing ผ่าน debounce ง่าย ๆ
      clearTimeout(onKeyDown._t);
      onKeyDown._t = setTimeout(() => socket?.emit("typing", { room: activeRoom, typing: false }), 800);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center space-x-3">
          <Shield className="w-7 h-7" />
          <div>
            <div className="font-semibold">แชทหน่วย</div>
            <div className="text-xs opacity-80">Realtime chat (Socket.io)</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Users className="w-4 h-4" />
          <span>{rooms.length} ห้อง</span>
        </div>
      </div>

      {/* Tabs (Rooms) */}
      <div className="flex gap-2 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
        {rooms.map(r => (
          <button
            key={r.key}
            onClick={() => switchRoom(r.key)}
            className={`px-3 py-1.5 rounded-xl text-sm whitespace-nowrap ${
              activeRoom === r.key ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m) => {
          const isMe = m.senderId && (String(m.senderId) === String(user?.id) || m.senderName === user?.firstname);
        return (
          <div key={m.messageId} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
              isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
            }`}>
              {!isMe && <div className="text-xs opacity-70 mb-0.5">{m.senderName}</div>}
              <div>{m.text}</div>
              <div className={`text-[10px] mt-1 ${isMe ? "text-white/80" : "text-slate-500"}`}>
                {new Date(m.createdAt || Date.now()).toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})}
              </div>
            </div>
          </div>
        )})}
        {/* typing */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="text-xs text-slate-500 italic px-2">
            {Object.values(typingUsers).join(", ")} กำลังพิมพ์...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`พิมพ์ข้อความถึง "${rooms.find(r=>r.key===activeRoom)?.label || ""}"`}
          className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          onClick={send}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
