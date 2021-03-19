module.exports = function(app) {
    const article = require('./articleController');
    const jwtMiddleware = require("../../../config/jwtMiddleware");

    // 9. 판매 글 생성 API
    app.post('/app/articles', jwtMiddleware, article.postArticles);

    // 10. 지역 광고 글 생성 API
    app.post('/app/localads', jwtMiddleware, article.postLocalAds);

    // 11. 카테고리 조회 API
    app.get('/app/articles/categories', article.getCategories);
    
    // 12. 글 전체 조회 API (글 종류에 따라)
    app.get('/app/articles', jwtMiddleware, article.getArticles);

    // 13. 글 상세페이지 조회 API
    app.get('/app/articles/:articleIdx', jwtMiddleware, article.getArticleByIdx);

    // 14. 댓글 생성 API
    app.post('/app/articles/comments', jwtMiddleware, article.postComments);

}