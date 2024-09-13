// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAusU0DI1CA6Pa1KuFOKtLzb9ijfk2hpFo",
  authDomain: "to-do-list-app-4ea90.firebaseapp.com",
  databaseURL: "https://to-do-list-app-4ea90-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "to-do-list-app-4ea90",
  storageBucket: "to-do-list-app-4ea90.appspot.com",
  messagingSenderId: "837762492174",
  appId: "1:837762492174:web:92d76255cc641eaf1c995f",
  measurementId: "G-RRWNT2Y92E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };