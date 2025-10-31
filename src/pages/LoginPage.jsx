import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { auth, db } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Notification from "../components/Notification";
import axios from "axios"; // 1. IMPORT AXIOS

export default function LoginPage() {
  const [hover, setHover] = useState(false);
  const [show, setShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState('login');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setShow(true), 20);
  }, []);

  const showNotificationWithMessage = (message, duration = 5000) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), duration);
  };

  const redirectAfterAuth = async (user) => {
    if (!user) {
      showNotificationWithMessage("User authentication failed.");
      return;
    }
    try {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          displayName: user.displayName || "",
          quizCompleted: false,
        });
        navigate("/quiz");
        return;
      }
      if (!snap.data().quizCompleted) {
        navigate("/quiz");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error checking quiz status", err);
      navigate("/quiz");
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // 2. SEND EMAIL ON GOOGLE LOGIN
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/send-welcome-email`;
        await axios.post(apiUrl, {
          name: user.displayName || "New User",
          email: user.email,
        });
        console.log("Welcome email request sent for Google user (Login).");
      } catch (emailError) {
        console.error("Failed to send welcome email on login:", emailError);
      }

      const userDocRef = doc(db, "users", user.uid);
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || "",
          quizCompleted: false,
        });
        navigate("/quiz");
        showNotificationWithMessage("✅ Successfully signed in with Google!");
        return;
      }
      await redirectAfterAuth(user);
      showNotificationWithMessage("✅ Successfully signed in with Google!");
    } catch (error) {
      console.error("Error during Google sign-in: ", error);
      showNotificationWithMessage("❌ Google Sign-In failed. Please try again.");
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      showNotificationWithMessage("❌ Please enter both email and password.");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. SEND EMAIL ON EMAIL LOGIN
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

      const userDocRef = doc(db, "users", user.uid);
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || "",
          quizCompleted: false,
        });
        navigate("/quiz");
        showNotificationWithMessage("✅ Welcome! Please take the quiz.");
        return;
      }
      await redirectAfterAuth(user);
      showNotificationWithMessage("✅ Welcome back!");
    } catch (error) {
      console.error("Error signing in:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        showNotificationWithMessage("❌ Invalid email or password.");
      } else {
        showNotificationWithMessage("❌ Sign-in failed. Please try again.");
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      showNotificationWithMessage("❌ Please enter your email address.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showNotificationWithMessage("✅ Password reset link sent! Check your inbox.");
      setView('login');
    } catch (error) {
      console.error("Error sending password reset email:", error);
      if (error.code === 'auth/user-not-found') {
        showNotificationWithMessage("❌ No account found with that email address.");
      } else {
        showNotificationWithMessage("❌ Failed to send reset link. Please try again.");
      }
    }
  };

  return (
    <div className="auth-login-root">
      <Notification message={notificationMessage} show={showNotification} />
      <div
        className="auth-login-left"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className={`auth-login-card${show ? " show" : ""}${hover ? " hovered" : ""}`}>
          <Link to="/">
            <img src="/logo.png" alt="CareerFlow" style={{ height: 36, marginBottom: 18 }}/>
          </Link>
          <h2 className="auth-login-card-title">Personalized Career Advisor</h2>
          <div className="auth-login-card-desc">
            India’s most trusted AI career guidance.<br />
            Discover your path with expert, unbiased advice.
          </div>
          <a className={`auth-login-register-btn${hover ? " hovered" : ""}`} href="/career-test">
            Take the free Career Test <span style={{ marginLeft: 4 }}>↗</span>
          </a>
        </div>
      </div>
      <div className="auth-login-right">
        <div className={`auth-login-form-box${show ? " show" : ""}`}>
          <Link to="/">
            <img src="/logo.png" alt="Logo" className="auth-login-logo" style={{ height: 38, marginBottom: 18 }}/>
          </Link>

          {view === 'login' ? (
            <>
              <h2 className="auth-login-title">Log in to your account</h2>
              <button className="auth-login-oauth-btn" onClick={handleGoogleSignIn}>
                <img src="https://www.citypng.com/public/uploads/preview/google-logo-icon-gsuite-hd-701751694791470gzbayltphh.png" alt="Google" width={20} height={20} style={{ marginRight: 8 }}/>
                Continue with Google
              </button>
              <div className="auth-login-divider"><span>or</span></div>
              <input
                type="email"
                className="auth-login-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="auth-login-password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-login-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="auth-login-eye-btn" tabIndex={-1} type="button" onClick={() => setShowPassword((v) => !v)}>
                  {/* Eye SVG icons */}
                </button>
              </div>
              <div className="auth-login-row">
                {/* --- CORRECTED ELEMENT #1 --- */}
                <button type="button" className="auth-login-forgot-link" onClick={() => setView('forgotPassword')}>
                  Forgot your password?
                </button>
              </div>
              <button className="auth-login-continue-btn" onClick={handleEmailSignIn}>Continue</button>
              <p className="auth-login-signup-link">
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="auth-login-title">Reset Your Password</h2>
              <p style={{color: '#666', fontSize: '0.95rem', marginBottom: '20px'}}>
                Enter your email address and we will send you a link to reset your password.
              </p>
              <input
                type="email"
                className="auth-login-input"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="auth-login-continue-btn" onClick={handlePasswordReset}>
                Send Reset Link
              </button>
              <p className="auth-login-signup-link">
                 {/* --- CORRECTED ELEMENT #2 --- */}
                <button type="button" className="auth-login-forgot-link" onClick={() => setView('login')}>
                  ← Back to Login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
