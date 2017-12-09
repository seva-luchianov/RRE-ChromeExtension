const config = require('../../../src/config/configuration.json');

module.exports = {
    XMLHttpRequest: function() {
        var self = this;
        this.status = 200;
        this.response = "ok";

        var apiMock = {};
        this.response = apiMock[config.RREServerURL + '/api/tags/'] = function() {
            self.status = 200;
            self.response = ['tag1', 'tag2', 'tag3'];
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
                if (body.tags[0] === "loadRecommendations") {
                    self.response(body.tags[1] === "200");
                }
            }
            self.response = JSON.stringify(self.response)
            console.log("MOCK SERVER RESPONSE: " + self.response);
            self.onload();
        };
    }
}
