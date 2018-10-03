// Firebase
var config = {
    apiKey: "AIzaSyAUve8Oa-LaT_sU2w5h7ALVlI3ZCx1ylPk",
    authDomain: "rps-multiplayer-c0940.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-c0940.firebaseio.com",
    projectId: "rps-multiplayer-c0940",
    storageBucket: "rps-multiplayer-c0940.appspot.com",
    messagingSenderId: "960179582729"
};

firebase.initializeApp(config);

// Function for authentication and session management
var Authenticate = (function(){

    var loginDialog = document.querySelector('#login-dialog');
    var createAccountDialog = document.querySelector('#create-account-dialog');
    var loggedIn = false;

    // Create Account function.  Writes account info to firebase.
    function submitCreateAccount() {
        var displayName = document.querySelector("#entry-displayname");
        var email = document.querySelector("#entry-email");
        var password = document.querySelector("#entry-password");

        if (validate(displayName, email, password)) {
            firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
            .then(function() {
                console.log("Account creation success");
                // updateProfile is a firebase function that can update a user's basic profile information
                var user = firebase.auth().currentUser;
                user.updateProfile({
                    displayName: displayName.value
                });
                // Closes the account creation box and the login dialog box
                createAccountDialog.close();
                closeLoginDialog();
            }, function (e) {
                console.error("Account creation error", e);
            });
        }
        else {
            //todo
            var data = {message: "Must enter valid name and email.  Passwords must be 4 characters or longer."};
            // UI.snackbar(data);
        }

        // Helper function to validate user input during account creation
        // Name and email must not be blank, email must have @, and password must be 4 chars or longer
        function validate(name, email, pw) {
            var valid = true;
            if (name.value == "") {
                valid = false;
                name.parentElement.classList.add("is-invalid");
            }
            else
                name.parentElement.classList.remove("is-invalid");
            if (email.value == "" || email.value.indexOf('@') == -1) {
                valid = false;
                email.parentElement.classList.add("is-invalid");
            }
            else
                email.parentElement.classList.remove("is-invalid");
            if (pw.value.length < 4) {
                valid = false;
                pw.parentElement.classList.add("is-invalid");
            }
            else
                pw.parentElement.classList.remove("is-invalid");
            return valid;
        }
    }

    // Logs the user in with email and password
    function signInWithEmailandPassword(){
        var email = document.querySelector("#email");
        var password = document.querySelector("#password");

        if (validate([email, password])) {
            // This calls firebase's signInWithEmailAndPassword's function as opposed to this one
            firebase.auth().signInWithEmailAndPassword(email.value, password.value).then(function(user) {
                console.log ("Sign in successful with user: " + user.email);
            }, function(e){
                console.error("Sign in error", e);
            });
            closeLoginDialog();
        }
        else {
            //todo
            var data = {message: "All fields required"};
            // UI.snackbar(data);
        }
        
        // Helper function to check if any credential is left blank
        function validate(arr) {
            valid = true;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].value == "") {
                    valid = false;
                    arr[i].parentElement.classList.add("is-invalid");
                }
                else
                    arr[i].parentElement.classList.remove("is-invalid");
            }
            return valid;    
        }
    }

    // Log in with google
    function signInWithGoogle(googleUser) {
        var credential = firebase.auth.GoogleAuthProvider.credecntial({
            'idToken': googleUser.getAuthResponse().id_token
        });
        firebase.auth().signInWithCredential(credential);

    }

    // When the users authentication state changes, like logging in and out
    // This will autmatically run from the listener set in the init function
    function authStateChangeListener(user) {
        if (user) {
            loggedIn = true;
            closeLoginDialog();
            document.querySelector("#login").style.display = "none";
            document.querySelector("#logout").style.display = "block";
            Chat.onlogin();
            // Game.onlogin();
        }
        else {   // log out
            if (loggedIn) {
                loggedIn = false;
                window.location.reload();
            }
        }
    }

    // Closes the log-in dialog box
    function closeLoginDialog() {
        var dialog = document.querySelector('#login-dialog')
        if (dialog.open)
            dialog.close();
    }

    // public functions
    return {
        // Initialize all authentication elements
        init: function() {
            firebase.auth().onAuthStateChanged(authStateChangeListener);
            // showModal() makes the user not able to interact with other elsements like a pop up box or an alert
            // Login button on top right
            document.querySelector("#login").addEventListener("click", function (){
                loginDialog.showModal();
            });
            // Logout button to top right
            document.querySelector("#logout").addEventListener("click", function(){
                firebase.auth().signOut();
                var logoutMessage = $("<li>");
                logoutMessage.html("<b>You have succesfully signed out!</b>");
                Chat.messageList.append(logoutMessage);
            }, function(e) {
                console.error("Logout error", e);            
            });
            // Sign in button in the login window
            document.querySelector("#sign-in").addEventListener("click", signInWithEmailandPassword);
            // Google sign in from icon
            document.querySelector("#google-signin img").addEventListener("click", signInWithGoogle);
            // Pop up create account dialog box when create account button is pressed
            document.querySelector('#create-account').addEventListener("click", function() {
                createAccountDialog.showModal();
            });
            // Create user account once create button is pressed
            document.querySelector("#entry-submit").addEventListener("click", submitCreateAccount);  
        },
    }
})();

// Function for chat box
var Chat = (function(){

    var send = document.querySelector('#send-chat-button');
    var messageField = document.querySelector('#chat-message-field');
    var messageList = document.querySelector('#chat-message-list')
    var messages = document.querySelector('#chat-messages')
    var chatRef = firebase.database().ref("/chat");

    // Push chat messages to firebase, which handles authentication automatically
    // Called from init function, which calls this function every time the "send" button is pressed
    function sendChatMessage() {
        enableChat(false);
        chatRef.push().set({
            name: firebase.auth().currentUser.displayName,
            message: messageField.value
        }, function (e) {
            if (e)
                console.error ("Chat message push error", e);
            else {
                messageField.value = "";
                messageField.parentElement.classList.remove("is-dirty")
            }
            enableChat(true);
        });
    }

    // Will enable chat if true is passed in, disable if false
    function enableChat(enabled) {
        send.disabled = !enabled;
        messageField.disabled = !enabled;
    }

            // Adds message w/name passed in into the chat box
    function addChatMessage(name, message) {
        // var chatMessage = $("<li>");
        // chatMessage.html("<b>" + name + "</b>: " + message);
        chatMessage = document.createElement("li");
        chatMessage.innerHTML = "<strong>" + name + "</strong>: " + message;
        console.log(chatMessage);
        messageList.append(chatMessage);
        messages.scrollTop = messageList.scrollHeight;
    }

    // public functions
    return {
        // Initializes chat box elements
        // Set up firebase for sending/receiving chat messages
        init: function(){
            // Initializes send button
            send.addEventListener("click", sendChatMessage);
            // child_added is triggered once for every existing child then again everytime a new child is added
            // So this function returns multiple snapshots equalling the total amount of messages in the DB
            // and triggers again once the user types a new message
            chatRef.on("child_added", function(snapshot){
                var newMessage = snapshot.val();
                console.log(newMessage);
                addChatMessage(newMessage.name, newMessage.message);
            }, function (e){
                console.error("Child added error", e);
            })
        },



        // Enables chat once user has logged in
        onlogin: function() {
            enableChat(true);
        },   
    }
})();

Authenticate.init();
Chat.init();

