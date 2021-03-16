module.exports = function(app) {
    const article = require('./articleController');
    const jwtMiddleware = require("../../../config/jwtMiddleware");

    // 9. 판매 글 생성 API
    app.post('/app/articles', jwtMiddleware,article.postArticles);

}