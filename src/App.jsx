import { darkModeThunk } from "./store/slices/darkMode.slice";
import { Navigate, Route, Routes } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

{/* Auth Imports */}
import { LoginPage } from "./components/pages/auth/login/LoginPage";
import { RegisterPage } from "./components/pages/auth/register/RegisterPage";
import { RecoveryPage } from "./components/pages/auth/recovery/RecoveryPage";
{/* End Auth Imports */}

{/* User Imports */}
import { ProtectedRoutes as UserProtectedRoutes } from "./components/pages/session/user/ProtectedRoutes";
import { HomePage as UserHomePage } from "./components/pages/user/home/HomePage";
import { Recipients as UserRecipients } from "./components/pages/user/recipients/Recipients";
import { Requests as UserRequests } from "./components/pages/user/requests/Requests";
{/* End User Imports */}

function App() {
  const darkMode = useSelector((state) => state.darkMode);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(darkModeThunk());
  }, [darkMode]);

  return (
    <Routes>
      <Route path="*" element={<Navigate to="/" />}/>
      <Route path="/login" element={<LoginPage />}/>
      <Route path="/register" element={<RegisterPage />}/>
      <Route path="/recovery" element={<RecoveryPage />}/>
      <Route path="/" element={<UserProtectedRoutes />}>
        <Route path="/" element={<UserHomePage />}/>
        <Route path="/recipients" element={<UserRecipients />}/>
        <Route path="/requests" element={<UserRequests />}/>
      </Route>
    </Routes>
  )
}

export default App
