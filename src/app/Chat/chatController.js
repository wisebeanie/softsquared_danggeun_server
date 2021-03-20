// const jwtMiddleware = require("../../../config/jwtMiddleware");
// const chatProvider = require("./chatProvider");
// const chatService = require("./chatService");
// const baseResponse = require("../../../config/baseResponseStatus");
// const {response, errResponse} = require("../../../config/response");

// const io = require('socket.io')(app);
// /*
//     API No. 18 채팅 보내기 API
//     API Name : 채팅 전송 API
//     [POST] /app/chat
// */
// exports.postChat = async function (req, res) {
//     /*
//         Body : articleIdx, 
//     */
//     io.on('connection', socket => {
//         socket.emit('chat-message', 'Hello World');
//     });
// };