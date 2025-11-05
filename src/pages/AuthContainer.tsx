import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
// REMOVED: Sparkles is no longer used
import { Mail, Lock, User, Chrome, ArrowRight } from 'lucide-react'; 
import { auth, db } from "../firebase"; // Firebase imports
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Notification from "../components/Notification.tsx";
import axios from "axios";

// Helper function to check/set user data and redirect
const redirectAfterAuth = async (user: any, navigate: any, showNotification: any) => {
    if (!user) {
        showNotification("User authentication failed.");
        return;
    }
    try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
            // Initialize user data if not present (e.g., first time sign-in)
            await setDoc(docRef, {
                email: user.email,
                displayName: user.displayName || "",
                quizCompleted: false,
            });
        }
        // Always navigate to dashboard after auth
        navigate("/dashboard");
    } catch (err) {
        console.error("Error checking/initializing user", err);
        // On error, still proceed to dashboard to avoid blocking the user
        navigate("/dashboard");
    }
};

export default function AuthContainer({ initialView = 'login' }: { initialView?: 'login' | 'signup' }) {
    const [isLogin, setIsLogin] = useState(initialView === 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [view, setView] = useState('auth'); // 'auth' or 'forgotPassword'
    const [loading, setLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");

    const navigate = useNavigate();

    const showNotificationWithMessage = (message: string, duration = 5000) => {
        setNotificationMessage(message);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), duration);
    };

    // Resets to login/signup view when changing routes
    useEffect(() => {
        setIsLogin(initialView === 'login');
        setView('auth');
        setEmail('');
        setPassword('');
        setFullName('');
    }, [initialView]);

    const handleGoogleAuth = async () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            const snap = await getDoc(userDocRef);
            const isNewUser = !snap.exists();

            if (isNewUser) {
                 // Send Welcome Email for new Google sign-up
                try {
                    const apiUrl = `${process.env.REACT_APP_API_URL}/api/send-welcome-email`;
                    await axios.post(apiUrl, {
                        name: user.displayName || "New User",
                        email: user.email,
                    });
                    console.log("Welcome email request sent for Google user.");
                } catch (emailError) {
                    console.error("Failed to send welcome email:", emailError);
                }
            }

            showNotificationWithMessage(`✅ Successfully signed in with Google! ${isNewUser ? 'Welcome!' : 'Welcome back!'}`);
            await redirectAfterAuth(user, navigate, showNotificationWithMessage);

        } catch (error: any) {
            console.error("Error during Google auth: ", error);
            if (error.code !== 'auth/popup-closed-by-user') {
                showNotificationWithMessage("❌ Google Sign-In failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // --- LOGIN LOGIC ---
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Send Welcome Email (Re-login)
                try {
                    const apiUrl = `${process.env.REACT_APP_API_URL}/api/send-welcome-email`;
                    await axios.post(apiUrl, {
                        name: user.displayName || "Valued User",
                        email: user.email,
                    });
                    console.log("Welcome email request sent for email user (Login).");
                } catch (emailError) {
                    console.error("Failed to send welcome email on login:", emailError);
                }

                showNotificationWithMessage("✅ Welcome back!");
                await redirectAfterAuth(user, navigate, showNotificationWithMessage);

            } else {
                // --- SIGN UP LOGIC ---
                if (!fullName) {
                    throw new Error("Full Name is required for sign up.");
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Save user data to Firestore
                const userDocRef = doc(db, "users", user.uid);
                await setDoc(userDocRef, {
                    email: email,
                    displayName: fullName,
                    quizCompleted: false,
                });

                // Send Welcome Email
                try {
                    const apiUrl = `${process.env.REACT_APP_API_URL}/api/send-welcome-email`;
                    await axios.post(apiUrl, {
                        name: fullName,
                        email: email,
                    });
                    console.log("Welcome email request sent for new email user (Sign Up).");
                } catch (emailError) {
                    console.error("Failed to send welcome email on signup:", emailError);
                }

                showNotificationWithMessage("✅ Account created successfully! Redirecting...");
                await redirectAfterAuth(user, navigate, showNotificationWithMessage);
            }
        } catch (error: any) {
            console.error("Error during email auth:", error);
            let errorMessage = "Authentication failed. Please check your credentials.";
            if (error.message === "Full Name is required for sign up.") {
                errorMessage = "❌ Full Name is required for sign up.";
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = "❌ Invalid email or password.";
            } else if (error.code === 'auth/email-already-in-use') {
                errorMessage = "❌ This email is already registered. Try logging in.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "❌ Password must be at least 6 characters long.";
            }
            showNotificationWithMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            showNotificationWithMessage("❌ Please enter your email address.");
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            showNotificationWithMessage("✅ Password reset link sent! Check your inbox.");
            setView('auth'); // Return to the main auth view
        } catch (error: any) {
            console.error("Error sending password reset email:", error);
            if (error.code === 'auth/user-not-found') {
                showNotificationWithMessage("❌ No account found with that email address.");
            } else {
                showNotificationWithMessage("❌ Failed to send reset link. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const formKey = isLogin ? 'login' : 'signup';

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
            <Notification message={notificationMessage} show={showNotification} />

            {/* Floating Shapes Background */}
            <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
                <div className="shape shape-5"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header/Logo */}
                <div className="text-center mb-8">
                    {/* MODIFIED: Replaced Sparkles with <img> tag */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        // Transparent static logo that pops on hover
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 static-logo"
                    >
                        <img 
                            src="/logo.png" // Loading from public folder
                            alt="CareerFlow Logo" 
                            className="w-full h-full object-contain"
                        />
                    </motion.div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-2">
                        CareerFlow
                    </h1>
                    <p className="text-gray-600">Your AI-powered career guidance platform</p>
                </div>

                {/* Auth Box Container */}
                <motion.div
                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    {/* View Toggle (Login/Sign Up tabs) */}
                    <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => { setIsLogin(true); setView('auth'); }}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                                isLogin
                                    ? 'bg-white text-gray-900 shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setView('auth'); }}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                                !isLogin
                                    ? 'bg-white text-gray-900 shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* --- Main Auth Form (Login/Sign Up) --- */}
                        {view === 'auth' && (
                            <motion.div
                                key={formKey} // Key added here for smooth form transition
                                initial={{ opacity: 0, x: isLogin ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isLogin ? -20 : 20 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden" // Clip the moving content
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGoogleAuth}
                                    disabled={loading}
                                    className="w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 mb-6 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Chrome className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                    Continue with Google
                                </motion.button>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                                    <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">or</span></div>
                                </div>

                                <form onSubmit={handleEmailAuth} className="space-y-4">
                                    <AnimatePresence mode="wait">
                                        {/* Full Name Input (Only on Sign Up) */}
                                        {!isLogin && (
                                            <motion.div
                                                key="fullname-field"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="relative pt-1" // ADDED pt-1 for potential clipping fix
                                            >
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    required={!isLogin}
                                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Email Input */}
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                        />
                                    </div>

                                    {/* Password Input */}
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                        />
                                    </div>

                                    {/* Remember Me and Forgot Password (Only on Login) */}
                                    {isLogin && (
                                        <div className="flex items-center justify-between text-sm">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-600">Remember me</span>
                                            </label>
                                            <button type="button" onClick={() => setView('forgotPassword')} className="text-blue-500 hover:text-blue-600 font-medium">
                                                Forgot password?
                                            </button>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                {isLogin ? 'Sign In' : 'Create Account'}
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                <p className="mt-6 text-center text-sm text-gray-600">
                                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                    <button
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="text-blue-500 hover:text-blue-600 font-semibold"
                                    >
                                        {isLogin ? 'Sign up' : 'Log in'}
                                    </button>
                                </p>
                            </motion.div>
                        )}

                        {/* --- Forgot Password View --- */}
                        {view === 'forgotPassword' && (
                            <motion.div
                                key="forgot"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <h2 className="text-2xl font-semibold text-gray-900">Reset Your Password</h2>
                                <p className="text-gray-600 text-sm">
                                    Enter your email address and we will send you a link to reset your password.
                                </p>
                                
                                <form onSubmit={handlePasswordReset} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="Enter your registered email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Send Reset Link
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                <p className="mt-6 text-center text-sm">
                                    <button type="button" onClick={() => setView('auth')} className="text-blue-500 hover:text-blue-600 font-medium">
                                        ← Back to Login
                                    </button>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-xs text-gray-500 mt-6"
                >
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </motion.p>
            </motion.div>

            {/* Tailwind and Animation Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(20px, -20px) rotate(90deg); }
                    50% { transform: translate(-15px, -40px) rotate(180deg); }
                    75% { transform: translate(-30px, -20px) rotate(270deg); }
                }
                /* removed continuous rotation/pulse for logo */
 
                .floating-shapes {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none;
                }
                .shape {
                    position: absolute; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1));
                    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; animation: float 20s infinite ease-in-out;
                }
                .shape-1 { width: 300px; height: 300px; top: 10%; left: 10%; animation-delay: 0s; }
                .shape-2 { width: 200px; height: 200px; top: 60%; right: 10%; animation-delay: -5s; border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
                .shape-3 { width: 250px; height: 250px; bottom: 10%; left: 15%; animation-delay: -10s; border-radius: 40% 60% 60% 40% / 60% 40% 60% 40%; }
                .shape-4 { width: 180px; height: 180px; top: 20%; right: 20%; animation-delay: -15s; border-radius: 60% 40% 40% 60% / 40% 60% 40% 60%; }
                .shape-5 { width: 220px; height: 220px; top: 50%; left: 5%; animation-delay: -7s; border-radius: 50% 50% 30% 70% / 50% 30% 70% 50%; }
 
                /* static logo container: transparent background, subtle pop on hover */
                .static-logo {
                    background: transparent;
                    transition: transform 180ms ease, box-shadow 180ms ease;
                    transform-origin: center;
                    will-change: transform;
                }
                .static-logo img { display: block; }
                .static-logo:hover {
                    transform: translateY(-6px) scale(1.06);
                    box-shadow: 0 12px 30px rgba(2,6,23,0.12), 0 6px 14px rgba(59,130,246,0.08);
                }
             `}</style>
        </div>
    );
}