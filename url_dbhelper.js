/*
 * realm db helper, initialize database, search database, anything relate to database
 */
const { once } = require('underscore');
const fs = require('fs');

// mongoDB realmDB (offline use)
const Realm = require('realm');
const { get_url_schema } = require('./url_schema');
const { BSON } = require('realm');
const database_path = './rdb/'; // realm db directory

// SCHEMA name is URL_SCHEMA, 스키마 이름을 지정한다. 
let url_schema = get_url_schema('URL_SCHEMA');
// Realm config가 있어야 한다.// returns realm config for realm access
let config = _realm_config(url_schema);

// TODO: Find the way of using username and password for offline - realm.
// strangely no username and no password for the offline use (Why is that?)
function _realm_config() {
    // DB연결을 위한 구성이 필요함.
    return {
        // 오프라인으로 사용하기 위한 구성. 원래는 온라인으로 사용하는 것이라고 하는데, offline first 라고 - 로컬에 저장한것을 나중에 온라인으로 동기화도 되는것 같다.
        path: `${database_path}${url_schema.name}.realm`,
        inMemory: false,
        // inMemory: the Realm will be opened in-memory,and objects are not persisted; once the last Realm instance is closed, all objects vanish
        schema: [url_schema]
    };
}

// DB초기화 및 초기값 입력 했다가 지움. // TODO : 초기값이 없이 DB를 만드는 방법을 없을까?
function _db_init() {
    // database 초기화 하는 Function
    // if directory not exist then create one directory name 'rdb'
    if (!fs.existsSync(`${database_path}`)) {
        console.info(`${database_path} 디렉토리 없음, 생성중...`)
            // 디렉토리가 없으면 만들자.
        fs.mkdirSync(`${database_path}`);
    }
    if (!fs.existsSync(`${database_path}${url_schema.name}.realm`)) {
        // 파일이 존재하지 않으면, DB가 없다고 판단한다.
        // console.info(`${url_schema.name} DB 파일없음, 생성중...`)
        // DB 가 Open됨.
        let realm_local = new Realm(config);
        realm_local.write(() => {
                // 초기 값을 넣는다.
                // console.info('DB 생성 및 샘플 데이터 입력중...');
                realm_local.create(`${url_schema.name}`, { _id: new BSON.ObjectID(), url_title: "init", url_description: "init", url: "init" });
                // 그리고 지운다. // TODO: DB 파일만 만드는 기능이 있는지 아직 모름
                // console.info('샘플 데이터 삭제...');
                realm_local.deleteAll();
            })
            // DB를 열었다면 꼭 닫아준다.
        realm_local.close();
    } else {
        // 파일이 이미 존재하기에 SKIP
        console.error(` 이미 파일(${database_path}${url_schema.name}.realm) 이 존재함. 초기화 SKIP!.`);
        return;
    }
}

function _init_db_once() {
    // 한번만 실행하려고 하는데, underscore module에서 once를 차용해서 써본다. 효과가 있는것인가?
    return once(_db_init());
}

// update()
function _db_update_one(...args) {
    let idForUpdate = args[0],
        urlTitleForUpdate = args[1],
        urlDescForUpdate = args[2],
        urlForUpdate = args[3];

    // console.log(idForUpdate);
    // console.log(urlTitleForUpdate);
    // console.log(urlDescForUpdate);
    // console.log(urlForUpdate);
    try {
        // console.log('args[1] =', args[1]);
        const realm_local = new Realm(config);
        // const matched = realm_local.objects(schema.name).filtered(`"url_title CONTAINS '${args[0]}'"`);
        const matched = realm_local.objects(url_schema.name).filtered(`_id == oid(${idForUpdate})`)
            // matched is Array of object
            // console.log('found = ', matched.toJSON());
            // console.log(matched[0]);
        realm_local.write(() => {
            // update db entry
            // matched가 Array 이기 때문에 한꺼플 벗겨야 함.
            matched[0].url_title = urlTitleForUpdate || matched[0].url_title;
            matched[0].url_description = urlDescForUpdate || matched[0].url_description;
            matched[0].url = urlForUpdate || matched[0].url; // 새로운 내용이 있다면 새로운 내용으로, 아니면 원래 내용 그대로.
        });
        realm_local.close();
    } catch (err) {
        console.error('Update Failed :', err.message);
    }
}
// delete()
function _db_delete_one(id) {
    // delete one item from db
    try {
        // console.log('args[1] =', id);
        const realm_local = new Realm(config);
        // const matched = realm_local.objects(schema.name).filtered(`"url_title CONTAINS '${args[0]}'"`);
        const matched = realm_local.objects(url_schema.name).filtered(`_id == oid(${id})`)
            // matched is Array of object
            // console.log('found = ', matched.toJSON());
        realm_local.write(() => {
            // delete the matched object from db, one entry
            realm_local.delete(matched);
        });
        realm_local.close();
    } catch (err) {
        console.error('Delete Failed :', err.message);
    }
}
// insert()
function _db_insert_one(obj) {

    // if something is found is 
    if (!_is_duplicated_url(obj.url, obj.url_title)) {
        try {
            const realm_local = new Realm(config);
            realm_local.write(() => {
                // Insert New element to db
                realm_local.create(`${url_schema.name}`, obj);
            })
            realm_local.close();
        } catch (err) {
            console.error('DB입력 불가: ', err.message);
        }
    } else {
        console.error('Found Duplication, Unable To Input!');
    }
}
// find if there is any duplicate url, 중복성 제거 , URL 하고 URL_TITLE
function _is_duplicated_url(...args) {
    const realm_local = new Realm(config);
    // filtering db with url
    let searchResult = realm_local.objects(url_schema.name).filtered(`url == "${args[0]}" OR url_title == "${args[1]}"`);
    searchResult = searchResult.toJSON();
    realm_local.close();
    if (searchResult.length > 0) {
        // 중복되는 데이터가 한개 이상있다.
        return 1;
    } else {
        // 중복되는 데이터가 없다.
        return 0;
    }
}

// read()
function _read_db_all() {
    try {
        const realm_local = new Realm(config);
        let result = realm_local.objects(url_schema.name);

        return result;
    } catch (err) {
        console.error('Read Failed ::', err.message);
    }
}

module.exports = {
    init_db_once: _init_db_once,
    read_db_all: _read_db_all,
    db_insert_one: _db_insert_one,
    db_update_one: _db_update_one,
    db_delete_one: _db_delete_one
}