import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (firstname, username, email, password) => {
  try {
		const response = await axios.post(
			`${API_URL}/api/register`,
			{ firstname, username, email, password},
			{
				headers: { "Content-Type": "application/json" },
				withCredentials: true
			}
		);

		return response.data;
	} catch (error) {
		console.error("Registration error:", error);

		if(error.response && error.response.data && error.response.data.error) {
			return { 
				success: false, 
				error: error.response.data.error
			};
		}	

		return { 
			success: false, 
			error: "Unexpected error"
		};
	}
};
    
