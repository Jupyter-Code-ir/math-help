import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import DataTable from "./table";

function transformLineData(lines) {
  return lines.map((line) => {
    const row = {
      "نام خط": line.name ?? "-",
      "معادله": line.input ?? "-",
    };

    if (line.type === "general" || line.type === "quadratic") {
      row["شیب خط"] = "-";
      row["عرض از مبدا"] = "-";
      row["طول از مبدا"] = "-";
      row["a"] = line.a != null ? line.a : "-";
      row["b"] = line.b_coef != null ? line.b_coef : "-";
      row["c"] = line.c != null ? line.c : "-";

      if (line.type === "general") {
        const { a, b_coef, c } = line;
        if (
          a != null &&
          b_coef != null &&
          c != null &&
          (a ** 2 + b_coef ** 2 !== 0)
        ) {
          const delta = Math.abs(c) / Math.sqrt(a ** 2 + b_coef ** 2);
          row["△/دلتا"] = delta.toFixed(2);
        } else {
          row["△/دلتا"] = "-";
        }
      } else {
        row["△/دلتا"] = line.delta != null ? line.delta.toFixed(2) : "-";
      }
    } else {
      const m = line.m;
      const b = line.b;
      row["شیب خط"] = m != null ? m.toFixed(2) : "-";
      row["عرض از مبدا"] = b != null ? b.toFixed(2) : "-";
      if (m != null && b != null) {
        const distance = Math.abs(b) / Math.sqrt(m ** 2 + 1);
        row["طول از مبدا"] = distance.toFixed(2);
      } else {
        row["طول از مبدا"] = "-";
      }
      row["a"] = "-";
      row["b"] = "-";
      row["c"] = "-";
      row["△/دلتا"] = "-";
    }

    return row;
  });
}

export default function lineResult() {
  const { state } = useLocation();
  const LineData = state.data;
  const [selectedLine, setSelectedLine] = useState(null);
  const [linesPlot, setLinesPlot] = useState([]);
  const [plot, setPlot] = useState();
  const [selectedTab, setSelectedTab] = useState("lines");
  const [isAnimating, setIsAnimating] = useState(false);

  function handleSelect(line, index) {
    if (line === null && index === null) {
      setSelectedLine(null);
    } else {
      setSelectedLine(index);
    }
  }

  function handleDeleteLine(index) {
    setLinesPlot((prev) => prev.filter((_, i) => i !== index));
    if (selectedLine === index) {
      setSelectedLine(null);
    }
  }

  useEffect(() => {
    if (linesPlot.length === 0) {
      setPlot(null);
      return;
    }
    const sendRequestVen = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/eqe/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            func: "نمودار",
            equations: linesPlot,
          }),
        });
        if (!response.ok) throw new Error(`خطا: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setPlot(data.chart_url);
      } catch (err) {
        console.error(err);
      }
    };
    sendRequestVen();
  }, [linesPlot]);

  return (
    <motion.div
      initial={{
        borderRadius: 32,
        opacity: 0,
        scale: 0.9,
        backdropFilter: "blur(24px) brightness(0.5)",
      }}
      animate={{
        opacity: 1,
        scale: 1,
        backdropFilter: "blur(8px) brightness(1)",
      }}
      exit={{ borderRadius: 32, opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-[500px] mx-auto gap-5 p-4 lg:max-w-[1024px] lg:top-30 top-50 rounded-4xl shadow-black/20 bg-blue-950/5 backdrop-blur-sm backdrop-brightness-200 w-full"
    >
      <div className="flex min-w-1/2 w-1/2 gap-5 flex-col lg:flex-row items-center justify-center">
        <div className="h-full items-center justify-center shadow-sm flex flex-col p-5 rounded-4xl shadow-black/20 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 w-full">
          <div className="mx-auto p-3 mt-3 justify-center mb-4 w-fit relative right-[0px] text-lg shadow-sm flex p-1 rounded-4xl shadow-black/20 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200">
            <button
              type="button"
              className="shadow-black/20 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-full disabled:bg-blue-950/50 disabled:scale-90"
              disabled={selectedTab === "lines" || isAnimating}
              onClick={() => setSelectedTab("lines")}
            >
              <span>خطوط ثبت شده</span>
            </button>
            <button
              type="button"
              className="shadow-black/20 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-full disabled:bg-blue-950/50 disabled:scale-90"
              disabled={selectedTab === "plotted" || isAnimating}
              onClick={() => setSelectedTab("plotted")}
            >
              <span>خطوط رسم شده</span>
            </button>
          </div>
          <AnimatePresence mode="wait">
            {selectedTab === "lines" && (
              <motion.div
                key="lines"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
                className="h-full w-full items-center justify-center shadow-sm flex flex-col p-5 rounded-xl shadow-black/20 bg-blue-950/30 backdrop-blur-sm backdrop-brightness-200"
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
              >
                <p className="text-white mb-4 text-xl text-shadow-sm text-shadow-black/20 w-100 text-center">
                  خطوط ثبت شده
                </p>
                <DataTable
                  data={transformLineData(LineData)}
                  enablePagination={false}
                  showDelete={false}
                  maxW={200}
                  maxHeight={400}
                  onSelect={handleSelect}
                />
                <div className="select_button mt-4">
                  <button
                    type="button"
                    className="w-full transform duration-500 shadow bg-blue-950/30 hover:shadow-lg hover:scale-102 text-white hover:bg-blue-950/50 shadow-black/40 p-2.5 rounded-lg disabled:blur-[1.5px] disabled:hover:shadow disabled:hover:scale-100 disabled:hover:bg-blue-950/30"
                    disabled={selectedLine === null}
                    onClick={() => {
                      const sel = LineData[selectedLine];
                      setLinesPlot((prev) =>
                        prev.some((l) => l.name === sel.name)
                          ? prev
                          : [...prev, sel]
                      );
                    }}
                  >
                    افزودن خط برای نمایش در نمودار
                  </button>
                </div>
              </motion.div>
            )}
            {selectedTab === "plotted" && (
              <motion.div
                key="plotted"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
                className="h-full w-full items-center justify-center shadow-sm flex flex-col p-5 rounded-xl shadow-black/20 bg-blue-950/30 backdrop-blur-sm backdrop-brightness-200"
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
              >
                <p className="text-white mb-4 text-xl text-shadow-sm text-shadow-black/20 w-100 text-center">
                  خطوط رسم شده
                </p>
                {linesPlot.length > 0 ? (
                  <DataTable
                    data={transformLineData(linesPlot)}
                    enablePagination={false}
                    showDelete={true}
                    maxW={200}
                    maxHeight={400}
                    onDelete={handleDeleteLine}
                    onSelect={handleSelect}
                  />
                ) : (
                  <p className="text-white text-center">ابتدا خط را انتخاب کنید</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex w-full gap-5 flex-col lg:flex-row items-center justify-center">
        <div className="h-full text-lg shadow-sm flex flex-wrap lg:flex-nowrap gap-12 p-5 rounded-4xl shadow-black/20 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 w-full">
          <AnimatePresence mode="wait">
            {plot ? (
              <motion.img
                key="plot"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7 }}
                src={plot}
                alt="Plot Diagram"
                className="max-w-full h-auto rounded-4xl shadow-md p-2 backdrop-blur-2xl"
              />
            ) : (
              <motion.p
                key="no-plot"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7 }}
                className="text-white w-full h-full flex items-center justify-center text-shadow-sm text-shadow-black/20 text-lg"
              >
                ابتدا خط را انتخاب کنید
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}