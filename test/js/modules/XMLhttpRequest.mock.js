
module.exports = {
  //`need to make a custom XMLHttpRequest`constructor for testing
  XMLHttpRequest: function() {
    const testingResponse = {['/r/gaming', '/r/pics']}

    this.setRequestHeader = function(header, value) {

    }

    this.onload = function() {

    }

    this.onerror = function() {

    }

    this.open = function() {

    }
  }
}
