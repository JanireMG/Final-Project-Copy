import React, { useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

import TopBanner from "../ReutilizableFx/TopBanner";
import UserPanelCarousel from "../ReutilizableFx/UserPanelCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function UserPanel() {
    const { user, setUser } = useOutletContext();
    const [username , setUsername] = useState(user?.username || "");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    if (user === null) return <FontAwesomeIcon icon="spinner" spin />; 
    if (!user) return <p>User not logged in</p>;

    const handleUpdate= async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!user?.id) {
            setError("User session not found");
            return;
        }

        const payload = {};
        if (username) payload.username = username;
        if (password) payload.password = password;

        if (Object.keys(payload).length === 0) {
            setError("Enter at least one field to update");
            return;
        }

        try{
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/user/${user.id}`,
                payload,
                { withCredentials: true }
            );

            if(res.data.success) {
                setUser((prev) => ({...prev, username}));
                setMessage(res.data.message);
            }
        }catch (err) {
            if (err.response && err.response.data?.error) {
                setError(err.response.data.error);
            } else {
                setError("Error updating user");
            }
        }
    };

    return (
        <div>
            <TopBanner/>
            <div className="userPanel">
                <h1 className="userPanelTitle">
                    Welcome back {user.username || "Guest"}!          
                </h1>
            
                <div className="userPanelConfig">
                    <h2>Update your username</h2>
                    <h3>Enter your new username and your current password</h3>
                    <form onSubmit={handleUpdate}>
                        <div className="userPanelForm">
                            <div>
                                <h3 className="userPanelLabel">Username</h3>
                                <input className='inputBar'
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <div>
                                <h3 className="userPanelLabel">Password</h3>
                                <input className='inputBar'
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <button className="btn" type="submit">Save changes</button>
                    </form>
                    {message && <p style={{ color: "white" }}>{message}</p>}
                    {error && <p style={{ color: "red"}}>{error}</p>}
                </div>
                <div className="userPanelVideo">
                    <UserPanelCarousel />
                </div>
            </div>
        </div>
    )
    
}