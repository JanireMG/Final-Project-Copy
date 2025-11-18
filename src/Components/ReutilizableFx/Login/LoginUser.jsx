import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/login`, 
      { username, password },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      }
    );

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    
    return { 
      success: false, 
      error: "User or password error." 
    };
  }
};