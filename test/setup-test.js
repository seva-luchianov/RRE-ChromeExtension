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
                <div>
                    <div>
                        <div style="display:inline; font-size:16px; font-weight:bold;">Recommendations:</div>
                        <button id="settings-button" style="position:relative; left: 28%">Settings</button>
                    </div>
                    <lu id=recommendations>
                    </lu>
                    <img id="recommendations-loading" style="display:none; max-height:100px;" src="">
                    <div id="optionswrapper" class="optionswrapper">
                        <div class="optionswrapper-content">
                            <div class="title">RRE Settings</div>
                            <span id="close-optionswrapper" class="close">&times;</span>
                            <iframe id="optionswrapper-frame" class="optionswrapper-frame" align="left" src="">
                            </iframe>
                        </div>
                    </div>
                </div>
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
