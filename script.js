const API_KEY = 'AIzaSyCUDPifdtDZgftNExQkkWHkweHL5YMM9t0'; 
// Replace with your actual Gemini API key

const API_URL = `https://gemini.ai/api/v1/generate`;

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Add current airport context tracking
let currentAirport = null;

// List of major airports for context detection
const airportKeywords = {
    'JFK': ['jfk', 'kennedy', 'new york'],
    'LAX': ['lax', 'los angeles'],
    'LHR': ['heathrow', 'lhr', 'london'],
    'SIN': ['changi', 'sin', 'singapore'],
    'DXB': ['dubai', 'dxb'],
    'ORD': ["o'hare", 'ord', 'chicago'],
    'HND': ['haneda', 'hnd', 'tokyo'],
    // Indian Airports
    'DEL': ['del', 'indira gandhi', 'delhi', 'new delhi', 'igi'],
    'BOM': ['bom', 'csia', 'mumbai', 'chhatrapati shivaji', 'bombay'],
    'BLR': ['blr', 'bengaluru', 'bangalore', 'kempegowda'],
    'MAA': ['maa', 'chennai', 'madras'],
    'CCU': ['ccu', 'kolkata', 'netaji subhas', 'calcutta'],
    'HYD': ['hyd', 'hyderabad', 'rajiv gandhi'],
    'AMD': ['amd', 'ahmedabad', 'sardar vallabhbhai patel'],
    'COK': ['cok', 'kochi', 'cochin'],
    'GOI': ['goi', 'goa', 'dabolim'],
    'GAU': ['gau', 'guwahati', 'lokpriya gopinath bordoloi'],
    'JAI': ['jai', 'jaipur', 'sanganeer'],
    'LKO': ['lko', 'lucknow', 'chaudhary charan singh'],
    'IXC': ['ixc', 'chandigarh'],
    // Add more airports as needed
};

// Function to detect if a message mentions a specific airport
function detectAirport(message) {
    const lowercaseMsg = message.toLowerCase();
    
    for (const [airport, keywords] of Object.entries(airportKeywords)) {
        if (keywords.some(keyword => lowercaseMsg.includes(keyword))) {
            return airport;
        }
    }
    return null;
}

async function generateResponse(prompt) {
    try {
        // Check if user is asking about a new airport
        const detectedAirport = detectAirport(prompt);
        if (detectedAirport) {
            currentAirport = detectedAirport;
        }
        
        // Airport assistant context to guide the AI responses
        const airportContext = `You are an AI-based personal airport guide called "Gemini Airport Assistant". 
        Your purpose is to provide helpful navigation tips, information about facilities, 
        and guidance for specific airports worldwide. When asked about an airport, provide 
        detailed information about terminal layouts, transportation options, dining options, 
        lounges, security checkpoints, and any special features of that airport.
        
        ${currentAirport ? `The user is currently asking about ${currentAirport} airport. 
        Answer all questions assuming they are about ${currentAirport} unless the user clearly mentions another airport.` : 
        'If the user doesn\'t specify an airport, ask which airport they need help with.'}
        
        Format your responses using Markdown with headings, bullet points, and emphasis where appropriate.
        Keep responses concise and practical for travelers.`;
        
        const fullPrompt = `${airportContext}\n\nUser query: ${prompt}`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              'contents': [
                {
                  'parts': [
                    {
                      'text': fullPrompt
                    }
                  ]
                }
              ]
            })
          });
        const data = await response.json();

        if (!data || !data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
            throw new Error("Invalid response from Gemini API.");
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("API Error:", error);
        showErrorMessage("Unable to retrieve airport information. Please try again later.");
        return null;
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

// Suggest common airport queries with improved styling
function addSuggestionChips() {
    const suggestions = [
        "Help with JFK Airport navigation",
        "Best food options at LAX",
        "Heathrow Airport terminal connections",
        "Singapore Changi Airport attractions",
        "Dubai Airport duty-free shopping",
        "Delhi Airport terminal guide",
        "Mumbai Airport transportation options",
        "Bangalore Airport lounges"
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

// Initialize with welcome message and suggestions
function initializeChat() {
    const welcomeMessage = "## 👋 Welcome to Gemini Airport Assistant!\n\nI can help you navigate airports worldwide. Some things I can assist with:\n\n- Terminal layouts and connections\n- Transportation options\n- Dining and shopping recommendations\n- Lounge information\n- Security tips\n\nWhich airport are you traveling through?";
    addMessage(welcomeMessage, false);
    addSuggestionChips();
}

// Add initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const airportSelector = document.getElementById('airport-selector');
    if (airportSelector) {
        airportSelector.addEventListener('change', function() {
            if (this.value) {
                currentAirport = this.value;
                document.getElementById('user-input').value = `Tell me about ${this.value} airport`;
                document.getElementById('send-button').click();
                this.selectedIndex = 0; // Reset selector
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
        if (recognition) {
            recognition.start();
            micButton.disabled = true;
            micButton.classList.add('recording');
            userInput.placeholder = "Listening..."; // Update placeholder to indicate listening
        }
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        micButton.disabled = false;
        micButton.classList.remove('recording');
        userInput.placeholder = "Ask about airport navigation, facilities, or tips..."; // Reset placeholder
        handleUserInput(); // Automatically send the transcribed text to GPT
    };

    recognition.onerror = () => {
        showErrorMessage("Voice recognition failed. Please try again.");
        micButton.disabled = false;
        micButton.classList.remove('recording');
        userInput.placeholder = "Ask about airport navigation, facilities, or tips..."; // Reset placeholder
    };

    recognition.onend = () => {
        micButton.disabled = false;
        micButton.classList.remove('recording');
        userInput.placeholder = "Ask about airport navigation, facilities, or tips..."; // Reset placeholder
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
