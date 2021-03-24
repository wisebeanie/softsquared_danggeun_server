async function createChatRoom(connection, articleIdx, buyerIdx) {
    const createChatRoomQuery = `
                INSERT INTO ChatRoom(articleIdx, buyerIdx)
                VALUES (${articleIdx}, ${buyerIdx});
                `; 
    const createChatRoomRow = await connection.query(createChatRoomQuery, articleIdx, buyerIdx);

    return createChatRoomRow;
};

async function createChat(connection, createChatParams) {
    const createChatQuery = `
                INSERT INTO Chat(chatRoomIdx, senderIdx, content)
                VALUES (?, ?, ?);
                `;
    const createChatRow = await connection.query(createChatQuery, createChatParams);

    return createChatRow;
};

async function selectArticleByChatRoom(connection, chatRoomIdx) {
    const selectArticleByChatRoomQuery = `
                SELECT Article.idx as articleIdx,
                    chatRoomIdx,
                    nickName,
                    manner,
                    title,
                    price
                FROM User
                    join Article on Article.userIdx = User.idx
                    join ChatRoom on ChatRoom.articleIdx = Article.idx
                    join Chat on Chat.chatRoomIdx = ChatRoom.idx
                WHERE ChatRoom.idx = ?
                group by Article.idx;
                `;
    const [articleRow] = await connection.query(selectArticleByChatRoomQuery, chatRoomIdx);

    return articleRow;
};

async function selectChatByChatRoomIdx(connection, chatRoomIdx) {
    const selectChatByChatRoomIdxQuery = `
                SELECT 
                    senderIdx,
                    content,
                    isRead,
                    case when date_format(createdAt, '%p') = 'AM'
                        then concat('오전 ', date_format(createdAt, '%h:%i'))
                    else concat('오후 ', date_format(createdAt, '%h:%i'))
                    end as sendTime
                FROM Chat
                WHERE chatRoomIdx = ${chatRoomIdx} 
                order by createdAt;
                `;
    const [chatRow] = await connection.query(selectChatByChatRoomIdxQuery, chatRoomIdx);

    return chatRow;
};

async function updateChatRead(connection, chatRoomIdx) {
    const updateChatReadQuery = `
                UPDATE Chat
                SET isRead = 'Y'
                WHERE chatRoomIdx = ?;
                `;
    const updateChatRow = await connection.query(updateChatReadQuery, chatRoomIdx);

    return updateChatRow;
};

module.exports = {
    createChatRoom,
    createChat,
    selectArticleByChatRoom,
    selectChatByChatRoomIdx,
    updateChatRead
};