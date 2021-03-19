const jwtMiddleware = require("../../../config/jwtMiddleware");
const commentProvider = require('./commentProvider');
const commentService = require('./commentService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");


/*
    API No. 14
    API Name : 댓글 생성 API
    [POST] /app/comments
*/
exports.postComments = async function (req, res) {
    /*
        Body : articleIdx, userIdx, parentCommentIdx, content
    */
    const userIdxFromJWT = req.verifiedToken.userIdx;
    var { articleIdx, userIdx, parentCommentIdx, content } = req.body;

    if (!articleIdx) {
        return res.send(response(baseResponse.COMMENT_ARTICLEIDX_EMPTY));
    } else if (!userIdx) {
        return res.send(response(baseResponse.COMMENT_USERIDX_EMPTY));
    } else if (!content) {
        return res.send(response(baseResponse.COMMENT_CONTENT_EMPTY));
    }

    if (userIdx != userIdxFromJWT) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    }
    if (content.length > 100) {
        return res.send(response(baseResponse.COMMENT_CONTENT_LENGTH));
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
    /*
        Body : content, status
    */
    // Path Variable : commentIdx
    const commentIdx = req.params.commentIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;
    var { content, status } = req.body;

    if (!commentIdx) {
        return res.send(response(baseResponse.COMMENT_COMMENTIDX_EMPTY));
    }

    const commentByIdx = await commentProvider.retrieveCommentByIdx(commentIdx);
    if (commentByIdx.isSuccess == false) {
        return res.send(commentByIdx);
    }

    const userIdx = commentByIdx[0].userIdx;

    if (userIdx != userIdxFromJWT) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    }

    if (status != 'DELETED' && status != null) {
        return res.send(response(baseResponse.COMMENT_STATUS_ERROR_TYPE));
    }

    if (!content && !status) {
        return res.send(response(baseResponse.COMMENT_NO_CHANGES));
    }
    if (!content) {
        content = commentByIdx[0].content;
    }
    if (!status) {
        status = commentByIdx[0].status;
    }

    if (content.length > 100) {
        return res.send(response(baseResponse.COMMENT_CONTENT_LENGTH));
    }

    const editComment = await commentService.editComment(commentIdx, content, status);
    return res.send(editComment);
};