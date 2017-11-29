const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const chrome = require('sinon-chrome');
// const chromedriver = require ('chromedriver');
// const webdriver = require ('selenium-webdriver');

 const dom = new JSDOM('<!doctype html><html><body><div class="side"><div></div><div></div></sidebar></body></html>');
global.chrome = chrome;
global.window = dom.window;
global.document = dom.window._document;

global.navigator = {
  userAgent: 'node.js'
};
