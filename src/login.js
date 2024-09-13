import React, { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { db } from "./firebase";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      onLogin(userCredential.user);
    } catch (error) {
      setShowPopup(true);
    }
  };

  const handleCreateAccount = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Salva l'utente nel database
      await set(ref(db, `users/${user.uid}`), {
        email: user.email,
      });

      onLogin(user);
    } catch (error) {
      console.error("Errore durante la creazione dell'account:", error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>Account non trovato, desideri crearlo?</p>
            <div className="popup-buttons">
              <button className="no-button" onClick={() => setShowPopup(false)}>
                NO
              </button>
              <button className="yes-button" onClick={handleCreateAccount}>
                SI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
