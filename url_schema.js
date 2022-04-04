// url properties
const urls = {
    // id 는 어떻게든 중복이 안된다고 본다. primary key 로 지정했음.
    _id: "objectId", // Primary Key
    url_title: "string", // 중복검사함 --> is_duplicated_url
    url_description: "string", // 중복검사 안함.
    url: "string" // 중복검사함 --> is_duplicated_url
}

// return url schema
function _get_url_schema(n) {
    return {
        name: n,
        required: ["url_title", "url"],
        properties: urls,
        primaryKey: '_id',
    };
}
module.exports = {
    get_url_schema: _get_url_schema
}