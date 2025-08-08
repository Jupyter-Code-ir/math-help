import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import classNames from "classnames";
import { debounce } from "lodash";

export default function AiPage({ isLoggedIn }) {
  const [infoBarSize, setInfoBarSize] = useState(300); // عرض نوار اطلاعات به پیکسل
  const [isInfoBarOpen, setIsInfoBarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("advanced"); // تب فعال: پیشرفته یا تاریخچه
  const [creativity, setCreativity] = useState(1); // مقدار اسلایدر خلاقیت
  const [selectedModel, setSelectedModel] = useState("grok-3"); // مدل انتخاب‌شده
  const [messages, setMessages] = useState([]); // پیام‌های چت
  const [inputText, setInputText] = useState(""); // متن ورودی
  const [isMobile, setIsMobile] = useState(false);
  const [isThinking, setIsThinking] = useState(false); // وضعیت فکر کردن
  const infoBarRef = useRef(null);

  const historyItems = [
    { id: 1, title: "هوش مصنوعی", description: "سوال در مورد ژوپیتر کد", date: "1404/04/04" },
    { id: 2, title: "مختصات", description: "2x+y=3", date: "1404/04/03" },
    { id: 3, title: "مجموعه", description: "1,2,3", date: "1404/04/02" },
  ];

  // تشخیص موبایل
  useEffect(() => {
    const checkMobile = debounce(() => {
      setIsMobile(window.innerWidth <= 1024);
    }, 100);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // بستن نوار اطلاعات با کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoBarRef.current && !infoBarRef.current.contains(event.target)) {
        setIsInfoBarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (inputText.trim()) {
      setMessages([...messages, { text: inputText, sender: "user" }]);
      setInputText("");
      setIsThinking(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: "پاسخ هوش مصنوعی", sender: "ai" }]);
        setIsThinking(false);
      }, 1000);
    }
  };

  const handleThink = () => {
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      alert("در حال فکر کردن...");
    }, 1000);
  };

  const handleNewChat = () => {
    setMessages([]);
    alert("گفتگوی جدید ایجاد شد");
  };

  const handleDeleteChat = (id) => {
    alert(`حذف گفتگو با شناسه ${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, backdropFilter: "blur(24px) brightness(0.5)" }}
      animate={{ opacity: 1, scale: 1, backdropFilter: "blur(8px) brightness(1)" }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="relative mx-auto rounded-none lg:rounded-4xl lg:max-w-[1024px] top-20 shadow-sm shadow-black/40 backdrop-blur-sm bg-blue-950/20 text-white flex h-[calc(100vh-80px)] z-40"
    >
      {/* نوار اطلاعات (سمت چپ) */}
      <AnimatePresence>
        {isInfoBarOpen && (isLoggedIn || activeTab === "advanced") ? (
          <motion.div
            ref={infoBarRef}
            initial={{ width: 0 }}
            animate={{ width: infoBarSize }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-blue-950/60 p-4 overflow-y-auto shadow-lg shadow-black/40 rounded-4xl"
            style={{ minWidth: infoBarSize }}
          >
            {isLoggedIn && (
              <div className="flex mb-4 gap-2">
                <button
                  onClick={() => setActiveTab("advanced")}
                  className={classNames(
                    "flex-1 p-2 rounded-xl transition duration-500 shadow-sm shadow-black/20",
                    {
                      "bg-blue-950/40 scale-110 shadow-lg": activeTab === "advanced",
                      "bg-blue-950/80 hover:bg-blue-950/40 hover:scale-110 hover:shadow-lg": activeTab !== "advanced",
                    }
                  )}
                >
                  پیشرفته
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={classNames(
                    "flex-1 p-2 rounded-xl transition duration-500 shadow-sm shadow-black/20",
                    {
                      "bg-blue-950/40 scale-110 shadow-lg": activeTab === "history",
                      "bg-blue-950/80 hover:bg-blue-950/40 hover:scale-110 hover:shadow-lg": activeTab !== "history",
                    }
                  )}
                >
                  گفتگوها
                </button>
              </div>
            )}

            {activeTab === "advanced" && (
              <div>
                <h3 className="text-lg mb-2">خلاقیت</h3>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={creativity}
                  onChange={(e) => setCreativity(e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-center">{creativity}</p>

                <h3 className="text-lg mt-4 mb-2">مدل خود را انتخاب کنید</h3>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-blue-950/80 p-2 rounded-xl text-white shadow-sm shadow-black/20"
                >
                  <option value="grok-3">Grok 3</option>
                  <option value="model-2">Model 2</option>
                  <option value="model-3">Model 3</option>
                </select>
              </div>
            )}

            {activeTab === "history" && isLoggedIn && (
              <div>
                <button
                  onClick={handleNewChat}
                  className="w-full bg-blue-950/40 p-2 mb-4 rounded-xl flex items-center justify-center transition duration-500 hover:bg-blue-950/60 hover:scale-105 hover:shadow-lg shadow-black/40"
                >
                  <i className="fa-solid fa-plus ml-2" aria-hidden="true"></i>
                  گفتگوی جدید
                </button>
                <ul className="history-mini-list">
                  {historyItems.map((item) => (
                    <li key={item.id} className="m-2 mx-3">
                      <div className="flex items-center justify-between bg-white text-black rounded-lg shadow-lg shadow-black/10 p-2 transition duration-200 hover:shadow-black/30 hover:scale-105">
                        <a href="#" className="flex-1">
                          <p className="text-nowrap overflow-ellipsis overflow-hidden">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.date}</p>
                        </a>
                        <button
                          onClick={() => handleDeleteChat(item.id)}
                          className="ml-2 p-1"
                          aria-label="حذف گفتگو"
                        >
                          <i className="fa-solid fa-trash text-red-600" aria-hidden="true"></i>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ) : (
          isLoggedIn && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 50 }}
              exit={{ width: 0 }}
              className="bg-blue-950/60 flex items-center justify-center shadow-lg shadow-black/40 rounded-4xl"
            >
              <motion.div
                animate={{ y: [-20, 20] }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
              >
                <i className="fa-solid fa-rectangle-history-circle-user text-white text-2xl" aria-hidden="true"></i>
              </motion.div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* منطقه چت (سمت راست) */}
      <div className="flex-1 flex flex-col bg-white text-black rounded-4xl shadow-sm shadow-black/20">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={classNames("p-2 mb-2 rounded-lg shadow-sm", {
                "bg-blue-950/10 ml-auto max-w-[70%]": msg.sender === "user",
                "bg-gray-100 mr-auto max-w-[70%]": msg.sender === "ai",
              })}
            >
              {msg.text}
            </motion.div>
          ))}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center mt-4"
            >
              <div className="spinner"></div>
            </motion.div>
          )}
        </div>

        <div className="p-4 border-t bg-blue-950/10 rounded-b-4xl">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="پیام خود را بنویسید..."
              className="flex-1 p-2 border rounded-xl bg-white text-black shadow-sm shadow-black/20 focus-visible:shadow-lg focus-visible:scale-102 focus-visible:outline-0"
            />
            <button
              onClick={handleThink}
              className="p-2 bg-blue-950/60 text-white rounded-xl transition duration-500 hover:bg-blue-950/40 hover:scale-110 hover:shadow-lg shadow-black/40"
              aria-label="فکر کن"
            >
              <i className="fa-solid fa-brain" aria-hidden="true"></i>
            </button>
            <button
              onClick={handleSend}
              className="p-2 bg-blue-950/60 text-white rounded-xl transition duration-500 hover:bg-blue-950/40 hover:scale-110 hover:shadow-lg shadow-black/40"
              aria-label="ارسال"
            >
              <i className="fa-solid fa-paper-plane" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>

      {/* دکمه تغییر وضعیت نوار اطلاعات */}
      {(isLoggedIn || activeTab === "advanced") && (
        <button
          onClick={() => setIsInfoBarOpen(!isInfoBarOpen)}
          className="absolute top-4 left-4 bg-blue-950/60 text-white p-2 rounded-xl transition duration-500 hover:bg-blue-950/40 hover:scale-110 hover:shadow-lg shadow-black/40"
        >
          {isInfoBarOpen ? "بستن" : "باز کردن"}
        </button>
      )}

      {/* استایل اسپینر */}
      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-top: 4px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}