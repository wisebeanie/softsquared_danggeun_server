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

module.exports = {
    createChatRoom,
    createChat
};