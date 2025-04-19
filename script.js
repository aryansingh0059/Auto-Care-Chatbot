const API_KEY = 'AIzaSyCUDPifdtDZgftNExQkkWHkweHL5YMM9t0'; 
// Replace with your actual Gemini API key

const API_URL = `https://gemini.ai/api/v1/generate`;

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Update tracking variable for current vehicle
let currentVehicle = null;

// Update keywords for vehicle detection
const vehicleKeywords = {
    'sedan': ['sedan', 'car', 'saloon'],
    'suv': ['suv', 'sports utility vehicle', '4x4'],
    'hatchback': ['hatchback', 'hatch'],
    'crossover': ['crossover', 'cuv'],
    'truck': ['truck', 'pickup', 'lorry'],
    'van': ['van', 'minivan'],
    'bus': ['bus', 'coach']
};

// Function to detect vehicle type from message
function detectVehicle(message) {
    const lowercaseMsg = message.toLowerCase();
    
    for (const [vehicle, keywords] of Object.entries(vehicleKeywords)) {
        if (keywords.some(keyword => lowercaseMsg.includes(keyword))) {
            return vehicle;
        }
    }
    return null;
}

async function generateResponse(prompt) {
    try {
        const detectedVehicle = detectVehicle(prompt);
        if (detectedVehicle) {
            currentVehicle = detectedVehicle;
        }
        
        const context = `You are AutoCare Assistant. Provide concise maintenance advice for ${currentVehicle || 'vehicles'}. 
Focus on:
${currentVehicle ? `- Specific ${currentVehicle} maintenance needs
- Common ${currentVehicle} issues
- ${currentVehicle}-specific service intervals` : 
'- General vehicle maintenance tips'}

Keep responses under 100 words and include specific actionable steps.
Current vehicle type: ${currentVehicle || 'not specified'}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'contents': [{
                    'parts': [{
                        'text': `${context}\n\nUser query about ${currentVehicle || 'vehicle'}: ${prompt}`
                    }]
                }]
            })
        });

        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || `I'll help you maintain your ${currentVehicle || 'vehicle'}. What specific aspect would you like to know about?`;
    } catch (error) {
        console.error("API Error:", error);
        return "I'm having trouble right now. Please try again later.";
    }
}

function cleanMarkdown(text) {
    // Less aggressive cleaning - preserve formatting that helps readability
    return text.replace(/\n{3,}/g, '\n\n').trim();
}

function addMessage(message, isUser) {
    const messageContainerElement = document.createElement('div');
    messageContainerElement.classList.add('message-container');
    messageContainerElement.classList.add(isUser ? 'user-message-container' : 'bot-message-container');

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isUser ? 'user-message' : 'bot-message');

    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');
    profileImage.src = isUser ? 'user.jpg' : 'bot.jpg';
    profileImage.alt = isUser ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    // Use Markdown for bot messages, plain text for user
    if (isUser) {
        messageContent.textContent = message;
    } else {
        // Parse markdown and set as HTML
        messageContent.innerHTML = marked.parse(message);
    }

    if (isUser) {
        messageElement.appendChild(messageContent);
        messageElement.appendChild(profileImage);
    } else {
        messageElement.appendChild(profileImage);
        messageElement.appendChild(messageContent);
    }
    
    messageContainerElement.appendChild(messageElement);
    chatMessages.appendChild(messageContainerElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingContainer = document.createElement('div');
    typingContainer.id = 'typing-indicator';
    typingContainer.classList.add('typing-indicator');
    
    // Add the three dots
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingContainer.appendChild(dot);
    }
    
    chatMessages.appendChild(typingContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// 🚀 New Function: Display an error message
function showErrorMessage(errorText) {
    const errorElement = document.createElement('div');
    errorElement.classList.add('error-message'); // Apply a CSS class for styling
    errorElement.textContent = errorText;
    
    chatMessages.appendChild(errorElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => errorElement.remove(), 5000); // Auto-remove error after 5 seconds
}

// Update initialization with welcome message for auto maintenance
function initializeChat() {
    const welcomeMessage = "## 🔧 Welcome to AutoCare Assistant!\n\nI'm your AI mechanic helper. I can assist with:\n\n- Vehicle maintenance schedules\n- Troubleshooting issues\n- Service reminders\n- Performance tips\n- Repair guidance\n\nSelect your vehicle type or ask me anything about vehicle maintenance!";
    addMessage(welcomeMessage, false);
    addMaintenanceSuggestions();
}

// Add maintenance-specific suggestion chips
function addMaintenanceSuggestions() {
    const suggestions = [
        "Regular maintenance schedule",
        "Engine troubleshooting",
        "Transmission care",
        "Brake system check",
        "Fluid levels guide",
        "Battery maintenance",
        "Tire care tips",
        "Filter replacement"
    ];
    
    const suggestionContainer = document.createElement('div');
    suggestionContainer.classList.add('suggestion-container', 'flex', 'flex-wrap', 'gap-2', 'my-3', 'justify-center');
    
    suggestions.forEach(text => {
        const chip = document.createElement('button');
        chip.classList.add('suggestion-chip', 'bg-blue-600', 'text-white', 'text-sm', 'px-3', 'py-1', 'rounded-full', 'hover:bg-blue-500', 'transition-all', 'hover:scale-105');
        chip.textContent = text;
        chip.addEventListener('click', () => {
            userInput.value = text;
            handleUserInput();
        });
        suggestionContainer.appendChild(chip);
    });
    
    chatMessages.appendChild(suggestionContainer);
}

// Add initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const vehicleSelector = document.getElementById('vehicle-selector');

    if (vehicleSelector) {
        vehicleSelector.addEventListener('change', function() {
            if (this.value) {
                currentVehicle = this.value;
                const vehicleName = this.options[this.selectedIndex].text;

                // Agent replies with a question about the selected vehicle
                const botMessage = `What do you want to know about your selected vehicle (${vehicleName})?`;
                addMessage(botMessage, false); // Display the bot's response in the chat

                // Do not reset the dropdown to allow the selected vehicle to remain visible
            }
        });
    }

    // Initialize chat
    initializeChat();
});

// Voice recognition setup
const micButton = document.getElementById('mic-button');
let recognition;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    micButton.addEventListener('click', () => {
        if (!currentVehicle) {
            showErrorMessage("Please select a vehicle type before using the microphone.");
            return;
        }

        recognition.start();
        micButton.disabled = true;
        micButton.classList.add('recording');
        userInput.placeholder = `Listening for queries about your ${currentVehicle}...`; // Update placeholder to indicate listening
    });

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        micButton.disabled = false;
        micButton.classList.remove('recording');
        userInput.placeholder = "Ask about vehicle maintenance or repairs..."; // Reset placeholder

        // Automatically send the transcribed text to the bot with the selected vehicle context
        await handleUserInput();
    };

    recognition.onerror = () => {
        showErrorMessage("Voice recognition failed. Please try again.");
        micButton.disabled = false;
        micButton.classList.remove('recording');
        userInput.placeholder = "Ask about vehicle maintenance or repairs..."; // Reset placeholder
    };

    recognition.onend = () => {
        micButton.disabled = false;
        micButton.classList.remove('recording');
        userInput.placeholder = "Ask about vehicle maintenance or repairs..."; // Reset placeholder
    };
} else {
    micButton.disabled = true;
    micButton.title = "Voice recognition not supported in this browser.";
}

async function handleUserInput() {
    const userMessage = userInput.value.trim();

    if (userMessage) {
        addMessage(userMessage, true);
        userInput.value = '';

        sendButton.disabled = true;
        userInput.disabled = true;
        
        // Show typing indicator while waiting for response
        showTypingIndicator();

        try {
            const botMessage = await generateResponse(userMessage);
            // Remove typing indicator before adding the response
            removeTypingIndicator();
            
            if (!botMessage) return; // If error occurred, don't proceed further

            addMessage(cleanMarkdown(botMessage), false);
        } catch (error) {
            removeTypingIndicator();
            console.error('Error:', error);
            showErrorMessage("Something went wrong. Please try again.");
        } finally {
            sendButton.disabled = false;
            userInput.disabled = false;
            userInput.focus();
        }
    }
}

sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserInput();
    }
});
