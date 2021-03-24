module.exports = function(app) {
    const chat = require('./chatController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 33. 채팅 보내기 API
    app.post('/app/chat', jwtMiddleware, chat.postChat);
};