"use strict";
$(document).ready(function () {
  // Function to register click event listeners for conversation titles
  function registerClickEventListeners() {
    $(".list-group-item").on("click", function () {
      const conversationId = $(this).data("conversation-id");
      const conversationTitle = $(this).text();

      // Set chat title and time
      $("#chat-title-display").text(conversationTitle);
      $(".chat-title p").text("Created on " + $(this).data("start_time"));

      sessionStorage.setItem("con_id", conversationId);
      fetchConversation(conversationId);
    });
  }

  $("#edit-title-button").on("click", function () {
    // Switch to edit mode
    $("#chat-title-display").hide();
    $("#chat-title-input")
      .show()
      .val($("#chat-title-display").text().trim())
      .focus();
  });

  $("#chat-title-input").on("blur keyup", function (e) {
    // Switch back to display mode when the user presses Enter or leaves the input field
    if (e.type === "blur" || (e.type === "keyup" && e.key === "Enter")) {
      const newTitle = $(this).val().trim();

      // Update the title in the display, the list item and the database
      $("#chat-title-display").text(newTitle).show();
      $(this).hide();

      const conversationId = sessionStorage.getItem("con_id");
      $(`.list-group-item[data-conversation-id=${conversationId}]`).text(
        newTitle
      );

      // AJAX call to your Flask route to update the chat title in the database
      $.ajax({
        url: "/updateConversationTitle" + `/${sessionStorage.getItem("token")}`,
        data: {
          con_id: conversationId,
          new_title: newTitle,
        },
        type: "POST",
        dataType: "json",
        success: function (response) {
          console.log("Title updated successfully: ", response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log("Error updating title: ", textStatus, errorThrown);
        },
      });
    }
  });

  // Click event listener for the "New Chat" button
  $("#new-chat-button").on("click", function () {
    //  clear chat history
    const chatHistory = $("#chat-history");
    chatHistory.empty();
    //    create new conversation
    const newConversationTitle = "New Conversation";
    $.ajax({
      url: "/newConversation" + `/${sessionStorage.getItem("token")}`,
      data: {
        user_id: sessionStorage.getItem("user_id"),
        title: newConversationTitle,
      },
      type: "Post",
      dataType: "text",
      success: function (res) {
        let data = JSON.parse(JSON.parse(res).data);
        console.log("data", data);
        const newConversationId = data.id;
        sessionStorage.setItem("con_id", newConversationId);
        //set Title and Time
        $(".chat-title h2").text(newConversationTitle);
        $(".chat-title p").text("Created on " + data.startTime);
        refreshConversations();
      },
    });
  });

  function refreshConversations(keyword) {
    // Fetch conversation titles and populate the left panel
    $.ajax({
      url: "/refreshConversations" + `/${sessionStorage.getItem("token")}`,
      data: {
        user_id: sessionStorage.getItem("user_id"),
        keyword: keyword,
      },
      method: "GET",
      success: function (res) {
        const conversationList = $("#conversation-list");
        conversationList.empty();
        let Cons = JSON.parse(res.data);
        console.log("Conversation_refresh", Cons);
        Cons.forEach(function (conversation) {
          const listItem = $("<li>")
            .addClass("list-group-item")
            .text(conversation.title)
            .attr("data-conversation-id", conversation.id)
            .attr("data-start_time", conversation.startTime);
          conversationList.append(listItem);
        });

        // Call the function to register click event listeners
        registerClickEventListeners();
      },
      error: function (error) {
        console.log("Error fetching conversation titles:", error);
      },
    });
  }
  document.querySelector(".searchSubmit").addEventListener("click", (e) => {
    e.preventDefault();
    let keyword = document.querySelector(".searchBar").value;
    refreshConversations(keyword);
    //    clear Chat history
    const chatHistory = $("#chat-history");
    chatHistory.empty();
  });
  refreshConversations();

  // Function to fetch and display the conversation based on the ID
  function fetchConversation(conversationId) {
    $.ajax({
      url: "/fetchConversation" + `/${sessionStorage.getItem("token")}`,
      data: {
        con_id: conversationId,
      },
      method: "GET",
      success: function (res) {
        const chatHistory = $("#chat-history");
        chatHistory.empty();
        let msgs = JSON.parse(res.data);
        console.log("ChatHistoryRefresh", msgs);
        msgs.forEach(function (msg) {
          const chatMessage =
            `<div class=${msg.title == "User" ? "usrMsg" : "botMsg"}><span>` +
            msg.content +
            "</span></div>";
          chatHistory.prepend(chatMessage);
        });
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
    if (message == "") {
      alert("Message Cannot Be Empty!");
      return;
    } else {
      const chatHistory = $("#chat-history");
      const chatMessage =
        '<div class="usrMsg"><span>' + message + "</span></div>";
      chatHistory.prepend(chatMessage);

      // Clear input field and focus
      inputField.val("");
      inputField.focus();
      let conversationId = sessionStorage.getItem("con_id");
      // No Conversation Case
      if (!conversationId) {
        // Create a new conversation
        const newConversationTitle = "New Conversation";
        $.ajax({
          url: "/newConversation" + `/${sessionStorage.getItem("token")}`,
          data: {
            user_id: sessionStorage.getItem("user_id"),
            title: newConversationTitle,
          },
          type: "Post",
          dataType: "text",
          success: function (res) {
            let data = JSON.parse(JSON.parse(res).data);
            let newConversationId = data.id;
            console.log("new_conversation", newConversationId);
            sessionStorage.setItem("con_id", newConversationId);
            //set Title and Time
            $(".chat-title h2").text(newConversationTitle);
            $(".chat-title p").text("Created on " + data.startTime);

            refreshConversations();
            $.ajax({
              url: "/returnMessage" + `/${sessionStorage.getItem("token")}`,
              data: {
                con_id: newConversationId,
                send_message: message,
              },
              type: "Post",
              dataType: "text",
              success: function (data) {
                const botReply =
                  '<div class="botMsg"><span>' + data + "</span></div>";
                chatHistory.prepend(botReply);
              },
            });
          },
        });
      } else {
        // Update the conversation on the server
        console.log("Conversation existed");
        $.ajax({
          url: "/returnMessage" + `/${sessionStorage.getItem("token")}`,
          data: {
            con_id: conversationId,
            send_message: message,
          },
          type: "Post",
          dataType: "text",
          success: function (data) {
            const botReply =
              '<div class="botMsg"><span>' + data + "</span></div>";
            chatHistory.prepend(botReply);
          },
        });
      }
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

  $(".settings-button").on("click", function () {
    var dropdownContent = $(this).next();
    if (dropdownContent.css("display") === "block") {
      dropdownContent.css("display", "none");
    } else {
      dropdownContent.css("display", "block");
    }
  });

  $("#logout-button").on("click", function () {
    var token = sessionStorage.getItem("token"); // Get the token from session storage

    // Send a POST request to the /logout endpoint
    $.post("/logout", { token: token }, function (data, status) {
      if (status === "success") {
        sessionStorage.clear(); // clear all session storage
        window.location.href = "/toLogin"; // redirect to login page
      } else {
        // Handle failure to logout here
        alert("Failed to logout");
      }
    });
  });
});
