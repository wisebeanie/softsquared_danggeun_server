const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const commentProvider = require("./commentProvider");
const commentDao = require("./commentDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const articleProvider = require('../Article/articleProvider')

exports.createComment = async function(articleIdx, userIdx, parentCommentIdx, content) {
    try {
        const articleCheck = await articleProvider.articleIdxCheck(articleIdx);
        if (articleCheck.length < 1) {
            return errResponse(baseResponse.ARTICLE_ARTICLE_NOT_EXIST);
        }
        const isAdCheck = await articleProvider.checkIsAd(articleIdx);
        if (isAdCheck.isAd == "N") {
            return errResponse(baseResponse.COMMENT_ARTICLE_IS_AD_ERROR);
        }
        if (parentCommentIdx != 0) {
            const parentCommentCheck = await commentProvider.checkParentComment(parentCommentIdx);
            if (parentCommentCheck.length < 1) {
                return errResponse(baseResponse.COMMENT_PARENT_COMMENT_NOT_EXIST);
            }
        }

        const insertCommentParams = [articleIdx, userIdx, parentCommentIdx, content];
        const connection = await pool.getConnection(async (conn) => conn);

        const commentResult = await commentDao.insertComment(connection, insertCommentParams);
        connection.release();
        
        return response(baseResponse.SUCCESS, {"added Comment": commentResult[0].insertId});
    } catch (err) {
        logger.error(`APP - createComment Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editComment = async function(commentIdx, content, status) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        const editCommentResult = await commentDao.updateComment(connection, commentIdx, content, status);
        const commentResult = await commentDao.selectCommentByIdx(connection, commentIdx);
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS, {"edited content": commentResult[0].content, "edited status": commentResult[0].status});
    } catch (err) {
        logger.error(`App - editComment Service Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};