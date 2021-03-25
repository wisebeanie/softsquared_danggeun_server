const {response, errResponse} = require("../../../config/response");
const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");

const commentDao = require("./commentDao");

const articleProvider = require("../Article/articleProvider")

exports.checkParentComment = async function (parentCommentIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const parentCommentResult = await commentDao.selectParentComment(connection, parentCommentIdx);
    connection.release();
    
    return parentCommentResult;
}

exports.retrieveComments = async function (articleIdx) {
    const articleCheck = await articleProvider.articleIdxCheck(articleIdx);
    if (articleCheck.length < 1) {
        return errResponse(baseResponse.ARTICLE_ARTICLE_NOT_EXIST);
    }
    const isAdCheck = await articleProvider.checkIsAd(articleIdx);
    if (isAdCheck.isAd == "N") {
        return errResponse(baseResponse.COMMENT_ARTICLE_IS_AD_ERROR);
    }
    const connection = await pool.getConnection(async (conn) => conn);

    // 대댓글이 아닌 댓글 조회
    const commentsResult = await commentDao.selectComments(connection, articleIdx);
    for (comment of commentsResult) {
        // 대댓글 조회
        const nestedCommentsResult = await commentDao.selectNestedComments(connection, comment.idx);
        // 대댓글이 있는 경우에만
        if (nestedCommentsResult.length > 0) {
            var nestedComments = [];
            for (nestedComment of nestedCommentsResult) {
                nestedComments.push(nestedComment);
            }
            comment.nestedComments = nestedComments;
        } 
    }
    connection.release();

    return response(baseResponse.SUCCESS, commentsResult)
};

exports.retrieveCommentByIdx = async function(commentIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const commentResult = await commentDao.selectCommentByIdx(connection, commentIdx);
    connection.release();


    if (commentResult.length < 1 || commentResult[0].status == 'DELETED') {
        return errResponse(baseResponse.COMMENT_NOT_EXIST);
    }
    return commentResult;
};