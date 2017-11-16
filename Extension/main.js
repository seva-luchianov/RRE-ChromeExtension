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

var xhr = new XMLHttpRequest();
xhr.open('POST', 'https://localhost:8080/api/subreddits/recommended');
xhr.onload = function() {
    var recommendationsListDIV = document.createElement("lu");
    if (this.status === 200) {
        var response = JSON.parse(this.response);
        var i;
        for (i in response) {
            var recommendationDIV = createRecommendationDIV(response[i].subreddit);
            recommendationsListDIV.appendChild(recommendationDIV);
        }
    } else {
        recommendationsListDIV.appendChild(document.createTextNode("No Recommendations :("));
    }
    RREContainer.appendChild(recommendationsListDIV);

    // Inject into reddit sidebar
    var sideBarDiv = document.getElementsByClassName("side")[0];
    sideBarDiv.insertBefore(RREContainer, sideBarDiv.childNodes[1]);
};

xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhr.send(JSON.stringify({
    tags: [
        "stories",
        "technology"
    ],
    subscribed: [],
    blacklisted: [
        "/r/news/"
    ],
    maxRecommendations: 10
}));

function createRecommendationDIV(subreddit) {
    var recommendationDIV = document.createElement("div");
    recommendationDIV.style.display = "block";
    recommendationDIV.innerHTML = subreddit;
    return recommendationDIV;
}
