const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

exports.phoneNumberCheck = async function (phoneNumber) {
    const connection = await pool.getConnection(async (conn) => conn);
    const phoneNumberCheckResult = await userDao.selectUserPhoneNumber(connection, phoneNumber);
    connection.release();

    return phoneNumberCheckResult;
};

exports.accountCheck = async function (phoneNumber) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userAccountResult = await userDao.selectUserAccount(connection, phoneNumber)
    connection.release();

    return userAccountResult;
};

exports.nickNameCheck = async function (nickName) {
    const connection = await pool.getConnection(async (conn) => conn);
    const nickNameResult = await userDao.selectUserNickName(connection, nickName)
    connection.release();

    return nickNameResult;
};

exports.retrieveLatitude = async function(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const latitudeResult = await userDao.selectLatitude(connection, userIdx);
    connection.release();

    return latitudeResult[0];
};

exports.retrieveLongitude = async function(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const longitudeResult = await userDao.selectLongitude(connection, userIdx);
    connection.release();

    return longitudeResult[0];
};
