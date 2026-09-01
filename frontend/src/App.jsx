import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import SignIn from "./pages/UserSignIn";
import SignUp from "./pages/UserSignUp";
import UserDashboard from "./pages/UserDashboard";
import CheckerSignIn from "./pages/CheckerSignIn";
import CheckerSignUp from "./pages/CheckerSignUp";
import CheckerDashboard from "./pages/CheckerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import VerifyCertificate from "./pages/VerifyCertificate";
import NotFound from "./pages/NotFound";

function App() {
    const location = useLocation();

    const authPages = [
        "/signin",
        "/signup",
        "/checker-signup",
        "/checker-signin",
        "/admin"
    ];

    const dashboardPages = [
        "/user-dashboard",
        "/checker-dashboard",
        "/admin",
    ];

    const validRoutes = [
        "/",
        "/signin",
        "/signup",
        "/user-dashboard",
        "/checker-signin",
        "/checker-signup",
        "/checker-dashboard",
        "/admin",
        "/verify-puc",
    ];

    const isAuthPage = authPages.includes(location.pathname);
    const isDashboardPage = dashboardPages.includes(location.pathname);
    const is404Page = !validRoutes.includes(location.pathname);

    const showNavbar = !isAuthPage && !is404Page;
    const showFooter = !isAuthPage && !isDashboardPage && !is404Page;

    return (
        <>
            {showNavbar && <Navbar />}

            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />

                <Route path="/checker-signin" element={<CheckerSignIn />} />
                <Route path="/checker-signup" element={<CheckerSignUp />} />
                <Route path="/checker-dashboard" element={<CheckerDashboard />} />

                <Route path="/admin" element={<AdminDashboard />} />

                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />

                <Route path="/verify-puc" element={<VerifyCertificate />} />

                <Route path="*" element={<NotFound />} />
            </Routes>

            {showFooter && <Footer />}
        </>
    );
}

export default App;