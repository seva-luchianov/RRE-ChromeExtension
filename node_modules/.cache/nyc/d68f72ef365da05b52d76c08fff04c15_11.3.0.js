const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const assert = chai.assert;
const expect = chai.expect;

describe('main.js tests', () => {

    };

    // Before Each Test
    before(done => {
    	done();
    });

    after(done => {
        done();
    })

    describe('These mains', () => {
        describe('This main', () => {
        	it('This main does thing', (done) => {


        		done();
            }).catch(done);
       	});
    });
});