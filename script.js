document.addEventListener('DOMContentLoaded', () => {
    const questions = document.querySelectorAll('.question-block');
    const successMessage = document.getElementById('success-message');

    questions.forEach(block => {
        const options = block.querySelectorAll('.option-box');
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                // 1. Your original instant grading logic
                if (block.getAttribute('data-answered') === 'true') return;
                
                block.setAttribute('data-answered', 'true');
                options.forEach(opt => opt.classList.add('answered'));
                
                if (this.getAttribute('data-correct') === 'true') { 
                    this.classList.add('correct'); 
                } else { 
                    this.classList.add('wrong'); 
                    // Show the correct answer if they got it wrong
                    block.querySelector('.option-box[data-correct="true"]').classList.add('correct'); 
                }

                // 2. The Auto-Checker
                // Check if the user has answered every question on the page
                const answeredQuestions = document.querySelectorAll('.question-block[data-answered="true"]').length;
                
                if (answeredQuestions === questions.length) {
                    // Check if any of their selected options were marked 'wrong'
                    const hasMistakes = document.querySelectorAll('.option-box.wrong').length > 0;
                    
                    if (!hasMistakes && successMessage) {
                        // If all questions are answered and there are zero mistakes, show the message!
                        successMessage.style.display = 'block';
                    }
                }
            });
        });
    });
});
// Import the functions you need from the Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmigCL0Zv85TGPCnkjnE_33eYpAytDIIA",
  authDomain: "sharkvision-4ac92.firebaseapp.com",
  projectId: "sharkvision-4ac92",
  storageBucket: "sharkvision-4ac92.firebasestorage.app",
  messagingSenderId: "516357464658",
  appId: "1:516357464658:web:b86fe0797e13bd682ef58b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ---------------------------------------------------------
// Your existing quiz logic goes below here
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // ... all your quiz code ...
});