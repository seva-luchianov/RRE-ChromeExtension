module.exports = {
    storage: {
        sync: {
            get: function(search, callback) {
                callback({
                    testingMode: true
                });
            },
            set: function(items, callback) {
                callback({
                    testingMode: true
                });
                // Do Nothing
            }
        },
        savedItems: {}
    },
    runtime: {
        getURL: function(url) {
            return url;
        }
    }
}
