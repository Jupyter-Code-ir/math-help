import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import classNames from "classnames";
import katex from 'katex';
import 'katex/dist/katex.min.css';
import CustomSelect from "./CustomSelect";

export default function Chatbot({ isLoggedIn }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatContainerRef = useRef(null);
  const infoContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [chatBoxAnimation, setChatBoxAnimation] = useState(false);
  const [infoBarContent, setInfoBarContent] = useState(isLoggedIn ? "تاریخچه" : "پیشرفته");
  const [infoBarVision, setInfoBarVision] = useState(true);
  const [creativity, setCreativity] = useState(0.6);
  const [selectedModel, setSelectedModel] = useState({
    label: "جمنای 2 فلاش با تفکر عمیق",
    value: "gemini-2.0-flash-thinking-exp-01-21",
  });
  const [chatPyObj, setPyObj] = useState(null);
  const models = [
    { label: "جمنای 2 فلاش لایت", value: "gemini-2.0-flash-lite-preview-02-05" },
    { label: "جمنای 2 پرو", value: "gemini-2.0-pro-exp-02-05" },
    { label: "جمنای 2 فلاش با تفکر عمیق", value: "gemini-2.0-flash-thinking-exp-01-21" },
  ];

  const [historyItems, setHistoryItems] = useState([
    { title: "هوش مصنوعی", date: "1404/04/04", chat: {}, id: 1 },
    { title: "هوش مصنوعی", date: "1404/04/04", chat: {}, id: 2 },
    { title: "هوش مصنوعی", date: "1404/04/04", chat: {}, id: 3 },
  ]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const checkMobile = debounce(() => {
      setIsMobile(window.innerWidth <= 1024);
    }, 100);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setInfoBarContent(isLoggedIn ? "تاریخچه" : "پیشرفته");
  }, [isLoggedIn]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = { text: inputText, sender: "user", isLatex: false };
    setMessages((prev) => [...prev, userMsg]);

    setIsThinking(true);

    try {
      const res = await fetch("http://localhost:8000/api/ai_chatbot/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          func: "message",
          chatHistory: messages,
          message: inputText,
          temp: creativity,
          model: selectedModel.value,
        }),
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const data = await res.json();
      const responseDict = data.respon;

      const aiMessages = Object.keys(responseDict).map((key) => {
        const { متن, لاتک } = responseDict[key];
        if (لاتک) {
          try {
            const htmlOutput = katex.renderToString(متن, {
              displayMode: false,
              throwOnError: false,
              strict: 'ignore',
            });
            return { text: htmlOutput, sender: "ai", isLatex: true };
          } catch (error) {
            console.error('خطا در رندر لاتک:', error);
            return { text: متن, sender: "ai", isLatex: false };
          }
        }
        return { text: متن, sender: "ai", isLatex: false };
      });

      setMessages((prev) => [...prev, ...aiMessages]);

    } catch (err) {
      console.error("خطا در fetch:", err);
      const errMsg = { text: "⛔ خطا در ارسال/دریافت پیام", sender: "ai", isLatex: false };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setInputText("");
      setIsThinking(false);
    }
  };

  function newChat() {
    setMessages([]);
    setInputText("");
    setIsThinking(false);
    setCreativity(0.6);
    setSelectedModel({
      label: "جمنای 2 فلاش با تفکر عمیق",
      value: "gemini-2.0-flash-thinking-exp-01-21",
    });
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (isMobile || e.shiftKey) {
        // در موبایل یا با Shift+Enter در دسکتاپ، خط جدید اضافه کن
        e.preventDefault(); // جلوگیری از رفتار پیش‌فرض (مثل ارسال فرم)
        setInputText((prev) => prev + "\n");
      } else {
        // در دسکتاپ بدون Shift، پیام را ارسال کن
        e.preventDefault(); // جلوگیری از رفتار پیش‌فرض
        handleSend();
      }
    }
  };

  function DeleteChat(id) {
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
  }

  const spinnerStyles = `
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
  `;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, backdropFilter: "blur(24px) brightness(0.5)" }}
      animate={{ opacity: 1, scale: 1, backdropFilter: "blur(8px) brightness(1)" }}
      transition={{ duration: 0.5 }}
      className="relative mx-auto gap-5 p-5 lg:max-w-[1500px] lg:top-20 top-50 text-white flex h-[calc(100vh-80px)] z-40"
    >
      <AnimatePresence mode="sync">
        {((isMobile && !infoBarVision) || !isMobile) && (
          <motion.div
            key="chatBox"
            onAnimationStart={() => setChatBoxAnimation(true)}
            onAnimationComplete={() => setChatBoxAnimation(false)}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ duration: 1 }}
            className="flex z-1 flex-col w-full h-full"
          >
            <style>{spinnerStyles}</style>
            <div
              ref={chatContainerRef}
              className="flex-1 flex flex-col relative backdrop-blur-xl bg-blue-950/30 text-white rounded-4xl shadow-sm shadow-black/20 overflow-y-auto"
            >
              <div className="flex-1 p-6 w-full lg:max-w-[1024px] mx-auto space-y-4">
                <AnimatePresence>
                  {messages.reduce((acc, msg, index) => {
                    if (msg.sender === "user") {
                      acc.push(
                        <motion.div
                          key={`user-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="p-4 rounded-2xl bg-blue-950/60 shadow-lg shadow-black/20 max-w-[calc(100%-20px)] ml-auto"
                        >
                          {msg.text}
                        </motion.div>
                      );
                    } else {
                      if (acc.length > 0 && acc[acc.length - 1].props.sender === "ai") {
                        acc[acc.length - 1].props.children.push(
                          <div key={`ai-part-${index}`} className="mt-2 first:mt-0">
                            {msg.isLatex ? (
                              <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                            ) : (
                              msg.text
                            )}
                          </div>
                        );
                      } else {
                        acc.push(
                          <motion.div
                            key={`ai-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="p-4 rounded-2xl bg-blue-950/10 shadow-lg shadow-black/20 max-w-[calc(100%-20px)] mr-auto lg:ml-0"
                            sender="ai"
                          >
                            {[<div key={`ai-part-${index}`} className="mt-2 first:mt-0">
                              {msg.isLatex ? (
                                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                              ) : (
                                msg.text
                              )}
                            </div>]}
                          </motion.div>
                        );
                      }
                    }
                    return acc;
                  }, [])}
                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center"
                    >
                      <div className="spinner"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="w-full max-w-[660px] md:mb-3 mx-auto p-4 relative border-t border-white/10 bg-blue-950/20 md:rounded-4xl">
                <div className="flex items-center gap-3">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress} // تغییر از onKeyPress به onKeyDown
                    placeholder="پیامتو اینجا بنویس..."
                    className="flex-1 p-3 bg-blue-950/20 text-white placeholder-white/50 rounded-xl border border-white/20 focus:outline-none focus:bg-blue-950/40 focus:shadow-lg shadow-black transition-all duration-300 shadow-sm shadow-black/20 resize-none"
                    rows="1" // ارتفاع اولیه مشابه input
                    style={{ minHeight: "40px", maxHeight: "120px" }} // تنظیم ارتفاع
                  />
                  <motion.button
                    whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={isThinking || !inputText.trim()}
                    className="p-3 backdrop-blur-lg text-white rounded-xl shadow-md shadow-black/20 transition-all duration-500 hover:bg-blue-950/20 focus:outline-none disabled:blur-[2px] disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <motion.div
          ref={infoContainerRef}
          key="infoBar"
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ duration: 1 }}
          className="z-2 flex flex-col transition-all duration-700 justify-between rounded-xl h-full backdrop-blur-lg bg-blue-950/50 p-2 w-full"
          style={{ width: !isMobile ? (infoBarVision ? 260 : 53) : infoBarVision && !chatBoxAnimation ? "100%" : 53 }}
        >
          <div className="chatControl h-2/12 flex items-center w-full">
            <div className="buttons flex flex-col w-full items-center justify-center gap-2">
              <button
                className="NewChat p-2 px-4 flex items-center justify-center backdrop-blur-lg shadow-md text-white rounded-full shadow-md hover:bg-blue-950 transition-all duration-300"
                disabled={isThinking}
                onClick={newChat}
              >
                <i className="fa-solid fa-plus"></i>
              </button>
              <div className="tabControl w-full flex items-center">
                {isLoggedIn && infoBarVision && !chatBoxAnimation && (
                  <button
                    className="historyButton w-1/2 p-2 px-4 flex items-center justify-center backdrop-blur-lg shadow-md text-white rounded-full shadow-md hover:bg-blue-950 transition-all duration-300 disabled:scale-90 disabled:hover:bg-blue-950/0 disabled:bg-blue-950"
                    onClick={() => setInfoBarContent("تاریخچه")}
                    disabled={infoBarContent === "تاریخچه"}
                  >
                    <p className="flex gap-2 flex-row-reverse justify-end">
                      <i className="fa-solid -translate-y-[-2px] fa-rectangle-history-circle-user"></i>
                      <span>تاریخچه</span>
                    </p>
                  </button>
                )}
                {isLoggedIn && (
                  <button
                    className={classNames(
                      "p-2 px-4 flex items-center justify-center backdrop-blur-lg shadow-md text-white rounded-full shadow-md hover:bg-blue-950 transition-all duration-300 disabled:scale-90 disabled:hover:bg-blue-950/0 disabled:bg-blue-950",
                      { "w-1/2": isLoggedIn && infoBarVision && !chatBoxAnimation, "w-full": !isLoggedIn || !infoBarVision || chatBoxAnimation }
                    )}
                    onClick={() => {
                      setInfoBarContent("پیشرفته");
                      setInfoBarVision(true);
                    }}
                    disabled={infoBarContent === "پیشرفته"}
                  >
                    <p className="flex gap-2 flex-row-reverse justify-end">
                      <i className={classNames("fa-solid fa-sliders", { "-translate-y-[-2px]": infoBarVision && !chatBoxAnimation })}></i>
                      <span className={classNames({ hidden: !infoBarVision || chatBoxAnimation })}>تنظیمات</span>
                    </p>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="chatTabBody h-8/12 max-h-8/12">
            <AnimatePresence mode="wait">
              {infoBarContent === "تاریخچه" && isLoggedIn ? (
                <motion.div
                  key="historyContent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="historyContent h-full"
                >
                  <div className="h-full flex items-center justify-center">
                    {infoBarVision && !chatBoxAnimation ? (
                      <ul className="history-mini-list overflow-y-auto h-full w-full">
                        {historyItems.map((item) => (
                          <li key={item.id} className="m-2 mx-3">
                            <div className="flex items-center justify-between backdrop-blur-lg bg-blue-950/20 rounded-lg shadow-lg shadow-black/10 p-2 transition duration-200 hover:shadow-black/30 hover:scale-105">
                              <a href="#" className="flex-1">
                                <p className="text-nowrap overflow-ellipsis overflow-hidden">{item.title}</p>
                                <p className="text-sm text-gray-300">{item.date}</p>
                              </a>
                              <button
                                onClick={() => DeleteChat(item.id)}
                                className="ml-2 p-1 px-2 hover:bg-red-500/20 rounded-lg transition-all duration-400"
                                aria-label="حذف گفتگو"
                              >
                                <i className="fa-solid fa-trash text-red-300" aria-hidden="true"></i>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <i className="text-xl fa-solid fa-rectangle-history-circle-user"></i>
                    )}
                  </div>
                </motion.div>
              ) : !infoBarVision || (chatBoxAnimation && isMobile) ? (
                <motion.div
                  key="settingsIcon"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex items-center justify-center"
                >
                  <i className="text-xl fa-solid fa-sliders"></i>
                </motion.div>
              ) : (
                <motion.div
                  key="advanceContent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="advanceContent p-4"
                >
                  <div className="flex flex-col gap-2">
                    <div className="w-full flex flex-col items-center justify-center p-2 rounded-lg backdrop-blur-xl bg-blue-950/20">
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
                    </div>
                    <div className="w-full flex flex-col items-center justify-center p-2 rounded-lg backdrop-blur-xl bg-blue-950/20">
                      <h3 className="text-lg text-center mt-4 mb-2">مدل خود را انتخاب کنید</h3>
                      <CustomSelect
                        options={models}
                        value={selectedModel}
                        onChange={(opt) => setSelectedModel(opt)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="SizeControlBtn relative h-2/12">
            <button
              onClick={() => {
                if (!chatBoxAnimation) {
                  setInfoBarVision(!infoBarVision);
                  if (infoBarVision && isLoggedIn) setInfoBarContent("تاریخچه");
                }
              }}
              disabled={chatBoxAnimation}
              className="p-2 px-4 flex absolute bottom-0 backdrop-blur-lg shadow-md text-white rounded-full shadow-md hover:bg-blue-950 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={infoBarVision ? "بستن نوار اطلاعات" : "باز کردن نوار اطلاعات"}
            >
              {infoBarVision && !chatBoxAnimation ? (
                <i className="fa-solid my-1 fa-backward-step"></i>
              ) : (
                <i className="fa-solid my-1 fa-forward-step"></i>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}