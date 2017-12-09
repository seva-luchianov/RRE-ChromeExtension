const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const assert = chai.assert;
const expect = chai.expect;
var utils = require('../../../src/js/utils');
var testUtils = require('../utils');

describe('Utility Functions', () => {
    describe('createListEntry', () => {
        it('Creates the List Entry', () => {
            var entryValue = testUtils.uuid('message');
            var deleteFunctionWorks = false;
            utils.createListEntry('recommendations', entryValue, false, function() {
                deleteFunctionWorks = true;
            });
            var entryDIV = document.getElementById('recommendations-' + entryValue);
            expect(entryDIV).to.not.be.undefined;
            if (entryDIV) {
                var deleteButton = entryDIV.lastElementChild;
                expect(deleteButton).to.not.be.undefined;
                if (deleteButton) {
                    deleteButton.click();
                    // make sure the click event has time to execute
                    setTimeout(function() {
                        expect(deleteFunctionWorks).to.be.true;
                    }, 10);
                }
            }
        });

        it('Doesn\'t create duplicate entries', () => {
            var entryValue = testUtils.uuid('message');
            var firstCreated = utils.createListEntry('recommendations', entryValue, false, function() {});
            var secondCreated = utils.createListEntry('recommendations', entryValue, false, function() {});
            expect(firstCreated).to.not.equal(secondCreated);
        });
    });

    describe('setListEntryMessage', () => {
        it('Creates the List Entry Message', () => {
            var message = testUtils.uuid('message');
            utils.setListEntryMessage('recommendations', message, undefined);
            var messageDIV = document.getElementById('recommendations-message');
            expect(messageDIV).to.not.be.undefined;
        });

        it('Modifies existing List Entry Message', () => {
            var message = testUtils.uuid('message');
            utils.setListEntryMessage('recommendations', message, undefined);
            var message2 = testUtils.uuid('message');
            utils.setListEntryMessage('recommendations', message2, undefined);
            var messageDIV = document.getElementById('recommendations-message');
            expect(messageDIV.firstElementChild.innerHTML).to.not.equal(message);
        });

        it('Removes List Entry Message', () => {
            var message = testUtils.uuid('message');
            utils.setListEntryMessage('recommendations', message, undefined);
            utils.setListEntryMessage('recommendations', undefined, undefined);
            var messageDIV = document.getElementById('recommendations-message');
            expect(messageDIV).to.be.null;
        });

        it('Creates List Entry Message With Image', () => {
            var message = testUtils.uuid('message');
            var imageSource = "/path/to/image.png";
            utils.setListEntryMessage('recommendations', message, imageSource);
            var messageDIV = document.getElementById('recommendations-message');
            expect(messageDIV.lastElementChild.src).to.equal(imageSource);
        });
    });

    describe('initializeSubscribedSubreddits', () => {
        describe('Using Vanilla Reddit', () => {
            it('Parses Subscriptions from Header', () => {
                testUtils.setUpDomForVanillaReddit();
                utils.initializeSubscribedSubreddits(function(parsedSubscriptions) {
                    expect(parsedSubscriptions.length).to.equal(testUtils.expectedSubscriptions.length)
                    for (var i in testUtils.expectedSubscriptions) {
                        expect(parsedSubscriptions).to.include(testUtils.expectedSubscriptions[i]);
                    }
                });
            });
        });

        describe('Using RES', () => {
            it('Parses Subscriptions from Header', () => {
                testUtils.setUpDomForRES();
                utils.initializeSubscribedSubreddits(function(parsedSubscriptions) {
                    expect(parsedSubscriptions.length).to.equal(testUtils.expectedSubscriptions.length)
                    for (var i in testUtils.expectedSubscriptions) {
                        expect(parsedSubscriptions).to.include(testUtils.expectedSubscriptions[i]);
                    }
                });
            });
        });
    });
    describe('Utility XHR Functions', () => {
        after((done) => {
            // After all xhr tests have finished running, check if elements in the dom have changed to assert functionality
            setTimeout(function() {
                function assertLoadRecommendations() {
                    alertTriggered = false;
                    console.log('assertLoadRecommendations Completed');
                }
                assertLoadRecommendations();

                function assertLoadTags() {
                    var tagsInput = document.getElementById('tagsInput');
                    expect(tagsInput.childElementCount).to.equal(3);
                    for (var i = 0; i < tagsInput.childElementCount; i++) {
                        expect(["tag1", "tag2", "tag3"]).to.include(tagsInput.children[i].innerHTML);
                    }
                    console.log('assertLoadTags Completed');
                }
                assertLoadTags();

                function assertGetTagsForSubscriptions() {
                    var tagListDIV = document.getElementById('tags');
                    expect(tagListDIV.childElementCount).to.equal(3);
                    for (var i = 0; i < tagListDIV.childElementCount; i++) {
                        expect(["tag1", "tag2", "tag3"]).to.include(tagListDIV.children[i].firstElementChild.innerHTML);
                    }
                    console.log('assertGetTagsForSubscriptions Completed');
                }
                assertGetTagsForSubscriptions();
                done();
            }, 10);
        });

        describe('loadRecommendations test', () => {
            it('Works', () => {
                utils.xhr.loadRecommendations({
                    RRETags: ['loadRecommendations', '200'],
                    RREBlackList: []
                }, [], false, function(response) {
                    console.log("chrome storage callback works");
                    expect(response[0].subreddit).to.equal("/r/loadRecommendations/");
                });
            });

            it('If Server Error, Display Alert', () => {
                utils.xhr.loadRecommendations({
                    RRETags: ['loadRecommendations', '500'],
                    RREBlackList: []
                }, [], false, function(response) {
                    expect.fail();
                });
            });
        });

        describe('loadTags test', () => {
            it('Works', () => {
                utils.xhr.loadTags();
            });
        });

        describe('getTagsForSubscriptions test', () => {
            it('Works', () => {
                utils.xhr.getTagsForSubscriptions(['getTagsForSubscriptions'], 1);
            });
        });
    });
});
