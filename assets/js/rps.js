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

// Firebase authentication provides a lot automatically
// This includes federrated login



// Function for authentication and session management
var Authenticate = (function(){
    var loggedIn = false;

    // Create Account function.  Writes account info to firebase.
    function submitCreateAccount() {
        var displayName = $("#entry-displayname");
        var email = $("#entry-email");
        var password = $("#entry-password");

        firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
            .then(function(user) {
                // add the displayName
                user.updateProfile({displayName: displayName.value});
    });
}

    // Logs the user in with email and password
    function signInWithEmailandPassword(){
        var email = $("#email");
        var password = $("#entry-password");

        firebase.auth().signInWithEmailAndPassword(email.value, password.value);
    }

    // Log in with google
    function googleSignin(googleUser) {
        var credential = firebase.auth.GoogleAuthProvider.credecntial({
            'idToken': googleUser.getAuthResponse().id_token
        });
        firebase.auth().signInWithCredential(credential);
    }

    // When the users authentication state changes, like logging in and out
    function authStateChangeListener(user) {
        if (user) {
            loggedIn = true;
            closeLoginDialog();
            document.querySelector("#login").style.display = "none";
            document.querySelector("#logout").style.display = "block";
            Chat.onlogin();
            Game.onlogin();
        }
        else {   // log out
            loggedIn = false;
            window.location.reload();
        }
    }

    // Closes the log-in dialog box
    function closeLoginDialog() {
        var dialog = document.querySelector('#login-dialog')
        if (dialog.open)
            dialog.close();
    }

});

// Function for chat box
var Chat = function(){

    var send = $('#send-chat-button');
    var messageField = $('#chat-message-field');
    var messageList = $('#chat-message-list')
    // var messages = $('#chat-messages');
    var chatRef = firebase.database().ref("/chat");


    // Initializes chat box elements
    // Set up firebase for sending/receiving chat messages
    function init(){
        // Initializes send button
        send.addEventListener("click", sendChatMessage);
        // child_added is triggered once for every existing child then again everytime a new child is added
        // So this function returns multiple snapshots equalling the total amount of messages in the DB
        // and triggers again once the user types a new message
        chatRef.on("child_added", function(snapshot){
            var newMessage = snapshot.val();
            addChatMessage(newMessage.name, newMessage.message);
        })
    }

    // Push chat messages to firebase, which handles authentication automatically
    // Called from init function, which calls this function every time the "send" button is pressed
    function sendChatMessage() {
        enableChat(false);
        chatRef.push().set({
            name: firebase.auth().currentUser.displayName,
            message: messageField.value
        }, function (e) {
            console.log ("Chat message push error", e);
            enableChat(true);
        });
    }

    // Adds message w/name passed in into the chat box
    function addChatMessage(name, message) {
        var chatMessage = doucment.createElement("li");
        chatMessage.html("<b>" + name + "</b>: " + message);
        messageList.append(chatMessage);
    }


    // Will enable chat if true is passed in, disable if false
    function enableChat(enabled) {
        send.disabled = !enabled;
        messageField.disabled = !enabled;
    }

    // Enables chat once user has logged in
    function onlogin() {
        enableChat(true);
    }
}




