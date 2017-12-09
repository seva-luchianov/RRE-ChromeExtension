const jsdom = require('jsdom');
const {
    JSDOM
} = jsdom;

const dom = new JSDOM(
    `<!doctype html>
    <html>
        <head>
        </head>
        <body>
            <div class="side">
                <div></div>
                <div></div>
            </div>
        </body>

        <div class="settings">
            <div class="header">Max Recommendations: </div>
            <input type="textbox" id="recommendationLimit">
            <div id="recommendation-limit-status"></div>
            <br>
            <div class="header">Tags:</div>
            <select id="tagsInput">
                <option value="" disabled selected>Add a tag</option>
            </select>
            <div class="firstTimeSetupSlider" id="first-time-setup-tags">
                <input type="range" min="1" max="20" value="5" id="first-time-setup-tags-range">
            </div>
            <div id="tags-status"></div>
            <div id="tags"></div>
            <br>
            <div class="header">Blacklist:</div>
            <input type="textbox" id="blacklistInput">
            <div id="blacklist-status"></div>
            <div id="blacklist"></div>
            <br>
        </div>
    </html>`
);

var chrome = require('sinon-chrome');

// global.chrome = chrome;
global.chrome = require('./js/modules/chrome.mock.js');
global.window = dom.window;
global.document = dom.window._document;
global.XMLHttpRequest = require('./js/modules/XMLHttpRequest.mock.js').XMLHttpRequest;
global.alert = function(message) {
    alertTriggered = true;
    console.log(message);
}
global.alertTriggered = false;

global.navigator = {
    userAgent: 'node.js'
};
