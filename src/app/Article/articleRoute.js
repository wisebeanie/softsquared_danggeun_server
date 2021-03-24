module.exports = function(app) {
    const article = require('./articleController');
    const jwtMiddleware = require("../../../config/jwtMiddleware");

    // 9. 판매 글 생성 API
    app.post('/app/articles', jwtMiddleware, article.postArticles);

    // 10. 지역 광고 글 생성 API
    app.post('/app/localads', jwtMiddleware, article.postLocalAds);

    // 11. 카테고리 조회 API
    app.get('/app/articles/categories', article.getCategories);
    
    // 12. 글 전체 조회 API
    app.get('/app/articles', jwtMiddleware, article.getArticles);

    // 13. 글 상세페이지 조회 API
    app.get('/app/articles/:articleIdx', jwtMiddleware, article.getArticleByIdx);

    // 15. 특정 글 댓글 조회 API
    app.get('/app/articles/:articleIdx/comments', article.getComments);

    // 17. 글 수정 API
    app.patch('/app/articles/:articleIdx', jwtMiddleware, article.patchArticle);

    // 22. 글 상태 수정 API
    app.patch('/app/articles/:articleIdx/status', jwtMiddleware, article.patchArticleStatus);

    // 26. 검색 API
    app.get('/app/search', jwtMiddleware, article.getSearch);

    // 3. 구매 확정 API
    app.post('/app/articles/buyer', jwtMiddleware, article.postBuyer);
}