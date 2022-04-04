module.exports = class TableCellEditing {
    // The Codeholic - Table cell editing using plain javascript| DOM coding challenges
    // https://www.youtube.com/watch?v=K6IH25Vf8ZA&ab_channel=TheCodeholic
    constructor(table) {
        this.tbody = table.querySelector('tbody');
        this.table = table;
    }

    init() {
        // td:not([id="url-cell-id"]) | Selecting TD but exclude(제외) id = 'url-cell-id' 

        this.tds = this.tbody.querySelectorAll('td:not([id="exclude-editing-id"])');
        this.tds.forEach(td => {
            td.setAttribute('contenteditable', true);

            td.addEventListener('click', (event) => {
                if (!this.inEditing(td)) {
                    this.startEditing(td);
                }
            })

        });
    }
    startEditing(td) {
        const activeId = this.findEditing();
        // console.log('activeID:', activeId);
        if (activeId) {
            this.cancelEditing(activeId);
            // return;
        }
        // for identifying if td is in editing mode or not
        td.className = 'in-editing';
        td.setAttribute('data-old-value', td.innerHTML);
        this.createButtonToolbar(td);
    }

    findEditing() {
        // console.log('this.tds', this.tds);
        // console.log(Array.prototype.find.call(this.tds, (td) => this.inEditing(td).cellIndex));
        // debugger;
        // console.log("really index? ", Array.prototype.findIndex.call(this.tds, (td) => this.inEditing(td)));
        return Array.prototype.find.call(this.tds, (td) => this.inEditing(td));
    }

    findEditingIndex() {
        return Array.prototype.findIndex.call(this.tds, (td) => this.inEditing(td));
    }

    cancelEditing(td) {
        td.innerHTML = td.getAttribute('data-old-value');
        // console.log(td.innerHTML);
        td.classList.remove('in-editing');
    }

    finishingEditing(td) {
        this.saveBtnAction();
        td.classList.remove('in-editing');
        this.removeToolbar(td);
    }
    inEditing(td) {
        return td.classList.contains("in-editing");
    }
    createButtonToolbar(td) {
        const toolbar = document.createElement('div');
        toolbar.className = 'button-toolbar';
        toolbar.setAttribute('contenteditable', false);

        toolbar.innerHTML = `
        <button class="btn btn-sm btn-danger btn-delete">Delete</button>
        <button class="btn btn-sm btn-primary btn-save">Save</button>
        <button class="btn btn-sm btn-warning btn-cancel">Cancel</button>
        `;

        td.appendChild(toolbar);

        const btnSave = toolbar.querySelector('.btn-save');
        const btnCancel = toolbar.querySelector('.btn-cancel');
        const btnDelete = toolbar.querySelector('.btn-delete');

        btnSave.addEventListener('click', (event) => {
            event.stopPropagation();
            this.finishingEditing(td);
        });
        btnCancel.addEventListener('click', (event) => {
            event.stopPropagation();
            this.cancelEditing(td);
        })
        btnDelete.addEventListener('click', (event) => {
            event.stopPropagation();
            this.deleteOneRow(td);
        })

    }
    removeToolbar(td) {
        // debugger;
        const toolbar = td.querySelector('.button-toolbar');
        toolbar.remove();
    }

    deleteOneRow(td) {
        // IPC Renderer Teritory
        const { ipcRenderer } = require('electron');
        if (window.confirm("삭제하려면 YES, 아니면 NO")) {
            // const toolBarBtnSave = document.getElementById('btn-save');
            // toolBarBtnSave.addEventListener('click', ev => {})
            let activeCellIndex = this.findEditingIndex(),
                lengthOfTds = this.tds.length,
                rowCount = this.table.querySelectorAll('tr').length - 1;
            // console.log(activeCellIndex, lengthOfTds, rowCount);
            // td 0,1,2,3
            // td 4,5,6,7
            // math.floor((td의 인텍스  예) 7) / (td.length = 8 / rows = 2)) ==> floor(7/4) => 1 * (td.length=8 / rows=2) 결과 4
            let TdIndexForID = Math.floor(activeCellIndex / (lengthOfTds / rowCount)) * (lengthOfTds / rowCount);
            let rowIndex = Math.floor(activeCellIndex / (lengthOfTds / rowCount));
            // getting ID from td , ex) 
            let idForDelete = this.tds[TdIndexForID].innerText;
            // console.log(idForDelete);
            // debugger;
            ipcRenderer.invoke('event:db:delete-one', idForDelete);
            this.table.deleteRow(rowIndex);
            location.reload();
        } // else ( user cancel deletion)
        // td.classList.remove('in-editing');
        // this.removeToolbar(td);
        // remove one row from html
    }

    saveBtnAction() {
        // IPC Renderer Teritory
        const { ipcRenderer } = require('electron');
        // const toolBarBtnSave = document.getElementById('btn-save');
        // toolBarBtnSave.addEventListener('click', ev => {})
        let activeCellIndex = this.findEditingIndex(),
            lengthOfTds = this.tds.length,
            rowCount = this.table.querySelectorAll('tr').length - 1;
        // td 0,1,2,3
        // td 4,5,6,7
        // math.floor((td의 인텍스  예) 7) / (td.length = 8 / rows = 2)) ==> floor(7/4) => 1 * (td.length=8 / rows=2) 결과 4
        let firstColumnTdIndex = Math.floor(activeCellIndex / (lengthOfTds / rowCount)) * (lengthOfTds / rowCount);
        // id는 숨겨져 있다.
        let idForUpdate = this.tds[firstColumnTdIndex].innerText;
        // 저장을 위해 셀마다 값을 가져오는데, Save Cancel 이 같이 셀안에 들어있어서 빼주어야 함.
        let urlTitleForUpdate = this.tds[firstColumnTdIndex + 1].innerText.replace('Delete Save Cancel', ''),
            urlDescForUpdate = this.tds[firstColumnTdIndex + 2].innerText.replace('Delete Save Cancel', ''),
            urlForUpdate = this.tds[firstColumnTdIndex + 3].innerText.replace('Delete Save Cancel', '');
        // debugger;
        if (urlTitleForUpdate && String(urlForUpdate).includes('http')) {
            // 입력값 테스트
            // debugger;
            ipcRenderer.invoke('event:db:update', idForUpdate, urlTitleForUpdate, urlDescForUpdate, urlForUpdate);
        } else {
            window.alert('제목과 URL을 입력해주세요!')
        }
    }
};