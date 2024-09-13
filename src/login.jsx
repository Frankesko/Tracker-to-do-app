import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { db } from "./firebase";
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const auth = getAuth();

  const completeEmail = (username) => `${username}@test.com`;

  const ensurePasswordLength = (pass) => {
    // Se la password è più corta di 6 caratteri, aggiungi "123456" alla fine
    return pass.length < 6 ? pass + "123456".slice(0, 6 - pass.length) : pass;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const email = completeEmail(username);
      const securePassword = ensurePasswordLength(password);
      const userCredential = await signInWithEmailAndPassword(auth, email, securePassword);
      onLogin(userCredential.user);
    } catch (error) {
      console.error("Errore di login:", error);
      setShowPopup(true);
    }
  };

  const handleCreateAccount = async () => {
    try {
      const email = completeEmail(username);
      const securePassword = ensurePasswordLength(password);
      const userCredential = await createUserWithEmailAndPassword(auth, email, securePassword);
      const user = userCredential.user;
      
      // Salva l'utente nel database
      await set(ref(db, `users/${user.uid}`), {
        username: username,
        email: email,
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
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="w-full"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (minimo 1 carattere)"
          required
          className="w-full"
        />
        <button type="submit" className="w-full">Login</button>
      </form>
      {showPopup && (
        <div className="login-popup-overlay">
          <div className="login-popup-content">
            <p className="mb-4">Account non trovato, desideri crearlo?</p>
            <p className="mb-4">L'email sarà: {completeEmail(username)}</p>
            <div className="login-popup-buttons">
              <button className="login-no-button" onClick={() => setShowPopup(false)}>NO</button>
              <button className="login-yes-button" onClick={handleCreateAccount}>SI</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;