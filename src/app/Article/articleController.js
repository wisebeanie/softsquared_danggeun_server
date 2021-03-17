const jwtMiddleware = require("../../../config/jwtMiddleware");
const articleProvider = require('./articleProvider');
const articleService = require('./articleService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

/*
    API No. 8
    판매 글 생성 API
    [POST] /app/articles
*/
exports.postArticles = async function(req, res) {
    /*
        Body : userIdx, title, description, articleImgUrl, price, categoryIdx, suggestPrice 
    */
    var {userIdx, title, description, articleImgUrl, price, categoryIdx, suggestPrice } = req.body;
  
    const userIdxFromJWT = req.verifiedToken.userIdx;
    
    if (!userIdx) {
        return res.send(response(baseResponse.ARTICLE_USERIDX_EMPTY));
    } else if (userIdx != userIdxFromJWT) {
        res.send(errResponse(baseResponse.USER_IDX_NOT_MATCH));
    } else if (!title) {
        return res.send(response(baseResponse.ARTICLE_TITLE_EMPTY));
    } else if (!description) {
        return res.send(response(baseResponse.ARTICLE_DESCRIPTION_EMPTY));
    } else if (!categoryIdx) {
        return res.send(response(baseResponse.ARTICLE_CATEGORYIDX_EMPTY));
    } else if (categoryIdx < 1 || categoryIdx > 15) {
        return res.send(response(baseResponse.ARTICLE_CATEGORYIDX_WRONG));
    }

    if (title.length > 100) {
        return res.send(response(baseResponse.ARTICLE_TITLE_LENGTH));
    } else if (description.length > 200) {
        return res.send(response(baseResponse.ARTICLE_DESCRIPTION_LENGTH));
    }
    if (!price) {
        price = 0;
    }
    if (!suggestPrice) {
        suggestPrice = 'N';
    }

    const signUpResponse = await articleService.createArticle(userIdx, title, description, articleImgUrl, price, categoryIdx, suggestPrice);

    res.send(signUpResponse);
};

/*
    API No. 10
    API Name : 지역 광고 생성 API
    [POST] /app/localads
*/
exports.postLocalAds = async function(req, res) {
    /*
        Body : userIdx, title, description, articleImgUrl, price, categoryIdx, noChat
    */
    var {userIdx, title, description, articleImgUrl, price, categoryIdx, noChat} = req.body;

    const userIdxFromJWT = req.verifiedToken.userIdx;

    if (!userIdx) {
        return res.send(response(baseResponse.ARTICLE_USERIDX_EMPTY));
    } else if (userIdx != userIdxFromJWT) {
        res.send(errResponse(baseResponse.USER_IDX_NOT_MATCH));
    } else if (!title) {
        return res.send(response(baseResponse.ARTICLE_TITLE_EMPTY));
    } else if (!description) {
        return res.send(response(baseResponse.ARTICLE_DESCRIPTION_EMPTY));
    } else if (!categoryIdx) {
        return res.send(response(baseResponse.ARTICLE_CATEGORYIDX_EMPTY));
    } else if (categoryIdx < 16 || categoryIdx > 22) {
        return res.send(response(baseResponse.ARTICLE_CATEGORYIDX_WRONG));
    }

    if (title.length > 100) {
        return res.send(response(baseResponse.ARTICLE_TITLE_LENGTH));
    } else if (description.length > 200) {
        return res.send(response(baseResponse.ARTICLE_DESCRIPTION_LENGTH));
    }

    if (!price) {
        price = 0;
    }
    if (!noChat) {
        noChat = 'N';
    }

    const isAd = "Y";

    const signUpResponse = await articleService.createLocalAd(userIdx, title, description, articleImgUrl, price, categoryIdx, noChat, isAd);

    res.send(signUpResponse);
};

/*
    API No. 11
    API Name : 카테고리 조회 API
    [GET] /app/articles/categories
*/
exports.getCategories = async function(req, res) {
    // QueryString : isAd
    const isAd = req.query.isAd;

    if (!isAd) {
        return res.send(response(baseResponse.ARTICLE_ISAD_EMPTY));
    }

    if (isAd == "N") {
        const categoryListResult = await articleProvider.retrieveArticleCategoryList();
        return res.send(response(baseResponse.SUCCESS, categoryListResult));
    } else {
        const categoryListResult = await articleProvider.retrieveLocalAdCategoryList();
        return res.send(response(baseResponse.SUCCESS, categoryListResult));
    }
}

/*
    API No. 11
    API Name : 판매 글 전체 조회
    [GET] /app/articles/:userIdx
*/
// 추후 거리별 조회를 위해 userIdx 추가
exports.getArticles = async function(req, res) {
    // Path Variable = userIdx
    // const userIdx = req.params.userIdx;

    const articleListResult = await articleProvider.retrieveArticleList();

    return res.send(response(baseResponse.SUCCESS, articleListResult));
}