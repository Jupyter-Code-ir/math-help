import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import DataTable from "./table";
import { result } from "lodash";

export default function LineForm(props) {
  const isLoggedIn = props.isLoggedIn;
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState({ name: "", value: "", index: null });
  const [numLines, setNumLines] = useState(1);
  const [showAi, setShowAi] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiButton, setAibutton] = useState(false);
  const [aiOutput, setAiOutput] = useState("پاسخی دریافت نشده است");
  const [selectedLine, setSelectedLine] = useState({ name: "", value: "", index: null });
  const [nameError, setNameError] = useState("");
  const [membError, setMembError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [historyShow, setHistoryShow] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const [pointList, setPointList] = useState({ p1: "", p2: "", p3: "", p4: "" });
  const [inputType, setInputType] = useState("معادله");
  const navigate = useNavigate();
  const minHeightForm = isLoggedIn ? "min-h-[241px]" : "min-h-[199px]";
  const [isAnimating, setIsAnimating] = useState(false);
  const historyItems = [
    { lines: [{ name: "S", value: "x^2+y=1" }, { name: "F", value: "x^2+y=1" }], lines_count: "2", date: "04.04.04", index: 0 },
    { lines: [{ name: "S", value: "x^2+y=1" }, { name: "F", value: "x^2+y=1" }], lines_count: "2", date: "04.04.04", index: 0 },
    { lines: [{ name: "S", value: "x^2+y=1" }, { name: "F", value: "x^2+y=1" }], lines_count: "2", date: "04.04.04", index: 0 },
  ];

  useEffect(() => {
    const timeout = setTimeout(() => setIsFirstLoad(false), 50);
    return () => clearTimeout(timeout);
  }, []);

  function handleViewChange(newView) {
    if (newView !== "lines") {
      setSelectedLine({ name: "", value: "", index: null });
    }
    if (newView !== "history") {
      setSelectedHistoryIndex(null);
    }
    if (editMode) {
      setEditMode(false);
      setCurrentLine({ name: "", value: "" });
      setPointList({ p1: "", p2: "", p3: "", p4: "" });
      setMembError("");
    }
  }

  function handleTabChange(type) {
    setInputType(type);
    setPointList({ p1: "", p2: "", p3: "", p4: "" });
    setCurrentLine({ ...currentLine, value: "" });
    setNameError("");
    setMembError("");
  }

  async function addLine(e) {
    e.preventDefault();
    let processedLine = { name: currentLine.name.toUpperCase(), value: "" };

    const data = {
      func: "prosses_eqe",
      input_type: inputType,
      name_eq: currentLine.name.toUpperCase(),
    };

    if (inputType === "معادله") {
      data.eq_input = currentLine.value.replace("X", "x").replace("Y", "y").replace(" ", "");
    } else if (inputType === "نقطه‌ای") {
      data.pt1_x = pointList.p1;
      data.pt1_y = pointList.p2;
      data.pt2_x = pointList.p3;
      data.pt2_y = pointList.p4;
    }

    try {
      const response = await fetch("http://localhost:8000/api/eqe/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.error) {
        setMembError(result.error || "خطا در پردازش داده‌ها");
        return;
      }

      processedLine = {
        name: result.name,
        value: result.input,
        type: result.type,
        info: result.info,
        ...result,
      };
    } catch (error) {
      setMembError("خطا در ارتباط با سرور");
      return;
    }

    if (editMode && currentLine.index !== null) {
      setLines(lines.map((line, index) => (index === currentLine.index ? processedLine : line)));
      setEditMode(false);
    } else {
      setLines([...lines, processedLine]);
      setNumLines(numLines + 1);
    }

    setCurrentLine({ name: "", value: "", index: null });
    setPointList({ p1: "", p2: "", p3: "", p4: "" });
    setMembError("");
    setNameError("");
  }

  function handleDelete(index) {
    setLines(lines.filter((_, i) => i !== index));
    setNumLines(lines.length - 1 || 1);
    if (selectedLine.index === index) {
      if (selectedLine.name === currentLine.name) {
        setCurrentLine({ name: "", value: "", index: null });
        setEditMode(false);
      }
      setSelectedLine({ name: "", value: "", index: null });
    }
  }

  function handleSelectDate(activity, index) {
    if (index === null) {
      setSelectedHistoryIndex(null);
      setLines([]);
      setSelectedLine({ name: "", value: "", index: null });
    } else {
      setSelectedHistoryIndex(index);
    }
  }

  function handleSelect(line, index) {
    if (line === null && index === null) {
      setSelectedLine({ name: "", value: "", index: null });
    } else {
      if (editMode && index !== currentLine.index) {
        setEditMode(false);
        setCurrentLine({ name: "", value: "", index: null });
      }
      setSelectedLine({ name: line["نام خط"], value: line["معادله خط"], index });
      setNameError("");
      setMembError("");
      if (editMode) {
        setCurrentLine({ name: line["نام خط"], value: line["معادله خط"], index });
      }
    }
  }

  function aiRequest() {
    setAibutton(false);
    setAiOutput("درحال دریافت جواب...");

    fetch("http://localhost:8000/api/ai_NLP/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: aiInput,
        section: "line",
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("پاسخی دریافت نشد");
        }
        return res.json();
      })
      .then((data) => {
        if (data.result) {
          setAiOutput(data.result);
          setAibutton(true);
        } else if (data.error) {
          setAiOutput("خطا: " + data.error);
          setAibutton(false);
        } else {
          setAiOutput("پاسخی از هوش مصنوعی دریافت نشد");
          setAibutton(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setAiOutput("⛔ خطا در اتصال به سرور هوش مصنوعی");
        setAibutton(false);
      });
  }

  function send_lines() {
    navigate(`/lines/result/${resultId}`, { state: { lines } });
  }

  function nameErrorCheck(v) {
    if (lines.some((s) => s.name.toUpperCase() === v.toUpperCase()) && !editMode) {
      setNameError("این نام قبلاً استفاده شده");
    } else {
      setNameError("");
    }
  }

  const eqeCheck = async (text) => {
    if (!text) {
      setMembError("");
      return { error: "لطفاً معادله را وارد کنید" };
    }
    try {
      setMembError("");
      const response = await fetch("http://localhost:8000/api/eqe/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          func: "check_eqe",
          input_type: "معادله",
          eq_input: text,
          name_eq: currentLine.name
        }),
      });
      if (!response.ok) {
        throw new Error("خطا در دریافت پاسخ از سرور");
      }
      const data = await response.json();
      if (data.error && data.error !== "None") {
        setMembError(data.error);
        return { error: data.error };
      }
      return data;
    } catch (err) {
      setMembError("خطایی در ارتباط با سرور رخ داد! لطفاً دوباره تلاش کنید");
      return { error: "خطایی در ارتباط با سرور رخ داد" };
    }
  };

  const pointCheck = async () => {
    if (pointList.p1 === "" || pointList.p2 === "" || pointList.p3 === "" || pointList.p4 === "") {
      return {};
    }
    try {
      setMembError("");
      const response = await fetch("http://localhost:8000/api/eqe/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          func: "check_eqe",
          input_type: "نقطه‌ای",
          pt1_y: pointList.p1,
          pt1_x: pointList.p2,
          pt2_y: pointList.p3,
          pt2_x: pointList.p4,
          name_eq: currentLine.name
        }),
      });
      if (!response.ok) {
        throw new Error("خطا در دریافت پاسخ از سرور");
      }
      const data = await response.json();
      if (data.error && data.error !== "None") {
        setMembError(data.error);
        return { error: data.error };
      }
      return data;
    } catch (err) {
      setMembError("خطایی در ارتباط با سرور رخ داد! لطفاً دوباره تلاش کنید");
      return { error: "خطایی در ارتباط با سرور رخ داد" };
    }
  };

  useEffect(() => {
    pointCheck();
  }, [pointList.p1, pointList.p2, pointList.p3, pointList.p4]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
        backdropFilter: "blur(24px) brightness(0.5)",
      }}
      animate={{
        opacity: 1,
        scale: 1,
        backdropFilter: "blur(8px) brightness(1)",
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
      }}
      transition={{ duration: 0.5 }}
      className="relative mx-auto rounded-none lg:rounded-4xl lg:max-w-[1024px] lg:top-30 top-50 shadow-sm shadow-black/20 backdrop-blur-sm backdrop-brightness-200"
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => setIsAnimating(false)}
    >
      <div className="lines text-lg shadow-sm flex flex-wrap lg:flex-nowrap gap-12 p-5 lg:rounded-4xl shadow-black/20 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 w-full">
        <div className="lines-form min-h-[326px] order-2 lg:order-1 w-full mx-auto max-w-[768px] lg:max-w-auto lg:w-7/12 h-full">
          <motion.div
            className="tabs flex gap-2 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <button
              className={classNames(
                "w-1/2 p-2 rounded-lg transition-all duration-300  hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50  disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30",
                inputType === "معادله" ? "bg-blue-950/50 text-white" : "bg-blue-950/30 text-white/70",
              )}
              onClick={() => handleTabChange("معادله")}
              disabled={isAnimating || (editMode && inputType !== "معادله")}
            >
              معادله
            </button>
            <button
              className={classNames(
                "w-1/2 p-2 rounded-lg transition-all duration-300  hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50  disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30",
                inputType === "نقطه‌ای" ? "bg-blue-950/50 text-white" : "bg-blue-950/30 text-white/70",
              )}
              onClick={() => handleTabChange("نقطه‌ای")}
              disabled={isAnimating || editMode}
            >
              نقطه‌ای
            </button>
          </motion.div>
          <form
            onSubmit={addLine}
            className={`p-4 min-h-[${minHeightForm}] rounded-3xl backdrop-blur-sm backdrop-brightness-200 shadow-sm shadow-black/20`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
                initial={isFirstLoad ? false : { borderRadius: 32, opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ borderRadius: 32, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}

              >
                <div className="set-name-form mt-5 gap-4 flex flex-wrap">
                  <div className="input gap-4 w-full flex items-center">
                    <span className="w-1/2 text-white text-shadow-sm text-shadow-black/40">
                      نام خط {editMode && currentLine.index !== null ? currentLine.index + 1 : numLines} :
                    </span>
                    <input
                      type="text"
                      maxLength={1}
                      value={currentLine.name.toUpperCase()}
                      placeholder={`نام خط ${editMode && currentLine.index !== null ? currentLine.index + 1 : numLines}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[a-zA-Z]*$/.test(value)) {
                          setCurrentLine({ ...currentLine, name: value });
                          nameErrorCheck(value);
                        } else {
                          setNameError("از یک حرف انگلیسی فقط می‌توان استفاده نمود");
                        }
                      }}
                      className={classNames(
                        "text-lg transform text-white duration-500 w-full p-2 shadow-sm shadow-black/30 rounded-lg focus-visible:shadow focus-visible:shadow-lg focus-visible:shadow-black/40 focus-visible:scale-102 focus-visible:outline-0",
                        { "shadow-red-700 focus-visible:shadow-red-700": nameError }
                      )}
                    />
                  </div>
                  <span
                    className={classNames(
                      "input-error text-red-700 text-shadow-sm text-shadow-black/20 overflow-auto w-full transition collapse opacity-0 duration-500",
                      { "visible mb-4 opacity-100": nameError }
                    )}
                  >
                    {nameError}
                  </span>
                </div>
                <AnimatePresence mode="wait">

                {inputType === "معادله" ? (
                  <motion.div
                    key={"eq"}
                    initial={isFirstLoad ? false : { borderRadius: 32, opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ borderRadius: 32, opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    onAnimationStart={() => setIsAnimating(true)}
                    onAnimationComplete={() => setIsAnimating(false)}
                   className="set-memb-form gap-4 flex flex-wrap">
                    <div className="input gap-4 w-full flex items-center">
                      <span className="w-1/2 text-white text-shadow-sm text-shadow-black/40">
                        معادله خط {editMode && currentLine.index !== null ? currentLine.index + 1 : numLines} :
                      </span>
                      <input
                        type="text"
                        value={currentLine.value}
                        placeholder={`معادله خط ${editMode && currentLine.index !== null ? currentLine.index + 1 : numLines}`}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setCurrentLine({ ...currentLine, value: newValue });
                          eqeCheck(newValue);
                        }}
                        className={classNames(
                          "text-lg math-input transform w-full duration-500 text-white p-2 shadow-sm shadow-black/30 rounded-lg focus-visible:shadow focus-visible:shadow-lg focus-visible:shadow-black/40 focus-visible:scale-102 focus-visible:outline-0",
                          { "shadow-red-700 focus-visible:shadow-red-700": membError }
                        )}
                      />
                    </div>
                    <span
                      className={classNames(
                        "input-error text-red-700 text-shadow-sm text-shadow-black/20 overflow-auto w-full transition collapse opacity-0 duration-500",
                        { "visible mb-4 opacity-100": membError }
                      )}
                    >
                      {membError}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key={"point"}
                    initial={isFirstLoad ? false : { borderRadius: 32, opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ borderRadius: 32, opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    onAnimationStart={() => setIsAnimating(true)}
                    onAnimationComplete={() => setIsAnimating(false)}
                    className="set-point-form gap-4 flex flex-wrap">
                    <div className="points gap-4 w-full flex flex-wrap">
                      <div className="point-pair flex gap-2 w-full">
                        <div className="w-1/2">
                          <input
                            type="number"
                            value={pointList.p2}
                            placeholder="x₁"
                            onChange={(e) => {
                              setPointList({ ...pointList, p2: e.target.value });
                            }}
                            className={classNames(
                              "text-lg transform text-white duration-500 w-full p-2 shadow-sm shadow-black/30 rounded-lg focus-visible:shadow focus-visible:shadow-lg focus-visible:shadow-black/40 focus-visible:scale-102 focus-visible:outline-0",
                              { "shadow-red-700 focus-visible:shadow-red-700": membError }
                            )}
                          />
                        </div>
                        <div className="w-1/2">
                          <input
                            type="number"
                            value={pointList.p1}
                            placeholder="y₁"
                            onChange={(e) => {
                              setPointList({ ...pointList, p1: e.target.value });
                            }}
                            className={classNames(
                              "text-lg transform text-white duration-500 w-full p-2 shadow-sm shadow-black/30 rounded-lg focus-visible:shadow focus-visible:shadow-lg focus-visible:shadow-black/40 focus-visible:scale-102 focus-visible:outline-0",
                              { "shadow-red-700 focus-visible:shadow-red-700": membError }
                            )}
                          />
                        </div>
                      </div>
                      <div className="point-pair flex gap-2 w-full">
                        <div className="w-1/2">
                          <input
                            type="number"
                            value={pointList.p4}
                            placeholder="x₂"
                            onChange={(e) => {
                              setPointList({ ...pointList, p4: e.target.value });
                            }}
                            className={classNames(
                              "text-lg transform text-white duration-500 w-full p-2 shadow-sm shadow-black/30 rounded-lg focus-visible:shadow focus-visible:shadow-lg focus-visible:shadow-black/40 focus-visible:scale-102 focus-visible:outline-0",
                              { "shadow-red-700 focus-visible:shadow-red-700": membError }
                            )}
                          />
                        </div>
                        <div className="w-1/2">
                          <input
                            type="number"
                            value={pointList.p3}
                            placeholder="y₂"
                            onChange={(e) => {
                              setPointList({ ...pointList, p3: e.target.value });
                            }}
                            className={classNames(
                              "text-lg transform text-white duration-500 w-full p-2 shadow-sm shadow-black/30 rounded-lg focus-visible:shadow focus-visible:shadow-lg focus-visible:shadow-black/40 focus-visible:scale-102 focus-visible:outline-0",
                              { "shadow-red-700 focus-visible:shadow-red-700": membError }
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    <span
                      className={classNames(
                        "input-error text-red-700 text-shadow-sm text-shadow-black/20 overflow-auto w-full transition collapse opacity-0 duration-500",
                       { "visible mb-4 opacity-100": membError }
                      )}
                    >
                      {membError}
                    </span>
                  </motion.div >
                )}
                </AnimatePresence>
                <div className="flex gap-4">
                  <AnimatePresence mode="wait">
                    {isLoggedIn && !historyShow && (
                      <motion.button
                        key="showHistoryOff"
                        initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        type="button"
                        onClick={() => {
                          handleViewChange("history");
                          setHistoryShow(true);
                          setShowAi(false);
                        }}
                        className="w-full transform duration-500 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 rounded-lg disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30"
                        disabled={isAnimating}
                      >
                        <span className="flex gap-2 justify-center items-center">
                          <span>فعالیت ها</span>
                          <i className="fa-solid fa-rectangle-history-circle-user" aria-hidden="true"></i>
                        </span>
                      </motion.button>
                    )}
                    {historyShow && isLoggedIn && (
                      <motion.button
                        key="showHistoryOn"
                        initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        type="button"
                        onClick={() => {
                          handleViewChange("lines");
                          setHistoryShow(false);
                        }}
                        className="w-full transform duration-500 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 rounded-lg disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30"
                        disabled={isAnimating}
                      >
                        <i className="fa-light fa-xmark-large text-xl"></i>
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    {!editMode && !isLoggedIn && (
                      <motion.button
                        key="editOff"
                        initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        type="submit"
                        className="w-full transform duration-500 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 rounded-lg disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30"
                        disabled={!currentLine.name || (inputType === "معادله" ? !currentLine.value : (!pointList.p1 || !pointList.p2 || !pointList.p3 || !pointList.p4)) || membError || nameError}
                      >
                        ثبت خط
                      </motion.button>
                    )}
                    {editMode && !isLoggedIn && (
                      <motion.button
                        key="editOn"
                        initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        type="submit"
                        className="w-full transform duration-500 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 rounded-lg disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30"
                        disabled={!currentLine.name || (inputType === "معادله" ? !currentLine.value : (!pointList.p1 || !pointList.p2 || !pointList.p3 || !pointList.p4)) || membError || nameError}
                      >
                        ویرایش خط
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    {!showAi && (
                      <motion.button
                        key="aiOff"
                        initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        type="button"
                        className="w-full transform duration-500 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 rounded-lg disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30"
                        onClick={() => {
                          handleViewChange("nlp");
                          setShowAi(true);
                          setHistoryShow(false);
                        }}
                        disabled={isAnimating}
                      >
                        <i className="fa-solid animate-bounce fa-sparkles text-xl"></i>
                      </motion.button>
                    )}
                    {showAi && (
                      <motion.button
                        key="aiOn"
                        initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        type="button"
                        className="w-full transform duration-500 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 rounded-lg disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30"
                        onClick={() => {
                          handleViewChange("lines");
                          setShowAi(false);
                        }}
                        disabled={isAnimating}
                      >
                        <i className="fa-light fa-xmark-large text-xl"></i>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-3">
                  <AnimatePresence mode="wait">
                    {!editMode && isLoggedIn && (
                      <motion.button
                        key="editOff"
                        initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        type="submit"
                        className="w-full transform duration-500 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 rounded-lg disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30"
                        disabled={!currentLine.name || (inputType === "معادله" ? !currentLine.value : (!pointList.p1 || !pointList.p2 || !pointList.p3 || !pointList.p4)) || membError || nameError}
                      >
                        ثبت خط
                      </motion.button>
                    )}
                    {editMode && isLoggedIn && (
                      <motion.button
                        key="editOn"
                        initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        type="submit"
                        className="w-full transform duration-500 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 rounded-lg disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30"
                        disabled={!currentLine.name || (inputType === "معادله" ? !currentLine.value : (!pointList.p1 || !pointList.p2 || !pointList.p3 || !pointList.p4)) || membError || nameError}
                      >
                        ویرایش خط
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>
          </form>
          <div className="set-final-btn w-full mt-4 p-4 rounded-3xl backdrop-blur-sm backdrop-brightness-200 shadow-sm shadow-black/20">
            <button
              type="button"
              className="w-full transform duration-500 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30 p-2.5 rounded-lg"
              disabled={lines.length === 0}
              onClick={send_lines}
            >
              پردازش خطوط
            </button>
            <AnimatePresence mode="wait">
              {!editMode && (
                <AnimatePresence mode="wait">
                  {selectedHistoryIndex !== null ? (
                    <motion.button
                      key="loadHistory"
                      initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      type="button"
                      className="w-full transform duration-500 mt-3 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 rounded-lg"
                      onClick={() => {
                        if (selectedHistoryIndex !== null) {
                          const selectedHistoryLines = historyItems[selectedHistoryIndex]?.lines || [];
                          setLines(selectedHistoryLines.map((s) => ({ name: s.name, value: s.value })));
                          handleViewChange("lines");
                          setHistoryShow(false);
                          setNumLines(selectedHistoryLines.length + 1);
                        }
                      }}
                    >
                      بارگذاری فعالیت
                    </motion.button>
                  ) : (
                    <motion.button
                      key="editSet"
                      initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      type="button"
                      className="w-full transform duration-500 mt-3 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30 rounded-lg"
                      disabled={selectedLine.name === "" || isAnimating}
                      onClick={() => {
                        setCurrentLine({ ...selectedLine });
                        setEditMode(true);
                      }}
                    >
                      ویرایش خط انتخاب شده
                    </motion.button>
                  )}
                </AnimatePresence>
              )}
              {editMode && (
                <motion.button
                  key="cancel"
                  initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  type="button"
                  className="w-full transform duration-500 mt-3 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30 rounded-lg"
                  onClick={() => {
                    setCurrentLine({ name: "", value: "", index: null });
                    setPointList({ p1: "", p2: "", p3: "", p4: "" });
                    setEditMode(false);
                  }}
                  disabled={isAnimating}
                >
                  لغو ویرایش
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {!showAi && !historyShow && (
            <motion.div
              key="lines-table"
              initial={isFirstLoad ? false : { borderRadius: 32, opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ borderRadius: 32, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="lines-table w-full mx-auto p-2 lg:order-2 h-100 lg:h-auto max-w-[768px] lg:w-7/12 lg:min-w-7/12 rounded-3xl backdrop-blur-sm backdrop-brightness-200 shadow-sm shadow-black/20"
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationComplete={() => setIsAnimating(false)}
            >
              <AnimatePresence mode="wait">
                {lines.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full text-white text-shadow-sm text-shadow-black/30 flex items-center justify-center text-center"
                  >
                    <span>هیچ خطی وارد نشده است</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="table"
                    initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <DataTable
                      data={lines.map((item) => ({ "نام خط": item.name.toUpperCase(), "معادله خط": item.value }))}
                      showDelete={true}
                      onDelete={handleDelete}
                      onSelect={handleSelect}
                      maxHeight={326}
                      enablePagination={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          {!showAi && historyShow && (
            <motion.div
              key="history-table"
              initial={isFirstLoad ? false : { borderRadius: 32, opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ borderRadius: 32, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="lines-table w-full mx-auto p-2 lg:order-2 h-100 lg:h-auto max-w-[768px] lg:w-7/12 lg:min-w-7/12 rounded-3xl backdrop-blur-sm backdrop-brightness-200 shadow-sm shadow-black/20"
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationComplete={() => setIsAnimating(false)}
            >
              <AnimatePresence mode="wait">
                {historyItems.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full text-white text-shadow-sm text-shadow-black/30 flex items-center justify-center text-center"
                  >
                    <span>هیچ فعالیتی ثبت نشده است</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="table"
                    initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <DataTable
                      data={historyItems.map((item) => ({
                        "خطوط": item.lines.map((dict) => dict.name),
                        "تعداد خطوط": item.lines_count,
                        تاریخ: item.date,
                      }))}
                      showDelete={false}
                      onSelect={handleSelectDate}
                      maxHeight={326}
                      enablePagination={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          {showAi && !historyShow && (
            <motion.div
              key="lines-ai"
              initial={{ borderRadius: 32, opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ borderRadius: 32, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="lines-ai w-full min-h-[326px] lg:order-2 mx-auto max-w-[768px] lg:w-7/12 lg:min-w-7/12 rounded-3xl backdrop-blur-sm backdrop-brightness-200 shadow-sm shadow-black/20"
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationComplete={() => setIsAnimating(false)}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  aiRequest();
                }}
                className="p-5 content-between h-full flex flex-wrap w-full"
              >
                <div className="ai-input-form gap-4 w-full flex flex-wrap">
                  <span className="text-white text-shadow-sm h-1/12 content-start text-shadow-black/40">
                    خط خود را توصیف کنید :
                  </span>
                  <textarea
                    type="text"
                    rows={5}
                    value={aiInput}
                    placeholder="خط خود را توصیف کنید :"
                    onChange={(e) => setAiInput(e.target.value)}
                    className="text-lg text-white transform duration-500 w-full p-2 shadow-sm shadow-black/30 rounded-2xl focus-visible:shadow focus-visible:shadow-lg focus-visible:shadow-black/40 focus-visible:scale-102 focus-visible:outline-0"
                  />
                </div>
                <p className="w-full mt-4 text-xl text-center overflow-auto">{aiOutput}</p>
                <div className="ai-lines-btn w-full flex-end max-h-[42px] flex mt-4 gap-4 mx-4">
                  <button
                    type="submit"
                    className="w-full transform duration-500 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 rounded-lg"
                  >
                    ارسال
                  </button>
                  <button
                    type="button"
                    className="w-full transform duration-500 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 rounded-lg disabled:hover:bg-blue-950/30 disabled:hover:shadow disabled:hover:scale-100 disabled:blur-[1.5px]"
                    disabled={!aiButton}
                    onClick={() => setCurrentLine({ name: currentLine.name, value: aiOutput })}
                  >
                    تایید پاسخ
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}