// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAmigCL0Zv85TGPCnkjnE_33eYpAytDIIA",
  authDomain: "sharkvision-4ac92.firebaseapp.com",
  projectId: "sharkvision-4ac92",
  storageBucket: "sharkvision-4ac92.firebasestorage.app",
  messagingSenderId: "516357464658",
  appId: "1:516357464658:web:b86fe0797e13bd682ef58b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);