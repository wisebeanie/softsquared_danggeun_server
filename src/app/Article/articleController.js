const jwtMiddleware = require("../../../config/jwtMiddleware");
const articleProvider = require('./articleProvider');
const articleService = require('./articleService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const userProvider = require("../User/userProvider");

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
    API No. 12
    API Name : 글 전체 조회 글 종류에 따라
    [GET] /app/articles?isAd=&userIdx=
*/
exports.getArticles = async function(req, res) {
    // Query String = isAd, userIdx
    const userIdx = req.query.userIdx;
    const isAd = req.query.isAd;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    if (!userIdx) {
        return res.send(errResponse(baseResponse.ARTICLE_USERIDX_EMPTY));
    }
    if (userIdx != userIdxFromJWT) {
        return res.send(errResponse(baseResponse.USER_IDX_NOT_MATCH));
    }

    if (!isAd) {
        return res.send(response(baseResponse.ARTICLE_ISAD_EMPTY));
    }

    const latitude = await userProvider.retrieveLatitude(userIdx);
    const longitude = await userProvider.retrieveLongitude(userIdx);



    if (isAd == "N") {
        const articleListResult = await articleProvider.retrieveArticleList(latitude.latitude, longitude.longitude);
        return res.send(response(baseResponse.SUCCESS, articleListResult));
    } else {
        const localAdListResult = await articleProvider.retrieveLocalAdList(latitude.latitude, longitude.longitude);
        return res.send(response(baseResponse.SUCCESS, localAdListResult));
    }
};

/*
    API No. 13
    API Name : 특정 글 조회 API
    [GET] /app/articles/:articelIdx
*/
exports.getArticleByIdx = async function (req, res) {
    // Path Variable : articleIdx, userIdx
    const articleIdx = req.params.articleIdx;
    const userIdx = req.params.userIdx;
    console.log(userIdx);
    const userIdxFromJWT = req.verifiedToken.userIdx;

    if (!articleIdx) {
        return res.send(response(baseResponse.ARTICLE_ARTICLEIDX_EMPTY));
    }
    if (userIdx != userIdxFromJWT) {
        return res.send(errResponse(baseResponse.USER_IDX_NOT_MATCH));
    }

    const articleByIdx = await articleProvider.retrieveArticle(articleIdx, userIdx);

    return res.send(articleByIdx);
};