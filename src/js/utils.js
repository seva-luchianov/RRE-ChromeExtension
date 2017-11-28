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
    }
}
