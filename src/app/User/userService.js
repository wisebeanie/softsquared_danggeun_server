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

exports.createUser = async function (nickName, phoneNumber, profileImgUrl, town, countryIdx, longitude, latitude) {
    try {
        // 전화번호 중복 확인
        const phoneNumberRows = await userProvider.phoneNumberCheck(phoneNumber);
        if (phoneNumberRows.length > 0) {
            return errResponse(baseResponse.SIGNUP_REDUNDANT_PHONENUMBER);
        }

        // 닉네임 중복 확인
        const nickNameRows = await userProvider.nickNameCheck(nickName);
        if (nickNameRows.length > 0) {
            return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);
        }

        // TODO
        // contryIdx 존재 여부 확인

        const insertUserInfoParams = [nickName, phoneNumber, profileImgUrl, town, countryIdx, longitude, latitude];

        const connection = await pool.getConnection(async (conn) => conn);
        const userIdResult = await userDao.insertUser(connection, insertUserInfoParams);
        connection.release();

        return response(baseResponse.SUCCESS, {"added User": userIdResult[0].insertId});
    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.postSignIn = async function(phoneNumber) {
    try {
        // 전화번호 존재 여부 확인
        const phoneNumberRows = await userProvider.phoneNumberCheck(phoneNumber);
        if (phoneNumberRows.length < 1) {
            return errResponse(baseResponse.SIGNIN_PHONENUMBER_WRONG);
        }

        const selectPhoneNumber = phoneNumberRows[0].phoneNumber;

        const userAccountRows = await userProvider.accountCheck(selectPhoneNumber);

        if (userAccountRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        } else if (userAccountRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

        let token = await jwt.sign(
            {
                userIdx: userAccountRows[0].idx,
            },
            secret_config.jwtsecret,
            {
                expiresIn: "365d",
                subject: "userInfo",
            }
        );

        return response(baseResponse.SUCCESS, {'userIdx': userAccountRows[0].idx, 'jwt': token});
    } catch(err) {
        logger.error(`App - postSignIn Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
