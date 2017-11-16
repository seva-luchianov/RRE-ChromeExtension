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
                status.textContent = 'Values saved';
                setTimeout(function() {
                    status.textContent = '';
                }, 1000);
            });
        }
    }
}

function restore_options() {
    chrome.storage.sync.get({
        RRERecommendationLimit: '5',
        RRETags: ["stories", "technology"],
        RREBlackList: ["/r/news/", "/r/memes/"]
    }, function(items) {
        console.log(items.RRERecommendationLimit);
        document.getElementById('recommendationLimit').value = items.RRERecommendationLimit;

        var i;
        for (i in items.RRETags) {
            createListEntry('tags', items.RRETags[i]);
        }

        for (i in items.RREBlackList) {
            createListEntry('blacklist', items.RREBlackList[i]);
        }
    });
}

function createListEntry(parentID, name) {
    var parentDIV = document.getElementById(parentID);
    var i;
    for (i = 0; i < parentDIV.childElementCount; i++) {
        var existingName = parentDIV.children[i].children[0].innerHTML;
        if (existingName === name) {
            var status = document.getElementById(parentID + "-status");
            status.textContent = 'Entry already exists';
            setTimeout(function() {
                status.textContent = '';
            }, 1000);
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
                    createListEntry('tags', textbox.value);
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
        let m;

        while ((m = regex.exec(this.value)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                blacklist = match;
                console.log(`Found match, group ${groupIndex}: ${match}`);
            });
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
            createListEntry('blacklist', tag);
            this.value = "";
        }
    }
});
