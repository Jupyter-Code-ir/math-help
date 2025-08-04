import { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import classNames from "classnames";
import { debounce } from "lodash";
const NavItem = ({ to, children, className }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      classNames("nav-item  duration-500 transition w-4/12 rounded-xl p-1 hover:shadow-lg hover:scale-110 hover:bg-blue-950/40 shadow-black/40 shadow text-center", {
        "bg-blue-950/10 scale-90 shadow-lg": isActive,
        [className]: className,
      })
    }
  >
    {children}
  </NavLink>
);

const historyItems = [
  { title: "هوش مصنوعی", description: "سوال در مورد ژوپیتر کد" },
  { title: "مختصات", description: "2x+y=3" },
  { title: "مجموعه", description: "1,2,3" },
];

export default function Navbar(props) {
  const isLoggedIn = props.isLoggedIn;
  const username=props.username;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const historyMenuRef = useRef(null);
  const userMenuRef = useRef(null); 



  useEffect(() => {
    const checkMobile = debounce(() => {
      setIsMobile(window.innerWidth <= 1024);
    }, 100);

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = debounce(() => {
      setIsScrolled(window.scrollY > 10);
    }, 100);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (historyMenuRef.current && !historyMenuRef.current.contains(event.target)) &&
        (userMenuRef.current && !userMenuRef.current.contains(event.target))
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuOpen = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id)); 
  };

  return (
    <div
      className={classNames("bg-white Navbar lg:mx-auto lg:max-w-9/10", {
        "before:bg-blue-950/20 scrolled before:backdrop-blur-sm m-0": isScrolled,
      })}
    >
      <nav
        className={classNames(
          "fixed top-0 right-0 left-0 backdrop-blur-sm flex-col lg:flex-row items-center lg:mt-2 lg:rounded-full lg:mx-auto lg:max-w-[1024px] flex p-4 gap-8 shadow-sm shadow-black/40 bg-blue-950/20 text-white z-50",
          { "scrolled-n": isScrolled }
        )}
      >
        <div className="profile-box lg:w-3/12 flex w-full justify-center order-1 lg:order-2 gap-3">
          <div className="logo order-2 w-10/12 flex justify-center lg:hidden">
            <a href="#" className="text-shadow-lg text-shadow-black text-center">
              Jupyter Code
            </a>
          </div>
          {!isLoggedIn && (
            <a
              href="#"
              className="flex order-3 grow-0 lg:w-auto transition duration-500 items-center justify-end backdrop-blur-3xl shadow-sm shadow-black/40 bg-blue-950/60 p-2 rounded-xl gap-2 hover:shadow-lg hover:bg-blue-950/40 hover:scale-110"
              aria-label="ثبت نام"
            >
              <span className="reg-text hidden lg:inline-block">ثبت نام</span>
              <i className="fa-light fa-pipe" aria-hidden="true"></i>
              <i className="fa-light fa-user-plus" aria-hidden="true"></i>
            </a>
          )}
          {isLoggedIn && (
            <div
              ref={historyMenuRef}
              className={classNames("relative inline-block grow-0 lg:w-auto order-3 lg:order-1", {
                group: !isMobile,
              })}
            >
              <a
                href="#"
                aria-expanded={openMenuId === "history-nav"}
                aria-controls="history-menu"
                className={classNames(
                  "flex transition duration-500 items-center justify-end backdrop-blur-3xl shadow-lg bg-blue-950/60 p-2 rounded-xl gap-2",
                  {
                    "scale-110 bg-blue-950/40 shadow-lg": openMenuId === "history-nav",
                    "lg:hover:shadow-lg lg:hover:bg-blue-950/40 lg:hover:scale-110": !isMobile,
                  }
                )}
                onClick={isMobile ?(e) => {
                  e.preventDefault();
                  handleMenuOpen("history-nav");
                } :undefined}
              >
                <span className="history-text hidden lg:inline-block">فعالیت‌ها</span>
                <i className="fa-light fa-pipe" aria-hidden="true"></i>
                <i className="fa-solid fa-rectangle-history-circle-user" aria-hidden="true"></i>
              </a>
              <div
                className={classNames(
                  "drop-menu top-35 lg:top-17 left-0 lg:right-0 bg-blue-950/80 w-50 saturate-150 rounded-2xl group-hover:opacity-100 group-hover:visible shadow-lg shadow-black/40 duration-500 transition absolute",
                  openMenuId === "history-nav" ? "visible opacity-100" : "opacity-0 collapse"
                )}
                id="history-menu"
              >
                <p className="p-1 m-3 mb-0">فعالیت‌های اخیر:</p>
                <ul className="history-mini-list">
                  {historyItems.map((item, index) => (
                    <li key={index} className="history-mini-card m-2 mx-3">
                      <a
                        href="#"
                        className="flex items-center duration-200 transition bg-white rounded-lg shadow-lg shadow-black/10 text-black hover:shadow-black/30 hover:shadow-lg hover:scale-105"
                      >
                        <p className="history-mini-title border-l-2 p-1 text-nowrap w-50 overflow-ellipsis overflow-hidden">
                          {item.title}
                        </p>
                        <p className="history-mini text-nowrap ms-1 overflow-ellipsis overflow-hidden w-50">
                          {item.description}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className="p-2 flex justify-between mx-3 mb-3 duration-200 transition bg-white rounded-xl shadow-lg shadow-black/10 items-center text-black hover:shadow-black/30 hover:shadow-lg hover:scale-105"
                >
                  <span>مشاهده بیشتر</span>
                  <i className="fa-solid order-2 fa-rectangle-history-circle-user" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          )}
          <div
            ref={userMenuRef}
            className={classNames("relative inline-block grow-0 lg:w-auto order-1 lg:order-2", {
              group: !isMobile,
            })}
          >
            <a
              href="#"
              aria-expanded={openMenuId === "user-nav-panel"}
              aria-controls="user-menu"
              className={classNames(
                "flex transition duration-500 items-center justify-end backdrop-blur-3xl shadow-lg bg-blue-950/60 p-2 rounded-xl gap-2",
                {
                  "scale-110 bg-blue-950/40 shadow-lg": openMenuId === "user-nav-panel",
                  "lg:hover:shadow-lg lg:hover:bg-blue-950/40 lg:hover:scale-110": !isMobile && isLoggedIn,
                  "hover:bg-blue-950/40 hover:scale-110 hover:shadow-lg": !isLoggedIn,
                }
              )}
              onClick={
                isLoggedIn && isMobile
                  ? (e) => {
                      e.preventDefault();
                      handleMenuOpen("user-nav-panel");
                    }
                  : undefined
              }
            >
              <span className="profile-text hidden lg:inline-block">{isLoggedIn ? username : "ورود"}</span>
              <i className="fa-light fa-pipe" aria-hidden="true"></i>
              <i
                className={classNames("fa-light", isLoggedIn ? "fa-user" : "fa-arrow-right-to-arc")}
                aria-hidden="true"
              ></i>
            </a>
            {isLoggedIn && (
              <div
                className={classNames(
                  "drop-menu top-35 lg:top-17 right-0 lg:left-0 p-4 bg-blue-950/80 w-50 saturate-150 rounded-2xl shadow-lg shadow-black/40 group-hover:opacity-100 group-hover:visible : duration-500 transition absolute",
                  openMenuId === "user-nav-panel" ? "visible opacity-100" : "opacity-0 collapse"
                )}
                id="user-menu"
              >
                <p className="text-center p-2">محمد مهدی وافری</p>
                <ul className="mt-2">
                  <li className="m-2 mx-0">
                    <a
                      href="#"
                      className="p-2 flex duration-200 transition bg-white rounded-lg shadow-lg shadow-black/10 text-black hover:shadow-black/30 hover:shadow-lg justify-between items-center hover:scale-105"
                    >
                      <span className="order-1">پنل کاربری</span>
                      <i className="fa-solid order-2 fa-address-card" aria-hidden="true"></i>
                    </a>
                  </li>
                  <li className="m-2 mx-0">
                    <a
                      href="#"
                      className="p-2 flex duration-200 transition bg-white rounded-lg items-center justify-between shadow-lg shadow-black/10 text-black hover:shadow-black/30 hover:shadow-lg hover:scale-105"
                    >
                      <span className="order-1">فعالیت‌ها</span>
                      <i className="fa-solid order-2 fa-rectangle-history-circle-user" aria-hidden="true"></i>
                    </a>
                  </li>
                </ul>
                <button
                  className="p-1 m-2 mx-0 duration-200 transition bg-white rounded-full shadow-lg shadow-black/10 items-center text-black hover:shadow-black/30 hover:shadow-lg hover:scale-105"
                  aria-label="خروج"
                >
                  <i className="fa-light fa-power-off mt-2 mx-2" aria-hidden="true"></i>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mb-2 w-full lg:w-7/12 lg:mb-0 gap-4 justify-evenly nav-sec order-1 text-shadow-sm text-shadow-black/50 flex items-center size-6">
          <NavItem to="/eq">مختصات</NavItem>
          <NavItem to="/sets">مجموعه</NavItem>
          <NavItem to="/ai">ai</NavItem>
        </div>
        <div className="w-2/12 order-0 logo hidden lg:inline-block">
          <a href="#" className="text-shadow-lg text-shadow-black text-center">
            Jupyter Code
          </a>
        </div>
      </nav>
    </div>
  );
}