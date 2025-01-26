import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { app as electronApp, BrowserWindow } from 'electron';
import { log } from 'console';

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5500;

// Express setup
const expressApp = express();
expressApp.use(express.static(path.join(__dirname, 'static')));
const expressServer = expressApp.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

// Socket.IO setup
const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5500','http://127.0.0.1:5500','http://192.168.254.68:5500']
    }
});

// Electron setup
let mainWindow;
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1175,
        height: 800,
        webPreferences: {
            contextIsolation: true, // Recommended for security
            preload: path.join(__dirname, 'preload.js') // Optional for secure communication
        }
    });

    mainWindow.loadURL(`http://localhost:${PORT}/pages/client/client.html`);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};
electronApp.on('ready', createMainWindow);
electronApp.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electronApp.quit();
    }
});
electronApp.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

//socket.io Events and whatnot
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
    socket.on('serverConsoleLog', (message) => {
        console.log(message);
    })

    //VARIABLES... Home is [0], Away is [1];
    let serverScore = [0,0];
    let serverNames = ["Home", "Away"];
    let serverSlugs = ["H1", "A2"];
    let serverCols = [["#FF0000","#00FF00"],["#000000","#FFFFFF"]] // [0[0]] and [0[1]] are primary colors, [1[0]] and [1[1]] are secondary colors.
    let serverLogos = ["https://placehold.co/400","https://placehold.co/400"];
    let serverTOL = [2,2];
    let serverRecords = [[0,0],[0,0]]; // [0] contains home's wins [0[0]] and losses [0[1]], [1] contains away's wins [1[0]] and losses [1[1]].
    let serverFlipped = false;
    let serverMaps = [];
    //MAP ARRAYS CONTAIN THE MAP NAME, [x][0]... FOLLOWED BY THE ID OF THE WINNING TEAM, [x][1].
    let serverCurrentMap = 1;

    socket.on("flipUpdate", (flipped) => {
        serverFlipped = flipped;
        console.log(`Scorebug flip status is ${serverFlipped}`);
        io.emit('ioScorePong', serverScore);
        io.emit('ioTeamPong', serverNames, serverSlugs, serverCols, serverLogos, serverRecords);
        io.emit('ioTimeoutPong', serverTOL);
        io.emit('ioMapPong', serverMaps, serverCurrentMap);
        io.emit('ioFlipPong', serverFlipped);
    });
    socket.on("scoreUpdate", (score) => {
        serverScore = score;
        io.emit('ioScorePong', serverScore);
    })
    socket.on("teamInfoUpdates", (namesIn, slugsIn, colorsIn, logosIn, recordsIn) => {
        serverNames = namesIn;
        serverSlugs = slugsIn;
        serverCols = colorsIn;
        serverLogos = logosIn;
        serverRecords = recordsIn;
        console.log("emitting team pong");
        io.emit('ioTeamPong', serverNames, serverSlugs, serverCols, serverLogos, serverRecords);
        console.log(serverCols);
    });
    socket.on("tolUpdate", (tol) => {
        serverTOL = tol;
        io.emit('ioTimeoutPong', serverTOL);
    });
    socket.on("mapUpdate", (mapArr, selMap) =>{
        serverMaps = mapArr;
        serverCurrentMap = selMap;
        console.log(serverMaps);
        console.log(`Current map is ${serverMaps[selMap - 1][0]}`);
        io.emit('ioMapPong', serverMaps, serverCurrentMap);
    });
});