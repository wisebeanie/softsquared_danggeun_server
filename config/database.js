const mysql = require('mysql2/promise');

// TODO: 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: 'danggeundb.ccnujuyzzot8.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    port: '3306',
    password: 'hyunbin7231',
    database: 'danggeunDB-dev'
});

module.exports = {
    pool: pool
};