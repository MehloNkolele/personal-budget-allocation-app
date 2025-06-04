// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAS8awD9mOr1qR5s2goXDvoPQfgM_VBpDI",
  authDomain: "personal-budget-planner-581d6.firebaseapp.com",
  projectId: "personal-budget-planner-581d6",
  storageBucket: "personal-budget-planner-581d6.firebasestorage.app",
  messagingSenderId: "790321408904",
  appId: "1:790321408904:web:465297f0879cf4443c283d",
  measurementId: "G-5321XQ5XTW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
