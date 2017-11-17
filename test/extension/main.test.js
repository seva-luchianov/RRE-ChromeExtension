const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const assert = chai.assert;
const expect = chai.expect;
const main = rewire('../../extension/main');

describe('main.js tests', () => {

    describe('These mains', () => {
        describe('This main', () => {
            it('This main does thing', () => {

            })
        });
    });
});
