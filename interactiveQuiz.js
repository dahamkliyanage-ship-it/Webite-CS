// script.js
// If your quiz needs to save results to the database, import it here:
// import { db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const questions = document.querySelectorAll('.question-block');
    const successMessage = document.getElementById('success-message');

    questions.forEach(block => {
        const options = block.querySelectorAll('.option-box');
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                if (block.getAttribute('data-answered') === 'true') return;
                
                block.setAttribute('data-answered', 'true');
                options.forEach(opt => opt.classList.add('answered'));
                
                if (this.getAttribute('data-correct') === 'true') { 
                    this.classList.add('correct'); 
                } else { 
                    this.classList.add('wrong'); 
                    block.querySelector('.option-box[data-correct="true"]').classList.add('correct'); 
                }

                const answeredQuestions = document.querySelectorAll('.question-block[data-answered="true"]').length;
                
                if (answeredQuestions === questions.length) {
                    const hasMistakes = document.querySelectorAll('.option-box.wrong').length > 0;
                    if (!hasMistakes && successMessage) {
                        successMessage.style.display = 'block';
                    }
                }
            });
        });
    });
});