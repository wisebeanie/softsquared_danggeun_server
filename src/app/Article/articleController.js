const jwtMiddleware = require("../../../config/jwtMiddleware");
const articleProvider = require('./articleProvider');
const articleService = require('./articleService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const userProvider = require("../User/userProvider");
const commentProvider = require("../Comment/commentProvider");

var regPhoneNumber = /^\d{3}\d{3,4}\d{4}$/;

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
        Body : userIdx, title, description, articleImgUrl, price, categoryIdx, noChat, phoneNumber
    */
    var {userIdx, title, description, articleImgUrl, price, categoryIdx, noChat, phoneNumber} = req.body;

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

    if (!regPhoneNumber.test(phoneNumber) && phoneNumber) {
        return res.send(response(baseResponse.LOCALAD_PHONENUMBER_ERROR_TYPE));
    }

    if (!price) {
        price = 0;
    }
    if (!noChat) {
        noChat = 'N';
    }
    if (!phoneNumber) {
        phoneNumber = 'N';
    }

    const isAd = "Y";

    const signUpResponse = await articleService.createLocalAd(userIdx, title, description, articleImgUrl, price, categoryIdx, noChat, isAd, phoneNumber);

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
    API Name : 글 전체 조회 글 종류에 따라, 유저에 따라
    [GET] /app/articles?isAd=&userIdx
*/
exports.getArticles = async function(req, res) {
    // Query String = isAd
    var isAd = req.query.isAd;
    // 현재 로그인 된 유저
    const userIdxFromJWT = req.verifiedToken.userIdx;

    // 조회하고 싶은 유저
    const userIdx = req.query.userIdx;

    if (!isAd) {
        isAd = "N";
    }

    const latitude = await userProvider.retrieveLatitude(userIdxFromJWT);
    const longitude = await userProvider.retrieveLongitude(userIdxFromJWT);

    // 글 전체 조회
    if (!userIdx) {
        if (isAd == "N") {
            const articleListResult = await articleProvider.retrieveArticleList(latitude.latitude, longitude.longitude);
            return res.send(response(baseResponse.SUCCESS, articleListResult));
        } else {
            const localAdListResult = await articleProvider.retrieveLocalAdList(latitude.latitude, longitude.longitude);
            return res.send(response(baseResponse.SUCCESS, localAdListResult));
        }   
    } else {
        // userIdx 가 올린 글 조회
        if (isAd == "Y") {
            return res.send(response(baseResponse.ARTICLE_ISAD_WRONG));
        } else {
            const articleByUserIdx = await articleProvider.retrieveArticleByUserIdx(userIdx);
            return res.send(articleByUserIdx);
        }
    }
};

/*
    API No. 13
    API Name : 특정 글 조회 API
    [GET] /app/articles/{articleIdx}
*/
exports.getArticleByIdx = async function (req, res) {
    // Path Variable : articleIdx
    const articleIdx = req.params.articleIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    if (!articleIdx) {
        return res.send(response(baseResponse.ARTICLE_ARTICLEIDX_EMPTY));
    } 

    const checkIsAd = await articleProvider.checkIsAd(articleIdx);

    if (checkIsAd.isAd == 'N') {
        const articleByIdx = await articleProvider.retrieveArticle(articleIdx, userIdxFromJWT);
        return res.send(articleByIdx);
    } else {
        const localAdByIdx = await articleProvider.retrieveLocalAd(articleIdx, userIdxFromJWT);
        return res.send(localAdByIdx);
    }
};

/*
    API No. 15 
    API Name : 특정 글 댓글 조회 APi
    [GET] /app/articles/{articleIdx}/comments
*/
exports.getComments = async function (req, res) {
    // Path Variable : articleIdx
    const articleIdx = req.params.articleIdx;

    if (!articleIdx) {
        return res.send(response(baseResponse.COMMENT_ARTICLEIDX_EMPTY));
    }

    const commentsByArticle = await commentProvider.retrieveComments(articleIdx);
    return res.send(commentsByArticle);
};