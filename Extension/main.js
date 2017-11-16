var xhr = new XMLHttpRequest();
xhr.open('POST', 'https://localhost:8080/api/subreddits/recommended');
xhr.onload = function() {
    var newDiv = document.createElement("div");
    if (this.status === 200) {
        console.log(this);
        var newContent = createRecommendationDIV("Test");
        newDiv.appendChild(newContent);
    } else {
        var newContent = document.createTextNode("No Recommendations :(");
        newDiv.appendChild(newContent);
    }

    // Inject into reddit sidebar
    var sideBarDiv = document.getElementsByClassName("side")[0];

    console.log(sideBarDiv);
    sideBarDiv.insertBefore(newDiv, sideBarDiv.childNodes[1]);
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

function createRecommendationDIV(name) {
  return document.createTextNode(name);
}
