import { useState, useEffect } from "react";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";

export default function UserPanel() {
  const [activeTab, setActiveTab] = useState("info");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [history, setHistory] = useState({ sets: [], lines: [], ais: [] });
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    full_name: "",
  });

useEffect(() => {
  const token = localStorage.getItem("access");
  if (!token) return;

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  fetch("http://localhost:8000/api/user-history/", { headers })
    .then(res => res.json())
    .then(data => {
      setHistory(data);
      setLoading(false);
    });

  fetch("http://localhost:8000/api/user-info/", { headers })
    .then(res => res.json())
    .then(data => setUserInfo(data));
}, []);

  const activities = [
    ...history.lines.map((item) => ({
      type: "eq",
      title: "معادله خطی",
      desc: JSON.stringify(item.line),
      date: item.created_at,
    })),
    ...history.sets.map((item) => ({
      type: "set",
      title: "مجموعه",
      desc: JSON.stringify(item.set),
      date: item.created_at,
    })),
    ...history.ais.map((item) => ({
      type: "ai",
      title: item.title,
      desc: JSON.stringify(item.chat),
      date: item.created_at,
    })),
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      {/* دایره‌های تب */}
      <motion.div
        className="flex gap-12 mb-10 relative"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <button
          className={classNames(
            "w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 text-2xl",
            activeTab === "info"
              ? "bg-blue-950/80 text-white scale-110"
              : "bg-white text-blue-950/80 hover:scale-105"
          )}
          onClick={() => {
            setActiveTab("info");
            setSelectedActivity(null);
          }}
        >
          <i className="fa-solid fa-user"></i>
        </button>
        <button
          className={classNames(
            "w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 text-2xl",
            activeTab === "history"
              ? "bg-blue-950/80 text-white scale-110"
              : "bg-white text-blue-950/80 hover:scale-105"
          )}
          onClick={() => {
            setActiveTab("history");
            setSelectedActivity(null);
          }}
        >
          <i className="fa-solid fa-rectangle-history-circle-user"></i>
        </button>
        {/* نقطه متحرک */}
        <motion.span
          className="absolute bottom-0 left-0"
          animate={{
            x: activeTab === "info" ? 0 : 96,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <span className="block w-4 h-4 rounded-full bg-blue-700 shadow-xl mx-auto"></span>
        </motion.span>
      </motion.div>

      {/* کانتینر محتوا */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + (selectedActivity ? "-detail" : "")}
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 40 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-blue-950/30 backdrop-blur-xl shadow-2xl rounded-3xl p-12 min-w-[400px] max-w-[700px] w-full"
        >
          {activeTab === "info" ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-28 h-28 rounded-full bg-blue-950/60 flex items-center justify-center shadow-xl mb-2">
                <i className="fa-solid fa-user text-4xl text-white"></i>
              </div>
              <div className="text-white text-2xl font-bold">{userInfo.full_name || userInfo.username}</div>
              <div className="text-white/80 text-lg">{userInfo.username}</div>
              <div className="text-white/80 text-lg">{userInfo.email}</div>
            </motion.div>
          ) : selectedActivity ? (
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6 items-center"
            >
              <div className="text-white text-2xl font-bold mb-2">{selectedActivity.title}</div>
              <div className="bg-white rounded-xl shadow-lg p-6 w-full text-black text-lg flex flex-col gap-2">
                <span className="font-bold">توضیحات:</span>
                <span>{selectedActivity.desc}</span>
                <span className="text-xs text-blue-700 mt-2">
                  {selectedActivity.type === "eq" && "معادلات خطی"}
                  {selectedActivity.type === "set" && "مجموعه‌ها"}
                  {selectedActivity.type === "ai" && "هوش مصنوعی"}
                </span>
                <span className="text-xs text-gray-500">{selectedActivity.date}</span>
              </div>
              <button
                className="mt-4 px-6 py-2 rounded-full bg-blue-700 text-white shadow-lg hover:bg-blue-900 transition"
                onClick={() => setSelectedActivity(null)}
              >
                بازگشت
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-white text-center mb-6 text-2xl font-bold">فعالیت‌ها</div>
              {loading ? (
                <div className="text-white text-center">در حال بارگذاری...</div>
              ) : activities.length === 0 ? (
                <div className="text-white text-center">هیچ فعالیتی یافت نشد.</div>
              ) : (
                <ul className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-700/60 scrollbar-track-blue-950/10">
                  {activities.map((item, idx) => (
                    <motion.li
                      key={idx}
                      whileHover={{ scale: 1.05, boxShadow: "0 8px 32px #1e293b55" }}
                      className="bg-white rounded-xl shadow-xl flex items-center gap-4 p-6 text-black cursor-pointer transition-all"
                      onClick={() => setSelectedActivity(item)}
                    >
                      <span className="font-bold text-lg">{item.title}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      </div>
  );
}