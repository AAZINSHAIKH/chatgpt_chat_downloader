document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("downloadChat").addEventListener("click", function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (!tabs.length) {
                alert("❌ No active tab found.");
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: extractChatFromPage
            }, (results) => {
                if (chrome.runtime.lastError) {
                    console.error("❌ Script execution error:", chrome.runtime.lastError);
                    alert("❌ Error executing script. Check console for details.");
                    return;
                }

                if (results && results[0] && results[0].result) {
                    let chatText = results[0].result;
                    if (chatText === "ERROR_NO_MESSAGES") {
                        alert("⚠️ No chat messages found. Ensure ChatGPT conversation is visible.");
                    } else {
                        downloadChatAsText(chatText);
                    }
                } else {
                    alert("❌ Error retrieving chat messages. Try again.");
                }
            });
        });
    });
});

// Function to extract chat in page context
function extractChatFromPage() {
    let messages = [];
    
    let chatContainers = document.querySelectorAll('div[class*="group"]');

    if (!chatContainers.length) {
        console.error("❌ No chat messages found.");
        return "ERROR_NO_MESSAGES";
    }

    chatContainers.forEach(container => {
        let userMessageDiv = container.querySelector('div.whitespace-pre-wrap');
        let chatgptMessageDiv = container.querySelector('div.prose');

        let userMessage = userMessageDiv ? userMessageDiv.innerText.trim() : "";
        let chatgptMessage = chatgptMessageDiv ? chatgptMessageDiv.innerText.trim() : "";

        if (userMessage) messages.push(`You: ${userMessage}`);
        if (chatgptMessage) messages.push(`ChatGPT: ${chatgptMessage}`);
    });

    console.log("✅ Extracted Chat Messages:", messages);

    return messages.length ? messages.join("\n\n") : "ERROR_NO_MESSAGES";
}

// Function to download chat as a text file
function downloadChatAsText(chatText) {
    let blob = new Blob([chatText], { type: "text/plain" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "chatgpt_chat.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
