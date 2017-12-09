const jsdom = require('jsdom');
const {
    JSDOM
} = jsdom;
const chrome = require('sinon-chrome');

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
    </html>`
);

global.chrome = chrome;
global.window = dom.window;
global.document = dom.window._document;
global.XMLHttpRequest = require('./js/modules/XMLHttpRequest.mock.js').XMLHttpRequest;
global.alert = function(message) {
    console.log(message);
}

global.navigator = {
    userAgent: 'node.js'
};
