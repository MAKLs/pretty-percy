/*
Background script for opening the PrettyPercy options page when the user presses the icon
in the toolbar or the Options button
*/

function openExtensionOptions(request, sender, sendResponse) {

    if (!request.hasOwnProperty("text")) {

        //Clicking the extension icon in the toolbar does not send a request
        //so set the request message.
        var request = { text: "Browser action icon pressed... opening options page" };
    }

    console.log(request.text);

    //Open the options.html page
    browser.runtime.openOptionsPage();
    
}


//Add listeners for the extension's icon in the toolbar and for messages
//from the content script to open the options.html page
browser.browserAction.onClicked.addListener(openExtensionOptions);
browser.runtime.onMessage.addListener(openExtensionOptions);