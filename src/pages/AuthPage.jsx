import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../pages/AuthPage.css";
import { auth, db } from "../firebase"; // db = getFirestore() from firebase.js
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import Notification from "../components/Notification";
import axios from "axios"; // 1. IMPORT AXIOS

// Card data for animation
const cards = [
  {
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    title: "Personalized Roadmaps",
    desc: "AI-driven career paths tailored to you.",
  },
  {
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    title: "Expert Guidance",
    desc: "Connect with industry professionals.",
  },
  {
    img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=400&q=80",
    title: "Skill Tracking",
    desc: "Monitor your progress and stay on track.",
  },
];

export default function AuthPage({ type }) {
  const isSignup = type === "signup";
  const [active, setActive] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Notification helper
  const showNotificationWithMessage = (message, duration = 4000) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), duration);
  };

  // Helper: Redirect based on quiz status
  const redirectAfterAuth = async (user) => {
    if (!user) {
      showNotificationWithMessage("User authentication failed.");
      return;
    }
    try {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (!snap.exists() || !snap.data().quizCompleted) {
        navigate("/quiz");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error checking quiz status", err);
      navigate("/quiz"); // default to quiz on error
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      // Create user doc if not exists
      const user = userCredential.user;
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          displayName: user.displayName || "",
          quizCompleted: false,
        });
        
        // 2. SEND EMAIL FOR NEW GOOGLE SIGNUP
        try {
          const apiUrl = `${process.env.REACT_APP_API_URL}/api/send-welcome-email`;
          await axios.post(apiUrl, {
            name: user.displayName || "New User",
            email: user.email,
          });
          console.log("Welcome email request sent for Google user.");
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Non-critical error, so we don't show a notification to the user
        }

        navigate("/quiz");
        showNotificationWithMessage("✅ Signed in with Google!");
        return;
      }
      await redirectAfterAuth(user);
      showNotificationWithMessage("✅ Signed in with Google!");
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      showNotificationWithMessage("❌ Google Sign-In failed. Please try again.");
    }
  };

  // Email Sign-Up
  const handleEmailSignUp = async () => {
    if (!fullName || !email || !password) {
      showNotificationWithMessage("❌ Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      showNotificationWithMessage("❌ Password must be at least 6 characters long.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      // Create user doc with quizCompleted: false
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName: fullName,
        quizCompleted: false,
      });
      
      // 3. SEND EMAIL FOR NEW EMAIL SIGNUP
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/send-welcome-email`;
        await axios.post(apiUrl, {
          name: fullName,
          email: email,
        });
        console.log("Welcome email request sent for email user.");
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      showNotificationWithMessage("🎉 Account created successfully! Welcome!");
      setTimeout(() => { navigate("/quiz"); }, 1500);
    } catch (error) {
      console.error("Error creating account:", error);
      if (error.code === 'auth/email-already-in-use') {
        showNotificationWithMessage("❌ This email is already registered.");
      } else {
        showNotificationWithMessage("❌ Failed to create account.");
      }
    }
  };

  // Email Sign-In (No changes needed here as emails are for signups)
  const handleEmailSignIn = async () => {
    if (!email || !password) {
      showNotificationWithMessage("❌ Please enter both email and password.");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Ensure Firestore user doc exists
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

  return (
    <div className="auth-root-fullscreen">
      <Notification
        message={notificationMessage}
        show={showNotification}
      />

      <div className="auth-left">
        <div className="auth-card-slider">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`auth-card ${idx === active ? "auth-card-active" : ""}`}
            >
              <img src={card.img} alt={card.title} className="auth-card-img" />
              <div className="auth-card-content">
                <h3>{card.title}</h3>
                <p className="auth-card-cost-desc">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <Link to="/">
            <img src="/logo.png" alt="Logo" className="auth-logo" style={{ height: 38, marginBottom: 18 }}/>
          </Link>
          <h2 className="auth-title">
            {isSignup ? "Join CareerFlow Today" : "Welcome Back"}
          </h2>
          <p className="auth-subtitle" style={{ color: '#666', marginBottom: '24px', fontSize: '0.95rem' }}>
            {isSignup ? "Start your personalized career journey" : "Continue your career development"}
          </p>

          <button className="auth-google-btn" onClick={handleGoogleSignIn}>
            <img src="https://www.citypng.com/public/uploads/preview/google-logo-icon-gsuite-hd-701751694791470gzbayltphh.png" alt="Google" width={20} height={20} style={{ marginRight: 8 }}/>
            {isSignup ? "Sign up with Google" : "Continue with Google"}
          </button>

          <div className="auth-divider"><span>or</span></div>

          {isSignup && (
            <input
              type="text"
              className="auth-input"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}

          <input
            type="email"
            className="auth-input"
            placeholder="Work email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="auth-continue-btn"
            onClick={isSignup ? handleEmailSignUp : handleEmailSignIn}
          >
            {isSignup ? "Create Account" : "Sign In"}
          </button>

          <p className="auth-login-link">
            {isSignup ? (
              <>Already have an account? <Link to="/login">Sign in</Link></>
            ) : (
              <>New to CareerFlow? <Link to="/signup">Create account</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
