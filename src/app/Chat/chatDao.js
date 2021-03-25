async function createChatRoom(connection, articleIdx, buyerIdx, sellerIdx) {
    const createChatRoomQuery = `
                INSERT INTO ChatRoom(articleIdx, buyerIdx, sellerIdx)
                VALUES (${articleIdx}, ${buyerIdx}, ${sellerIdx});
                `; 
    const createChatRoomRow = await connection.query(createChatRoomQuery, articleIdx, buyerIdx, sellerIdx);

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
                    case when price = 0
                            then '무료나눔'
                        else price
                    end as price
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
                    case when timestampdiff(year, createdAt, current_timestamp) > 1
                            then date_format(createdAt, '%Y년 %c월 %d일')
                        when timestampdiff(hour, createdAt, current_timestamp) > 24
                            then date_format(createdAt, '%c월 %d일')
                        else
                            case when date_format(createdAt, '%p') = 'AM'
                                    then concat('오전 ', date_format(createdAt, '%h:%i'))
                                else concat('오후 ', date_format(createdAt, '%h:%i'))
                                end
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

async function selectChatRoom(connection, userIdx) {
    const selectChatRoomQuery = `
                SELECT ChatRoom.idx,
                    lastChatMessage,
                    sendTime,
                    e.profileImgUrl,
                    e.nickName,
                    e.town,
                    ChatRoom.articleIdx,
                    case when notRead is null
                        then 0
                        else notRead
                    end as notRead
                FROM User
                    join ChatRoom on ChatRoom.buyerIdx = User.idx or ChatRoom.sellerIdx = User.idx
                    join (select userIdx, profileImgUrl, nickName, town, Article.idx from User join Article on Article.userIdx = User.idx) e on e.idx = ChatRoom.articleIdx
                    join (select Chat.chatRoomIdx,
                                content as lastChatMessage,
                                createdAt,
                                case when timestampdiff(year, createdAt, current_timestamp) > 1
                            then date_format(createdAt, '%Y년 %c월 %d일')
                        when timestampdiff(hour, createdAt, current_timestamp) > 24
                            then date_format(createdAt, '%c월 %d일')
                        else
                            case when date_format(createdAt, '%p') = 'AM'
                                    then concat('오전 ', date_format(createdAt, '%h:%i'))
                                else concat('오후 ', date_format(createdAt, '%h:%i'))
                                end
                        end as sendTime
                            from Chat join (select Chat.chatRoomIdx, max(idx) from Chat group by Chat.chatRoomIdx) currentMessage) as d on d.chatRoomIdx = ChatRoom.idx
                        left join (select Count(idx) as notRead, chatRoomIdx from Chat where isRead = 'N' group by chatRoomIdx) c on c.chatRoomIdx = ChatRoom.idx
                WHERE User.idx = ?
                group by ChatRoom.idx
                order by d.createdAt DESC;
                `;
    const [chatRoomRows] = await connection.query(selectChatRoomQuery, userIdx);

    return chatRoomRows;
};

async function selectChatRoomByArticle(connection, articleIdx) {
    const selectChatRoomByArticleQuery = `
                SELECT User.idx, nickName,
                    town,
                    profileImgUrl
                FROM User
                    join (select buyerIdx from ChatRoom where articleIdx = ${articleIdx}) c on c.buyerIdx = User.idx;
                `;
    const [UserRows] = await connection.query(selectChatRoomByArticleQuery, articleIdx);
    
    return UserRows;
};

module.exports = {
    createChatRoom,
    createChat,
    selectArticleByChatRoom,
    selectChatByChatRoomIdx,
    updateChatRead,
    selectChatRoom,
    selectChatRoomByArticle
};