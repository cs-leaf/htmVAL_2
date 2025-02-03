const socket = io('ws://localhost:5500'); //ON START
hideDiv("homeControl", false);
hideDiv("valControl", true);
hideDiv("keebControl", true);
hideDiv("valBO5Select", true);
hideDiv("valBO3Select", true);

//VARIABLES... Home is [0], Away is [1];
let score = [0,0];
let names = ["Home", "Away"];
let slugs = ["H1", "A2"];
let colors = [["#FF0000","#00FF00"],["#000000","#FFFFFF"]]; // [0[0]] and [0[1]] are primary colors, [1[0]] and [1[1]] are secondary colors.
let logos = ["https://placehold.co/400","https://placehold.co/400"];
let tol = [2,2];
let flipped = false;
let currentMenu = 0; // 0 = no game selected,  1 = VALORANT, 2 = Overwatch, 3 = other.
let mapMode = 0 // 0 = BO3 and 1 = B05
let currentMap = 1;

    //VALORANT
    let val_mapsArr3 = [["N/A", 0],["N/A", 0],["N/A", 0]];
    let val_mapsArr5 = [["N/A", 0],["N/A", 0],["N/A", 0],["N/A", 0],["N/A", 0]];
        //MAP ARRAYS CONTAIN THE MAP NAME, [x][0]... FOLLOWED BY THE ID OF THE WINNING TEAM, [x][1].

    //OVERWATCH 2
    let currentMode = "N/A";
    let ow_mapsArr5 = [["N/A", 0],["N/A", 0],["N/A", 0],["N/A", 0],["N/A", 0]];
        //MAP ARRAYS CONTAIN THE MAP NAME, [x][0]... FOLLOWED BY THE ID OF THE WINNING TEAM, [x][1].


//FUNCTIONS
function updateScore(index, points) {
    if (index < 0 || index > 1) return; // Ensure valid index

    // Update score within bounds
    const newScore = Math.max(0, score[index] + points);
    if (newScore <= 5) {
        score[index] = newScore;
        serverConsoleLog(score);

        // Update the relevant DOM element
        const elementID = index === 0 ? "scoreHome" : "scoreAway";
        updateText(elementID, score, index);
    }
    socket.emit("scoreUpdate", score);
}
function resetScore(index) {
    score[index] = 0;
    serverConsoleLog(score);
    socket.emit("scoreUpdate", score);
    // Update the relevant DOM element
    const elementID = index === 0 ? "scoreHome" : "scoreAway";
    updateText(elementID, score, index);
}
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
function serverConsoleLog(logMessage) {
    socket.emit("serverConsoleLog", logMessage);
};
function selectMenu(menuID) {
    if (menuID >= 0 && menuID < 4){
        currentGame = menuID;
    }
    hideDiv("homeControl", true);
    hideDiv("valControl", true);
    hideDiv("keebControl", true);

    // Show the selected control div
    const prefix = createPrefix(currentGame);
    const controlID = `${prefix}Control`;
    if (document.getElementById(controlID)) {
        hideDiv(controlID, false);
    } else {
        serverConsoleLog(`Control div with ID "${controlID}" does not exist.`);
    }
};
function createPrefix(menuID) {
    const gameArr = ["home", "val", "keeb", "other"];
    return gameArr[menuID] ?? "error";
};
function hideDiv(elementID, hideBool) {
    const element = document.getElementById(elementID);
    if (element) {
        element.style.display = hideBool ? "none" : "block";
    } else {
        serverConsoleLog(`Element with ID "${elementID}" not found.`);
    }
};
function submitTeamInfo(teamID) {
    let suffix = "";
    if (teamID == 0){
        suffix = "A";
    }else{
        if (teamID == 1){
            suffix = "B";
        }
    };
    names[teamID] = document.getElementById(`inputName${suffix}`).value;
    slugs[teamID] = document.getElementById(`inputSlug${suffix}`).value;
    colors[0][teamID] = document.getElementById(`inputPCol${suffix}`).value;
    colors[1][teamID] = document.getElementById(`inputSCol${suffix}`).value;
    logos[teamID] = document.getElementById(`inputImg${suffix}`).value;
    updateImgURL(`img${suffix}`, logos, teamID);
    updateText(`name${suffix}Display`, names, teamID);

    socket.emit(`teamInfoUpdates`, names, slugs, colors, logos);
}
function flipBoard() {
    flipped = !flipped;
    updateText("flipValue", `Flipped is ${flipped}`);
    socket.emit("flipUpdate", flipped);
}
function getRadio(name){
    const radios = document.getElementsByName(name); // Get all radio buttons with the specified name
    for (const radio of radios) {
        if (radio.checked) { // Check if this radio button is selected
            return radio.value; // Return its value
        }
    }
    return null;
}
function submitMaps() {
    // Get the selected map format (BO3 or BO5)
    mapMode = getRadio("VALbestOfRadio") || 1;
    console.log(`Current Format Selected: ${mapMode}`);
    currentMap = getRadio("valCurrMap") || 1;
    console.log(`Current Map Selected: ${currentMap}`);

    if (mapMode == 0) {
        // Best of 3 format
        for (let i = 0; i < 3; i++) {
            const mapInput = document.getElementById(`valBO3_map${i + 1}`);
            const winnerInput = document.getElementById(`val_map${i + 1}WinnerBO3`);
            
            val_mapsArr3[i][0] = mapInput?.value || "N/A";
            val_mapsArr3[i][1] = parseWinner(winnerInput?.value);
        }
        console.log("Updated Best of 3 Maps:", val_mapsArr3);
        emitMap(val_mapsArr3, currentMap);
    } else if (mapMode == 1) {
        // Best of 5 format
        for (let i = 0; i < 5; i++) {
            const mapInput = document.getElementById(`valBO5_map${i + 1}`);
            const winnerInput = document.getElementById(`val_map${i + 1}WinnerBO5`);
            
            val_mapsArr5[i][0] = mapInput?.value || "N/A";
            val_mapsArr5[i][1] = parseWinner(winnerInput?.value);
        }
        console.log("Updated Best of 5 Maps:", val_mapsArr5);
        emitMap(val_mapsArr5, currentMap);
    } else {
        console.error("Invalid mapMode value.");
    }
}
// Helper function to parse winner input
function parseWinner(winner) {
    if (winner === "A") return 0; // Map winner is Home
    if (winner === "B") return 1; // Map winner is Away
    return null; // No winner selected
}
function emitMap(mapArr, selMap){ //used to quickly emit map data
    socket.emit("mapUpdate", mapArr, selMap);
}

//Select Map Format
const bestOfBtns = document.querySelectorAll('input[name="VALbestOfRadio"]');
bestOfBtns.forEach(radioButton => { //VALORANT
    radioButton.addEventListener('change', () => {
        format = document.querySelector('input[name="VALbestOfRadio"]:checked').value;
        console.log('Selected format:', format);
        if (format != 1){
            hideDiv("valBO3Select", false);
            hideDiv("valBO5Select", true);
        }else{
            hideDiv("valBO5Select", false);
            hideDiv("valBO3Select", true);
        }
    })
})

//listen for timeout updates
document.getElementById("tolA").addEventListener("change", (event) => {
    tol[0] = parseInt(event.target.value, 10) || 0; // Ensure integer or fallback to 0
    updateText("tolADisplay", tol, 0); // Update the display with the correct value
    socket.emit("tolUpdate", tol);
});

document.getElementById("tolB").addEventListener("change", (event) => {
    tol[1] = parseInt(event.target.value, 10) || 0; // Ensure integer or fallback to 0
    updateText("tolBDisplay", tol, 1); // Update the display with the correct value
    socket.emit("tolUpdate", tol);
});

//CSS Changes w/ javascript
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            // Remove the active class from all links
            navLinks.forEach(nav => nav.classList.remove("active"));

            // Add the active class to the clicked link
            link.classList.add("active");
        });
    });
});

//Keybinds
let keybinds = {
    increaseScoreA: "Ctrl+ArrowUp",
    decreaseScoreA: "Ctrl+ArrowDown",
    increaseScoreB: "Shift+ArrowUp",
    decreaseScoreB: "Shift+ArrowDown",
    resetScores: "Ctrl+Shift+ArrowDown",
    flipTeams: "Shift+F",
}
document.addEventListener("keydown", function(event) {
    if (event.repeat) return; // Prevent holding the key from triggering multiple times

    let keyCombo = 
        (event.ctrlKey ? "Ctrl+" : "") +
        (event.shiftKey ? "Shift+" : "") +
        (event.altKey ? "Alt+" : "") +
        event.key;

    console.log(`Detected key: ${keyCombo}`); // Debugging

    for (let action in keybinds) {
        if (keybinds[action] === keyCombo) {
            handleKeybind(action);
            event.preventDefault(); // Prevent default browser behavior (e.g., Ctrl+R refreshing the page)
            return;
        }
    }
});
// Function to execute keybind actions
function handleKeybind(action) {
    switch (action) {
        case "increaseScoreA":
            updateScore(0, 1);
            break;
        case "decreaseScoreA":
            updateScore(0, -1);
            break;
        case "increaseScoreB":
            updateScore(1, 1);
            break;
        case "decreaseScoreB":
            updateScore(1, -1);
            break;
        case "resetScores":
            resetScore(0);
            resetScore(1);
            break;
        case "flipTeams":
            flipBoard();
            break;
        default:
            console.log(`No function assigned to ${action}`);
    }
}


