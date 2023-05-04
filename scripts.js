"use strict"


// The function called when the form is submitted.
function attemptToLogin() {

    // Get the username and password from the form.
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    // Check if the username and password are correct.
    if (username == "admin" && password == "admin") {

        // If correct, hide the login panel.
        var signInElement = document.getElementById("sign-in");
        signInElement.style.visibility = "hidden";

    } else {

        // If incorrect, alert the user.
        alert("Incorrect username or password.")
    }
}