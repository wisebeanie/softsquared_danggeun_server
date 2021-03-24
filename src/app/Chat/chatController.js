const jwtMiddleware = require("../../../config/jwtMiddleware");
const chatProvider = require("./chatProvider");
const chatService = require("./chatService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const userProvider = require("../User/userProvider");

/*
    API No. 33 채팅 보내기 API
    API Name : 채팅 전송 API
    [POST] /app/chat
*/
exports.postChat = async function (req, res) {
    /*
        Body : chatRoomIdx, articleIdx, content
    */
    const { chatRoomIdx, articleIdx, content } = req.body;
    
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdxFromJWT);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    if(!articleIdx) {
        return res.send(response(baseResponse.CHAT_ARTICLEIDX_EMPTY));
    } else if (!content) {
        return res.send(response(baseResponse.CHAT_CONTENT_EMPTY));
    }

    const postChatResponse = await chatService.createChat(chatRoomIdx, articleIdx, userIdxFromJWT, content);

    res.send(postChatResponse);
};