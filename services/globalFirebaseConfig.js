// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBq0wVyh3EfaTXHkKwdJiLUda-00ZYKI8c",
  authDomain: "destyastudio-cf294.firebaseapp.com",
  projectId: "destyastudio-cf294",
  storageBucket: "destyastudio-cf294.firebasestorage.app",
  messagingSenderId: "964274576146",
  appId: "1:964274576146:web:b4d473753209021617b1cb",
  measurementId: "G-Y89RKCPC19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const globalDb = getFirestore(app);

export { globalDb };
