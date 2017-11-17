const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const assert = chai.assert;
const expect = chai.expect;
var content = require('../../src/js/content');

describe('content.js tests', () => {

    describe('Test Content Functions', () => {
        it('This main does thing', () => {
            content._createRecommendationDIV('someName');

        });
    });
});
