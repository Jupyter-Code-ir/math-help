import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import classNames from "classnames";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState(""); // فیلد تکرار رمز
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("نام کاربری یا رمز عبور اشتباه است");
      const data = await res.json();
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      navigate("/user");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError("");
    setRegisterSuccess("");
    if (password !== repeatPassword) {
      setRegisterError("رمز عبور و تکرار آن یکسان نیستند!");
      setRegisterLoading(false);
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "ثبت نام انجام نشد");
      }
      setRegisterSuccess("ثبت نام با موفقیت انجام شد! حالا وارد شوید.");
      setUsername("");
      setPassword("");
      setRepeatPassword("");
    } catch (err) {
      setRegisterError(err.message);
    }
    setRegisterLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="bg-blue-950/30 backdrop-blur-xl shadow-2xl rounded-3xl px-12 py-10 min-w-[350px] max-w-[420px] w-full flex flex-col items-center border-2 border-blue-700/30"
      >
        {/* دایره‌های تب بالا */}
        <motion.div
          className="flex gap-10 mb-8 relative"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <button
            className={classNames(
              "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 text-xl",
              activeTab === "login"
                ? "bg-blue-950/80 text-white scale-110"
                : "bg-white text-blue-950/80 hover:scale-105"
            )}
            onClick={() => setActiveTab("login")}
          >
            <i className="fa-solid fa-right-to-bracket"></i>
          </button>
          <button
            className={classNames(
              "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 text-xl",
              activeTab === "register"
                ? "bg-blue-950/80 text-white scale-110"
                : "bg-white text-blue-950/80 hover:scale-105"
            )}
            onClick={() => setActiveTab("register")}
          >
            <i className="fa-solid fa-user-plus"></i>
          </button>
          {/* نقطه متحرک */}
          <motion.span
            className="absolute bottom-0 left-0"
            animate={{
              x: activeTab === "login" ? 0 : 64,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <span className="block w-3 h-3 rounded-full bg-blue-700 shadow-lg mx-auto"></span>
          </motion.span>
        </motion.div>

        {/* فرم ورود یا ثبت‌نام */}
        {activeTab === "login" ? (
          <>
            <motion.div
              initial={{ scale: 0.7, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-2xl mb-6 border-4 border-white"
            >
              <i className="fa-solid fa-user-lock text-4xl text-white drop-shadow-lg"></i>
            </motion.div>
            <h2 className="text-2xl font-bold text-blue-900 mb-8">
              ورود به حساب کاربری
            </h2>
            <form className="w-full flex flex-col gap-6" onSubmit={handleLogin}>
              <motion.input
                type="text"
                placeholder="نام کاربری"
                className={classNames(
                  "rounded-xl px-5 py-3 bg-white text-blue-900 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-700 transition backdrop-blur-xl",
                  { "border border-red-500": error }
                )}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                whileFocus={{ scale: 1.03 }}
              />
              <motion.input
                type="password"
                placeholder="رمز عبور"
                className={classNames(
                  "rounded-xl px-5 py-3 bg-white text-blue-900 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-700 transition backdrop-blur-xl",
                  { "border border-red-500": error }
                )}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                whileFocus={{ scale: 1.03 }}
              />
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-center font-bold"
                >
                  {error}
                </motion.div>
              )}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.05, boxShadow: "0 8px 32px #1e293b55" }}
                className="mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 text-white font-bold shadow-lg hover:scale-105 transition-all text-lg"
              >
                {loading ? "در حال ورود..." : "ورود"}
              </motion.button>
            </form>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0.7, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-2xl mb-6 border-4 border-white"
            >
              <i className="fa-solid fa-user-plus text-4xl text-white drop-shadow-lg"></i>
            </motion.div>
            <h2 className="text-2xl font-bold text-blue-900 mb-8">
              ثبت نام کاربر جدید
            </h2>
            <form className="w-full flex flex-col gap-6" onSubmit={handleRegister}>
              <motion.input
                type="text"
                placeholder="نام کاربری"
                className={classNames(
                  "rounded-xl px-5 py-3 bg-white text-blue-900 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-700 transition backdrop-blur-xl",
                  { "border border-red-500": registerError }
                )}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                whileFocus={{ scale: 1.03 }}
              />
              <motion.input
                type="password"
                placeholder="رمز عبور"
                className={classNames(
                  "rounded-xl px-5 py-3 bg-white text-blue-900 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-700 transition backdrop-blur-xl",
                  { "border border-red-500": registerError }
                )}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                whileFocus={{ scale: 1.03 }}
              />
              <motion.input
                type="password"
                placeholder="تکرار رمز عبور"
                className={classNames(
                  "rounded-xl px-5 py-3 bg-white text-blue-900 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-700 transition backdrop-blur-xl",
                  { "border border-red-500": registerError }
                )}
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
                whileFocus={{ scale: 1.03 }}
              />
              {registerError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-center font-bold"
                >
                  {registerError}
                </motion.div>
              )}
              {registerSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-center font-bold"
                >
                  {registerSuccess}
                </motion.div>
              )}
              <motion.button
                type="submit"
                disabled={registerLoading}
                whileHover={{ scale: 1.05, boxShadow: "0 8px 32px #1e293b55" }}
                className="mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 text-white font-bold shadow-lg hover:scale-105 transition-all text-lg"
              >
                {registerLoading ? "در حال ثبت نام..." : "ثبت نام"}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}