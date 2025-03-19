import { createContext, useEffect, useState } from "react";
import api from "../api/axios";
import appError from "../utils/appError";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);

    const checkAuth = async () => {
        await api.post("/api/v1/auth/check")
            .then(res => setAuth(res.data))
            .catch(err => appError(err));
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;