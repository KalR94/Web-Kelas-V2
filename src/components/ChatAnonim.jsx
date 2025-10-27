import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import axios from "axios";
import Swal from "sweetalert2";

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [userIp, setUserIp] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef(null);

  // ==============================
  // 🔹 Ambil daftar IP yang diblokir dari tabel "blacklist_ips"
  // ==============================
  const fetchBlockedIPs = async () => {
    try {
      const { data, error } = await supabase.from("blacklist_ips").select("ipAddress");
      if (error) throw error;
      return data.map((row) => row.ipAddress);
    } catch (error) {
      console.error("Gagal mengambil daftar IP yang diblokir:", error);
      return [];
    }
  };

  // ==============================
  // 🔹 Ambil pesan & realtime listener
  // ==============================
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("realtime:chats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chats" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new]);
            if (shouldScrollToBottom) scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shouldScrollToBottom]);

  // ==============================
  // 🔹 Ambil semua pesan dari Supabase
  // ==============================
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .order("timestamp", { ascending: true });

    if (!error && data) {
      setMessages(data);
      scrollToBottom();
    }
  };

  // ==============================
  // 🔹 Ambil IP user
  // ==============================
  useEffect(() => {
    getUserIp();
    checkMessageCount();
    scrollToBottom();
  }, []);

  const getUserIp = async () => {
    try {
      const cachedIp = localStorage.getItem("userIp");
      const expiration = localStorage.getItem("ipExpiration");
      const now = new Date().getTime();

      if (cachedIp && expiration && now < parseInt(expiration)) {
        setUserIp(cachedIp);
        return;
      }

      const response = await axios.get("https://ipapi.co/json");
      const newIp = response.data.network || response.data.ip;
      setUserIp(newIp);
      const expirationTime = now + 60 * 60 * 1000; // 1 jam
      localStorage.setItem("userIp", newIp);
      localStorage.setItem("ipExpiration", expirationTime.toString());
    } catch (error) {
      console.error("Gagal mendapatkan IP:", error);
    }
  };

  // ==============================
  // 🔹 Batas pesan per hari
  // ==============================
  const checkMessageCount = () => {
    const currentDate = new Date().toDateString();
    const storedDate = localStorage.getItem("messageCountDate");

    if (currentDate === storedDate) {
      const count = parseInt(localStorage.getItem("messageCount")) || 0;
      setMessageCount(count);
    } else {
      localStorage.setItem("messageCountDate", currentDate);
      localStorage.setItem("messageCount", "0");
      setMessageCount(0);
    }
  };

  // ==============================
  // 🔹 Cek apakah IP diblokir
  // ==============================
  const isIpBlocked = async () => {
    const blockedIPs = await fetchBlockedIPs();
    return blockedIPs.includes(userIp);
  };

  // ==============================
  // 🔹 Kirim pesan
  // ==============================
  const sendMessage = async () => {
    if (message.trim() === "") return;

    const isBlocked = await isIpBlocked();
    if (isBlocked) {
      Swal.fire({
        icon: "error",
        title: "Blocked",
        text: "You are blocked from sending messages.",
      });
      return;
    }

    if (messageCount >= 20) {
      Swal.fire({
        icon: "error",
        title: "Message limit exceeded",
        text: "You have reached your daily message limit.",
      });
      return;
    }

    const senderImageURL = "/AnonimUser.png";
    const trimmedMessage = message.trim().substring(0, 60);

    const { error } = await supabase.from("chats").insert([
      {
        message: trimmedMessage,
        sender: { image: senderImageURL },
        timestamp: new Date().toISOString(),
        userIp: userIp,
      },
    ]);

    if (error) {
      console.error("Gagal kirim pesan:", error);
      Swal.fire({ icon: "error", title: "Gagal kirim pesan" });
      return;
    }

    const newCount = messageCount + 1;
    localStorage.setItem("messageCount", newCount.toString());
    setMessageCount(newCount);

    setMessage("");
    setShouldScrollToBottom(true);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // ==============================
  // 🔹 UI
  // ==============================
  return (
    <div id="ChatAnonim">
      <div className="text-center text-4xl font-semibold" id="Glow">
        Text Anonim
      </div>

      <div className="mt-5" id="KotakPesan" style={{ overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <div key={index} className="flex items-start text-sm py-[1%]">
            <img
              src={msg.sender?.image || "/AnonimUser.png"}
              alt="User"
              className="h-7 w-7 mr-2"
            />
            <div className="relative top-[0.30rem]">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <div id="InputChat" className="flex items-center mt-5">
        <input
          className="bg-transparent flex-grow pr-4 w-4 placeholder:text-white placeholder:opacity-60"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ketik pesan Anda..."
          maxLength={60}
        />
        <button onClick={sendMessage} className="ml-2">
          <img src="/paper-plane.png" alt="" className="h-4 w-4 lg:h-6 lg:w-6" />
        </button>
      </div>
    </div>
  );
}

export default Chat;
