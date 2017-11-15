var xhr = new XMLHttpRequest();
xhr.open('GET', 'localhost:8080/api/subreddits/recommended', true);
xhr.onload = function() {
    var
    if (this.status === 200) {
        console.log(this)
            // do something
    } else {

    }

    // Inject
    var newDiv = document.createElement("div");
    var newContent = document.createTextNode("Hi there and greetings!");
    newDiv.appendChild(newContent); //add the text node to the newly created div.

    // add the newly created element and its content into the DOM
    var sideBarDiv = document.getElementsByClassName("side")[0];

    console.log(sideBarDiv);
    sideBarDiv.insertBefore(newDiv, sideBarDiv.childNodes[1]);
};
xhr.send(null);
