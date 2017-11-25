function save_options() {
    var maxRecommendations = parseInt(document.getElementById('recommendationLimit').value);
    var status = document.getElementById('save-status');
    if (isNaN(maxRecommendations)) {
        status.textContent = 'Value must be integer';
    } else {
        if (maxRecommendations < 0) {
            status.textContent = 'Value must be at least 1';
        } else {
            // At this point maxRecommendations is correct format, now gather data for tags and blacklist.
            var tags = [];
            var tagsDIV = document.getElementById('tags');

            var i;
            for (i = 0; i < tagsDIV.childElementCount; i++) {
                tags.push(tagsDIV.children[i].children[0].innerHTML);
            }

            var blacklist = [];
            var blacklistDIV = document.getElementById('blacklist');
            for (i = 0; i < blacklistDIV.childElementCount; i++) {
                blacklist.push(blacklistDIV.children[i].children[0].innerHTML);
            }

            console.log(tags);
            console.log(blacklist);

            chrome.storage.sync.set({
                RRERecommendationLimit: maxRecommendations,
                RRETags: tags,
                RREBlackList: blacklist
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

function restore_options() {
    chrome.storage.sync.get([
        'RRERecommendationLimit',
        'RRETags',
        'RREBlackList'
    ], function(items) {
        console.log(items.RRERecommendationLimit);
        if (!items.RRERecommendationLimit) {
            items.RRERecommendationLimit = 5;
        }
        if (!items.RREBlackList) {
            items.RREBlackList = [];
        }
        document.getElementById('recommendationLimit').value = items.RRERecommendationLimit;

        var i;
        for (i in items.RREBlackList) {
            createListEntry('blacklist', items.RREBlackList[i], false);
        }

        if (!items.RRETags) {
            // No Tag data, use First Time Setup logic
            document.getElementById('first-time-setup-tags').setAttribute("class", "sliderVisible");
            console.log("Range Bar Visible");
        } else {
            for (i in items.RRETags) {
                createListEntry('tags', items.RRETags[i], false);
            }
        }
    });
}

function createListEntry(parentID, name, displayStatus) {
    var parentDIV = document.getElementById(parentID);
    var i;
    for (i = 0; i < parentDIV.childElementCount; i++) {
        var existingName = parentDIV.children[i].children[0].innerHTML;
        if (existingName === name) {
            if (displayStatus) {
                var status = document.getElementById(parentID + "-status");
                status.textContent = 'Entry already exists';
                setTimeout(function() {
                    status.textContent = '';
                }, 1000);
            }
            return;
        }
    }

    var id = parentID + "-" + name;
    console.log("Entry: " + name);

    var entry = document.createElement("div");
    entry.setAttribute("id", id);
    entry.style.display = "block";

    var nameDIV = document.createElement("div");
    nameDIV.innerHTML = name;
    nameDIV.style.display = "inline";
    entry.appendChild(nameDIV);

    var deleteButton = document.createElement("button");
    deleteButton.setAttribute("class", "deleteButton");
    deleteButton.innerHTML = 'X';
    // deleteButton.setAttribute("id", "delete-" + tagName);
    deleteButton.addEventListener('click', function() {
        var deleteThis = document.getElementById(this.parentElement.id);
        deleteThis.parentNode.removeChild(deleteThis);
    });
    entry.appendChild(deleteButton);
    parentDIV.appendChild(entry);
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

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
        if (tagListDIV.childElementCount > totalTags) {
            while (!!tagListDIV.firstChild) {
                tagListDIV.removeChild(tagListDIV.firstChild);
            }
        }
        // we dont have to clear list if it has less tags becuase createListEntry prevents duplicates
        var tag;
        for (tag in response) {
            createListEntry('tags', tag, false);
        }
    }
    xhr.send(JSON.stringify({
        subreddits: [
            "/r/news/"
        ],
        maxDistance: maxDistance
    }));
});

document.getElementById("tagsInput").addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
        var textbox = this;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://localhost:8080/api/tags/');
        xhr.onload = function() {
            if (this.status === 200) {
                var response = JSON.parse(this.response);
                var tagExists = false;
                var i;
                for (i in response) {
                    tagExists = tagExists || (response[i].name === textbox.value);
                }
                if (tagExists) {
                    createListEntry('tags', textbox.value, true);
                    textbox.value = "";
                } else {
                    var status = document.getElementById('tags-status');
                    status.textContent = 'Tag Not Found';
                    setTimeout(function() {
                        status.textContent = '';
                    }, 1000);
                }
            } else {
                // Fucking RIP
            }
        };
        xhr.send();
    }
});

document.getElementById("blacklistInput").addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
        var blacklist = "";
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
                blacklist = m[i]
            }
        }
        if (!blacklist) {
            var status = document.getElementById('blacklist-status');
            status.textContent = 'Input cannot be interpreted as subreddit';
            setTimeout(function() {
                status.textContent = '';
            }, 1000);
        } else {
            blacklist = "/r/" + blacklist + "/";
            console.log("final cleanup: " + blacklist);
            createListEntry('blacklist', tag, true);
            this.value = "";
        }
    }
});
