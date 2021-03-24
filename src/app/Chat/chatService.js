const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const chatProvider = require("./chatProvider");
const chatDao = require("./chatDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const articleProvider = require("../Article/articleProvider");

exports.createChat = async function(chatRoomIdx, articleIdx, senderIdx, content) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();

        // 수신자 = articleIdx를 쓴 사람, chatRoom 만들때 포함시키기
        var seller = await articleProvider.retrieveUserByArticle(articleIdx);
        seller = seller[0].userIdx;

        if (!chatRoomIdx) {
            // 새로 채팅방 생성
            const createChatRoom = await chatDao.createChatRoom(connection, articleIdx, senderIdx, seller);
            const newChatRoomIdx = createChatRoom[0].insertId;
            const createChatParams = [newChatRoomIdx, senderIdx, content];

            // 생성된 채팅방에 채팅 보내기
            const createChat = await chatDao.createChat(connection, createChatParams);
            await connection.commit();
            connection.release();
            return response(baseResponse.SUCCESS, {"addedchatRoomIdx": newChatRoomIdx});
        } else {
            // 원래 있던 채팅방에 채팅 보내기
            const createChatParams = [chatRoomIdx, senderIdx, content];
            const createChat = await chatDao.createChat(connection, createChatParams);

            await connection.commit();
            connection.release();

            return response(baseResponse.SUCCESS);
        }
    } catch(err) {
        logger.error(`App - createChat Service error\n: ${err.message}`);
        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};