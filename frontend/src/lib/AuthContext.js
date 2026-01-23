import { signInWithPopup, signOut } from "firebase/auth";
import { useState, createContext, useContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    await signOut(auth);
  };

  const requestOTP = async (state, phone = "") => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const payload = {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        image: firebaseUser.photoURL,
        state,
        phone,
      };

      localStorage.setItem("otpEmail", firebaseUser.email);
      localStorage.setItem("otpPhone", phone);
      localStorage.setItem("otpState", state);

      const res = await axiosInstance.post("/user/login", payload);

      return { success: true, method: res.data.method };
    } catch (err) {
      console.error("OTP Request Failed:", err);
      return { success: false };
    }
  };

  const verifyOTP = async (otp) => {
  try {
    const email = localStorage.getItem("otpEmail");
    const phone = localStorage.getItem("otpPhone");
    const state = localStorage.getItem("otpState");

    const res = await axiosInstance.post("/user/verify-otp", {
      email,
      phone,
      otp,
      state,
    });

    if (res.data.message === "OTP verified successfully") {
      const userRes = await axiosInstance.post("/user/get-user", { email });
      login(userRes.data.result);
      return { success: true };
    }

    return { success: false };

  } catch (err) {
    console.log("Invalid OTP or verification failed.");

    return { success: false };  
  }
};


  return (
    <UserContext.Provider
      value={{ user, login, logout, requestOTP, verifyOTP }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
