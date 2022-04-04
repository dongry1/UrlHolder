// main app.js
const { app, BrowserWindow, ipcMain, Menu } = require('electron'); // windows size and location coordination saving
const windowStateKeeper = require('electron-window-state'); // db access 
const { init_db_once, read_db_all, db_insert_one, db_delete_one, db_update_one } = require('./url_dbhelper');
const path = require('path'); // for the initial data input
const { BSON } = require('realm');
const isMac = process.platform === 'darwin'; // checking if OS is Mac

let mainWindow;

function createWindow() {
    // window size and location preservation
    let winState = windowStateKeeper({
            defaultWidth: 1300,
            defaultHeight: 400,
        })
        // mainWindow config file
    mainWindow = new BrowserWindow({
        title: "Application is currently initializing...",
        x: winState.x,
        y: winState.y,
        width: winState.width,
        height: winState.height,
        minWidth: 1300,
        minHeight: 400,
        resizable: true,
        // 번쩍거림 방지, 초기 바탕화면 색을 집어 넣는다.
        backgroundColor: '#2B2E3B',
        webPreferences: {
            // DEV :: 개발모드일때만 사이즈 조정이 되게 한다. Production에서는 막자
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    // database initialization
    init_db_once();
    mainWindow.loadFile('./main.html');
    // 윈도우 사이즈 저장.
    winState.manage(mainWindow);
    // DEV :: Dev Tools for debug
    // mainWindow.webContents.openDevTools();
    // Event closed -> mainWindow Object = null
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // loading menu-template
    const menu = Menu.buildFromTemplate(menuTemplate);
    // Rendering Menu,
    Menu.setApplicationMenu(menu);
}
// 매뉴중에 Find가 없음 
const menuTemplate = [];

// if desktop is MAC OS X , 맥이면 처음 메뉴는 무조건 App이름이다.
if (isMac) {
    menuTemplate.unshift({
        label: app.name,
        submenu: [
            { role: 'about' },
            isMac ? { label: '닫기', accelerator: 'Command+Q', role: 'close' } : { label: '닫기', accelerator: 'Ctrl+Q', role: 'close' }
        ]
    });
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

ipcMain.handle('event:db:loading', (event) => {
    // database read-all
    let result = read_db_all();
    result = result.toJSON();
    // console.log('ipcMain.handle: read db all() : ', result);
    // ID가 'new ObjectID('123123123123ab223')' 이런식이어서
    // .toString() -> ObjectID('123123123123ab223')
    // .valueOf() -> 123123123123ab223 로 변환, 변환하기위해 아래 루프를 수행한다.
    for (let i = 0; i < result.length; i++) { // array of objects [{},{},{}...]
        for (let [key, value] of Object.entries(result[i])) {
            if (key === '_id') {
                result[i]._id = `${value}`.toString().valueOf();
                // console.log(`${value}`.toString().valueOf());
            }
            // console.log('key:', key);
            // console.log('value:', value);
        }
    }
    return result;
});

ipcMain.handle('event:input', (event, ...args) => {

    //arg0: urlTitleText.value
    //arg1: urlDescriptionText.value
    //arg2: urlText.value
    db_insert_one({
        _id: new BSON.ObjectID(),
        url_title: `${args[0]}`,
        url_description: `${args[1]}`,
        url: `${args[2]}`
    });
});

ipcMain.handle('event:db:update', (event, ...args) => {
    // idForUpdate, urlTitleForUpdate, urlDescForUpdate, urlForUpdate
    db_update_one(...args);
});

ipcMain.handle('event:db:delete-one', (event, ...args) => {
    // idForUpdate, urlTitleForUpdate, urlDescForUpdate, urlForUpdate
    db_delete_one(...args);
});