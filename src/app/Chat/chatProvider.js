const {response, errResponse} = require("../../../config/response");
const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");

const chatDao = require("./chatDao");

const articleDao = require("../Article/articleDao");


exports.retrieveChatBychatRoomIdx = async function(chatRoomIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        // 채팅 글 판매글 정보 가져오기
        const chatArticleResult = await chatDao.selectArticleByChatRoom(connection, chatRoomIdx);

        // 판매글의 대표 사진 가져오기
        for (article of chatArticleResult) {
            const articleImgResult = await articleDao.selectArticleImg(connection, article.articleIdx);
            const img = articleImgResult[0];
            article.representativeImg = img;
        }

        // 채팅 보기 활성화
        const readResult = await chatDao.updateChatRead(connection, chatRoomIdx);

        // 채팅 내역 가져오기
        const chatResult = await chatDao.selectChatByChatRoomIdx(connection, chatRoomIdx);

        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS, {"Article": chatArticleResult[0], "Chat": chatResult});
    } catch (err) {
        logger.error(`App - retrieveArticle Error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.retrieveChatRoom = async function(userIdx, articleIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    if (!articleIdx) {
        // 유저 별로 조회
        const chatRoomResult = await chatDao.selectChatRoom(connection, userIdx);

        for (article of chatRoomResult) {
            const articleImgResult = await articleDao.selectArticleImg(connection, article.articleIdx);
            const img = articleImgResult[0];
            article.representativeImg = img;
        }
        connection.release();
        
        return response(baseResponse.SUCCESS, chatRoomResult);
    } else {
        const chatRoomUserResult = await chatDao.selectChatRoomByArticle(connection, articleIdx);
        connection.release();

        return response(baseResponse.SUCCESS, chatRoomUserResult);
    }
};