const config = require('../../../src/config/configuration.json');

module.exports = {
    XMLHttpRequest: function() {
        var self = this;
        this.status = 200;
        this.response = "ok";

        var apiMock = {};

        apiMock[config.RREServerURL + '/api/tags/'] = function() {
            self.status = 200;
            self.response = [{
                name: 'tag1'
            }, {
                name: 'tag2'
            }, {
                name: 'tag3'
            }];
        };

        apiMock[config.RREServerURL + '/api/subreddits/recommended'] = function() {
            self.status = 200;
            self.response = function(choice) {
                if (choice) {
                    self.response = [{
                        subreddit: "/r/loadRecommendations/",
                        rank: 1
                    }];
                } else {
                    self.status = 500;
                }
            }
        };

        apiMock[config.RREServerURL + '/api/subreddits/getTagsForSubreddits'] = function() {
            self.status = 200;
            self.response = {
                tag1: 0,
                tag2: 1,
                tag3: 2
            };
        };

        this.setRequestHeader = function(header, value) {
            console.log("MOCK SERVER Request Header Set");
        };

        this.onload = function() {
            console.log("MOCK SERVER ONLOAD");
        };

        this.onerror = function() {
            console.log("MOCK SERVER ERROR");
        };

        this.open = function(method, url) {
            console.log("MOCK SERVER Connection Open: " + url);
            apiMock[url]();
        };

        this.send = function(body) {
            if (body) {
                body = JSON.parse(body);
                // Mock from getTagsForSubscriptions
                if (body.maxDistance) {

                }
                // Mock from loadRecommendations
                else if (body.tags[0] === "loadRecommendations") {
                    self.response(body.tags[1] === "200");
                }
            }
            self.response = JSON.stringify(self.response)
            console.log("MOCK SERVER RESPONSE: " + self.response);
            self.onload();
        };
    }
}
