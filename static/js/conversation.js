"use strict";
$(document).ready(function () {
  // Fetch conversation titles and populate the left panel
  $.ajax({
    url: "/chat/conversations",
    method: "GET",
    success: function (response) {
      if (response.success) {
        var conversationList = $("#conversation-list");
        response.conversations.forEach(function (title, index) {
          var listItem = $("<li>")
            .addClass("list-group-item")
            .text(title)
            .attr("data-conversation-id", index + 1);
          conversationList.append(listItem);
        });

        // Click event listener for conversation titles
        $(".list-group-item").on("click", function () {
          var title = $(this).text();
          var conversationId = $(this).data("conversation-id");
          updateURL(conversationId);
          fetchConversation(title);
        });
      }
    },
    error: function (error) {
      console.log("Error fetching conversation titles:", error);
    },
  });

  // Function to fetch and display the conversation based on the title
  function fetchConversation(title) {
    $.ajax({
      url: "/chat/conversation",
      method: "POST",
      data: { title: title },
      success: function (response) {
        if (response.success) {
          const chatHistory = $("#chat-history");
          chatHistory.empty();
          response.messages.forEach(function (message) {
            const chatMessage = $("<div>").text(message);
            chatHistory.append(chatMessage);
          });
        }
      },
      error: function (error) {
        console.log("Error fetching conversation:", error);
      },
    });
  }

  // Get references to the input field and send button
  const inputField = $(".user-input input");
  const sendButton = $(".user-input button");

  // Get reference to the chatHistory div
  const chatHistory = $(".chat-history");

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

    // Insert the new message element at the beginning of the chatHistory div
    chatHistory.prepend(messageElement);

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
        chatHistory.prepend(replyElement);
      },
      error: function (xhr, status, error) {
        console.log("An error occurred:", error);
      },
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
});
