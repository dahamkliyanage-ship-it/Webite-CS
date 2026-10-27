// script.js
document.addEventListener("DOMContentLoaded", function () {
  const chatbotContainer = document.getElementById("chatbot-container");
  const closeBtn = document.getElementById("close-btn");
  const sendBtn = document.getElementById("send-btn");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotMessages = document.getElementById("chatbot-messages");

  const chatbotIcon = document.getElementById("chatbot-icon");
  const closeButton = document.getElementById("close-btn");

  // Toggle chatbot visibility when clicking the icon
  // Show chatbot when clicking the icon
  chatbotIcon.addEventListener("click", function () {
    chatbotContainer.classList.remove("hidden");
    chatbotIcon.style.display = "none"; // Hide chat icon
  });

  // Also toggle when clicking the close button
  closeButton.addEventListener("click", function () {
    chatbotContainer.classList.add("hidden");
    chatbotIcon.style.display = "flex"; // Show chat icon again
  });

  sendBtn.addEventListener("click", sendMessage);
  chatbotInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  function sendMessage() {
    const userMessage = chatbotInput.value.trim();
    if (userMessage) {
      appendMessage("user", userMessage);
      chatbotInput.value = "";
      getBotResponse(userMessage);
    }
  }

  function appendMessage(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    
    // Convert Markdown bold (**text**) to HTML <strong> tags
    let formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks (\n) to HTML <br> tags
    formattedMessage = formattedMessage.replace(/\n/g, '<br>');
    
    messageElement.innerHTML = formattedMessage;
    
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  async function getBotResponse(userMessage) {
    const apiKey = "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"; // Replace with your active API key
    const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

    // 1. Grab the context from the current HTML page's meta tag right before making the request
    const pageContext = document.querySelector('meta[name="bot-context"]')?.content || "General CS1033 Module";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        // 2. Inject the dynamic context into the body payload
        body: JSON.stringify({
          model: "openai/gpt-oss-20b", 
          messages: [
            { //Change the content attribute according to the MAIN TOPICS ROADMAP of your module.
              role: "system", 
              content: `You are an expert AI assistant embedded directly into a 1st-semester university MT1023 module website. 
              Your job is to help students navigate this specific site. 
              The modules covered here are:
              1. Introduction 
              2. Atomic Structure 
              3. Crystal Structure
              4. Mechanical Properties 
              5. Electrical Properties
              6. Nanotechnology
              7. Functional Properties
              8. Degredation of Materials
              9. Selection of Materials
              
              CURRENT PAGE CONTEXT: ${pageContext}
              
              Keep your answers brief, punchy, and strictly relevant to the current page context and these CS1033 topics.` 
            },
            { role: "user", content: userMessage }
          ],
          max_tokens: 500,
        }),
      });

      const data = await response.json();

      // Defensive check: If OpenAI/Groq sends back an error, catch it before it crashes
      if (data.error) {
        console.error("API Error:", data.error.message);
        appendMessage("bot", `API Error: ${data.error.message}`);
        return; 
      }

      // If successful, parse and print the message
      const botMessage = data.choices[0].message.content;
      appendMessage("bot", botMessage);
      
    } catch (error) {
      console.error("Error fetching bot response:", error);
      appendMessage("bot", "Sorry, something went wrong. Please try again.");
    }
  
  }
});
  