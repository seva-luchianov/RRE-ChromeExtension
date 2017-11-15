const recommendationBlock = document.createElement('div');
recommendationBlock.className = "recBlock";
recommendationBlock.style.position = 'inherit';

console.log('created');

const sideBarDiv = document.getElementsByClassName('side')[0];
sideBarDiv.insertBefore(recommendationBlock, sideBarDiv.childNodes[1]);

console.log('inserted');

//const recommendationTitle = document.createTextNode('Recommendation 1');
//recommendationBlock.appendChild(recommendationTitle); //add the text node to the newly created div.