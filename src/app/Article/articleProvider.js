const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const articleDao = require("./articleDao");

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

exports.retrieveArticleList = async function(latitude, longitude) {
    const connection = await pool.getConnection(async (conn) => conn);
    const articleListResult = await articleDao.selectArticle(connection, latitude, longitude);
    for (article of articleListResult) {
        const articleImgResult = await articleDao.selectArticleImg(connection, article.idx);
        const img = articleImgResult[0];
        article.representativeImg = img;
    }
    connection.release();

    return articleListResult;
};

exports.retrieveLocalAdList = async function(latitude, longitude) {
    const connection = await pool.getConnection(async (conn) => conn);
    const localAdListResult = await articleDao.selectLocalAd(connection, latitude, longitude);
    for (localAd of localAdListResult) {
        const localAdImgResult = await articleDao.selectArticleImg(connection, article.idx);
        const img = localAdImgResult[0];
        localAd.representativeImg = img;
    }
    connection.release();

    return localAdListResult;
}