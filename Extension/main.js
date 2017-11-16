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
        window.open(chrome.runtime.getURL('settings.html'));
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
xhr.open('POST', 'https://localhost:8080/api/subreddits/recommended');
xhr.onload = function() {
    var recommendationsListDIV = document.getElementById("recommendations");
    if (this.status === 200) {
        var response = JSON.parse(this.response);
        var i;
        for (i in response) {
            createRecommendationDIV(response[i].subreddit);
        }
    } else {
        recommendationsListDIV.appendChild(document.createTextNode("No Recommendations :("));
    }
};

xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

chrome.storage.sync.get([
    'RRERecommendationLimit',
    'RRETags',
    'RREBlackList'
], function(items) {
    xhr.send(JSON.stringify({
        tags: items.RRETags,
        subscribed: [],
        blacklisted: items.RREBlackList,
        maxRecommendations: items.RRERecommendationLimit
    }));
});

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
        var deleteThis = document.getElementById(this.parentElement.id);
        deleteThis.parentNode.removeChild(deleteThis);
        // still need to add to blacklist after removed from normal list.
    });
    entry.appendChild(deleteButton);
    parentDIV.appendChild(entry);
}
