const {response, errResponse} = require("../../../config/response");
const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");

const userDao = require("./userDao");
const articleDao = require("../Article/articleDao");

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

exports.retrieveUserByIdx = async function(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userIdxResult = await userDao.selectUserByIdx(connection, userIdx);
    connection.release();

    return response(baseResponse.SUCCESS, userIdxResult[0]);
};

exports.retrieveUserProfile = async function(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userProfileResult = await userDao.selectUserProfile(connection, userIdx);
    connection.release();

    if (userProfileResult.length < 1) {
        return response(baseResponse.USER_USER_NOT_EXIST);
    }

    return response(baseResponse.SUCCESS, userProfileResult[0]);
};

exports.retrieveLikes = async function(articleIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const likeResult = await userDao.selectLikes(connection, articleIdx, userIdx);
    connection.release();

    return likeResult;
};

exports.retrieveLikesByUserIdx = async function(userIdx, isAd) {
    const connection = await pool.getConnection(async (conn) => conn);
    const likesList = await userDao.selectLikesByUserIdx(connection, userIdx, isAd);
    for (article of likesList) {
        const articleImgResult = await articleDao.selectArticleImg(connection, article.idx);
        const img = articleImgResult[0];
        article.representativeImg = img;
    }
    connection.release();

    return response(baseResponse.SUCCESS, likesList);
};

exports.checkJWT = async function(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkJWTResult = await userDao.selectJWT(connection, userIdx);
    connection.release();

    return checkJWTResult;
};