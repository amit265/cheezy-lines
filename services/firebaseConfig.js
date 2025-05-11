// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSxfRkXKyRUUgBqPZsHGJl5IC8GO9Trro",
  authDomain: "cheezy-lines-16e49.firebaseapp.com",
  projectId: "cheezy-lines-16e49",
  storageBucket: "cheezy-lines-16e49.firebasestorage.app",
  messagingSenderId: "965513942108",
  appId: "1:965513942108:web:53c9f7c5b022685f9a0299",
  measurementId: "G-2F2PB8CEFF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db}