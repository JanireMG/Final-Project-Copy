import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Btn from "../ReutilizableFx/Btn";

const API_URL = import.meta.env.VITE_API_URL;

export default function Logout({ setLoggedIn }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(
                `${API_URL}/api/logout`,
                {},
                { withCredentials: true }
            );

            setLoggedIn(false);
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Btn onLogoutClick={handleLogout}/>
    );
}