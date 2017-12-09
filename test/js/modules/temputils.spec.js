const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const assert = chai.assert;
const expect = chai.expect;
var utils = require('../../../src/js/utils');
var testUtils = require('../utils');

const seedData = {
  RRETags: ['stories', 'technology', 'food'],
  RREBlackList: ['/r/photography']
},
subscribedSubreddits = ['/r/gaming', '/r/pics']

describe('utility functions', () => {
    describe('loadRecommendations test', () => {
        it('works', () => {
          utils.xhr.loadRecommendations(seedData, subscribedSubreddits, true, function (response) {
            console.log("wtf this works?")
          })
        });
    });

    describe('loadTags test', () => {
        it('creates the List Entry', () => {

        });
    });

    describe('getTagsForSubscriptions test', () => {
        it('creates the List Entry', () => {

        });
    });
});
