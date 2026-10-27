import { auth, db } from "./backend.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, setDoc, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// --- LOGIN ROUTING AND PROGRESS TRACKING ---
onAuthStateChanged(auth, (user) => {
  const loginSection = document.getElementById("login-section");
  const userInfo = document.getElementById("user-info");
  const completeBtn = document.getElementById("mark-complete-btn");

  if (user) {
    // 1. Handle Login Page Routing
    if (loginSection) {
      window.location.href = "pyDataStr.html"; 
    }
    
    // 2. Fetch profile data AND fill the progress bar on page load
    displayUserProfile(user.uid);
    updateProgressBar(user.uid); 
    
    // 3. Safely attach the "Mark as Complete" logic
    if (completeBtn && !completeBtn.hasAttribute("data-active")) {
      completeBtn.setAttribute("data-active", "true"); // Prevents duplicate listeners cleanly
      
      completeBtn.addEventListener("click", async () => {
        const moduleName = completeBtn.getAttribute("data-module");
        
        try {
          await setDoc(doc(db, "users", user.uid), {
            completedModules: arrayUnion(moduleName)
          }, { merge: true });
          
          completeBtn.innerText = "Completed!";
          completeBtn.style.background = "var(--string, #9ece6a)";
          completeBtn.style.color = "#0f1117";
          
          updateProgressBar(user.uid); 
        } catch (error) {
          console.error("Error saving progress:", error);
          alert("Database Error: " + error.message); 
        }
      });
    }
    
  } else {
    // User is logged out
    if(loginSection) loginSection.style.display = "block";
    if(userInfo) userInfo.style.display = "none";
    
    if (completeBtn && !completeBtn.hasAttribute("data-active")) {
      completeBtn.setAttribute("data-active", "true");
      completeBtn.addEventListener("click", () => {
        alert("Please log in to save your progress.");
      });
    }
  }
});

// --- PROGRESS BAR CALCULATION & BUTTON STATE RESTORATION ---
async function updateProgressBar(userId) {
  const progressBar = document.getElementById("progress-bar");
  const completeBtn = document.getElementById("mark-complete-btn");
  
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const userData = docSnap.data();
    
    // Calculate and fill the progress bar
    const completedCount = userData.completedModules ? userData.completedModules.length : 0;
    const totalModulesInCourse = 10; 
    
    if (progressBar) {
      const percentage = Math.min((completedCount / totalModulesInCourse) * 100, 100);
      progressBar.style.width = `${percentage}%`;
    }
    
    // Restore the button state if they already completed this specific page
    if (completeBtn && userData.completedModules) {
      const currentModuleName = completeBtn.getAttribute("data-module");
      
      if (userData.completedModules.includes(currentModuleName)) {
        completeBtn.innerText = "Completed!";
        completeBtn.style.background = "var(--string, #9ece6a)";
        completeBtn.style.color = "#0f1117";
      }
    }
  }
}

// --- PROFILE INJECTION ---
async function displayUserProfile(userId) {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const userData = docSnap.data();
    
    const scoreElement = document.getElementById("profile-score");
    const moduleElement = document.getElementById("last-module");
    
    if (scoreElement) scoreElement.innerText = `Total Score: ${userData.totalScore}`;
    if (moduleElement) moduleElement.innerText = `Current Phase: ${userData.lastCompleted}`;
  }
}

// --- FORM TOGGLE & SUBMISSION LOGIC ---
const toggleModeBtn = document.getElementById("toggle-mode-btn");
const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const emailActionBtn = document.getElementById("email-action-btn");
const switchMsg = document.getElementById("switch-msg");

let isSignUpMode = false;

if (toggleModeBtn) {
  toggleModeBtn.addEventListener("click", () => {
    isSignUpMode = !isSignUpMode;
    if (isSignUpMode) {
      formTitle.textContent = "Create Account";
      formSubtitle.textContent = "Register with your email to start learning";
      emailActionBtn.textContent = "Sign Up";
      switchMsg.textContent = "Already have an account?";
      toggleModeBtn.textContent = "Sign In";
    } else {
      formTitle.textContent = "Welcome Back";
      formSubtitle.textContent = "Sign in to continue your progress";
      emailActionBtn.textContent = "Sign In";
      switchMsg.textContent = "Don't have an account?";
      toggleModeBtn.textContent = "Register";
    }
  });
}

if (emailActionBtn) {
  emailActionBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (isSignUpMode) {
      createUserWithEmailAndPassword(auth, email, password)
        .catch(error => alert("Registration Error: " + error.message));
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .catch(err => alert("Login Error: " + err.message));
    }
  });
}