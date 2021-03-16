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
        if (articleImgUrl != "DEFAULT") {
            for (img of articleImgUrl) {
                const insertArticleImgParams = [articleIdx, img]
                const articleImgResult = await articleDao.insertArticleImg(connection, insertArticleImgParams);
            }
        } else {
            const insertArticleImgParams = [articleIdx, articleImgUrl]
            const articleImgResult = await articleDao.insertArticleImg(connection, insertArticleImgParams);
        }
    
    
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS, {"added Article": articleIdxResult[0].insertId});
    } catch(err) {
        logger.error(`App - createArticle Service Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};