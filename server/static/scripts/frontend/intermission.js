const socket = io('ws://localhost:5500'); //ON START

let score = [0,0];
let names = ["Home", "Away"];
let slugs = ["H1", "A2"];
let logos = ["https://placehold.co/400","https://placehold.co/400"];

socket.on('ioScorePong', inScore => {
    score = inScore;
    updateText('score0', score, 0);
    updateText('score1', score, 1);
});
socket.on('ioTeamPong', (inNames, inSlugs, inCols, inLogos) => {
    names = inNames;
    slugs = inSlugs;
    logos = inLogos;
    console.log(names);
    updateText('name0', names, 0);
    updateText('name1', names, 1);
    updateImgURL('imgA', logos, 0);
    updateImgURL('imgB', logos, 1);
}) 

//FUNCTIONS
function updateText(elementID, value, index=null) {
    if (index !== null){
        document.getElementById(`${elementID}`).textContent = value[index];
    }else{
        document.getElementById(`${elementID}`).textContent = value;
    }
};
function updateImgURL(elementID, content, index = null) {
    const placeholder = "https://placehold.co/400"; // Define placeholder URL

    if (index !== null) {
        if (!content[index]) {
            content[index] = placeholder;
        }
        document.getElementById(elementID).src = content[index];
    } else {
        if (!content) {
            content = placeholder;
        }
        document.getElementById(elementID).src = content;
    }
}