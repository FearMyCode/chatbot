"use strict";

// Get references to the input field and send button
const inputField = $(".input-container input");
const sendButton = $(".input-container button");

// Get reference to the conversation div
const conversation = $(".conversation");

// Function to create a new message element
function createMessageElement(content) {
  const messageElement = $("<div>").addClass("message").text(content);
  return messageElement;
}

// Function to handle the send button click event
function sendButtonClick() {
  // Get the message content from the input field
  const messageContent = inputField.val();

  // If the input field is empty, do nothing
  if (!messageContent) {
    return;
  }

  // Create a new message element with the message content
  const messageElement = createMessageElement(messageContent);

  // Insert the new message element at the beginning of the conversation div
  conversation.prepend(messageElement);

  // Reset the input field
  inputField.val("");

  inputField.focus();

  // Send the message to the server using AJAX
  $.ajax({
    url: "/api/send-message",
    method: "POST",
    data: { message: messageContent },
    success: function (response) {
      // Handle the server's response
      const replyElement = createMessageElement(response);
      conversation.prepend(replyElement);
    },
    error: function (xhr, status, error) {
      console.log("An error occurred:", error);
    }
  });
}

// Add a click event listener to the send button
sendButton.on("click", sendButtonClick);

// Add event listeners to "Enter" key press
inputField.on("keydown", function (event) {
  if (event.key === "Enter") {
    sendButtonClick();
  }
});
