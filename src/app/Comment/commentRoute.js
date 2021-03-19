module.exports = function(app) {
    const comment = require('./commentController');
    const jwtMiddleware = require("../../../config/jwtMiddleware");

    // 14. 댓글 생성 API
    app.post('/app/comments', jwtMiddleware, comment.postComments);

    // 16. 특정 댓글 수정 API
    app.patch('/app/comments/:commentIdx', jwtMiddleware, comment.patchComment);
}