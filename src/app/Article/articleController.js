const jwtMiddleware = require("../../../config/jwtMiddleware");
const articleProvider = require('./articleProvider');
const articleService = require('./articleService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const userProvider = require("../User/userProvider");
const commentProvider = require("../Comment/commentProvider");

var regPhoneNumber = /^\d{3}\d{3,4}\d{4}$/;

const schedule = require('node-schedule');

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
    
    if (!userIdx) {
        return res.send(response(baseResponse.ARTICLE_USERIDX_EMPTY));
    }  else if (!title) {
        return res.send(response(baseResponse.ARTICLE_TITLE_EMPTY));
    } else if (!description) {
        return res.send(response(baseResponse.ARTICLE_DESCRIPTION_EMPTY));
    } else if (!categoryIdx) {
        return res.send(response(baseResponse.ARTICLE_CATEGORYIDX_EMPTY));
    } else if (categoryIdx < 1 || categoryIdx > 15) {
        return res.send(response(baseResponse.ARTICLE_CATEGORYIDX_WRONG));
    }

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
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

    if (articleImgUrl && typeof(articleImgUrl) == "string") {
        return res.send(response(baseResponse.ARTICLE_IMG_WRONG));
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


    if (!userIdx) {
        return res.send(response(baseResponse.ARTICLE_USERIDX_EMPTY));
    } else if (!title) {
        return res.send(response(baseResponse.ARTICLE_TITLE_EMPTY));
    } else if (!description) {
        return res.send(response(baseResponse.ARTICLE_DESCRIPTION_EMPTY));
    } else if (!categoryIdx) {
        return res.send(response(baseResponse.ARTICLE_CATEGORYIDX_EMPTY));
    } else if (categoryIdx < 16 || categoryIdx > 22) {
        return res.send(response(baseResponse.ARTICLE_CATEGORYIDX_WRONG));
    }

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    if (title.length > 100) {
        return res.send(response(baseResponse.ARTICLE_TITLE_LENGTH));
    } else if (description.length > 200) {
        return res.send(response(baseResponse.ARTICLE_DESCRIPTION_LENGTH));
    }

    if (!regPhoneNumber.test(phoneNumber) && phoneNumber) {
        return res.send(response(baseResponse.LOCALAD_PHONENUMBER_ERROR_TYPE));
    }

    if (articleImgUrl && typeof(articleImgUrl) == "string") {
        return res.send(response(baseResponse.ARTICLE_IMG_WRONG));
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
    API Name : 글 전체 조회 글 종류에 따라
    [GET] /app/articles?page=&categoryIdx=
*/
exports.getArticles = async function(req, res) {
    // Query String = page, categoryIdx
    var page = req.query.page;
    if (!page) {
        page = 1;
    }
    var categoryList = req.query.categoryIdx;

    const userIdxFromJWT = req.verifiedToken.userIdx;
    // 현재 로그인 된 유저
    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdxFromJWT);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    }

    if (!categoryList) {
        return res.send(response(baseResponse.MODIFY_CATEGORY_IDX_EMPTY));
    };


    if(typeof(categoryList) == "string") {
        if (categoryList > 15 || categoryList < 1) {
            return res.send(response(baseResponse.ARTICLE_CATEGORYIDX_WRONG));
        }
    } else {
        for (categoryIdx of categoryList) {
            if (categoryIdx > 15 || categoryIdx < 1) {
                return res.send(response(baseResponse.ARTICLE_CATEGORYIDX_WRONG));
            }
        }
    }

    // 로그인 된 유저의 위경도
    const latitude = await userProvider.retrieveLatitude(checkJWT[0].userIdx);
    const longitude = await userProvider.retrieveLongitude(checkJWT[0].userIdx);

    // 판매 글 조회
    const articleListResult = await articleProvider.retrieveArticleList(latitude.latitude, longitude.longitude, categoryList, page);
    return res.send(response(baseResponse.SUCCESS, articleListResult));
    
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

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdxFromJWT);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    }

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

/*
    API No. 17
    API Name : 글 수정 API
    [PATCH] /app/articles/{articleIdx}
*/
exports.patchArticle = async function(req, res) {
    // Path Variable : articleIdx
    const articleIdx = req.params.articleIdx;
    /*
        Body : articleImgUrl, description, title, categoryIdx, price, phoneNumber, noChat, suggetPrice
    */
    var {articleImgUrl, description, title, categoryIdx, price, phoneNumber, noChat, suggestPrice} = req.body;
    
    // 존재하는 글인지 확인
    const checkArticleIdx = await articleProvider.articleIdxCheck(articleIdx);
    if (checkArticleIdx.length < 1) {
        return res.send(response(baseResponse.ARTICLE_ARTICLEIDX_WRONG));
    }

    const userIdx = checkArticleIdx[0].userIdx;

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    const isAd = checkArticleIdx[0].isAd;

    if (!articleImgUrl) {
        return res.send(response(baseResponse.MODIFY_ARTICLEIMG_EMPTY));
    } else if (!description) {
        return res.send(response(baseResponse.MODIFY_DESCRIPTION_EMPTY));
    } else if (!title) {
        return res.send(response(baseResponse.MODIFY_TITLE_EMPTY));
    } else if (!categoryIdx) {
        return res.send(response(baseResponse.MODIFY_CATEGORY_IDX_EMPTY));
    } else if (!price) {
        return res.send(response(baseResponse.MODIFY_PRICE_EMPTY));
    } else if (isAd == "N" && !suggestPrice) {
        return res.send(response(baseResponse.MODIFY_SUGGESTPRICE_EMPTY));
    } else if (isAd == "Y" && !noChat) {
        return res.send(response(baseResponse.MODIFY_NOCHAT_EMPTY));
    } else if (isAd == "Y" && !phoneNumber) {
        return res.send(response(baseResponse.MODIFY_PHONENUMBER_EMPTY));
    } else if (isAd == "N" && (phoneNumber || noChat)) {
        return res.send(response(baseResponse.MODIFY_ARTICLE_WRONG));
    } else if (isAd == "Y" && suggestPrice) {
        return res.send(response(baseResponse.MODIFY_LOCALAD_WRONG));
    }

    if (articleImgUrl && typeof(articleImgUrl) == "string") {
        return res.send(response(baseResponse.ARTICLE_IMG_WRONG));
    }

    if (title.length > 100) {
        return res.send(response(baseResponse.ARTICLE_TITLE_LENGTH));
    } else if (description.length > 200) {
        return res.send(response(baseResponse.ARTICLE_DESCRIPTION_LENGTH));
    }

    if (!regPhoneNumber.test(phoneNumber) && phoneNumber) {
        return res.send(response(baseResponse.LOCALAD_PHONENUMBER_ERROR_TYPE));
    }

    if (isAd == "N") {
        const editArticle = await articleService.editArticle(articleIdx, articleImgUrl, description, title, categoryIdx, price, suggestPrice);
        return res.send(editArticle);
    } else {
        const editLocalAd = await articleService.editLocalAd(articleIdx, articleImgUrl, description, title, categoryIdx, price, phoneNumber, noChat);
        return res.send(editLocalAd);
    }
};

/*
    API No. 22
    API Name : 글 상태 수정 API
    [PATCH] /app/articles/{articleIdx}/status
*/
exports.patchArticleStatus = async function(req, res) {
    // Path Variable : articleIdx
    const articleIdx = req.params.articleIdx;

    /*
        Body : status, hideOrNot
    */
    const { status, hideOrNot } = req.body;

    // get UserIdx
    const userIdxResult = await articleProvider.articleIdxCheck(articleIdx);
    if (userIdxResult.length < 1) {
        return res.send(response(baseResponse.ARTICLE_ARTICLE_NOT_EXIST));
    }
    const userIdx = userIdxResult[0].userIdx;

    if (!articleIdx) {
        return res.send(response(baseResponse.ARTICLE_ARTICLEIDX_EMPTY));
    }

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    if (!status) {
        return res.send(response(baseResponse.ARTICLE_STATUS_EMPTY));
    } else if (status == "RESERVED" || status == "SOLD" || status == "DELETED" || status == "SALE") {
        const editStatus = await articleService.editArticleStatus(articleIdx, status);
        return res.send(editStatus);
    } else if (status == "HIDE" && hideOrNot) {
        const editStatus = await articleService.editArticleHide(articleIdx, hideOrNot);
        return res.send(editStatus);
    } else if (status == "HIDE" && !hideOrNot) {
        return res.send(response(baseResponse.ARTICLE_HIDE_OR_NOT_EMPTY));
    } else {
        return res.send(response(baseResponse.ARTICLE_EDIT_STATUS_WRONG));
    }
};

/*
    API No. 26
    API Name : 검색 API
    [GET] /app/search?page=&searchquery=
*/
exports.getSearch = async function(req, res) {
    // Query String = searchquery, page
    const searchQuery = req.query.searchquery;
    var page = req.query.page;

    if (!page) {
        page = 1;
    }

    const userIdxFromJWT = req.verifiedToken.userIdx;

    if (!searchQuery) {
        res.send(response(baseResponse.SEARCH_SEARCHQUERY_EMPTY));
    }

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdxFromJWT);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    var searchQueryList = searchQuery.split(' ');

    for (searchWord of searchQueryList) {
        if (searchWord == '') {
            searchQueryList.splice(searchQueryList.indexOf(searchWord.length == 0));
        }
    }


    // 로그인 된 유저의 위경도
    const latitude = await userProvider.retrieveLatitude(checkJWT[0].userIdx);
    const longitude = await userProvider.retrieveLongitude(checkJWT[0].userIdx);

    const searchResponse = await articleProvider.searchArticles(page, searchQueryList, latitude.latitude, longitude.longitude);

    return res.send(searchResponse);
};

/*
    API No. 36
    API Name : 구매자 확정 API
    [POST] /app/articles/buyer
*/
exports.postBuyer = async function(req, res) {
    /*
        Body : articleIdx, userIdx
    */
    const { articleIdx, userIdx } = req.body;
    
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdxFromJWT);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    if (!articleIdx) {
        return res.send(response(baseResponse.ARTICLE_ARTICLEIDX_EMPTY));
    } else if (!userIdx) {
        return res.send(response(baseResponse.USER_USERIDX_EMPTY));
    }

    const createBuyer = await articleService.createBuyer(articleIdx, userIdx);

    return res.send(createBuyer);
};

/*
    API No. 37
    API Name : 구매내역 조회 API
    [GET] /app/users/{userIdx}/bought
*/
exports.getBought = async function(req, res) {
    // Path Variable : userIdx
    const userIdx = req.params.userIdx;

    if (!userIdx) {
        return res.send(response(baseResponse.USER_USERIDX_EMPTY));
    }

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    const boughtResult = await articleProvider.retrieveBoughtList(userIdx);

    return res.send(boughtResult);
};


var j = schedule.scheduleJob('* * 7 * * *', async function() {
    const article = await articleProvider.hotSearchWord()
});

/*
    API No. 38
    API Name : 인기 검색어 조회 API
    [GET] /app/hot-searchwords
*/
exports.getHotSearchWord = async function(req, res) {
    const result = await articleProvider.retrieveHotSearchWord();
    // const result = await articleProvider.hotSearchWord();
    return res.send(result);
};