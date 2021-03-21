const {response, errResponse} = require("../../../config/response");
const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");

const articleDao = require("./articleDao");
const articleService = require("./articleService");

exports.categoryImgCheck = async function(categoryIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const categoryImgCheckResult = await articleDao.selectCategoryImg(connection, categoryIdx);
    connection.release();

    return categoryImgCheckResult[0].categoryImgUrl;
};

exports.retrieveArticleCategoryList = async function() {
    const connection = await pool.getConnection(async (conn) => conn);
    const categoryListResult = await articleDao.selectArticleCategory(connection);
    connection.release();

    return categoryListResult;
};

exports.retrieveLocalAdCategoryList = async function() {
    const connection = await pool.getConnection(async (conn) => conn);
    const categoryListResult = await articleDao.selectLocalAdCategory(connection);
    connection.release();

    return categoryListResult;
};

exports.retrieveArticleList = async function(latitude, longitude, categoryList) {
    const connection = await pool.getConnection(async (conn) => conn);

    // 판매 글 조회
    const articleListResult = await articleDao.selectArticles(connection, latitude, longitude, categoryList);
    for (article of articleListResult) {
        const articleImgResult = await articleDao.selectArticleImg(connection, article.idx);
        const img = articleImgResult[0];
        article.representativeImg = img;
    }
    connection.release();

    return articleListResult;
};

exports.retrieveLocalAdList = async function(latitude, longitude, categoryList) {
    const connection = await pool.getConnection(async (conn) => conn);
    const localAdListResult = await articleDao.selectLocalAds(connection, latitude, longitude, categoryList);
    for (localAd of localAdListResult) {
        const localAdImgResult = await articleDao.selectArticleImg(connection, localAd.idx);
        const img = localAdImgResult[0];
        localAd.representativeImg = img;
    }
    connection.release();

    return localAdListResult;
}

exports.retrieveArticle = async function(articleIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn); 
    try {
        await connection.beginTransaction();
        const articleResult = await articleDao.selectArticleIdx(connection, articleIdx, userIdx);
        const article = articleResult[0];
        
        // 이미지 따로 추가
        const imgArray = [];
        const articleImgResult = await articleDao.selectArticleImg(connection, articleIdx);
        for (img of articleImgResult) {
            imgArray.push(img);
        }
        article.imgUrls = imgArray;

        const addView = articleService.addView(articleIdx);
        
        await connection.commit();
        connection.release();
        if (articleResult == undefined || articleResult == null) {
            return response(baseResponse.ARTICLE_ARTICLE_NOT_EXIST);
        } else if (article.status == "DELETED") {
            return response(baseResponse.ARTICLE_ARTICLE_NOT_EXIST);
        } else if (article.status == "HIDE") {
            return response(baseResponse.ARTICLE_ARTICLE_CANNOT_SEE);
        }

        return response(baseResponse.SUCCESS, article);
    } catch (err) {
        logger.error(`App - retrieveArticle Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.retrieveLocalAd = async function(articleIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        const localAdResult = await articleDao.selectocalAdIdx(connection, articleIdx, userIdx); 
        const localAd = localAdResult[0];
        
        // 이미지 따로 추가
        const imgArray = [];
        const localAdImgResult = await articleDao.selectArticleImg(connection, articleIdx);
        for (img of localAdImgResult) {
            imgArray.push(img);
        }
        localAd.imgUrls = imgArray;
        
        const addView = articleService.addView(articleIdx);

        await connection.commit();
        connection.release();
        if (localAdResult == undefined || localAdResult == null) {
            return response(baseResponse.ARTICLE_ARTICLE_NOT_EXIST);
        } else if (localAd.status == "DELETED") {
            return response(baseResponse.ARTICLE_ARTICLE_NOT_EXIST);
        } else if (localAd.status == "HIDE") {
            return response(baseResponse.ARTICLE_ARTICLE_CANNOT_SEE);
        }
    
        return response(baseResponse.SUCCESS, localAd);
    } catch(err) {
        logger.error(`App - retrieveLocalAd Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.checkIsAd = async function(articleIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const isAdResult = await articleDao.checkIsAd(connection, articleIdx);
    connection.release();

    return isAdResult[0];
};

exports.articleIdxCheck = async function(articleIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const articleIdxResult = await articleDao.selectArticleByArticleIdx(connection, articleIdx);
    connection.release();

    return articleIdxResult;
};

exports.retrieveSales = async function(userIdx, status) {
    const connection = await pool.getConnection(async (conn) => conn);
    const salesResult = await articleDao.selectArticleByStatus(connection, userIdx, status);
    for (article of salesResult) {
        const articleImgResult = await articleDao.selectArticleImg(connection, article.idx);
        const img = articleImgResult[0];
        article.representativeImg = img;
    }
    connection.release();

    return response(baseResponse.SUCCESS, salesResult);
};

exports.retrieveHideArticles = async function(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const articleResult = await articleDao.selectHideArticles(connection, userIdx);
    for (article of articleResult) {
        const articleImgResult = await articleDao.selectArticleImg(connection, article.idx);
        const img = articleImgResult[0];
        article.representativeImg = img;
    }
    connection.release();

    return response(baseResponse.SUCCESS, articleResult);
};

exports.retrieveSalesByUserIdx = async function(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const articleResult = await articleDao.selectSalesUserIdx(connection, userIdx);
    for (article of articleResult) {
        const articleImgResult = await articleDao.selectArticleImg(connection, article.idx);
        const img = articleImgResult[0];
        article.representativeImg = img;
    }
    connection.release();

    return response(baseResponse.SUCCESS, articleResult);
}

exports.retrieveArticleIdx = async function(articleIdx) {
    const connection = await pool.getConnection(async (conn) =>  conn);
    const articleResult = await articleDao.selectArticleByArticleIdx(connection, articleIdx);
    connection.release();

    return articleResult;
}