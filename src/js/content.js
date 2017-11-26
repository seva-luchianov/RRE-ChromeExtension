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

var loadingNewRecommendations = false;
// Setup the container
var RREContainer = document.createElement("div");
RREContainer.setAttribute('class', 'spacer');
var manifest = chrome.runtime.getURL('./manifest.json');
var optionshtml = chrome.runtime.getURL('./html/options.html');
console.log(optionshtml);
RREContainer.innerHTML =
    `<div>
        <link rel="manifest" href="${manifest}">
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

var settingsButton = document.getElementById('settings-button');
settingsButton.addEventListener('click', function() {
    document.getElementById('optionswrapper').style.display = "block";
    // window.open(chrome.runtime.getURL('./html/options.html'));
});

// Get the modal
var modal = document.getElementById('optionswrapper');
// Get the <span> element that closes the modal
var closeButton = document.getElementById("close-optionswrapper");

// When the user clicks on <span> (x), close the modal
closeButton.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
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
    if (!!deletedRecommendation) {
        recommendationsListDIV.removeChild(deletedRecommendation);
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
            if (chrome.runtime.openOptionsPage) {
                // New way to open options pages, if supported (Chrome 42+).
                chrome.runtime.openOptionsPage();
            } else {
                // Reasonable fallback.
                window.open(chrome.runtime.getURL('./html/options.html'));
            }
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
            while (i < items.RRERecommendationLimit + encounteredBlacklist) {
                if (items.RREBlackList.indexOf(items.RRERecommendations[i].subreddit) === -1) {
                    if (!isRecommendationDisplayed(items.RRERecommendations[i].subreddit)) {
                        createRecommendationDIV(items.RRERecommendations[i].subreddit);
                    }
                } else {
                    encounteredBlacklist++;
                }
                i++;
            }
        } else {
            recommendationsListDIV.appendChild(document.createTextNode("No More Recommendations :("));
        }
    });
}

function isRecommendationDisplayed(subreddit) {
    var recommendationsListDIV = document.getElementById("recommendations");
    var i;
    for (i = 0; i < recommendationsListDIV.children.length; i++) {
        if (recommendationsListDIV.children[i].firstChild.innerHTML === subreddit) {
            return true;
        }
    }
    return false;
}

function createRecommendationDIV(subreddit) {
    var parentDIV = document.getElementById("recommendations");
    var id = "recommendations-" + subreddit;

    var entry = document.createElement("div");
    entry.setAttribute("id", id);
    entry.setAttribute("class", "recommendation");

    var nameDIV = document.createElement("div");
    nameDIV.innerHTML = subreddit;
    nameDIV.style.display = "inline";
    nameDIV.addEventListener('click', function() {
        window.location.pathname = this.innerHTML;
    });
    entry.appendChild(nameDIV);

    var deleteButton = document.createElement("button");
    deleteButton.setAttribute("class", "deleteButton");
    deleteButton.innerHTML = '&times;';
    deleteButton.addEventListener('click', function() {
        var entryToDelete = document.getElementById(this.parentElement.id);
        chrome.storage.sync.get([
            'RREBlackList',
            'RRERecommendations'
        ], function(items) {
            var blacklist = items.RREBlackList;
            var newBlacklistEntry = entryToDelete.children[0].innerHTML
            blacklist.push(newBlacklistEntry);

            var recommendations = items.RRERecommendations;
            var index = -1;
            var i;
            for (i = 0; i < recommendations.length; i++) {
                if (recommendations[i].subreddit === newBlacklistEntry) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                recommendations.splice(index, 1);
            }
            chrome.storage.sync.set({
                RREBlackList: blacklist,
                RRERecommendations: recommendations
            }, function() {
                refreshRecommendations(entryToDelete);
            });
        });
    });
    entry.appendChild(deleteButton);
    parentDIV.appendChild(entry);
}

module.exports = {
    _createRecommendationDIV: function(subreddit) {
        return createRecommendationDIV(subreddit);
    }
}
