import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const AuthContext = createContext(null);

/*
 * This provider should export a `user` context state that is 
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    //const user = null;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch(`${BACKEND_URL}/user/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch user info");
                    return res.json();
                })
                .then((data) => {
                    setUser(data.user);
                })
                .catch(() => {
                    setUser(null);
                });
        } else {
            setUser(null);
        }
    }, []);

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        // TODO: complete me
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (username, password) => {
        try {
            const res = await fetch(`${BACKEND_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const error = await res.json();
                return error.message;
            }

            const data = await res.json();
            localStorage.setItem("token", data.token);

            // Fetch user info after login
            const userRes = await fetch(`${BACKEND_URL}/user/me`, {
                headers: {
                    Authorization: `Bearer ${data.token}`,
                },
            });

            const userData = await userRes.json();
            setUser(userData.user);
            navigate("/profile");
        } catch (err) {
            return "Login failed. Please try again.";
        }
        //return "TODO: complete me";
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async (userData) => {
        try {
            const res = await fetch(`${BACKEND_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (!res.ok) {
                const error = await res.json();
                return error.message;
            }

            navigate("/success");
        } catch (err) {
            return "Registration failed. Please try again.";
        }
        //return "TODO: complete me";
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
