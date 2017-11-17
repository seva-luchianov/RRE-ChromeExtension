const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const assert = chai.assert;
const expect = chai.expect;
const rewire = require("rewire");
const fs = require('fs');
var main = rewire('../../extension/main');

var documentMock {
    createElement: function(type) {
        var element = {
            children: [],
            appendChild: function(child) {
                this.children.push(child);
            },
            innerHTML: "",
            addEventListener: function(eventType, callback) {
                callback();
            },
            setAttribute: function(key, value) {
                this[key] = value;
            },
            insertBefore: function(indexElement, insertElement) {
                var searchedIndex = this.children.indexOf(child);
                if (searchedIndex > -1) {
                    this.children.splice(searchedIndex, 0, insertElement);
                }
            },
            removeChild: function(child) {
                var searchedIndex = this.children.indexOf(child);
                if (searchedIndex > -1) {
                    this.children.splice(searchedIndex, 1);
                }
            },
        }
        fs.writeFileSync("")
        return element;
    },
    createTextNode: function(text) {
        return text
    },
    getElementsByClassName: function(name) {

    },
    getElementById: function(id) {

    }
};

main.__set__({
    document: documentMock
});

describe('main.js tests', () => {

    describe('These mains', () => {
        describe('This main', () => {
            it('This main does thing', () => {

            })
        });
    });
});
