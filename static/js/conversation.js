"use strict";
$(document).ready(function () {
  // Fetch conversation titles and populate the left panel
  $.ajax({
    url: "/chat/conversations",
    method: "GET",
    success: function (response) {
      if (response.success) {
        const conversationList = $("#conversation-list");
        response.conversations.forEach(function (title, index) {
          const listItem = $("<li>")
            .addClass("list-group-item")
            .text(title)
            .attr("data-conversation-id", index + 1);
          conversationList.append(listItem);
        });

        // Click event listener for conversation titles
        $(".list-group-item").on("click", function () {
          const title = $(this).text();
          const conversationId = $(this).data("conversation-id");
          updateURL(conversationId);
          fetchConversation(title);
        });
      }
    },
    error: function (error) {
      console.log("Error fetching conversation titles:", error);
    },
  });

  // Function to update the URL with the conversation ID
  function updateURL(conversationId) {
    const newURL = "/chat/" + conversationId;
    window.history.pushState(null, "", newURL);
  }

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
            chatHistory.prepend(chatMessage);
          });
        }
      },
      error: function (error) {
        console.log("Error fetching conversation:", error);
      },
    });
  }

  // Function to handle the send button click event
  function sendButtonClick() {
    const inputField = $("#message-input");
    const message = inputField.val().trim();
    if (message !== "") {
      const chatHistory = $("#chat-history");
      const chatMessage = $("<div>").text(message);
      chatHistory.prepend(chatMessage);
      inputField.val("");

      // Update the conversation on the server
      const conversationId = getCurrentConversationId();
      updateConversation(message, conversationId);
    }
    inputField.focus();
  }

  // Click event listener for the send button
  $("#send-button").on("click", sendButtonClick);

  // Event listener for "Enter" key press on the input field
  $("#message-input").on("keyup", function (event) {
    if (event.key === "Enter") {
      sendButtonClick();
    }
  });

  // Function to get the current conversation ID from the URL
  function getCurrentConversationId() {
    const currentURL = window.location.href;
    const conversationId = currentURL.split("/").pop();
    return conversationId;
  }

  // Function to update the conversation on the server
  function updateConversation(message, conversationId) {
    $.ajax({
      url: "/chat/update",
      method: "POST",
      data: { message: message, conversation_id: conversationId },
      success: function (response) {
        console.log("Conversation updated successfully.");
      },
      error: function (error) {
        console.log("Error updating conversation:", error);
      },
    });
  }
});
