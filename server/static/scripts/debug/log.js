const socket = io('ws://localhost:5500');

//VARIABLES... Home is [0], Away is [1];
let score = [0,0];
let names = ["Home", "Away"];
let slugs = ["H1", "A2"];
let colors = [["#FF0000","#00FF00"],["#000000","#FFFFFF"]]; // [0[0]] and [0[1]] are primary colors, [1[0]] and [1[1]] are secondary colors.
let logos = ["https://placehold.co/400","https://placehold.co/400"];
let tol = [2,2];
let records = [[0,0],[0,0]]; // [0] contains home's wins [0[0]] and losses [0[1]], [1] contains away's wins [1[0]] and losses [1[1]].
let flipped = false;
let currentGame = 0; // 0 = no game selected,  1 = VALORANT, 2 = Overwatch, 3 = other.
let mapMode = 0 // 0 = BO3 and 1 = B05
let currentMap = 1;
let mapsArr = [];
//MAP ARRAYS CONTAIN THE MAP NAME, [x][0]... FOLLOWED BY THE ID OF THE WINNING TEAM, [x][1].

//activity log
let logID = 1;

socket.on('ioScorePong', inScore => {
    score = inScore;
    addLogElement("p", `<strong>LOG #${logID}:</strong> Score Updated... ${slugs[0]} ${score[0]} - ${score[1]} ${slugs[1]}`);

    if (!flipped){
        updateText("scoreA", score[0]); //update home score on display
        updateText("scoreB", score[1]); //update away score on display
    }else{
        updateText("scoreA", score[1]); //update home score on display
        updateText("scoreB", score[0]); //update away score on display
    }
});
socket.on('ioFlipPong', inFlip => {
    flipped = inFlip;
    addLogElement("p", `<strong>LOG #${logID}:</strong> Scorebug flip status is ${flipped}`);
});
socket.on('ioTeamPong', (inNames, inSlugs, inCols, inLogos, inRecords) => {
    console.log(inNames, inSlugs, inCols, inLogos, inRecords);
    names = inNames;
    slugs = inSlugs;
    colors = inCols;
    logos = inLogos;
    records = inRecords;
    updateText("nameA", `${names[0]} || ${slugs[0]}`); //update home name on display
    updateText("nameB", `${names[1]} || ${slugs[1]}`); //update away name on display
    updateText("recordA", `${records[0][0]} - ${records[0][1]}`); //update home record on display
    updateText("recordB", `${records[1][0]} - ${records[1][1]}`); //update away record on display
    updateImgURL("imgA", logos[0], 0); //update home logo
    updateImgURL("imgB", logos[1], 1); //update away logo
    addLogElement("p", `<strong>LOG #${logID}:</strong> Team Data has been updated. <br>
                    <strong>Name:</strong> ${names[0]}... <strong>Slug:</strong> ${slugs[0]}<br>
                    <strong>Record:</strong> ${records[0][0]} - ${records[0][1]} <br>
                    <strong>Primary Color:</strong> ${colors[0][0]}... <strong>Secondary Color:</strong> ${colors[1][0]} <br>
                    <strong>Logo URL:</strong> ${logos[0]}<br><br>
                    
                    <strong>Name:</strong> ${names[1]}... <strong>Slug:</strong> ${slugs[1]}<br>
                    <strong>Record:</strong> ${records[1][0]} - ${records[1][1]} <br>
                    <strong>Primary Color:</strong> ${colors[0][1]}... <strong>Secondary Color:</strong> ${colors[1][1]} <br>
                    <strong>Logo URL:</strong> ${logos[1]}<br><br>`);
});
socket.on('ioMapPong', (inMaps, inCurrentMap) =>{
    mapsArr = inMaps;
    currentMap = inCurrentMap;
    console.log(mapsArr);
    if (mapsArr.length == 3){
        mapMode = 0;
        addLogElement("p", `<strong>LOG #${logID}:</strong> Best of 3, <br>
                     Selected maps are ${mapsArr[0][0]}, ${mapsArr[1][0]}, and ${mapsArr[2][0]}. <br>
                     Current map is ${mapsArr[currentMap - 1][0]}. <br>
                     ${slugs[mapsArr[0][1]]} won ${mapsArr[0][0]}, ${slugs[mapsArr[1][1]]} won ${mapsArr[1][0]}, and ${slugs[mapsArr[2][1]]} won ${mapsArr[2][0]}`)
    }
    if (mapsArr.length == 5){
        mapMode = 1;
        addLogElement("p", `<strong>LOG #${logID}:</strong> Best of 5, <br>
                     Selected maps are ${mapsArr[0][0]}, ${mapsArr[1][0]}, ${mapsArr[2][0]}, ${mapsArr[3][0]}, and ${mapsArr[4][0]}. <br>
                     Current map is ${mapsArr[currentMap - 1][0]} <br>
                     ${slugs[mapsArr[0][1]]} won ${mapsArr[0][0]}, ${slugs[mapsArr[1][1]]} won ${mapsArr[1][0]}, ${slugs[mapsArr[2][1]]} won ${mapsArr[2][0]}, ${slugs[mapsArr[3][1]]} won ${mapsArr[3][0]}, and ${slugs[mapsArr[4][1]]} won ${mapsArr[4][0]}`)
    }
});
socket.on('ioTimeoutPong', inTol => {
    tol = inTol;
    addLogElement("p", `<strong>LOG #${logID}:</strong> <br> ${slugs[0]} has ${tol[0]} timeouts remaining. <br> ${slugs[1]} has ${tol[1]} timeouts remaining. `);
})

function addLogElement(tag, content){
    const newLog = document.createElement(tag);
    newLog.innerHTML = `${content}`;
    document.getElementById("infoLog").prepend(newLog);
    logID++;
}
function updateText(elementID, value, index=null) {
    if (index !== null){
        document.getElementById(`${elementID}`).textContent = value[index];
    }else{
        document.getElementById(`${elementID}`).textContent = value;
    }
};
function updateImgURL(elementID, content) {
    const placeholder = "https://placehold.co/400"; // Define placeholder URL

        if (!content) {
            content = placeholder;
        }
        document.getElementById(elementID).src = content;
}