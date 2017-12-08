const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const assert = chai.assert;
const expect = chai.expect;
var utils = require('../../../src/js/utils');

describe('utility functions', () => {
    describe('createListEntry', () => {
        it('works', () => {
            // console.log(document.querySelector('body').innerHTML);
            utils.createListEntry('recommendations');
        })
    });
});
