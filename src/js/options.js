const utils = require('./utils');

function restore_options() {
    chrome.storage.sync.get([
        'RRERecommendationLimit',
        'RRETags',
        'RREBlackList'
    ], function(items) {
        if (!items.RRERecommendationLimit) {
            items.RRERecommendationLimit = 5;
        }
        if (!items.RREBlackList) {
            items.RREBlackList = [];
        }
        document.getElementById('recommendationLimit').value = items.RRERecommendationLimit;

        function deleteBlacklistCallback(subreddit) {
            utils.saveBlacklist(subreddit, function() {
                document.getElementById("blacklist").removeChild(document.getElementById("blacklist-" + subreddit));
            });
        }

        var i;
        for (i in items.RREBlackList) {
            var subreddit = items.RREBlackList[i].subreddit;
            utils.createListEntryDIV('blacklist', subreddit, false, deleteBlacklistCallback);
        }

        if (!items.RRETags) {
            // No Tag data, use First Time Setup logic
            document.getElementById('first-time-setup-tags').setAttribute("class", "sliderVisible");
            console.log("Range Bar Visible");
        } else {
            function deleteTagCallback(tag) {
                document.getElementById('tags').removeChild(document.getElementById("tags-" + tag));
            }
            for (i in items.RRETags) {
                var tag = items.RRETags[i];
                utils.createListEntryDIV('tags', tag, false, deleteTagCallback);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://localhost:8080/api/tags/');
    xhr.onload = function() {
        console.log(this.status);
        if (this.status === 200) {
            var tagsInput = document.getElementById('tagsInput');
            var response = JSON.parse(this.response);
            console.log("tags loaded");
            var i;
            for (i in response) {
                var option = document.createElement("option");
                option.text = response[i].name;
                tagsInput.add(option);
            }
        }
    };
    console.log("loading tags");
    xhr.send();
    restore_options();
});

document.getElementById("first-time-setup-tags-range").addEventListener("change", function(event) {
    var maxDistance = this.value;
    console.log(maxDistance);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://localhost:8080/api/subreddits/getTagsForSubreddits');
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = function() {
        var response = JSON.parse(this.response);
        var totalTags = Object.keys(response).length;
        var tagListDIV = document.getElementById('tags');
        // clear list if it has more tags than give (this can be optimized)
        // we dont have to clear list if it has less tags because createListEntry prevents duplicates
        if (tagListDIV.childElementCount > totalTags) {
            while (!!tagListDIV.firstChild) {
                tagListDIV.removeChild(tagListDIV.firstChild);
            }
        }

        function deleteCallback(tag) {
            tagListDIV.removeChild(document.getElementById("tags-" + tag));
        }
        var tag;
        for (tag in response) {
            utils.createListEntryDIV('tags', tag, false, deleteCallback);
        }
    }
    xhr.send(JSON.stringify({
        subreddits: [
            "/r/news/"
        ],
        maxDistance: maxDistance
    }));
});

document.getElementById("recommendationLimit").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        var maxRecommendations = parseInt(document.getElementById('recommendationLimit').value);
        var status = document.getElementById('recommendation-limit-status');
        if (isNaN(maxRecommendations)) {
            status.textContent = 'Value must be integer';
        } else {
            if (maxRecommendations < 0) {
                status.textContent = 'Value must be at least 1';
            } else if (maxRecommendations > utils.RRERecommendationsCacheSize - utils.RRERecommendationsCacheBufferSize) {
                status.textContent = 'Value cannot exceed ' + (utils.RRERecommendationsCacheSize - utils.RRERecommendationsCacheBufferSize);
            } else {
                chrome.storage.sync.set({
                    RRERecommendationLimit: maxRecommendations
                }, function() {
                    document.getElementById('first-time-setup-tags').setAttribute("class", "slider");
                    status.textContent = 'Values saved';
                    setTimeout(function() {
                        status.textContent = '';
                    }, 1000);
                });
            }
        }
    }
});

document.getElementById("tagsInput").addEventListener("change", function(event) {
    var self = this;
    var tag = self.value;
    var added = utils.createListEntryDIV('tags', tag, true, function() {
        document.getElementById('tags').removeChild(document.getElementById("tags-" + tag));
    });

    if (added) {
        saveTags(function() {
            self.value = "";
        });
    }
});

document.getElementById("first-time-setup-done").addEventListener("click", function(event) {
    document.getElementById('first-time-setup-tags').setAttribute("class", "slider");
    saveTags(function() {
        chrome.storage.sync.get([
            'RRERecommendationLimit',
            'RREBlackList'
        ], function(items) {
            var update = false;
            if (!items.RRERecommendationLimit) {
                items.RRERecommendationLimit = 5;
                update = true;
            }
            if (!items.RREBlackList) {
                items.RREBlackList = [];
                update = true;
            }
            if (update) {
                chrome.storage.sync.set({
                    RRERecommendationLimit: items.RRERecommendationLimit,
                    RREBlackList: items.RREBlackList
                });
            }
        });
    });
});

function saveTags(callback) {
    var tags = [];
    var tagsDIV = document.getElementById('tags');

    var i;
    for (i = 0; i < tagsDIV.childElementCount; i++) {
        tags.push(tagsDIV.children[i].children[0].innerHTML);
    }

    chrome.storage.sync.set({
        RRETags: tags,
        RRERecommendations: [] // Changing the tags should reset the recommendations.
    }, callback);
}

document.getElementById("blacklistInput").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        var blacklistInput = this;
        var subreddit = "";
        const regex = /[\w]+/g;
        var m;

        while ((m = regex.exec(this.value)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            var i;
            for (i in m) {
                subreddit = m[i]
            }
        }
        if (!subreddit) {
            var status = document.getElementById('blacklist-status');
            status.textContent = 'Input cannot be interpreted as subreddit';
            setTimeout(function() {
                status.textContent = '';
            }, 1000);
        } else {
            subreddit = "/r/" + subreddit + "/";
            utils.createListEntryDIV('blacklist', subreddit, true, function() {
                utils.saveBlacklist(subreddit, undefined);
            });
            utils.saveBlacklist(subreddit, function() {
                blacklistInput.value = "";
            });
        }
    }
});
