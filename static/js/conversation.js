"use strict";
$(document).ready(function () {
  // Function to register click event listeners for conversation titles
  function registerClickEventListeners() {
    $(".list-group-item").on("click", function () {
      const conversationId = $(this).data("conversation-id");
      updateURL(conversationId);
      fetchConversation(conversationId);
    });
  }

  // Function to update the URL with the conversation ID
  function updateURL(conversationId) {
    const newURL = "/chat/" + conversationId;
    window.history.pushState(null, "", newURL);
  }

  // Function to fetch and display the conversation based on the ID
  function fetchConversation(conversationId) {
    $.ajax({
      url: "/chat/" + conversationId,
      method: "GET",
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

  // Fetch conversation titles and populate the left panel
  $.ajax({
    url: "/chat/conversations",
    method: "GET",
    success: function (response) {
      if (response.success) {
        const conversationList = $("#conversation-list");
        response.conversations.forEach(function (conversation) {
          const listItem = $("<li>")
            .addClass("list-group-item")
            .text(conversation.title)
            .attr("data-conversation-id", conversation.id);
          conversationList.append(listItem);
        });

        // Call the function to register click event listeners
        registerClickEventListeners();
      }
    },
    error: function (error) {
      console.log("Error fetching conversation titles:", error);
    },
  });

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
      let conversationId = getCurrentConversationId();

      if (window.location.pathname === "/") {
        // Create a new conversation
        const conversationList = $("#conversation-list");
        const newConversationId = conversationList.children().length + 1;
        const newConversationTitle = "Conversation " + newConversationId;
        const listItem = $("<li>")
          .addClass("list-group-item")
          .text(newConversationTitle)
          .attr("data-conversation-id", newConversationId);
        conversationList.append(listItem);

        // Update the URL for the new conversation
        updateURL(newConversationId);

        // Update the conversation ID
        conversationId = newConversationId;

        // Create a new conversation object
        const newConversation = {
          id: newConversationId,
          title: newConversationTitle,
          messages: [message],
        };
        conversations.push(newConversation);

        // Call the function to register click event listeners
        registerClickEventListeners();
      }

      // Clear input field and focus
      inputField.val("");
      inputField.focus();

      // Update the conversation on the server
      updateConversation(message, conversationId);
    }
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
