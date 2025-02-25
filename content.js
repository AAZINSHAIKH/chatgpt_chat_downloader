/* ChatGPT Chat Downloader - Content Script */

// Function to extract ChatGPT conversation
function extractChat() {
    let messages = [];
    
    // Select all message blocks inside the conversation
    let chatContainers = document.querySelectorAll('div[class*="group"]');

    if (!chatContainers.length) {
        console.error("❌ No chat messages found.");
        return "ERROR_NO_MESSAGES";
    }

    chatContainers.forEach(container => {
        let userMessageDiv = container.querySelector('div.whitespace-pre-wrap'); // User messages
        let chatgptMessageDiv = container.querySelector('div.prose'); // ChatGPT messages

        let userMessage = userMessageDiv ? userMessageDiv.innerText.trim() : "";
        let chatgptMessage = chatgptMessageDiv ? chatgptMessageDiv.innerText.trim() : "";

        if (userMessage) messages.push(`You: ${userMessage}`);
        if (chatgptMessage) messages.push(`ChatGPT: ${chatgptMessage}`);
    });

    console.log("✅ Extracted Chat Messages:", messages);

    return messages.length ? messages.join("\n\n") : "ERROR_NO_MESSAGES";
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractChat") {
        let chatText = extractChat();
        sendResponse({ chatText });
    }
});
