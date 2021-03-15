const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

exports.phoneNumberCheck = async function (phoneNumber) {
    const connection = await pool.getConnection(async (conn) => conn);
    const phoneNumberCheckResult = await userDao.selectUserPhoneNumber(connection, phoneNumber);
    connection.release();

    return phoneNumberCheckResult;
};

exports.emailCheck = async function (email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const emailCheckResult = await userDao.selectUserEmail(connection, email);
    connection.release();

    return emailCheckResult;
};

exports.retrieveUserList = async function (email) {
    if (!email) {
        const connection = await pool.getConnection(async (conn) => conn);
        const userListResult = await userDao.selectUser(connection);
        connection.release();

    return userListResult;

    } else {
        const connection = await pool.getConnection(async (conn) => conn);
        const userListResult = await userDao.selectUserEmail(connection, email);
        connection.release();

        return userListResult;
    }
};

exports.retrieveUser = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userResult = await userDao.selectUserId(connection, userId);

    connection.release();

    return userResult[0];
};