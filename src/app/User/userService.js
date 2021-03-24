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

const articleProvider = require("../Article/articleProvider");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (nickName, phoneNumber, profileImgUrl, town, countryIdx, longitude, latitude) {
    try {
        // 전화번호 중복 확인
        const phoneNumberRows = await userProvider.phoneNumberCheck(phoneNumber);
        if (phoneNumberRows.length > 0) {
            return errResponse(baseResponse.SIGNUP_REDUNDANT_PHONENUMBER);
        }
        // TODO
        // contryIdx 존재 여부 확인

        const insertUserInfoParams = [nickName, phoneNumber, profileImgUrl, town, countryIdx, longitude, latitude];

        const connection = await pool.getConnection(async (conn) => conn);
        const userIdResult = await userDao.insertUser(connection, insertUserInfoParams);
        connection.release();

        return response(baseResponse.SUCCESS, {"addedUser": userIdResult[0].insertId});
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

        const checkJWT = await userProvider.checkJWT(phoneNumberRows[0].idx);
        if (checkJWT.length > 0) {
            return errResponse(baseResponse.ALREADY_LOGIN);
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

        const connection = await pool.getConnection(async (conn) => conn);
        const tokenResult = await userDao.insertToken(connection, userAccountRows[0].idx, token);
        connection.release();

        return response(baseResponse.SUCCESS, {'userIdx': userAccountRows[0].idx, 'jwt': token});
    } catch(err) {
        logger.error(`App - postSignIn Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editProfile = async function(userIdx, profileImgUrl, nickName) {
    try {
        // 닉네임 중복 확인
        const nickNameRows = await userProvider.nickNameCheck(nickName);
        if (nickNameRows.length > 0) {
            return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);
        }

        const connection = await pool.getConnection(async (conn) => conn);
        const editProfileResult = await userDao.updateProfile(connection, userIdx, profileImgUrl, nickName);
        connection.release();

        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - editProfile Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updateLikeStatus = async function(articleIdx, userIdx, status) {
    
    try {
        // articleIdx 있는지 확인
        const articleByIdx = await articleProvider.retrieveArticleIdx(articleIdx);
        if (articleByIdx.length < 1) {
            return errResponse(baseResponse.ARTICLE_ARTICLE_NOT_EXIST);
        }
        const connection = await pool.getConnection(async (conn) => conn);
        // 좋아요 활성
        if (status == "DELETED") {
            status = "ACTIVE";
            const activateLikes = await userDao.updateLikes(connection, articleIdx, userIdx, status);
            connection.release();
            return response(baseResponse.SUCCESS, "좋아요가 활성되었습니다.");
        } else {
            // 좋아요 취소
            status = "DELETED";
            const deleteLikes = await userDao.updateLikes(connection, articleIdx, userIdx, status);
            connection.release();
            return response(baseResponse.SUCCESS, "좋아요가 비활성되었습니다.");
        }
    } catch (err) {
        logger.error(`App - updateLikeStatus Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.insertLike = async function(articleIdx, userIdx) {
    try {
        // articleIdx 있는지 확인
        const articleByIdx = await articleProvider.retrieveArticleIdx(articleIdx);
        if (articleByIdx.length < 1) {
            return errResponse(baseResponse.ARTICLE_ARTICLE_NOT_EXIST);
        }

        const connection = await pool.getConnection(async (conn) => conn);
        const insertLikeParams = [articleIdx, userIdx];
        const insertLikeResult = await userDao.insertLike(connection, insertLikeParams);
        connection.release();

        return response(baseResponse.SUCCESS, "좋아요가 활성되었습니다.");
    } catch (err) {
        logger.error(`App - insertLike Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.patchTownAuth = async function(userIdx, currentLatitude, currentLongitude, userLatitude, userLongitude) {
    const connection = await pool.getConnection(async(conn) => conn);
    try {
        await connection.beginTransaction();
        const authTownResult = await userDao.selectUserByLocation(connection, userIdx, currentLatitude, currentLongitude, userLatitude, userLongitude);
        // 동네 인증 실패
        if (authTownResult.length < 1) {
            await connection.rollback();
            connection.release();
            return errResponse(baseResponse.AUTH_TOWN_FAIL);
        } else {
            // 동네 인증 성공
            const updateTownAuthResult = await userDao.updateTownAuth(connection, userIdx);
            await connection.commit();
            connection.release();

            return response(baseResponse.SUCCESS, "동네인증 성공");
        }
    } catch(err) {
        logger.error(`App - patchTownAuth Service error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.deleteJWT = async function(userIdx) {
    try {
        const connection = await pool.getConnection(async(conn) => conn);
        const deleteJWTResult = await userDao.deleteJWT(connection, userIdx);
        connection.release();

        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - deleteJWT Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.withDrawUser = async function(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        connection.beginTransaction();
        const withDrawUserResult = await userDao.withDrawUser(connection, userIdx);
        const deleteJWTResult = await userDao.deleteJWT(connection, userIdx);
        connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS, {"userIdx": userIdx});
    } catch (err) {
        logger.error(`App - withDrawUser Service error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updateUserAccount = async function(userIdx, phoneNumber, email) {
    try {
        // 전화번호 중복 확인
        if (phoneNumber) {
            const phoneNumberRows = await userProvider.phoneNumberCheck(phoneNumber);
            if (phoneNumberRows.length > 0) {
                return errResponse(baseResponse.SIGNUP_REDUNDANT_PHONENUMBER);
            }
        }

        const connection = await pool.getConnection(async (conn) => conn);
        if (phoneNumber) {
            const updateParams = [phoneNumber, userIdx];
            const updateUserAccountResult = await userDao.updateUserPhoneNumber(connection, updateParams);
        } else {
            const updateParams = [email, userIdx];
            const updateUserAccountResult = await userDao.updateUserEmail(connection, updateParams);
        }
        connection.release();

        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - updateUserAccount Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updateFollow = async function(userIdx, followUserIdx, status) {
    try {
        const userByIdx = await userProvider.retrieveUserByIdx(followUserIdx);
        if (userByIdx.length < 1) {
            return errResponse(baseResponse.USER_USER_NOT_EXIST);
        }
        const connection = await pool.getConnection(async (conn) => conn);
        const updateFollowResult = await userDao.updateFollow(connection, userIdx, followUserIdx, status);
        connection.release();

        if (status == "DELETED") {
            return response(baseResponse.SUCCESS, "팔로잉 취소");
        } else {
            return response(baseResponse.SUCCESS, "팔로잉 성공");
        }
    } catch (err) {
        logger.error(`App - updateFollow Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.followUser = async function(userIdx, followUserIdx) {
    try {
        const userByIdx = await userProvider.retrieveUserByIdx(followUserIdx);
        if (userByIdx.length < 1) {
            return errResponse(baseResponse.USER_USER_NOT_EXIST);
        }
        const connection = await pool.getConnection(async (conn) => conn);
        const insertFollowResult = await userDao.insertFollow(connection, userIdx, followUserIdx);
        connection.release();
        
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - followUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};