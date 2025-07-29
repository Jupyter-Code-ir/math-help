import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "./assets/components/Navbar.jsx";
import SetsForm from "./assets/components/sets-form.jsx";
import SetResult from "./assets/components/SetResult.jsx";
import LineForm from "./assets/components/eqe-form.jsx";
import LineResult  from "./assets/components/lineResult.jsx";

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
          <Route path="/sets" element={<SetsForm isLoggedIn={isLoggedIn}   />} />
          <Route path="/sets/result/:id" element={<SetResult />} /> 
          <Route path="/eqe/result/:id" element={<LineResult />} /> 

          <Route path="/eq" element={<LineForm isLoggedIn={isLoggedIn}/>}/>
        </Routes>
      </AnimatePresence>
    </>
  );
}
