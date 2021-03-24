const jwtMiddleware = require("../../../config/jwtMiddleware");
const chatProvider = require("./chatProvider");
const chatService = require("./chatService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const userProvider = require("../User/userProvider");

/*
    API No. 33 
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

/*
    API No. 34 
    API Name : 채팅 조회 API
    [GET] /app/chat{chatRoomIdx}
*/
exports.getChat = async function (req, res) {
    // Path Variable : chatRoomIdx
    const chatRoomIdx = req.params.chatRoomIdx;

    const userIdxFromJWT = req.verifiedToken.userIdx;
  
    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdxFromJWT);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    if (!chatRoomIdx) {
        return res.send(response(baseResponse.CHAT_CHATROOMIDX_EMPTY));
    }

    const chatResult = await chatProvider.retrieveChatBychatRoomIdx(chatRoomIdx);

    return res.send(chatResult);
};

/*
    API No. 35
    API Name : 채팅방 조회 API
    [GET] /app/chatroom?articleIdx=
*/
exports.getChatRooms = async function(req, res) {
    // Query String : articleIdx
    const articleIdx = req.query.articleIdx;
    
    const userIdxFromJWT = req.verifiedToken.userIdx;


    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdxFromJWT);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    const chatRoomResult = await chatProvider.retrieveChatRoom(userIdxFromJWT, articleIdx);

    return res.send(chatRoomResult);
};