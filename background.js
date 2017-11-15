chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript({
		file: "newRec.js"
	});
});