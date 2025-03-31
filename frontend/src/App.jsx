import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Home from "./pages/Home.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Navbar from "./pages/components/Navbar.jsx";
import LogoutButton from "./pages/components/LogoutButton.jsx";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
        if (token) {
            setUser({ token });
        }
    }, []);
    
    return (
        <BrowserRouter>
            <Navbar isLoggedIn={isLoggedIn} user={user} setUser={setUser} setIsLoggedIn={setIsLoggedIn} />
            <Routes>
                <Route path="/" element={<Home isLoggedIn={isLoggedIn} user={user} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
                <Route path="/profile" element={<Profile isLoggedIn={isLoggedIn} user={user} />} />
                <Route path="/admin" element={<Admin isLoggedIn={isLoggedIn} user={user} />} />
            </Routes>
        </BrowserRouter>
    );
}