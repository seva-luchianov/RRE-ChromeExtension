function save_options() {
    var maxRecommendations = parseInt(document.getElementById('recommendationLimit').value);
    var status = document.getElementById('status');
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
    document.getElementById(parentID).appendChild(entry);
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
