/*
Content script for applying themes to Percy
*/


function applyPercyStyles(theme) {

    //CSS Styles for Percy
    var transitions = {
        //Smooth transitions
        overflow: "hidden",
        callEventHeights: {},
        webKitTransition: "height 0.4s cubic-bezier(0.65, 0.05, 0.36, 1) 0s, opacity 0.4s ease-in-out 0s",
        MozTransition: "height 0.4s cubic-bezier(0.65, 0.05, 0.36, 1) 0s, opacity 0.4s ease-in-out 0s",
        transition: "height 0.4s cubic-bezier(0.65, 0.05, 0.36, 1) 0s, opacity 0.4s ease-in-out 0s"
    };

    var buttonStyles = {
        //Button styles
        text: {
            all: ["- All", "+ All"],
            event: ["-", "+"],
            option: "Options"
        },
        float: "right",
        margin: {
            right: "5px"
        },
        class: {
            all: "collapse-all",
            event: "collapse",
            option: "options"
        },
        color: theme.button["color"],
        background: theme.button["background"],
        border: theme.button["border"]
    };

    //Get all call events in the document
    var allCallEvents = document.getElementsByClassName("call_event");

    //Document background color
    var docBackground = theme.document.background.color;

    var noIndex = {};
    var eventID = "";
    var styleSelector = [];

    var borderStyle = "";
    var borderType = "";
    var internalLabel;
    var internalLabelColor = "";
    var eventLabel;
    var eventLabelColor = "";
    var arrowImage;
    var arrowImageSrc = "";

    let likeButton = document.querySelector("div.like");

    //Set background of document
    document.firstElementChild.style.background = docBackground;
 
    //Insert Option button
    //insertOptionButton(buttonStyles);
    insertButton(
        likeButton.parentElement,
        likeButton,
        "option",
        buttonStyles,
        (clickObj) => {
            browser.runtime.sendMessage({ text: "Open options page." })
        }
    );

    //Iterate through the events and apply the
    //necessary styles.
    for (let callEvent of allCallEvents) {

        //Remove shadows from events
        callEvent.style.boxShadow = "0px 0px 0px #555";

        noIndex = (callEvent.querySelector("div.noindex") === null) ? false : true;
        eventID = callEvent.querySelector("a[id^='event']");

        //All call events have background color set
        setBackgroundColor(callEvent, theme.event.background.color, noIndex);
        
        if (noIndex) {

            //Title call event

        } else {

            //Call event with content

            //Set event label colors (where engineer's name and datetime info are stored)
            eventLabels = callEvent.querySelectorAll("span[class$=bound],span.dateinfo");
            eventLabelColor = theme["event"]["label"]["color"];
            for (let label of eventLabels) {
                label.style.color = eventLabelColor;
            }

            if (eventID !== null) {

                //Call event with content that is not Problem Description

                styleSelector = getStyleSelector(callEvent);

                //Remove any existing borders and apply style
                callEvent.style.removeProperty("border");
                borderStyle = stringifyBorderStyles(theme[styleSelector[0]][styleSelector[1]]["border"]);
                borderType = theme.borderType;
                callEvent.style[borderType] = borderStyle;

                //Set arrow image
                arrowImageSrc = theme[styleSelector[0]][styleSelector[1]]["image"];
                //insertImage(eventLabels[0], eventLabels[0].firstChild, arrowImageSrc, "arrow");
                insertSVG(eventLabels[0], eventLabels[0].firstChild, arrowImageSrc, theme[styleSelector[0]][styleSelector[1]]["border"]["color"], theme.event.background.color);

                if (styleSelector.indexOf("internal") >= 0) {

                    //Set '- Internal' label color
                    internalLabel = callEvent.querySelector("span:not([class])");
                    internalLabelColor = theme[styleSelector[0]][styleSelector[1]]["label"]["color"];
                    internalLabel.style.color = internalLabelColor;

                }

            } else {

                //Set event ID to index the call event's contents' heights in transitions.callEventHeights
                //Problem Description/Resolution does not have an event ID in the DOM
                eventID = { id: "event_1" };

                //Insert collapse all button
                insertButton(
                    callEvent,
                    callEvent.firstChild,
                    "all",
                    buttonStyles,
                    (clickObj) => { collapseAllButtonClick(clickObj.target, buttonStyles.class.event, buttonStyles.text.all) }
                );

            }

            //Set transition styles for call event's content
            setCallEventTransitions(callEvent, transitions, eventID.id);

            //Insert collapse button on call event
            //(also collapse all button on Problem Description/Resolution)
            //insertCollapseButton(callEvent, transitions, buttonStyles, eventID.id);
            let contentHeights = transitions.callEventHeights[eventID.id];

            insertButton(
                callEvent,
                callEvent.firstChild,
                "event",
                buttonStyles,
                (clickObj) => { collapseButtonClick(clickObj.target, callEvent.querySelectorAll("div.call_event_content"), buttonStyles.text.event, contentHeights) }
            );

        }
        
    }

}


function collapseAllButtonClick(button, buttonClass, states) {

    var currentState = button.textContent[0];

    //Get all collapse buttons
    var allCollapseButtons = document.querySelectorAll("button." + buttonClass);

    for (var collapseButton of allCollapseButtons) {

        //Only click buttons that match the all button state
        //FIND BETTER WAY TO CHECK STATE
        if (collapseButton.textContent === currentState) {

            collapseButton.click();
            
        }

    }

    //Change the state of the button
    if (button.textContent === states[0]) {

        button.textContent = states[1];

    } else {

        button.textContent = states[0];

    }

}


function collapseButtonClick(button, contents, states, heights) {

    //Toggle the call event content visibility
    for (var i = 0; i < contents.length; i++) {

        //Hidden -> Visible
        if (contents[i].style.height === "0px") {

            //contents[i].style.visibility = "";
            contents[i].style.height = heights[i];
            contents[i].style.opacity = 1;

        } else {

            //Visible -> Hidden
            contents[i].style.height = "0px";
            contents[i].style.opacity = 0;

        }

    }

    //Change the state of the button
    if (button.textContent === states[0]) {

        button.textContent = states[1];

    } else {

        button.textContent = states[0];

    }

}


function fillRandomTheme(themeStr) {

    var filling = true;
    var startIndex = 0;
    var endIndex = themeStr.length;
    var color = "";
    var holderIndex = 0;
    var tmpStr = "";

    while (filling) {

        holderIndex = themeStr.indexOf("#", startIndex);
  
        if (holderIndex < 0) {
            endIndex = themeStr.length;
            tmpStr += themeStr.substring(startIndex, endIndex);
            filling = false;
        } else {
            endIndex = holderIndex + 1;
            color = getRandomHex();
            tmpStr += themeStr.substring(startIndex, endIndex).replace("#", color);
            startIndex = endIndex
        }
    }
    return tmpStr
}


function getRandomHex() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
}


function getStyleSelector(callEvent) {

    var internalClassName = "call_event call_event_internal";
    var eventClassName = callEvent.className;
    var selector = [];
    var childClassName = callEvent.querySelector("span[class$='bound']").className;
    var callEventLabel = callEvent.querySelector("span");


    //Get the styles to be applied to the event
    if (childClassName === "inbound" && eventClassName === internalClassName) {

        selector.push("inbound", "internal");

    } else if (childClassName === "inbound" && eventClassName !== internalClassName) {

        selector.push("inbound", "external");

    } else if (childClassName === "outbound" && eventClassName === internalClassName) {

        selector.push("outbound", "internal");

    } else if (childClassName === "outbound" && eventClassName !== internalClassName) {

        selector.push("outbound", "external");

    }

    return selector;
}


function getThemeProperties(themeName, doneCallBack) {

    if (themeName === null) {

        name = "default";

    }

    var url = browser.runtime.getURL("themes/{}.json".replace("{}", themeName));
    var xhr;

    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handleStateChange;
    xhr.open("GET", url, true);
    xhr.send();

    function handleStateChange() {
        if (xhr.readyState === 4) {
            doneCallBack(xhr.status == 200 ? xhr.responseText : null);
        }
    }

}


function insertButton() {

    //MANDATORY parameters
    var parent = arguments[0];
    var nextSibling = arguments[1];
    var type = arguments[2];
    var styles = arguments[3];
    var onClickFun = arguments[4];

    //Check if button exists
    var className = styles["class"][type];
    var button = parent.querySelector("button." + className);
    var textContent = styles["text"][type];

    if (button === null) {

        //Create button
        button = document.createElement("button");

        //Set button properties
        button.className = className;
        button.style.float = styles.float;
        button.style.marginRight = styles.margin.right;
        button.textContent = (typeof textContent === "string") ? textContent : textContent[0];
        button.onclick = onClickFun;

        //Insert button into document
        parent.insertBefore(button, nextSibling);

    }

    //Set button styles defined by the theme
    button.style.color = styles.color;
    button.style.background = styles.background;
    button.style.border = styles.border;
}


function insertImage(parent, nextSibling, source, className) {

    //Check if image exists
    var image = parent.querySelector("img." + className);

    if (image === null) {

        //Create image
        image = document.createElement("img");
        image.className = className;
        parent.insertBefore(image, nextSibling);
    }

    image.src = browser.runtime.getURL(source);
}


function insertSVG(parent, nextSibling, source, arrowColor, backGroundColor) {

    var image = parent.querySelector("object.arrow-svg")
    var editSVG = function (svg) {

        let content = image.contentDocument;
        let backGround = content.querySelector("#background");
        let triangle = content.querySelector("#triangle");
        let rectangle = content.querySelector("#rectangle");

        backGround.setAttribute("fill", backGroundColor);
        triangle.setAttribute("fill", arrowColor);
        rectangle.setAttribute("fill", arrowColor);

    };

    //Check if SVG is already in the webpage
    if (image === null) {

        //Create it if not
        image = document.createElement("object");
        image.type = "image/svg+xml";
        image.data = browser.runtime.getURL(source);
        image.className = "arrow-svg";

        parent.insertBefore(image, nextSibling);

        //Edit the SVG once it loads to match the theme colors
        image.addEventListener("load", editSVG, image);

    } else {

        //SVG already loaded, so edit it to match theme colors
        editSVG(image);
    }

}


function main() {

    //Get theme name from sync storage
    var gettingOptions = browser.storage.sync.get();

    gettingOptions.then(function (res) {

        //If no defaults existed in storage, set them
        res.theme = (res.theme === undefined) ? "default" : res.theme;
        res.borderType = (res.borderType === undefined) ? "borderLeft" : res.borderType;

        //Get the theme's properties and apply theme on callback
        getThemeProperties(res.theme, function (response) {

            var theme = {};

            if (response === null) {

                //No themes found!
                console.log("No Pretty Percy themes found!");
                theme = null;

            } else {

                if (res.theme === "random") {
                    response = fillRandomTheme(response);
                }

                //Parse theme string into JSON object
                theme = JSON.parse(response);

                //Add border type to theme
                theme.borderType = res.borderType;

                //Apply the properties in the theme object
                applyPercyStyles(theme);

            }

        });
    });
}


function setBackgroundColor(element, color, isTitleEvent) {

    //Recursively set the background color of the element and its children

    var children = element.children;
    var className = element.className.toLowerCase();
    var tagName = element.tagName.toLowerCase();

    //If the element is an attachment, we do not want to overwrite
    //the attachment's icon
    if (className !== null && className.endsWith("_attach")) {

        element.style.background.backgroundColor = color;

    } else if (className !== "like" && className !== "options" && tagName !== "table" || (tagName === "table" && isTitleEvent)) {

        element.style.background = color;

    } else {
        //Break to prevent children of elements that should not have background
        //from being filled in
        return 0
    }

    for (var child of children) {

        setBackgroundColor(child, color, isTitleEvent);

    }

}


function setCallEventTransitions(callEvent, transitionStyles, callEventIndex) {

    var callEventContent = callEvent.querySelectorAll("div.call_event_content");
    var callEventContentHeight = "";

    //Initialize call event height 
    transitionStyles.callEventHeights[callEventIndex] = [];

    for (var i = 0; i < callEventContent.length; i++) {

        //Get height of call event content
        callEventContentHeight = callEventContent[i].style.height;

        //Store the offset heights for the call event content elements to reset
        //them to original
        transitionStyles.callEventHeights[callEventIndex].push(callEventContent[i].offsetHeight + "px");

        //Apply the transition styles
        callEventContent[i].style.height = (callEventContentHeight === "") ? transitionStyles.callEventHeights[callEventIndex][i] : callEventContentHeight;
        callEventContent[i].style.overflow = transitionStyles.overflow;
        callEventContent[i].style.webKitTransition = transitionStyles.webKitTransition;
        callEventContent[i].style.MozTransition = transitionStyles.MozTransition;
        callEventContent[i].style.transition = transitionStyles.transition;

    }

}


function stringifyBorderStyles(obj) {

    var props = [];

    for (var key in obj) {

        props.push(obj[key]);

    }

    return props.join(" ");
}


//Set listener for messages to apply newly selected theme
browser.runtime.onMessage.addListener(main);

//Run the extension
console.log("Applying Pretty Percy...");
main();