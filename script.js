const chatContainer = document.getElementById("chatContainer");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const typingIndicator = document.getElementById("typingIndicator");

let conversationHistory = [];

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    sendBtn.disabled = true;

    addMessage("user", message);

  messageInput.value = "";
    autoResizeTextarea();

    conversationHistory.push({
        role: "user",
        parts: [
            {
                text: message
            }
        ]
    });

    // Show typing animation
    showTyping();

    try {

const response = await fetch("/.netlify/functions/chat", {

    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({

        contents: conversationHistory

    })

});


        // Check HTTP status
        if (!response.ok) {

            let errorMessage = "Something went wrong.";

            try {

                const errorData = await response.json();

                errorMessage =
                    errorData?.error?.message ||
                    errorMessage;

            } catch (error) {
                // Ignore JSON parsing error
            }

            throw new Error(errorMessage);
        }


        const data = await response.json();


        // Extract Gemini response
        const aiResponse =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;


        if (!aiResponse) {
            throw new Error(
                "Gemini returned an empty response."
            );
        }


        // Add AI response to conversation history
        conversationHistory.push({
            role: "model",
            parts: [
                {
                    text: aiResponse
                }
            ]
        });


        // Display AI response
        addMessage("ai", aiResponse);

    } catch (error) {

        console.error("Gemini API Error:", error);

        addMessage(
            "ai",
            `Sorry, something went wrong.\n\n${error.message}`
        );

    } finally {

        hideTyping();

        sendBtn.disabled = false;

        messageInput.focus();
    }
}


// ==========================================
// ADD MESSAGE TO UI
// ==========================================

function addMessage(sender, text) {

    const messageElement =
        document.createElement("div");

    messageElement.classList.add(
        "message",
        sender === "user"
            ? "user-message"
            : "ai-message"
    );


    const avatar =
        document.createElement("div");

    avatar.classList.add(
        "avatar",
        sender === "user"
            ? "user-avatar"
            : "ai-avatar"
    );

    avatar.textContent =
        sender === "user"
            ? "U"
            : "✦";


    const content =
        document.createElement("div");

    content.classList.add("message-content");


    const name =
        document.createElement("div");

    name.classList.add("message-name");

    name.textContent =
        sender === "user"
            ? "You"
            : "Gemini";


    const bubble =
        document.createElement("div");

    bubble.classList.add("bubble");

    // textContent prevents HTML injection.
    bubble.textContent = text;


    content.appendChild(name);
    content.appendChild(bubble);

    messageElement.appendChild(avatar);
    messageElement.appendChild(content);


    chatContainer.appendChild(messageElement);


    // Automatically scroll to newest message
    chatContainer.scrollTop =
        chatContainer.scrollHeight;
}


// ==========================================
// TYPING INDICATOR
// ==========================================

function showTyping() {

    typingIndicator.classList.remove("hidden");

    chatContainer.scrollTop =
        chatContainer.scrollHeight;
}


function hideTyping() {

    typingIndicator.classList.add("hidden");
}


// ==========================================
// CLEAR CHAT
// ==========================================

clearBtn.addEventListener("click", () => {

    conversationHistory = [];

    chatContainer.innerHTML = "";

    addMessage(
        "ai",
        "Hello! 👋 I'm your AI assistant. How can I help you today?"
    );

    messageInput.focus();
});


// ==========================================
// SEND BUTTON
// ==========================================

sendBtn.addEventListener(
    "click",
    sendMessage
);


// ==========================================
// ENTER TO SEND
// ==========================================

messageInput.addEventListener(
    "keydown",
    (event) => {

        // Enter = send
        // Shift + Enter = new line

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }

    }
);


// ==========================================
// AUTO RESIZE TEXTAREA
// ==========================================

messageInput.addEventListener(
    "input",
    autoResizeTextarea
);


function autoResizeTextarea() {

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            150
        ) + "px";
}
