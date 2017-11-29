function getRecommendations(xhr, seedData) {
    // Insert loading animation
    var recommendationsListDIV = document.getElementById('recommendations');
    var loadingDIV = document.createElement("img");
    loadingDIV.setAttribute("src", chrome.runtime.getURL('./img/loading.gif'));
    loadingDIV.setAttribute("id", "recommendations-loading");
    loadingDIV.style.maxHeight = "100px";
    recommendationsListDIV.insertBefore(loadingDIV, recommendationsListDIV.firstElementChild);

    xhr.open('POST', 'https://localhost:8080/api/subreddits/recommended');
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({
        tags: seedData.RRETags,
        subscribed: [],
        blacklisted: seedData.RREBlackList,
        maxRecommendations: module.exports.RRERecommendationsCacheSize
    }));
}

module.exports = {
    RRERecommendationsCacheSize: 30, // The max size of RRERecommendations.length
    RRERecommendationsCacheBufferSize: 10, // The minimum result of RRERecommendations.length - RRERecommendationLimit
    saveBlacklist: function(subreddit, callback) {
        chrome.storage.sync.get([
            'RREBlackList',
            'RRERecommendations'
        ], function(items) {
            var doDelete = true;
            var blacklist = items.RREBlackList;
            var recommendations = items.RRERecommendations;
            var i;
            for (i = 0; i < blacklist.length; i++) {
                if (blacklist[i].subreddit === subreddit) {
                    // If this is true then we are deleting the entry, not adding it
                    if (blacklist[i].rank !== -1) {
                        recommendations.splice(blacklist[i].rank, 0, blacklist[i]);
                    }
                    blacklist.splice(i, 1);
                    doDelete = false;
                    break;
                }
            }

            if (doDelete) {
                var newBlacklistEntry = {
                    subreddit: subreddit,
                    rank: -1
                }

                var recommendations = items.RRERecommendations;
                for (i = 0; i < recommendations.length; i++) {
                    if (recommendations[i].subreddit === newBlacklistEntry.subreddit) {
                        newBlacklistEntry.rank = i;
                        break;
                    }
                }
                if (newBlacklistEntry.rank > -1) {
                    recommendations.splice(newBlacklistEntry.rank, 1);
                }

                blacklist.push(newBlacklistEntry);
            }

            chrome.storage.sync.set({
                RREBlackList: blacklist,
                RRERecommendations: recommendations
            }, function() {
                callback();
            });
        });
    },
    createListEntryDIV: function(parentID, value, displayStatus, deleteCallback) {
        var parentDIV = document.getElementById(parentID);
        var i;
        for (i = 0; i < parentDIV.childElementCount; i++) {
            var existingValue = parentDIV.children[i].children[0].innerHTML;
            if (existingValue === value) {
                if (displayStatus) {
                    var status = document.getElementById(parentID + "-status");
                    status.textContent = 'Entry already exists';
                    setTimeout(function() {
                        status.textContent = '';
                    }, 1000);
                }
                return false;
            }
        }

        var id = parentID + "-" + value;

        var entry = document.createElement("div");
        entry.setAttribute("id", id);
        entry.style.display = "block";

        var valueDIV = document.createElement("div");
        valueDIV.innerHTML = value;
        valueDIV.style.display = "inline";
        entry.appendChild(valueDIV);

        if (parentID === "recommendations") {
            entry.setAttribute("class", "recommendation");
            valueDIV.addEventListener('click', function() {
                window.location.pathname = value;
            });
        }

        var deleteButton = document.createElement("button");
        deleteButton.setAttribute("class", "deleteButton");
        // deleteButton.setAttribute("id", parentID + "-delete-" + value);
        deleteButton.innerHTML = '&times;';
        deleteButton.addEventListener('click', function() {
            deleteCallback(value);
        });
        entry.appendChild(deleteButton);
        parentDIV.appendChild(entry);
        return true;
    },
    xhr: {
        getRecommendations: getRecommendations,
        processRecommendations: function(request, callback) {
            if (request.status === 200) {
                var response = JSON.parse(request.response);
                chrome.storage.sync.set({
                    RRERecommendations: response
                }, function() {
                    loadingNewRecommendations = false;
                    // Remove loading animation
                    var recommendationsListDIV = document.getElementById('recommendations');
                    var loadingDIV = document.getElementById("recommendations-loading");
                    recommendationsListDIV.removeChild(loadingDIV);
                    callback(response);
                });
            } else {
                alert("RRE Server Error: " + request.status);
            }
        }
    }
}
