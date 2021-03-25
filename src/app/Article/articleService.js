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

        return response(baseResponse.SUCCESS, {"addedArticle": articleIdx});
    } catch(err) {
        logger.error(`App - createArticle Service Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createLocalAd = async function (userIdx, title, description, articleImgUrl, price, categoryIdx, noChat, isAd, phoneNumber) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const insertLocalAdParmas = [userIdx, title, description, price, categoryIdx, noChat, isAd, phoneNumber];
        await connection.beginTransaction();
        // 지역광고 생성
        const localAdIdxResult = await articleDao.insertLocalAd(connection, insertLocalAdParmas);
        
        const localAdIdx = localAdIdxResult[0].insertId;
        // 해당 판매글 이미지 생성
        if (articleImgUrl) {
            // 이미지 입력한 경우
            for (img of articleImgUrl) {
                const insertArticleImgParams = [localAdIdx, img];
                const articleImgResult = await articleDao.insertArticleImg(connection, insertArticleImgParams);
            }
        } else {
            // 기본이미지
            const categoryImgRow = await articleProvider.categoryImgCheck(categoryIdx);
            articleImgUrl = categoryImgRow;
            const insertArticleImgParams = [localAdIdx, articleImgUrl];
            const articleImgResult = await articleDao.insertArticleImg(connection, insertArticleImgParams);
        }
        
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS, {"addedlocalAd": localAdIdx});
    } catch(err) {
        logger.error(`App - createArticle Service Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.addView = async function(articleIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const addViewResult = await articleDao.addView(connection, articleIdx);
    connection.release();

    return addViewResult;
}

exports.editArticle = async function(articleIdx, articleImgUrl, description, title, categoryIdx, price, suggestPrice) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        // 원래 이미지 삭제
        const deleteOriginImg = await articleDao.deleteImg(connection, articleIdx);
        // 이미지 수정
        for (imgIdx in articleImgUrl) {
            const insertArticleImgParams = [articleIdx, articleImgUrl[imgIdx]];
            const editImg = await articleDao.insertArticleImg(connection, insertArticleImgParams);
        }
        // 글 수정
        const editArticleResult = await articleDao.updateArticle(connection, articleIdx, description, title, categoryIdx, price, suggestPrice);
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - editArticle Service Error\n ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editLocalAd = async function(articleIdx, articleImgUrl, description, title, categoryIdx, price, phoneNumber, noChat) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        // 원래 이미지 삭제
        const deleteOriginImg = await articleDao.deleteImg(connection, articleIdx);
        // 이미지 수정
        for (imgIdx in articleImgUrl) {
            const insertArticleImgParams = [articleIdx, articleImgUrl[imgIdx]];
            const editImg = await articleDao.insertArticleImg(connection, insertArticleImgParams);
        }
        // 글 수정
        const editLocalAdResult = await articleDao.updateLocalAd(connection, articleIdx, articleImgUrl, description, title, categoryIdx, price, phoneNumber, noChat);
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - editLocalAd Service Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editArticleStatus = async function(articleIdx, status) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const editStatusResult = await articleDao.updateArticleStatus(connection, articleIdx, status);
        connection.release();

        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - editArticleStatus Service Error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editArticleHide = async function(articleIdx, hideOrNot) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const editArticleHideResult = await articleDao.updateArticleHide(connection, articleIdx, hideOrNot);
        connection.release();

        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`APP - editArticleHide Service Error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createBuyer = async function(articleIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        const updateArticleStatus = await this.editArticleStatus(articleIdx, 'SOLD');
        const buyerResult = await articleDao.insertBuyer(connection, articleIdx, userIdx);
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`APP - createBuyer Service Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.insertRanking = async function(searchWordIdx, ranking, change) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const insertRanking = await articleDao.insertRanking(connection, searchWordIdx, ranking ,change);
        connection.release();

        return 0;
    } catch (err) {
        logger.error(`APP - insertRanking Service Error\n: ${err.message}`);
        return 0;
    }
};

exports.deleteRanking = async function() {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const deleteRanking = await articleDao.deleteRanking(connection);
        connection.release();

        return 0;
    } catch (err) {
        logger.error(`APP - deleteRanking Service Error\n: ${err.message}`);
        return 0;
    }
};

exports.updateChange = async function(searchWordIdx, change) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const updateChange = await articleDao.updateChange(connection, searchWordIdx, change);
        connection.release();

        return 0;
    }
    catch (err) {
        logger.error(`APP - updateChange Service Error\n: ${err.message}`);
        return 0;
    }
}