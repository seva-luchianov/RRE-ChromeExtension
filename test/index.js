const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const expect = chai.expect;
const chalk = require('chalk');

describe('Testing the frontend...', () => {

    //after going through all the tests we want to disconnect from the database

    // Run the rest of tests
    require('./extension/main.test.js');
    require('./extension/settings.test.js');
});
