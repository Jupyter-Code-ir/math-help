import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import DataTable from "./table";
import classNames from "classnames";
import { set } from "lodash";

export default function SetResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const setData = state?.data || {};
  const [selectedSetKey, setSelectedSetKey] = useState(
    Object.keys(setData).length > 0 ? Object.keys(setData)[0] : null
  );
  const [subsets, setSubsets] = useState([]);
  const [partitions, setPartitions] = useState([]);
  const [subsetOffset, setSubsetOffset] = useState(0);
  const [partOffset, setPartOffset] = useState(0);
  const [hasMoreSubset, setHasMoreSubset] = useState(false);
  const [hasMorePart, setHasMorePart] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTabSet, setSelectedTabSet] = useState("subset");
  const [selectedTabSets, setSelectedTabSets] = useState("ven");
  const [isLoading, setIsLoading] = useState(false);
  const [subsetPageIndex, setSubsetPageIndex] = useState(0);
  const [partPageIndex, setPartPageIndex] = useState(0);
  const [groupNumberSub, setGroupNumberSub] = useState(0);
  const [groupNumberPar, setGroupNumberPar] = useState(0);
  const [calcTextIn, setCalcTextIn] = useState("");
  const [calcTextOut, setCalcTextOut] = useState("");
  const [calcError, setCalcError] = useState("");
  const [venData, setVenData] = useState({ image: null, region: null });
  const [info, setInfo] = useState({});
  const [isAnimatingSetKey, setIsAnimatingSetKey] = useState(false);  
  const [isAnimatingTabSets, setIsAnimatingTabSets] = useState(false);
  const [loadMoreFlag, setLoadMoreFlag] = useState(false);
  const limit = 5000;

  const formatData = (data, dataType = "subset") => {
    let baseIndex = 0;
    if (dataType === "info") {
      if (!data.subsets_info) {
        return [];
      }
      const setNames = Object.keys(data.subsets_info);
      const tableData = setNames.map((setName) => {
        const row = { "نام مجموعه": setName };
        setNames.forEach((otherSet) => {
          if (setName === otherSet) {
            row[otherSet] = "خود";
          } else {
            row[otherSet] = data.subsets_info[setName][otherSet] ? "✓" : "✗";
          }
        });
        return row;
      });
      return tableData;
    }
    if (!data || typeof data !== "object") {
      return [];
    }
    if (dataType === "part") {
      if (!Array.isArray(data)) {
        return [];
      }
      return data.map((item, index) => ({
        شماره: index + 1 + groupNumberPar * limit,
        نوع: `افراز ${index + 1 + groupNumberPar * limit}`,
        اعضا: Array.isArray(item) ? item.join(", ") : String(item || ""),
      }));
    }
    return Object.keys(data).flatMap((key, groupIndex) => {
      const group = data[key];
      if (!Array.isArray(group)) {
        return [];
      }
      const result = group.map((item, index) => ({
        شماره: baseIndex + index + 1 + groupNumberSub * limit,
        نوع: `${key}`,
        اعضا: Array.isArray(item) ? item.join(", ") : String(item || ""),
      }));
      baseIndex += group.length;
      return result;
    });
  };

  useEffect(() => {
    const sendRequestVen = async () => {
      if (venData.image) return; 
      try {
        setError(null);
        const response = await fetch("http://localhost:8000/api/set/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            func: "ven",
            set: state?.sets || [],
          }),
        });
        if (!response.ok) throw new Error(`خطا: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setVenData({ image: data.ven_url, region: data.region });
      } catch (error) {
        setError(`خطا: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    const sendRequestInfo = async () => {
      if (Object.keys(info).length > 0) return;
      try {
        setError(null);
        const response = await fetch("http://localhost:8000/api/set/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            func: "other_info",
            set: state?.sets || [],
          }),
        });
        if (!response.ok) throw new Error(`خطا: ${response.status}`);
        const data = await response.json();
        setInfo(data);
      } catch (error) {
        setError(`خطا: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    if (selectedTabSets === "ven") {
      sendRequestVen();
    } else if (selectedTabSets === "otherInfo") {
      sendRequestInfo();
    }
  }, [selectedTabSets]);

  useEffect(() => {
    const sendRequestParsub = async () => {
      if (!loadMoreFlag && (subsets.length > 0 && partitions.length > 0)) return;
      setIsLoading(true);
      try {
        
        setError(null);
        const offset = selectedTabSet === "subset" ? subsetOffset : partOffset;
        const response = await fetch("http://localhost:8000/api/set/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            func: "parsub",
            set: state?.sets || [],
            key: selectedSetKey,
            offset: offset,
            limit: limit,
            type: selectedTabSet,
          }),
        });
        if (!response.ok) throw new Error(`خطا: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        if (selectedTabSet === "subset") {
          setSubsets((prev) => [...prev, ...formatData(data.subset)]);
          setHasMoreSubset(data.has_more_subset);
        } else {
          setPartitions((prev) => [...prev, ...formatData(data.part, "part")]);
          setHasMorePart(data.has_more_part);
        }
      } catch (error) {
        setError(`خطا: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    if (selectedSetKey) {
      sendRequestParsub();
      setLoadMoreFlag(false);
    }
  }, [selectedSetKey, subsetOffset, partOffset, selectedTabSet]);

  const loadMore = () => {
    if (selectedTabSet === "subset") {
      setSubsetOffset((prev) => prev + limit);
      setGroupNumberSub(groupNumberSub + 1);
    } else {
      setPartOffset((prev) => prev + limit);
      setGroupNumberPar(groupNumberPar + 1);
    }
    setLoadMoreFlag(true)
  };

  const calcCheck = async (text) => {
    setCalcTextIn(text);
    if (!text) {
      setCalcError("");
      return;
    }
    try {
      setCalcError("");
      const response = await fetch("http://localhost:8000/api/set/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          func: "calc_check",
          text: text,
          set: state?.sets || [],
        }),
      });
      if (!response.ok) {
        throw new Error("خطا در دریافت پاسخ از سرور");
      }
      const data = await response.json();
      if (data.error && data.error !== "None") {
        setCalcError(data.error);
      } else {
        setCalcError("");
      }
    } catch (err) {
      setCalcError("خطایی در ارتباط با سرور رخ داد! لطفاً دوباره تلاش کنید");
    }
  };

  const calc = async () => {
    if (!calcTextIn || calcError) {
      setCalcError(calcTextIn ? calcError : "لطفاً عبارت معتبر وارد کنید");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/api/set/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          func: "calc",
          text: calcTextIn,
          set: state?.sets || [],
        }),
      });
      if (!response.ok) {
        throw new Error("خطا در دریافت پاسخ از سرور");
      }
      const data = await response.json();
      setCalcTextOut(data);
    } catch (err) {
      setCalcError("خطایی در محاسبه رخ داد! لطفاً دوباره تلاش کنید");
    }
  };

  const handleUnionClick = () => {
    const newText = calcTextIn + "∪";
    calcCheck(newText);
  };

  const handleIntersectionClick = () => {
    const newText = calcTextIn + "∩";
    calcCheck(newText);
  };

  const handlePageIndexChange = (pageIndex, tab) => {
    if (tab === "subset") {
      setSubsetPageIndex(pageIndex);
    } else if (tab === "part") {
      setPartPageIndex(pageIndex);
    }
  };

  const calcTableData = (state?.sets || []).map((item) => ({
    "نام مجموعه": item.name,
    "اعضای مجموعه": item.value,
  }));

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
      className="relative flex mx-auto gap-5 p-4 lg:max-w-[1024px] lg:top-30 top-50 rounded-4xl shadow-black/20 bg-blue-950/5 backdrop-blur-sm backdrop-brightness-200 w-full"
      onAnimationStart={() => {
        setIsAnimatingSetKey(true);
        setIsAnimatingTabSets(true);
      }}
      onAnimationComplete={() => {
        setIsAnimatingSetKey(false);
        setIsAnimatingTabSets(false);
      }}
    >
      <style>{spinnerStyles}</style>
      {Object.keys(setData).length > 1 && (
        <div className="hidden lg:inline-block">
          <ul className="sets-button p-2 hidden lg:flex relative right-[0px] text-lg shadow-sm flex-wrap flex-col p-1 rounded-4xl shadow-black/20 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200">
            {Object.keys(setData).map((key) => (
              <li key={key} className="m-1">
                <button
                  type="button"
                  className="shadow-black/20 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-full disabled:bg-blue-950/50 disabled:scale-90"
                  disabled={selectedSetKey === key || isAnimatingSetKey} 
                  onClick={() => {
                    setSelectedSetKey(key);
                    setSubsets([]);
                    setPartitions([]);
                    setSubsetOffset(0);
                    setPartOffset(0);
                    setSubsetPageIndex(0);
                    setPartPageIndex(0);
                  }}
                >
                  {key}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex w-full gap-5 flex-col lg:flex-row items-center justify-center">
        {Object.keys(setData).length > 1 && (
          <div className="w-fit mx-auto">
            <ul className="sets-button  w-fit p-2 relative right-[0px] text-lg shadow-sm flex lg:hidden p-1 rounded-4xl shadow-black/20 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200">
              {Object.keys(setData).map((key) => (
                <li key={key} className="m-1">
                  <button
                    type="button"
                    className="shadow-black/20 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-full disabled:bg-blue-950/50 disabled:scale-90"
                    disabled={selectedSetKey === key || isAnimatingSetKey}
                    onClick={() => {
                      setSelectedSetKey(key);
                      setSubsets([]);
                      setPartitions([]);
                      setSubsetOffset(0);
                      setPartOffset(0);
                      setSubsetPageIndex(0);
                      setPartPageIndex(0);
                    }}
                  >
                    {key}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <AnimatePresence mode="wait">
          {selectedSetKey && (
            <motion.div
              key={selectedSetKey}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="set text-lg lg:max-w-1/2 lg:min-w-1/2 shadow-sm flex flex-col gap-5 p-5 rounded-4xl shadow-black/20 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 w-full"
              onAnimationStart={() => setIsAnimatingSetKey(true)} 
              onAnimationComplete={() => setIsAnimatingSetKey(false)} 
            >
              <div className="text-lg justify-center text-white items-center shadow-sm flex max-h-1/7 w-full gap-12 p-5 rounded-4xl shadow-black/20 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200">
                <span className="text-nowrap">نام مجموعه: {selectedSetKey}</span>
                <span className="overflow-x-auto text-nowrap inline-block max-w-1/3">
                  اعضای مجموعه: {setData[selectedSetKey]?.memb || ""}
                </span>
                <span className="overflow-x-auto text-nowrap inline-block max-w-1/3">
                  تعداد اعضای مجموعه: {setData[selectedSetKey]?.number || 0}
                </span>
              </div>
              <div className="w-full mx-auto lg:order-2 lg:h-auto rounded-3xl backdrop-blur-sm backdrop-brightness-200 shadow-sm shadow-black/20">
                <div className="mx-auto p-3 mt-3 justify-center mb-4 w-fit relative right-[0px] text-lg shadow-sm flex p-1 rounded-4xl shadow-black/20 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200">
                  <button
                    type="button"
                    className="shadow-black/20 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-full disabled:bg-blue-950/50 disabled:scale-90"
                    disabled={selectedTabSet === "subset" } 
                    onClick={() => setSelectedTabSet("subset")}
                  >
                    <span>زیر مجموعه‌ها</span>
                  </button>
                  <button
                    type="button"
                    className="shadow-black/20 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-full disabled:bg-blue-950/50 disabled:scale-90"
                    disabled={selectedTabSet === "part" } 
                    onClick={() => setSelectedTabSet("part")}
                  >
                    <span>افرازها</span>
                  </button>
                </div>
                <div className="flex justify-center my-5">
                  <button
                    type="button"
                    className="shadow-black/20 rounded-full hover:scale-105 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-lg disabled:blur-xs disabled:scale-90"
                    onClick={loadMore}
                    disabled={
                      (selectedTabSet === "subset" && !hasMoreSubset) ||
                      (selectedTabSet === "part" && !hasMorePart) 
                       
                    }
                  >
                    بارگذاری بیشتر
                  </button>
                </div>
                <AnimatePresence mode="sync">
                  {error && (
                    <motion.div
                      key={"error"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-center"
                    >
                      {error}
                    </motion.div>
                  )}
                  {isLoading && (
                    <motion.div
                      key={"load"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center"
                    >
                      <div className="spinner"></div>
                    </motion.div>
                  )}
                  {selectedTabSet === "subset" && subsets.length > 0 && (
                    <DataTable
                      data={subsets}
                      showDelete={false}
                      maxHeight={300}
                      defaultPageIndex={subsetPageIndex}
                      onPageIndexChange={(pageIndex) => handlePageIndexChange(pageIndex, "subset")}
                    />
                  )}
                  {selectedTabSet === "part" && partitions.length > 0 && (
                    <DataTable
                      data={partitions}
                      showDelete={false}
                      maxHeight={300}
                      defaultPageIndex={partPageIndex}
                      onPageIndexChange={(pageIndex) => handlePageIndexChange(pageIndex, "part")}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="sets h-full text-lg shadow-sm flex flex-wrap content-start p-5 rounded-4xl shadow-black/20 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 w-full">
          <div className="mx-auto gap-2 h-fit p-3 mt-3 justify-center mb-4 w-fit relative right-[0px] text-lg shadow-sm flex p-1 rounded-4xl shadow-black/20 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200">
            <button
              type="button"
              className="shadow-black/20 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-full disabled:bg-blue-950/50 disabled:scale-90"
              disabled={selectedTabSets === "ven" || isAnimatingTabSets} 
              onClick={() => setSelectedTabSets("ven")}
            >
              <span>نمودار ون</span>
            </button>
            <button
              type="button"
              className="shadow-black/20 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-full disabled:bg-blue-950/50 disabled:scale-90"
              disabled={selectedTabSets === "calc" || isAnimatingTabSets} 
              onClick={() => setSelectedTabSets("calc")}
            >
              <span>محاسبات</span>
            </button>
            {Object.keys(setData).length > 1 && (
              <button
                type="button"
                className="shadow-black/20 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-full disabled:bg-blue-950/50 disabled:scale-90"
                disabled={selectedTabSets === "otherInfo" || isAnimatingTabSets}  
                onClick={() => setSelectedTabSets("otherInfo")}
              >
                <span>اطلاعات دیگر</span>
              </button>
            )}
          </div>
          <AnimatePresence mode="wait">
            {selectedTabSets === "ven" && (
              <motion.div
                key="ven"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col items-center"
                onAnimationStart={() => setIsAnimatingTabSets(true)}  
                onAnimationComplete={() => setIsAnimatingTabSets(false)}  
              >
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center items-center"
                  >
                    <div className="spinner"></div>
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-center"
                  >
                    {error}
                  </motion.div>
                )}
                  <div className="flex flex-col items-center gap-5">
                    <img

                      src={venData.image}
                      alt="Venn Diagram"
                      className="max-w-full h-auto rounded-4xl shadow-md bg-blue-950/30"
                    />
                    {console.log(venData.region)}
                  </div>
              </motion.div>
            )}
            {selectedTabSets === "calc" && (
              <motion.div
                key="calc"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col items-stretch "
                onAnimationStart={() => setIsAnimatingTabSets(true)}  
                onAnimationComplete={() => setIsAnimatingTabSets(false)}  
              >
                <div className="form-calc   m-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      calc();
                    }}
                  >
                    <div className="w-full  flex flex-wrap justify-center text-white shadow-sm p-3 rounded-2xl shadow-black/20 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200">
                      <input
                        type="text"
                        onChange={(e) => calcCheck(e.target.value)}
                        value={calcTextIn}
                        placeholder="عبارت خود را وارد کنید (مثال: A ∩ B)"
                        className={classNames(
                          "text-lg transform w-full math-input text-white duration-500 p-2 shadow-sm shadow-black/30 rounded-lg focus-visible:shadow focus-visible:shadow-lg focus-visible:shadow-black/40 focus-visible:scale-102 focus-visible:outline-0",
                          { "shadow-red-700 focus-visible:shadow-red-700": calcError }
                        )}
                      />
                      {calcError && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-red-500 text-center mt-2"
                        >
                          {calcError}
                        </motion.div>
                      )}
                      <div className="flex mb-1 w-full justify-center gap-4 mt-4">
                        <button
                          type="button"
                          className="shadow-black/20 w-full rounded-full hover:scale-105 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-lg"
                          onClick={handleUnionClick}
                        >
                          اجتماع (∪)
                        </button>
                        <button
                          type="button"
                          className="shadow-black/20 w-full rounded-full hover:scale-105 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-lg"
                          onClick={handleIntersectionClick}
                        >
                          اشتراک (∩)
                        </button>
                      </div>
                      <AnimatePresence mode="wait">
                        {calcTextOut !== "" && (
                          <motion.div
                            key={calcTextOut}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                            className="shadow-black/20 text-center w-full rounded-full my-1 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-lg"
                          >
                            <p className="text-lg">نتیجه محاسبه:</p>
                            <p className="overflow-x-auto text-nowrap text-lg inline-block max-w-[150px]">
                              {calcTextOut}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        type="submit"
                        className="shadow-black/20 w-full mt-1 rounded-full hover:scale-105 transition-all duration-500 text-white p-2 px-4 bg-blue-950/20 backdrop-blur-sm backdrop-brightness-200 rounded-lg disabled:blur-xs"
                        disabled={!!calcError || !calcTextIn}
                      >
                        محاسبه
                      </button>
                    </div>
                  </form>
                </div>
                <DataTable
                  data={calcTableData}
                  showDelete={false}
                  maxHeight={206}
                  enablePagination={false}
                />
              </motion.div>
            )}
            {selectedTabSets === "otherInfo" && Object.keys(setData).length > 1 && (
              <motion.div
                key="otherInfo"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
                className="w-full flex  flex-col items-stretch"
                onAnimationStart={() => setIsAnimatingTabSets(true)}  
                onAnimationComplete={() => setIsAnimatingTabSets(false)}  
              >
                <div
                  className={classNames(
                    "text-center p-4 rounded-2xl mx-4  bg-blue-950/10 shadow-md shadow-black/20 backdrop-blur-lg",
                    { "shadow-green-900/50 bg-green-900/40": info.all_sets_chain },
                    { "shadow-red-900/50 bg-red-900/40": !info.all_sets_chain }
                  )}
                >
                  <p className="flex text-white flex-row-reverse gap-2 justify-center">
                    <span>{info.all_sets_chain ? "بله" : "خیر"}</span>
                    <span>آیا همه مجموعه‌ها تشکیل زنجیر می‌دهند؟</span>
                  </p>
                </div>
                <DataTable
                  data={formatData(info, "info")}
                  showDelete={false}
                  maxHeight={206}
                  enablePagination={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

                