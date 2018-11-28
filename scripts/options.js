/*
Functions for handling actions on the options.html page.
Also sets the theme in storage in Current Theme when the page is loaded.
*/


function displaySaveMessage() {

    var message = document.querySelector("div.confirm");
    var resetOpacity = function (msg) {
        msg.style.opacity = 0;
    };
    console.log(message)
    message.style.opacity = 1;
    setTimeout(resetOpacity, 1000, message);
}


function getRandomTheme() {

    var themes = document.querySelectorAll("option:enabled");
    var max = themes.length;
    var randomInt = function (max) {
        return Math.floor(Math.random() * max);
    }(max);

    return themes[randomInt].value;
}


function reapplyOptions(tabs) {

    for (var tab of tabs) {

        console.log("Resetting theme of tab with ID {}".replace("{}", tab.id));
        browser.tabs.sendMessage(tab.id, "reload")
    }
}


function restoreOptions() {

    var gettingOptions = browser.storage.sync.get();
    var selectOption = function (selection, val) {
        var options = selection.options
        for (var opt, i = 0; opt = options[i]; i++) {
            if (opt.value === val) {
                selection.selectedIndex = i;
                break;
            }
        }
    }

    gettingOptions.then((res) => {

        var borderType = res.borderType || "borderLeft";
        var theme = res.theme || "default";

        selectOption(document.querySelector("#theme"), theme);
        document.querySelector("input[value={}]".replace("{}", borderType)).checked = true;
    });
}


function saveOptions(e) {

    var options = {
        theme: document.querySelector("#theme").value,
        borderType: document.querySelector("input[name=border-type]:checked").value
    };
    var percyTabQuery = browser.tabs.query({ url: "*://*.percy.osisoft.com/*" });
    var settingOptions = browser.storage.sync.set(options);

    //console.log("Setting theme to '{}'.".replace("{}", options.theme));
    //console.log("Setting border type to '{}'.".replace("{}", options.borderType));

    //Stop the form from showing "no value found" while we wait for the 
    //storage.sync.set Promise to finish
    e.preventDefault();

    //Reapply new theme to all open Percy Tabs
    settingOptions.then(() => {
        displaySaveMessage();
        percyTabQuery.then(reapplyOptions)
    });
}


//Add listeners to load the stored theme and for when the save button
//on the Options page is pressed.
document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener("keypress", (e) => {
    //If Enter key is pressed, save options
    if (e.keyCode === 13) {
        saveOptions(e);
    }
});
document.querySelector("form").addEventListener("submit", saveOptions);