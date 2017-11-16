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

    // Inject into reddit sidebar
    var sideBarDiv = document.getElementsByClassName("side")[0];
    sideBarDiv.insertBefore(recommendationsListDIV, sideBarDiv.childNodes[1]);
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
