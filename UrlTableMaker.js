module.exports = function UrlTableMaker(list) {
    let bd = document.getElementsByTagName('body')[0];
    let tbl = document.createElement('table');
    tbl.setAttribute('id', 'urlTable');
    let tblbody = document.createElement('tbody');
    for (let j = 0; j < list.length; j++) { // 마지막 추가 한칸
        if (j === 0) {
            // TableHeader
            let row_head = document.createElement('tr');
            for (let [key, value] of Object.entries(list[j])) {
                let cell_th = document.createElement('th');
                let cellText;
                // = document.createTextNode(`${key}`);
                // TableHeader : _id, display: none
                switch (`${key}`) {
                    case '_id':
                        cellText = document.createTextNode('ID');
                        cell_th.setAttribute('class', 'list-tbl-th-id');
                        break;
                    case 'url_title':
                        cellText = document.createTextNode('제목');
                        cell_th.setAttribute('class', 'list-tbl-th');
                        break;
                    case 'url_description':
                        cellText = document.createTextNode('사이트 설명');
                        cell_th.setAttribute('class', 'list-tbl-th');
                        break;
                    case 'url':
                        cell_th.setAttribute('class', 'list-tbl-th');
                        cell_th.colSpan = 2;
                        cellText = document.createTextNode('사이트 주소');
                        break;
                    default:
                        cell_th.setAttribute('class', 'list-tbl-th');
                        cellText = document.createTextNode('default');
                        break;
                }
                cell_th.appendChild(cellText);
                row_head.appendChild(cell_th);
            }
            tblbody.appendChild(row_head);
        }

        let row_data = document.createElement('tr');
        for (let [key, value] of Object.entries(list[j])) {
            let cell = null;
            let cellText = null;
            // TableData
            switch (`${key}`) {
                case '_id': // _id cell, display: none
                    cell = document.createElement('td');
                    cell.setAttribute('class', 'tbl-td-id');
                    cellText = document.createTextNode(`${value}`);
                    cell.appendChild(cellText);
                    row_data.appendChild(cell);
                    break;
                case 'url':
                    cell = document.createElement('td');
                    cell.setAttribute('id', 'exclude-editing-id');
                    cell.setAttribute('calss', 'tbl-td-url');

                    cellText = document.createTextNode(`${value}`);
                    let hLink = document.createElement('a');
                    hLink.setAttribute('class', 'tbl-td-url-anchor');
                    hLink.href = `${value}`;
                    hLink.target = '#';
                    hLink.innerText = '링크열기';
                    hLink.append(cellText);
                    cell.appendChild(hLink);
                    row_data.appendChild(cell);

                    cell = document.createElement('td');
                    cell.setAttribute('class', 'tbl-td-plain');

                    cell.appendChild(cellText);
                    row_data.appendChild(cell);
                    break;
                default:
                    // url_title, url_description
                    cell = document.createElement('td');
                    cell.setAttribute('class', 'tbl-td-plain');
                    cellText = document.createTextNode(`${value}`);
                    cell.appendChild(cellText);
                    row_data.appendChild(cell);
                    break;
            }
        }
        tblbody.appendChild(row_data);
    }
    tbl.appendChild(tblbody);
    bd.append(tbl);
}