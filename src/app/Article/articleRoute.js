module.exports = function(app) {
    const article = require('./articleController');
    const jwtMiddleware = require("../../../config/jwtMiddleware");

    // 9. 판매 글 생성 API
    app.post('/app/articles', jwtMiddleware, article.postArticles);

    // 10. 지역 광고 글 생성 API
    app.post('/app/localads', jwtMiddleware, article.postLocalAds);

}