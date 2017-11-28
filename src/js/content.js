const utils = require('./utils');

//---------------------------------------------------------------------------------------
// Configure mock browser

/*var AbstractBrowser = require('mock-browser').delegates.AbstractBrowser;
var MockBrowser = require('mock-browser').mocks.MockBrowser;

// configure in some factory
var opts = {};

if (typeof window === 'object') {
    // assign the browser window if it exists
    opts.window = window;
} else {
    // create a mock window object for testing
    opts.window = MockBrowser.createWindow();
}

// create the browser object with a real window in brwosers and mock when not in browser
var browser = new AbstractBrowser(opts);

var window = browser.getWindow();
var document = browser.getDocument();*/

//---------------------------------------------------------------------------------------

// Some Globals
var loadingNewRecommendations = false;

// Setup the container
var RREContainer = document.createElement("div");
RREContainer.setAttribute('class', 'spacer');
const optionshtml = chrome.runtime.getURL('./html/options.html');
RREContainer.innerHTML =
    `<div>
        <div>
            <div style="display:inline; font-size:16px; font-weight:bold;">Recommendations:</div>
            <button id="settings-button" style="position:relative; left: 28%">Settings</button>
        </div>
        <lu id=recommendations>
        </lu>
        <div id="optionswrapper" class="optionswrapper">
            <div class="optionswrapper-content">
                <span id="close-optionswrapper" class="close">&times;</span>
                <object style="height: inherit; width: inherit;" type="text/html" data="${optionshtml}"></object>
            </div>
        </div>
    </div>`;

// Inject into reddit sidebar
var sideBarDiv = document.getElementsByClassName("side")[0];
sideBarDiv.insertBefore(RREContainer, sideBarDiv.childNodes[1]);

var oldSettings = {};

document.getElementById('settings-button').addEventListener('click', function() {
    chrome.storage.sync.get([
        'RRERecommendationLimit',
        'RREBlackList'
    ], function(items) {
        oldSettings = items;
        document.getElementById('optionswrapper').style.display = "block";
    });
});

// When the user clicks on <span> (x), close the modal
document.getElementById("close-optionswrapper").onclick = function() {
    closeModalAndUpdateRecommendations();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == document.getElementById("optionswrapper")) {
        closeModalAndUpdateRecommendations();
    }
}

function closeModalAndUpdateRecommendations() {
    chrome.storage.sync.get([
        'RRERecommendationLimit',
        'RREBlackList'
    ], function(items) {
        document.getElementById('optionswrapper').style.display = "none";
        if (oldSettings.RRERecommendationLimit !== items.RRERecommendationLimit) {
            refreshRecommendations(true);
            oldSettings = {};
            return;
        }
        // If blacklist modified, refresh recommendations
        if (oldSettings.RREBlackList.length !== items.RREBlackList.length) {
            refreshRecommendations(true);
            oldSettings = {};
            return;
        } else {
            for (i = 0; i < oldSettings.RREBlackList.length; i++) {
                if (oldSettings.RREBlackList[i] !== items.RREBlackList[i]) {
                    refreshRecommendations(true);
                    oldSettings = {};
                    return;
                }
            }
        }
    });
}

var xhr = new XMLHttpRequest();
xhr.onload = function() {
    if (this.status === 200) {
        var response = JSON.parse(this.response);
        chrome.storage.sync.set({
            RRERecommendations: response
        }, function() {
            loadingNewRecommendations = false;
            populateRecommendations(response);
        });
    } else {
        alert("RRE Server Error: " + this.status);
    }
};

refreshRecommendations();

function refreshRecommendations(deletedRecommendation) {
    if (deletedRecommendation) {
        var recommendationsListDIV = document.getElementById('recommendations');
        if (typeof deletedRecommendation === 'boolean') {
            while (!!recommendationsListDIV.firstElementChild) {
                recommendationsListDIV.removeChild(recommendationsListDIV.firstElementChild);
            }
        } else {
            recommendationsListDIV.removeChild(deletedRecommendation);
        }
    }

    chrome.storage.sync.get([
        'RRERecommendationLimit',
        'RRETags',
        'RREBlackList'
    ], function(seedData) {
        // Do we have seed data?
        if (!seedData.RRETags || !seedData.RREBlackList || !seedData.RRERecommendationLimit) {
            // No seed data, first time setup.
            console.log("First Time Setup Triggered");
            document.getElementById('optionswrapper').style.display = "block";
        } else {
            // we have seed data, do we have recommendations?
            chrome.storage.sync.get([
                'RRERecommendations'
            ], function(items) {
                if (!items.RRERecommendations || items.RRERecommendations.length <= seedData.RRERecommendationLimit + 10) {
                    if (!loadingNewRecommendations) {
                        // not enough recommendations stored, need to query for more.
                        loadingNewRecommendations = true;
                        // we do have seed data, need to update recommendations
                        xhr.open('POST', 'https://localhost:8080/api/subreddits/recommended');
                        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                        xhr.send(JSON.stringify({
                            tags: seedData.RRETags,
                            subscribed: [],
                            blacklisted: seedData.RREBlackList,
                            maxRecommendations: 30
                        }));
                    } else {
                        // we should still have enough recommendations, lets show them.
                        populateRecommendations(items.RRERecommendations, seedData.RRERecommendationLimit, seedData.RREBlackList);
                    }
                } else {
                    // we have recommendations, lets show them.
                    populateRecommendations(items.RRERecommendations, seedData.RRERecommendationLimit, seedData.RREBlackList);
                }
            });
        }
    });
}

function populateRecommendations(recommendations, recommendationLimit, blackList) {
    chrome.storage.sync.get([
        'RRERecommendationLimit',
        'RRERecommendations',
        'RREBlackList'
    ], function(items) {
        var recommendationsListDIV = document.getElementById("recommendations");
        if (items.RRERecommendations.length !== 0) {
            var i = 0;
            var encounteredBlacklist = 0;

            function deleteCallback(value) {
                utils.saveBlacklist(value, function() {
                    refreshRecommendations(document.getElementById("recommendations-" + value));
                });
            }

            while (recommendationsListDIV.children.length < items.RRERecommendationLimit) {
                if (items.RREBlackList.indexOf(items.RRERecommendations[i].subreddit) === -1) {
                    var value = items.RRERecommendations[i].subreddit;
                    utils.createListEntryDIV("recommendations", value, false, deleteCallback);
                }
            }
        } else {
            recommendationsListDIV.appendChild(document.createTextNode("No More Recommendations :("));
        }
    });
}
