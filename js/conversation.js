"user strict";

// Get references to the input field and send button
const inputField = document.querySelector(".input-container input");
const sendButton = document.querySelector(".input-container button");

// Get reference to the conversation div
const conversation = document.querySelector(".conversation");

// Function to create a new message element
function createMessageElement(content) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  messageElement.textContent = content;
  return messageElement;
}

// Function to handle the send button click event
function SendButtonClick() {
  // Get the message content from the input field
  const messageContent = inputField.value;

  // If the input field is empty, do nothing
  if (!messageContent) {
    return;
  }

  // Create a new message element with the message content
  const messageElement = createMessageElement(messageContent);

  // Insert the new message element at the beginning of the conversation div
  conversation.insertBefore(messageElement, conversation.firstChild);

  // Reset the input field
  inputField.value = "";
}

// Add a click event listener to the send button
sendButton.addEventListener("click", SendButtonClick);
