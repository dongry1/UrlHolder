const { ipcRenderer } = require('electron');
const inputBtn = document.getElementById('db-input-btn');
const urlDescriptionText = document.getElementById('url-description-text');
const urlText = document.getElementById('url-text');
const urlTitleText = document.getElementById('url-title-text');

// Table Maker
const UrlTableMaker = require("./UrlTableMaker");
// Editable Table
const TableCellEditing = require("./TableCellEditing");
ipcRenderer.invoke('event:db:loading').then((list) => {
    UrlTableMaker(list);
    const editing = new TableCellEditing(document.querySelector('table'));
    editing.init();
});

inputBtn.addEventListener('click', e => {
    // 입력값 테스트
    if (urlTitleText.value && urlText.value && String(urlText.value).includes('http')) {
        ipcRenderer.invoke('event:input', urlTitleText.value, urlDescriptionText.value, urlText.value);
    } else {
        window.alert('제목과 URL을 입력해주세요!')
    }
})