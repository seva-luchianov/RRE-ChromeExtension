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
});
