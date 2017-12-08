const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const assert = chai.assert;
const expect = chai.expect;
var utils = require('../../../src/js/utils');
var testUtils = require('../utils');

describe('utility functions', () => {
    describe('createListEntry', () => {
        it('creates the List Entry', () => {
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
    });
});
