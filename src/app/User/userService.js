const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (nickName, phoneNumber, profileImgUrl, town, countryIdx) {
    try {
        // 전화번호 중복 확인
        const phoneNumberRows = await userProvider.phoneNumberCheck(phoneNumber);
        if (phoneNumberRows.length > 0) {
            return errResponse(baseResponse.SIGNUP_REDUNDANT_PHONENUMBER);
        }

        const insertUserInfoParams = [nickName, phoneNumber, profileImgUrl, town, countryIdx];

        const connection = await pool.getConnection(async (conn) => conn);
        const userIdResult = await userDao.insertUser(connection, insertUserInfoParams);
        connection.release();

        return response(baseResponse.SUCCESS, {"추가된 회원": userIdResult[0].insertId});
    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
