const jwtMiddleware = require("../../../config/jwtMiddleware");
const commentProvider = require('./commentProvider');
const commentService = require('./commentService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const userProvider = require("../User/userProvider");

/*
    API No. 14
    API Name : 댓글 생성 API
    [POST] /app/comments
*/
exports.postComments = async function (req, res) {
    /*
        Body : articleIdx, userIdx, parentCommentIdx, content
    */
    var { articleIdx, userIdx, parentCommentIdx, content } = req.body;

    if (!articleIdx) {
        return res.send(response(baseResponse.COMMENT_ARTICLEIDX_EMPTY));
    } else if (!userIdx) {
        return res.send(response(baseResponse.COMMENT_USERIDX_EMPTY));
    } else if (!content) {
        return res.send(response(baseResponse.COMMENT_CONTENT_EMPTY));
    }

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    if (!parentCommentIdx) {
        parentCommentIdx = 0;
    }

    const signUpResponse = await commentService.createComment(articleIdx, userIdx, parentCommentIdx, content);

    return res.send(signUpResponse);
};

/*
    API No. 16
    API Name : 특정 댓글 수정 API
    [PATCH] /app/comments/{commentIdx}
*/
exports.patchComment = async function(req, res) {
    // Path Variable : commentIdx
    const commentIdx = req.params.commentIdx;

    if (!commentIdx) {
        return res.send(response(baseResponse.COMMENT_COMMENTIDX_EMPTY));
    }

    // 존재하는 comment인지 확인
    const commentByIdx = await commentProvider.retrieveCommentByIdx(commentIdx);
    if (commentByIdx.isSuccess == false) {
        return res.send(commentByIdx);
    }

    const userIdx = commentByIdx[0].userIdx;

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    const editComment = await commentService.editComment(commentIdx);
    return res.send(editComment);
};