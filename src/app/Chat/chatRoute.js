module.exports = function(app) {
    const chat = require('./chatController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 33. 채팅 보내기 API
    app.post('/app/chat', jwtMiddleware, chat.postChat);

    // 34. 채팅 조회 API
    app.get('/app/chat/:chatRoomIdx', jwtMiddleware, chat.getChat);

    // 35. 채팅방 조회 API
    app.get('/app/chatrooms', jwtMiddleware, chat.getChatRooms);
};