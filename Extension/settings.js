// Saves options to chrome.storage
function save_options() {
    var maxRecommendations = parseInt(document.getElementById('recommendationLimit').value);
    if (isNaN(maxRecommendations)) {
        status.textContent = 'Value must be integer';
    } else {
        if (maxRecommendations < 0) {
            status.textContent = 'Value must be at least 1';
        } else {
            chrome.storage.sync.set({
                RRERecommendationLimit: maxRecommendations
            }, function() {
                // Update status to let user know options were saved.
                var status = document.getElementById('status');
                status.textContent = 'Value saved';
                setTimeout(function() {
                    status.textContent = '';
                }, 1000);
            });
        }
    }
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get({
        RRERecommendationLimit: '5',
    }, function(items) {
        console.log(items.RRERecommendationLimit);
        document.getElementById('recommendationLimit').value = items.RRERecommendationLimit;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
