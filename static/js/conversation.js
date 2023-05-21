"use strict";
$(document).ready(function () {
  // Function to register click event listeners for conversation titles
  function registerClickEventListeners() {
    $(".list-group-item").on("click", function () {
      const conversationId = $(this).data("conversation-id");
      //Change chat Title and time
      $(".chat-title h2").text($(this).text())
      $(".chat-title p").text("Created on "+$(this).data("start_time"))

      sessionStorage.setItem('con_id',conversationId)
      fetchConversation(conversationId);
    });
  }

   // Click event listener for the "New Chat" button
  $("#new-chat-button").on("click", function () {
  //  clear chat history
      const chatHistory = $("#chat-history");
      chatHistory.empty();
  //    create new conversation
      const newConversationTitle = "New Conversation";
        $.ajax({
        url: "/newConversation"+`/${sessionStorage.getItem('token')}`,
        data: {
            "user_id":sessionStorage.getItem('user_id'),
            "title": newConversationTitle
        },
        type: "Post",
        dataType: "text",
        success: function (res) {
            let data= JSON.parse(JSON.parse(res).data)
            console.log("data",data)
            const newConversationId=data.id
            sessionStorage.setItem('con_id',newConversationId)
            //set Title and Time
            $(".chat-title h2").text(newConversationTitle)
            $(".chat-title p").text("Created on "+data.startTime)
            refreshConversations()
        },
    })
  });

  function refreshConversations(keyword){
    // Fetch conversation titles and populate the left panel
  $.ajax({
    url: "/refreshConversations"+`/${sessionStorage.getItem('token')}`,
    data: {
            "user_id":sessionStorage.getItem('user_id'),
            "keyword":keyword
        },
    method: "GET",
    success: function (res) {
        const conversationList = $("#conversation-list");
        conversationList.empty()
        let Cons=JSON.parse(res.data)
        console.log("Conversation_refresh",Cons)
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
  document.querySelector(".searchSubmit").addEventListener("click",e=>{
      e.preventDefault()
      let keyword=document.querySelector(".searchBar").value
      refreshConversations(keyword)
  //    clear Chat history
      const chatHistory = $("#chat-history");
      chatHistory.empty();
  })
  refreshConversations()

  // Function to fetch and display the conversation based on the ID
  function fetchConversation(conversationId) {
    $.ajax({
      url: "/fetchConversation"+`/${sessionStorage.getItem('token')}`,
      data: {
            "con_id":conversationId
        },
      method: "GET",
      success: function (res) {
          const chatHistory = $("#chat-history");
          chatHistory.empty();
          let msgs = JSON.parse(res.data)
          console.log("ChatHistoryRefresh",msgs)
          msgs.forEach(function (msg) {
            const chatMessage = `<div class=${msg.title=="User"?"usrMsg":"botMsg"}><span>` + msg.content +'</span></div>' ;
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
    }
    else{
      const chatHistory = $("#chat-history");
      const chatMessage = '<div class="usrMsg"><span>' + message +'</span></div>' ;
      chatHistory.prepend(chatMessage);

      // Clear input field and focus
      inputField.val("");
      inputField.focus();
      let conversationId = sessionStorage.getItem('con_id')
      // No Conversation Case
      if (!conversationId) {
        // Create a new conversation
        const newConversationTitle = "New Conversation";
        $.ajax({
        url: "/newConversation"+`/${sessionStorage.getItem('token')}`,
        data: {
            "user_id":sessionStorage.getItem('user_id'),
            "title": newConversationTitle
        },
        type: "Post",
        dataType: "text",
        success: function (res) {
            let data= JSON.parse(JSON.parse(res).data)
            let newConversationId=data.id
            console.log("new_conversation",newConversationId)
            sessionStorage.setItem('con_id',newConversationId)
            //set Title and Time
            $(".chat-title h2").text(newConversationTitle)
            $(".chat-title p").text("Created on "+data.startTime)

            refreshConversations()
            $.ajax({
              url: "/returnMessage"+`/${sessionStorage.getItem('token')}`,
              data: {
                  "con_id":newConversationId,
                  "send_message": message
                },
              type: "Post",
              dataType: "text",
              success: function (data) {
                  const botReply = '<div class="botMsg"><span>' + data +'</span></div>' ;
                  chatHistory.prepend(botReply);
              },
    })
        },
    })



      }else{
        // Update the conversation on the server
          console.log("Conversation existed")
        $.ajax({
        url: "/returnMessage"+`/${sessionStorage.getItem('token')}`,
        data: {
            "con_id":conversationId,
            "send_message": message
        },
        type: "Post",
        dataType: "text",
        success: function (data) {
            const botReply = '<div class="botMsg"><span>' + data +'</span></div>' ;
            chatHistory.prepend(botReply);
        },
    })
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



});
