import axios from "axios";

export const registerUser = async (firstname, username, email, password) => {
  try {
		const response = await (
			'http://localhost:5000/api/register',
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
    
