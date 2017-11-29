const jsdom = require('jsdom');
const { JSDOM } = jsdom;
// const chromedriver = require ('chromedriver');
// const webdriver = require ('selenium-webdriver');

 const dom = new JSDOM(``, {
  url: "https://reddit.com/",
  contentType: "text/html",
  includeNodeLocations: true
});

global.window = dom.window;
global.document = dom.window._document;

global.navigator = {
  userAgent: 'node.js'
};
