const utils = require('./utils');

// Globals:
// Used to prevent multiple identical requests to server if user triggers suggestion refresh.
// Set to true before send and set to false inside the onload.
var loadingNewRecommendations = false;

// Used to trigger dynamic refresh if settings are modified.
// Set to current state of settings before when settings wondow opened and compared with settings after settings window is closed.
var oldSettings = {};

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
                <div class="title">RRE Settings</div>
                <span id="close-optionswrapper" class="close">&times;</span>
                <iframe src="${optionshtml}" align="left" class="optionswrapper-frame">
                </iframe>
            </div>
        </div>
    </div>`;

// Inject into reddit sidebar
var sideBarDiv = document.getElementsByClassName("side")[0];
sideBarDiv.insertBefore(RREContainer, sideBarDiv.childNodes[1]);

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
        if (!oldSettings.RRERecommendationLimit || oldSettings.RRERecommendationLimit !== items.RRERecommendationLimit) {
            refreshRecommendations(true);
            oldSettings = {};
            return;
        }
        // If blacklist modified, refresh recommendations
        if (!oldSettings.RREBlackList || oldSettings.RREBlackList.length !== items.RREBlackList.length) {
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
                if (!items.RRERecommendations || items.RRERecommendations.length <= seedData.RRERecommendationLimit + utils.RRERecommendationsCacheBufferSize) {
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
                            maxRecommendations: utils.RRERecommendationsCacheSize
                        }));
                    } else {
                        // we should still have enough recommendations due to RRERecommendationsCacheBufferSize, lets show them.
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
            function deleteCallback(subreddit) {
                utils.saveBlacklist(subreddit, function() {
                    refreshRecommendations(document.getElementById("recommendations-" + subreddit));
                });
            }

            var i = 0;
            while (recommendationsListDIV.children.length < items.RRERecommendationLimit) {
                var subreddit = items.RRERecommendations[i].subreddit;
                if (items.RREBlackList.indexOf(subreddit) === -1) {
                    utils.createListEntryDIV("recommendations", subreddit, false, deleteCallback);
                }
                i++;
            }
        } else {
            recommendationsListDIV.appendChild(document.createTextNode("No More Recommendations :("));
        }
    });
}
