import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

export default function CustomSelect({ options = [], value, onChange, placeholder = "انتخاب کنید", className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4, 
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    updateCoords();
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords);

    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateCoords();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative text-white ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-fit text-nowrap hover:scale-110  text-center p-2 px-4 rounded-full bg-blue-950/40 backdrop-blur-lg  shadow-md transition-all duration-300"
      >
        {value ? value.label : placeholder}
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`,
                zIndex: 50,
              }}
              className="bg-blue-950/80 w-fit text-white backdrop-blur-md  rounded-xl shadow-lg overflow-hidden max-h-[200px] overflow-y-auto"
            >
              {options.map((opt, i) => (
                <li
                  key={i}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`p-2 px-4 cursor-pointer text-nowrap hover:bg-blue-800 transition-all duration-200 ${
                    value?.value === opt.value ? "bg-blue-800" : ""
                  }`}
                >
                  {opt.label}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}