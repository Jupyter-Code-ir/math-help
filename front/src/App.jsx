import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./assets/components/Navbar.jsx";
import SetsForm from "./assets/components/sets-form.jsx";
import UserPanel from "./assets/components/user_panel.jsx"; // وارد کردن کامپوننت جدید
import "./App.css";
import "./assets/css/all.css";

export default function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/sets" element={<SetsForm />} />
          <Route path="/user" element={<UserPanel />} /> {/* مسیر جدید */}
        </Routes>
      </AnimatePresence>
    </>
  );
}