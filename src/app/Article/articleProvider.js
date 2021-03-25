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

exports.retrieveArticleList = async function(latitude, longitude, categoryList, page) {
    const connection = await pool.getConnection(async (conn) => conn);

    // 판매 글 조회
    const articleListResult = await articleDao.selectArticles(connection, latitude, longitude, categoryList, page);
    for (article of articleListResult) {
        const articleImgResult = await articleDao.selectArticleImg(connection, article.idx);
        const img = articleImgResult[0];
        article.representativeImg = img;
    }
    connection.release();

    return articleListResult;
};

exports.retrieveArticle = async function(articleIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn); 
    try {
        await connection.beginTransaction();

        const addView = await articleService.addView(articleIdx);
        const articleResult = await articleDao.selectArticleIdx(connection, articleIdx, userIdx);
        const article = articleResult[0];
        
        // 이미지 따로 추가
        const imgArray = [];
        const articleImgResult = await articleDao.selectArticleImg(connection, articleIdx);
        for (img of articleImgResult) {
            imgArray.push(img);
        }
        article.imgUrls = imgArray;
        
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

        const addView = await articleService.addView(articleIdx);
        const localAdResult = await articleDao.selectLocalAdIdx(connection, articleIdx, userIdx); 
        const localAd = localAdResult[0];
        
        // 이미지 따로 추가
        const imgArray = [];
        const localAdImgResult = await articleDao.selectArticleImg(connection, articleIdx);
        for (img of localAdImgResult) {
            imgArray.push(img);
        }
        localAd.imgUrls = imgArray;
        

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
};

exports.retrieveArticleIdx = async function(articleIdx) {
    const connection = await pool.getConnection(async (conn) =>  conn);
    const articleResult = await articleDao.selectArticleByArticleIdx(connection, articleIdx);
    connection.release();

    return articleResult;
};

exports.searchArticles = async function(page, searchQueryList, latitude, longitude) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        const searchResult = await articleDao.searchArticles(connection, page, searchQueryList, latitude, longitude);

        for (article of searchResult) {
            const articleImgResult = await articleDao.selectArticleImg(connection, article.idx);
            const img = articleImgResult[0];
            article.representativeImg = img;
        }

        // 검색어 저장
        for (searchQuery of searchQueryList) {
            const checkSearchWord = await articleDao.selectSearchWord(connection, searchQuery);
            // 저장되지 않은 검색어
            if (checkSearchWord.length < 1) {
                const insertSearchWord = await articleDao.insertSearchWord(connection, searchQuery);
            } else {
                const updateSearchWord = await articleDao.updateSearchWord(connection, searchQuery);
            }
        }

        await connection.commit();
        connection.release();
    
        return response(baseResponse.SUCCESS, searchResult);
    } catch (err) {
        logger.error(`App - searchArticles Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.retrieveFollowUsersArticles = async function(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const articleResult = await articleDao.selectFollowUsersArticles(connection, userIdx);
    for (article of articleResult) {
        const articleImgResult = await articleDao.selectArticleImg(connection, article.idx);
        const img = articleImgResult[0];
        article.representativeImg = img;
    }
    connection.release();
    
    return articleResult;
};

exports.retrieveUserByArticle = async function(articleIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userResult = await articleDao.selectUserByArticle(connection, articleIdx);
    connection.release();

    return userResult;
};

exports.retrieveBoughtList = async function(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const boughtResult = await articleDao.selectBoughtArticle(connection, userIdx);
    for (article of boughtResult) {
        const articleImgResult = await articleDao.selectArticleImg(connection, article.idx);
        const img = articleImgResult[0];
        article.representativeImg = img;
    }
    connection.release();

    return response(baseResponse.SUCCESS, boughtResult);
};

exports.hotSearchWord = async function() {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        // 예전 인기 검색어 순위 테이블 가져오기 
        const getOldRanking = await articleDao.selectOldRanking(connection);

        // 현재 순위 가져오기
        const searchWordresult = await articleDao.selectHotSearchWord(connection);  

        var change = 'new';

        // 처음 순위 매김
        if (getOldRanking.length < 1) {
            for (searchWord of searchWordresult) {
                // 순위 테이블에 추가
                const insertRanking = await articleService.insertRanking(searchWord.idx, searchWord.ranking, change);
            }
        } else {
            // 기존 순위 테이블 삭제
            const deleteRanking = await articleService.deleteRanking(connection);

            // 새로 순위 테이블에 추가
            for (searchWord of searchWordresult) {
                const insertRanking = await articleService.insertRanking(searchWord.idx, searchWord.ranking, change);
            }

            
            // 순위 변동 조회
            for (currentSearchWord of searchWordresult) {
                for (oldSearchWord of getOldRanking) {
                    if (currentSearchWord.idx == oldSearchWord.searchWordIdx) {
                        // 순위 상승
                        if ((oldSearchWord.ranking - currentSearchWord.ranking) > 0) {
                            change = `up ${(oldSearchWord.ranking - currentSearchWord.ranking)}`;
                            const insertChange = await articleService.updateChange(currentSearchWord.idx, change);
                        }
                        // 순위 하락
                        else if ((oldSearchWord.ranking - currentSearchWord.ranking) < 0) {
                            change = `down ${(currentSearchWord.ranking - oldSearchWord.ranking)}`;
                            const insertChange = await articleService.updateChange(currentSearchWord.idx, change);
                        }
                        // 순위 유지
                        else if ((oldSearchWord.ranking - currentSearchWord.ranking) == 0) {
                            change = `-`;
                            const updateChange = await articleService.updateChange(currentSearchWord.idx, change);
                        }
                    }
                }
            }
        }
        const searchResult = await articleDao.selectRanking(connection);  
        await connection.commit();
        connection.release();
    
        // return response(baseResponse.SUCCESS, searchResult);
        return 0;
    } catch (err) {
        logger.error(`App - retrieveHotSearchWord Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return 0;
    }
};

exports.retrieveHotSearchWord = async function() {

    const connection = await pool.getConnection(async (conn) => conn);
    const searchWordresult = await articleDao.selectRanking(connection);  
    connection.release();

    return response(baseResponse.SUCCESS, searchWordresult);
};