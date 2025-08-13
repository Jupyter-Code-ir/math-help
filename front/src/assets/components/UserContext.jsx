import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [username, setUsername] = useState("کاربر");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

const fetchUserInfo = async () => {
  const token = localStorage.getItem("access");
  if (!token) return;

  try {
    const response = await fetch("http://localhost:8000/api/user-info/", {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`   // مهم
      },
    });
    if (response.ok) {
      const data = await response.json();
      setUsername(data.username);
      setIsLoggedIn(true);
    } else {
      setUsername("کاربر");
      setIsLoggedIn(false);
    }
  } catch {
    setUsername("کاربر");
    setIsLoggedIn(false);
  }
};

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <UserContext.Provider value={{ username, setUsername, isLoggedIn, setIsLoggedIn, fetchUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}
