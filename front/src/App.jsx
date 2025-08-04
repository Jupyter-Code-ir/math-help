import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "./assets/components/Navbar.jsx";
import SetsForm from "./assets/components/sets-form.jsx";
<<<<<<< HEAD
import UserPanel from "./assets/components/user_panel.jsx"; // وارد کردن کامپوننت جدید
=======
import SetResult from "./assets/components/SetResult.jsx";
import UserPanel from "./assets/components/UserPanel.jsx";
import Login from "./assets/components/Login.jsx"; 
>>>>>>> ca2f415dc143fdc672157f8bbfa2dc2943e958ff
import "./App.css";
import "./assets/css/all.css";

export default function App() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userName,setUsername] = useState("کاربر");

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      setIsLoggedIn(true);
      setUsername("محمدمهدی");
    } else {
      setIsLoggedIn(false);
      setUsername("");
    }
  }, []);
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} username={userName}  />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
<<<<<<< HEAD
          <Route path="/sets" element={<SetsForm />} />
          <Route path="/user" element={<UserPanel />} /> {/* مسیر جدید */}
=======
          <Route path="/sets" element={<SetsForm isLoggedIn={isLoggedIn}   />} />
          <Route path="/user" element={<UserPanel />} />
          <Route path="/sets/result/:id" element={<SetResult />} />
          <Route path="/login" element={<Login />} /> 
>>>>>>> ca2f415dc143fdc672157f8bbfa2dc2943e958ff
        </Routes>
      </AnimatePresence>
    </>
  );
}