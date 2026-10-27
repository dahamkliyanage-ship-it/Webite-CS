import { auth, db } from "./backend.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, setDoc, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// --- NEW CODE: FORCE LOGOUT CHECK ---
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('logout') === 'true') {
  signOut(auth).then(() => {
    window.history.replaceState(null, '', window.location.pathname);
  });
}
// ------------------------------------

// --- GLOBAL STATE TRACKING ---
let currentUser = null;
let authStateTimer; // Prevent rapid misfires from Firebase cache

// --- LOGIN ROUTING AND PROGRESS TRACKING ---
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  
  const loginSection = document.getElementById("login-section");
  const userInfo = document.getElementById("user-info");
  const completeBtn = document.getElementById("mark-complete-btn");

  // Clear any pending redirects if Firebase updates state quickly
  clearTimeout(authStateTimer);

  if (user) {
    // 1. Handle Login Page Routing (Safely buffered to prevent loops)
    if (loginSection) {
      loginSection.style.display = "none";
      authStateTimer = setTimeout(() => {
        if (auth.currentUser) {
          window.location.replace("Home module page.html"); 
        }
      }, 800);
    }
    
    // 2. Fetch profile data AND fill all progress bars on page load
    displayUserProfile(user.uid);
    updateProgressBar(user.uid); 
    
    // 3. Safely attach the "Mark as Complete" logic for single lesson pages
    if (completeBtn && !completeBtn.hasAttribute("data-active")) {
      completeBtn.setAttribute("data-active", "true"); 
      
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
    // User is logged out: Reset UI state
    if (loginSection) loginSection.style.display = "block";
    if (userInfo) userInfo.style.display = "none";
    
    // Lock the individual complete button
    if (completeBtn && !completeBtn.hasAttribute("data-active")) {
      completeBtn.setAttribute("data-active", "true");
      completeBtn.addEventListener("click", () => {
        alert("Please log in to save your progress.");
      });
    }
    
    // Display lock messages on multi-bar Hub/Roadmap Pages
    const submoduleBars = document.querySelectorAll(".dynamic-sub-bar");
    submoduleBars.forEach(barContainer => {
      barContainer.innerHTML = `<div style="color: #94a3b8; font-size: 13px; margin-top: 5px;">🔒 Login to view progress</div>`;
    });
  }
});

// --- PROGRESS BAR CALCULATION & BUTTON STATE RESTORATION ---
async function updateProgressBar(userId) {
  const progressBar = document.getElementById("progress-bar");
  const subProgressBar = document.getElementById("submodule-progress-bar"); 
  const subProgressText = document.getElementById("submodule-progress-text");
  const completeBtn = document.getElementById("mark-complete-btn");
  
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const userData = docSnap.data();
    const completedArray = userData.completedModules || [];
    
    // 1. Fill the Global Course Progress Bar
    if (progressBar) {
      const totalModulesInCourse = 50; 
      const percentage = Math.min((completedArray.length / totalModulesInCourse) * 100, 100);
      progressBar.style.width = `${percentage}%`;
    }
    
    // 2. Fill the Individual Page Submodule Bar
    if (subProgressBar) {
      const prefix = subProgressBar.getAttribute("data-prefix"); 
      const total = parseInt(subProgressBar.getAttribute("data-total"), 10);
      
      const subCount = completedArray.filter(modName => modName.startsWith(prefix)).length;
      let subPercentage = 0;
      if (total > 0) subPercentage = Math.round((subCount / total) * 100);
      
      subProgressBar.style.width = `${subPercentage}%`;
      if (subProgressText) subProgressText.innerText = `Submodule Progress: ${subPercentage}%`;
    }

    // 3. Fill Hub Page Multiple Bars (Statics, Dynamics, Math Roadmaps, etc.)
    const submoduleBars = document.querySelectorAll(".dynamic-sub-bar");
    submoduleBars.forEach(barContainer => {
      const prefix = barContainer.getAttribute("data-prefix");
      const total = parseInt(barContainer.getAttribute("data-total"), 10);
      
      const subCount = completedArray.filter(modName => modName.startsWith(prefix)).length;
      let subPercentage = 0;
      if (total > 0) subPercentage = Math.round((subCount / total) * 100);
      
      const innerBar = barContainer.querySelector(".inner-fill");
      const textLabel = barContainer.querySelector(".progress-text");
      
      if (innerBar) innerBar.style.width = `${subPercentage}%`;
      if (textLabel) textLabel.innerText = `Progress: ${subPercentage}%`;
    });
    
    // 4. Restore the Button State if already completed
    if (completeBtn) {
      const currentModuleName = completeBtn.getAttribute("data-module");
      if (completedArray.includes(currentModuleName)) {
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
        .then(() => window.location.replace("Home module page.html"))
        .catch(error => alert("Registration Error: " + error.message));
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => window.location.replace("Home module page.html"))
        .catch(err => alert("Login Error: " + err.message));
    }
  });
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => signOut(auth));
}