const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const assert = chai.assert;
const expect = chai.expect;
const main = rewire('../../extension/settings');

describe('settings tests', () => {

    describe('These settings', () => {
        describe('This setting', () => {
            it('This thing does this', () => {

            })
        });
    });
});
