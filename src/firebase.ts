// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA49mQIpqvNORehX7fvs_EB5xTcKWSC2hU",
  authDomain: "depositosanjudas-praxis.firebaseapp.com",
  projectId: "depositosanjudas-praxis",
  storageBucket: "depositosanjudas-praxis.firebasestorage.app",
  messagingSenderId: "405711005956",
  appId: "1:405711005956:web:b7b93ea358b3342e5cc851",
  measurementId: "G-VMZKVK53XM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
