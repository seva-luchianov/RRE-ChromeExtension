const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const assert = chai.assert;
const expect = chai.expect;

describe('settings tests', () => {
    let subreddit;
    const thing;

    // Before Each Test
    before(done => {
    	done();
    });

    after(done => {
    	done();
    })

    describe('These settings', () => {
        describe('This setting', () => {
        	it('This thing does this', (done) => {


        		done();
            }).catch(done);
       	});
    });
});