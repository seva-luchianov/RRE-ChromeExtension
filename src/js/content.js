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

// Setup the container
var RREContainer = document.createElement("div");
var header = document.createElement("div");
header.appendChild(document.createTextNode("Recommendations:"));

var settingsButton = document.createElement('button');
//settingsButton.setAttribute('id', "go-to-options");
settingsButton.innerHTML = "Settings";
settingsButton.addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
        // New way to open options pages, if supported (Chrome 42+).
        chrome.runtime.openOptionsPage();
    } else {
        // Reasonable fallback.
        window.open(chrome.runtime.getURL('./html/options.html'));
    }
});
header.appendChild(settingsButton);
RREContainer.appendChild(header);

var recommendationsListDIV = document.createElement("lu");
recommendationsListDIV.setAttribute("id", "recommendations");
RREContainer.appendChild(recommendationsListDIV);

// Inject into reddit sidebar
var sideBarDiv = document.getElementsByClassName("side")[0];
sideBarDiv.insertBefore(RREContainer, sideBarDiv.childNodes[1]);

var xhr = new XMLHttpRequest();
xhr.onload = function() {
    if (this.status === 200) {
        var response = JSON.parse(this.response);
        chrome.storage.sync.set({
            RRERecommendations: response
        }, function() {
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
                    // not enough recommendations stored, need to query for more.
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
    console.log("Entry: " + subreddit);

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
    deleteButton.innerHTML = 'X';
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
