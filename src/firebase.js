import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzEup_VB1yGaq89wj-ktP7qKCyU4JWn-4",
  authDomain: "lokl-2afb4.firebaseapp.com",
  projectId: "lokl-2afb4",
  storageBucket: "lokl-2afb4.firebasestorage.app",
  messagingSenderId: "1007526650457",
  appId: "1:1007526650457:web:91ced1cef0522f9cc48748",
  measurementId: "G-H1P6JQHVE3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);