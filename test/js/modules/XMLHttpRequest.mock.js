module.exports = {
    //`need to make a custom XMLHttpRequest`constructor for testing
    XMLHttpRequest: function() {
        const testingResponse = "Server Response";
        var self = this;

        this.setRequestHeader = function(header, value) {
            console.log("MOCK SERVER Request Header Set");
        };

        this.onload = function() {
            console.log("MOCK SERVER ONLOAD");
        };

        this.onerror = function() {
            console.log("MOCK SERVER ERROR");
        };

        this.open = function(content) {
            console.log("MOCK SERVER Connection Open");
        };

        this.send = function(body) {
            self.onload(testingResponse);
        };
    }
}
