const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const articleProvider = require("./articleProvider");
const articleDao = require("./articleDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

exports.createArticle = async function (userIdx, title, description, articleImgUrl, price, categoryIdx, suggestPrice) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const insertArticleParmas = [userIdx, title, description, price, categoryIdx, suggestPrice];
        await connection.beginTransaction();
        // 판매글 생성
        const articleIdxResult = await articleDao.insertArticle(connection, insertArticleParmas);
        
        const articleIdx = articleIdxResult[0].insertId;
        
        // 해당 판매글 이미지 생성
        if (articleImgUrl) {
            // 이미지 입력한 경우
            for (img of articleImgUrl) {
                const insertArticleImgParams = [articleIdx, img];
                const articleImgResult = await articleDao.insertArticleImg(connection, insertArticleImgParams);
            }
        } else {
            // 기본이미지
            const categoryImgRow = await articleProvider.categoryImgCheck(categoryIdx);
            articleImgUrl = categoryImgRow;
            const insertArticleImgParams = [articleIdx, articleImgUrl];
            const articleImgResult = await articleDao.insertArticleImg(connection, insertArticleImgParams);
        }
        
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS, {"added Article": articleIdx});
    } catch(err) {
        logger.error(`App - createArticle Service Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createLocalAd = async function (userIdx, title, description, articleImgUrl, price, categoryIdx, noChat, isAd) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const insertLocalAdParmas = [userIdx, title, description, price, categoryIdx, noChat, isAd];
        await connection.beginTransaction();
        // 지역광고 생성
        const localAdIdxResult = await articleDao.insertLocalAd(connection, insertLocalAdParmas);
        
        const localAdIdx = localAdIdxResult[0].insertId;
        // 해당 판매글 이미지 생성
        if (articleImgUrl) {
            // 이미지 입력한 경우
            for (img of articleImgUrl) {
                const insertArticleImgParams = [articleIdx, img];
                const articleImgResult = await articleDao.insertArticleImg(connection, insertArticleImgParams);
            }
        } else {
            // 기본이미지
            const categoryImgRow = await articleProvider.categoryImgCheck(categoryIdx);
            articleImgUrl = categoryImgRow;
            const insertArticleImgParams = [articleIdx, articleImgUrl];
            const articleImgResult = await articleDao.insertArticleImg(connection, insertArticleImgParams);
        }
        
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS, {"added localAd": localAdIdx});
    } catch(err) {
        logger.error(`App - createArticle Service Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
}