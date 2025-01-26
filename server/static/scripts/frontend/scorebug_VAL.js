//ON START
const socket = io('ws://localhost:5500');
hideDiv(`bo3Maps`, true);
hideDiv(`bo5Maps`, true);

//VARIABLES... Home is [0], Away is [1];
let score = [0,0];
let names = ["Home", "Away"];
let slugs = ["H1", "A2"];
let colors = [["#FF0000","#00FF00"],["#000000","#FFFFFF"]]; // [0][0] and [0][1] are primary colors, [1][0] and [1][1] are secondary colors.
let tol = [2,2];
let flipped = false;
let currentGame = 0; // 0 = no game selected,  1 = VALORANT, 2 = Overwatch, 3 = other.
let mapArr = [];
let mapMode = 0 // 0 = BO3 and 1 = B05
let currentMap = 1;

socket.on('ioFlipPong', inFlip => {
    flipped = inFlip;
    updateScore();
    updateTimeouts();
    updateSlugs();
    updateColors();
})
socket.on('ioScorePong', inScore => {
    //UPDATE SCORES AND CORRESPONDING TEXT ON OVERLAY
    score = inScore;
    updateScore();
});
socket.on('ioTimeoutPong', inTimeouts => {
    //UPDATE TIMEOUTS AND TIMEOUT BARS ON OVERLAY
    tol = inTimeouts;
    updateTimeouts();
});
socket.on('ioTeamPong', (inNames, inSlugs, inCols) => {
    names = inNames;
    slugs = inSlugs;
    colors = inCols;
    updateSlugs();
    updateColors();
});
socket.on('ioMapPong', (inMapArr, inCurrentMap) => {
    mapArr = inMapArr;
    currentMap = inCurrentMap;
    console.log(mapArr);
    console.log(currentMap);
    if (mapArr.length > 3){
        mapMode = 1;
        hideDiv('bo5Maps', false);
        hideDiv('bo3Maps', true);
        //update text
        for (let i = 1; i <= mapArr.length; i++){
            updateText(`text${i}_${mapMode}`, mapArr[i-1][0]);
        };
        getMapWinner();
    }else{
        mapMode = 0;
        hideDiv('bo5Maps', true);
        hideDiv('bo3Maps', false);
        //update text
        for (let i = 1; i <= mapArr.length; i++){
            updateText(`text${i}_${mapMode}`, mapArr[i-1][0]);
        };
        getMapWinner();
    }
})

//FUNCTIONS
function updateText(elementID, value, index=null) {
    if (index !== null){
        document.getElementById(`${elementID}`).textContent = value[index];
    }else{
        document.getElementById(`${elementID}`).textContent = value;
    }
};
function hideDiv(elementID, hideBool) {
    const element = document.getElementById(elementID);
    if (element) {
        element.style.display = hideBool ? "none" : "block";
    } else {
        serverConsoleLog(`Element with ID "${elementID}" not found.`);
    }
};

//functions to update specific parts of the bug
function updateScore(){
    if (flipped == false){
        updateText("scoreL", score, 0);
        updateText("scoreR", score, 1);
    }else{
        updateText("scoreR", score, 0);
        updateText("scoreL", score, 1);
    }
}
function updateTimeouts(){
    if (flipped == false){
        if (tol[0] == 2){
            document.getElementById('timeoutBox1L').style.visibility='visible';
            document.getElementById('timeoutBox2L').style.visibility='visible';
        }
        if (tol[0] == 1){
            document.getElementById('timeoutBox1L').style.visibility='visible';
            document.getElementById('timeoutBox2L').style.visibility='hidden';
        }
        if (tol[0] == 0){
            document.getElementById('timeoutBox1L').style.visibility='hidden';
            document.getElementById('timeoutBox2L').style.visibility='hidden';
        }
        if (tol[1] == 2){
            document.getElementById('timeoutBox1R').style.visibility='visible';
            document.getElementById('timeoutBox2R').style.visibility='visible';
        }
        if (tol[1] == 1){
            document.getElementById('timeoutBox1R').style.visibility='visible';
            document.getElementById('timeoutBox2R').style.visibility='hidden';
        }
        if (tol[1] == 0){
            document.getElementById('timeoutBox1R').style.visibility='hidden';
            document.getElementById('timeoutBox2R').style.visibility='hidden';
        }
    }else{
        if (tol[1] == 2){
            document.getElementById('timeoutBox1L').style.visibility='visible';
            document.getElementById('timeoutBox2L').style.visibility='visible';
        }
        if (tol[1] == 1){
            document.getElementById('timeoutBox1L').style.visibility='visible';
            document.getElementById('timeoutBox2L').style.visibility='hidden';
        }
        if (tol[1] == 0){
            document.getElementById('timeoutBox1L').style.visibility='hidden';
            document.getElementById('timeoutBox2L').style.visibility='hidden';
        }
        if (tol[0] == 2){
            document.getElementById('timeoutBox1R').style.visibility='visible';
            document.getElementById('timeoutBox2R').style.visibility='visible';
        }
        if (tol[0] == 1){
            document.getElementById('timeoutBox1R').style.visibility='visible';
            document.getElementById('timeoutBox2R').style.visibility='hidden';
        }
        if (tol[0] == 0){
            document.getElementById('timeoutBox1R').style.visibility='hidden';
            document.getElementById('timeoutBox2R').style.visibility='hidden';
        }
    }
}
function updateSlugs(){
    if (flipped == false){
        updateText("slugL", slugs, 0);
        updateText("slugR", slugs, 1);
    }else{
        updateText("slugR", slugs, 0);
        updateText("slugL", slugs, 1);
    }
}
function updateColors(){
    //timeout boxes are the designated team's secondary color [1][x]
    //gradients are updated here as well
    if (flipped == false){
        //timeout boxes
        document.getElementById('timeoutBox1L').style.fill=colors[1][0];
        document.getElementById('timeoutBox2L').style.fill=colors[1][0];
        document.getElementById('timeoutBox1R').style.fill=colors[1][1];
        document.getElementById('timeoutBox2R').style.fill=colors[1][1];
        //update gradients
        document.getElementById('gradL_stop1').style.stopColor=colors[0][0];
        document.getElementById('gradL_stop2').style.stopColor=colors[1][0];
        document.getElementById('gradR_stop1').style.stopColor=colors[0][1];
        document.getElementById('gradR_stop2').style.stopColor=colors[1][1];
    }else{
        //timeout boxes
        document.getElementById('timeoutBox1R').style.fill=colors[1][0];
        document.getElementById('timeoutBox2R').style.fill=colors[1][0];
        document.getElementById('timeoutBox1L').style.fill=colors[1][1];
        document.getElementById('timeoutBox2L').style.fill=colors[1][1];
        //update gradients
        document.getElementById('gradR_stop1').style.stopColor=colors[0][0];
        document.getElementById('gradR_stop2').style.stopColor=colors[1][0];
        document.getElementById('gradL_stop1').style.stopColor=colors[0][1];
        document.getElementById('gradL_stop2').style.stopColor=colors[1][1];        
    }
    //map gradient updates
    document.getElementById('mapGradA1').style.stopColor=colors[0][0];
    document.getElementById('mapGradA2').style.stopColor=colors[0][0];
    document.getElementById('mapGradB1').style.stopColor=colors[0][1];
    document.getElementById('mapGradB2').style.stopColor=colors[0][1];
}
function getMapWinner(){
    //map winner id is found in mapArr [x][1]
    //team a's id = 0 and team b's id = 1
    for (let x = 0; x < mapArr.length; x++){
        if (mapArr[x][1] != null){
            document.getElementById(`map${x+1}bg_${mapMode}`).style.fill=`url("#linear-gradient${mapArr[x][1]}")`
        }else{
            document.getElementById(`map${x+1}bg_${mapMode}`).style.fill=`url("#linear-gradientCurrent")`
        }
    }
}


