var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: '05d7d11d-4c13-49b8-9dca-db6ac975fb12',
    appPassword: 'pHHTpacqsQwjA3DnYMdeCEs'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());





//=========================================================
// Activity Events
//=========================================================




bot.on('conversationUpdate', function (message) {
   // Check for group conversations
    if (message.address.conversation.isGroup) {
        // Send a hello message when bot is added
        if (message.membersAdded) {
            message.membersAdded.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    var reply = new builder.Message()
                            .address(message.address)
                            .text("Hello everyone!");
                    bot.send(reply);
                }
            });
        }

        // Send a goodbye message when bot is removed
        if (message.membersRemoved) {
            message.membersRemoved.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    var reply = new builder.Message()
                        .address(message.address)
                        .text("Goodbye");
                    bot.send(reply);
                }
            });
        }
    }
});

bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
                .address(message.address)
                .text("Hi %s... Welcome to the PayPal Integration's bot (Beta). Say 'hello' to start chatting.", name || 'there');
        bot.send(reply);
    } else {
        // delete their data
    }
});

//=========================================================
// Bots Global Actions
//=========================================================

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i });


//=========================================================
// Bots Dialogs
//=========================================================


bot.dialog('/', [
    function (session) {
        // Send a greeting and show help.
        var card = new builder.HeroCard(session)
            .title("Integration Test Bot")
            .text("Our smartest integration team mate.")
            .images([
                 builder.CardImage.create(session, "https://img0.etsystatic.com/033/1/9136998/il_340x270.625165576_jf6k.jpg")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);

        session.send("Hi... Welcome to the PayPal Integration's bot (Beta).");
        session.beginDialog('/help');
    },
    function (session, results) {
        // Display menu
        session.beginDialog('/menu');
    },
    function (session, results) {
        // Always say goodbye
        session.send("Ok... See you later!");
    }
]);

// help

bot.dialog('/help', [
    function (session) {
        session.endDialog("Global commands that are available anytime:\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);


// menu
bot.dialog('/menu', [
    function (session) {
       // var style = builder.ListStyle[results.response.entity];
         var style = builder.ListStyle['button'];
        builder.Prompts.choice(session, "!). I can help you with integrations,  What would you like to do?", "Start an integration|How to..|xxxxxxx", { listStyle: style });
    },
    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
 switch (results.response.entity) {
            case "Start an integration":
                session.replaceDialog("/basic");
                break;
            case "How to..":
                session.replaceDialog("/advanced");
                break;
            case "xxxxxxx":
                session.replaceDialog("/customization");
                break;
            default:
                session.replaceDialog("/");
                break;
        }
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/menu');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/basic', [
	function (session) {
         session.send("That's great %s..\n ", name);
    	 builder.Prompts.choice(session, "Which PayPal product/solution are you looking for?", ["First time integration", "HELP! I have issues!"]); 
    	},
    	 function (session, results) {
        switch (results.response.entity) {
            case "First time integration":
                session.replaceDialog("/first");
                break;
            case "HELP! I have issues!":
                session.replaceDialog("/help2");
                break;
            default:
                session.replaceDialog("/");
                break;
        }
    

    }
]);

bot.dialog('/advanced', [
	function (session) {
         session.send("Advanced integration! \n The technical guidelines can be found here: https://developer.paypal.com/docs/integration/direct/express-checkout/integration-jsv4/advanced-integration/");
    }  
    ]);  
 bot.dialog('/customization', [
	function (session) {
         session.send("You Choose customization! Check the UX guidelines here: ");
    }
]);

 bot.dialog('/first', [
	function (session) {
         session.send("If you are just starting I recommend you to create a test / sandbox account here: http://developer.paypal.com/");
         session.send("After that you can check some awesome sample code here: GITHUB");
    }  
    ]); 

  bot.dialog('/help2', [
	function (session) {
         session.send("No Panic! I am here to help you! :) \n Please try the troubleshooting guidance here: LINK");
         session.send("You can check here the common errors and error codes: LINK");
    }  
    ]); 