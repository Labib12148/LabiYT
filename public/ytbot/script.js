let memory = {
    lastPrompt: "",
    chatHistory: []
};

document.getElementById("prompt").addEventListener("keypress", async function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        await sendMessage();
    }
});

async function sendMessage() {
    // Display user message in chat
    const promptInput = document.getElementById('prompt');
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Display user message in chat
    displayMessage("You", prompt);

    // Clear input field
    promptInput.value = '';


    // Save user's message to chat history
    memory.chatHistory.push({ sender: "You", message: prompt });
    saveChatHistory(); // Save chat history after each update

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userInput: prompt })
            });
            const data = await response.json();

            // Display LabiYT response in chat
            if (data.response) {
                displayMessage("LabiYT", data.response);
                // Update chat history
                memory.chatHistory.push({ sender: "LabiYT", message: data.response });
                saveChatHistory(); // Save chat history after each update
            } else {
                displayMessage("LabiYT", "I can't assist with that. Try generating something else.");
                // Update chat history
                memory.chatHistory.push({ sender: "LabiYT", message: "I can't assist with that. Try generating something else." });
                saveChatHistory(); // Save chat history after each update
            }
        } catch (error) {
            console.error("Error generating content:", error.message);
            displayMessage("LabiYT", "I can't assist with that.");
            // Update chat history
            memory.chatHistory.push({ sender: "LabiYT", message: "I can't assist with that. Try generating something else." });
            saveChatHistory(); // Save chat history after each update
        }

    // Update memory with last prompt
    memory.lastPrompt = prompt;

}


// Function to save chat history to local storage
function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(memory.chatHistory));
}

// Function to load chat history from local storage
function loadChatHistory() {
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
        memory.chatHistory = JSON.parse(savedChatHistory);
    }
}

// Call function to load chat history when the page loads
loadChatHistory();

// Populate chat with chat history
memory.chatHistory.forEach(message => {
    displayMessage(message.sender, message.message);
});

// Populate input field with the last prompt
document.getElementById('prompt').value = memory.lastPrompt;


async function displayMessage(sender, message) {
    const chatContainer = document.getElementById('chat-container');

    // Create a spacer element for better visual separation between messages
    const spacerElement = document.createElement('div');
    spacerElement.classList.add('message-gap');

    // Append spacer element only if it's not the first message in the chat
    if (chatContainer.childNodes.length > 0) {
        chatContainer.appendChild(spacerElement);
    }

    // Check if the message is a string
    if (typeof message !== 'string') {
        // If not a string, convert it to a string
        message = String(message);
    }

    // Split message into individual lines
    const lines = message.split('\n');

    // Create a message element for each line
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const messageElement = document.createElement('div');

        // Display sender's message only if it's the first line
        if (index === 0) {
            // Add appropriate class based on the sender
            if (sender === "You") {
                messageElement.classList.add("user-message");
                const userImageElement = document.createElement('img');
                userImageElement.src = "./assets/user.png";
                userImageElement.classList.add('avatar');
                userImageElement.style.width = '30px';
                messageElement.appendChild(userImageElement);
            } else if (sender === "LabiYT") {
                messageElement.classList.add("LabiYT-message");
                const chatImageElement = document.createElement('img');
                chatImageElement.src = "./assets/chat.png";
                chatImageElement.classList.add('avatar');
                chatImageElement.style.width = '30px';
                messageElement.appendChild(chatImageElement);
            }

            // Check for bold text and wrap it in <strong> tags
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

            // Append sender's name and message text
            const textNode = document.createElement('div');
            textNode.innerHTML = `${sender}: ${formattedLine.trim()}`;
            messageElement.appendChild(textNode);
        } else {
            // Check for bold text and wrap it in <strong> tags
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            // Append message text directly
            messageElement.innerHTML = formattedLine.trim();
        }

        // Append message element
        chatContainer.appendChild(messageElement);

        if (index < lines.length - 1) {
            const lineBreak = document.createElement('br');
            chatContainer.appendChild(lineBreak);
        }

        // Add typing animation for LabiYT's response
        if (sender === "LabiYT") {
            await sleep(60 + Math.random() * 50); // Adjust timing as needed
        }
    }

    // Scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


// Function to simulate delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Function to clear chat history
function clearChat() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';

    // Clear memory
    memory.chatHistory = [];

    // Save chat history to local storage
    saveChatHistory();
}