// 전화번호로 회원 조회
async function selectUserPhoneNumber(connection, phoneNumber) {
    const selectUserPhoneNumberQuery = `
                SELECT nickName, phoneNumber, idx
                FROM User
                WHERE phoneNumber = ?;
                `;
    const [phoneNumberRows] = await connection.query(selectUserPhoneNumberQuery, phoneNumber);
    return phoneNumberRows;
};

// 유저 생성
async function insertUser(connection, insertUserParams) {
  const insertUserQuery = `
        INSERT INTO User(nickName, phoneNumber, profileImgUrl, town, countryIdx, longitude, latitude)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
    const insertUserRow = await connection.query(
        insertUserQuery,
        insertUserParams
    );

    return insertUserRow;
}

// 유저 계정 상태 체크
async function selectUserAccount(connection, phoneNumber) {
    const selectUserAccountQuery = `
                SELECT status, idx
                FROM User
                WHERE phoneNumber = ?;
                `;
    const selectUserAccountRow = await connection.query(selectUserAccountQuery, phoneNumber);

    return selectUserAccountRow[0];
};

async function selectUserNickName(connection, nickName) {
    const selectUserNickNameQuery = `
                SELECT nickName
                FROM User
                WHERE nickName = ?;
                `;
    const [nickNameRows] = await connection.query(selectUserNickNameQuery, nickName);
    return nickNameRows;
};

async function selectLatitude(connection, userIdx) {
    const selectLatitudeQuery = `
                SELECT latitude
                FROM User
                WHERE idx = ?;
                `;
    const latitudeRows = await connection.query(selectLatitudeQuery, userIdx);

    return latitudeRows[0];
};

async function selectLongitude(connection, userIdx) {
    const selectLongitudeQuery = `
                SELECT longitude
                FROM User
                WHERE idx = ?;
                `;
    const longitudeRows = await connection.query(selectLongitudeQuery, userIdx);

    return longitudeRows[0];
};

async function selectUserByIdx(connection, userIdx) {
    const selectUserByIdxQuery = `
                SELECT profileImgUrl,
                    nickName,
                    town,
                10000000 + User.idx as userNum
                FROM User
                WHERE idx = ?;
                `;
    const [userIdxRow] = await connection.query(selectUserByIdxQuery, userIdx);

    return userIdxRow;
};

async function selectUserProfile(connection, userIdx) {
    const selectUserProfileQuery = `
                SELECT profileImgUrl,
                    nickName,
                    10000000 + User.idx as userNum,
                    manner,
                    town,
                    case
                    when townAuth = 0
                        then '미인증'
                    else townAuth
                    end as 'townCertification',
                    date_format(createdAt, '%Y년 %c월 %d일 가입') as 'createdAt',
                    case when sellProduct is null
                        then 0
                        else sellProduct
                    end as sellCount
                FROM User
                left join (select userIdx, Count(userIdx) as 'sellProduct' from Article where Article.status = 'SALE' and Article.hide != 'Y' group by userIdx) s on s.userIdx = User.idx
                WHERE User.idx = ?;
                `;
    const [userProfileRow] = await connection.query(selectUserProfileQuery, userIdx);
    
    return userProfileRow;
};

async function updateProfile(connection, userIdx, profileImgUrl, nickName) {
    const updateProfile = `
                UPDATE User
                SET profileImgUrl = '${profileImgUrl}',
                    nickName = '${nickName}'
                WHERE idx = ${userIdx};
                `;
    const updateProfileRow = await connection.query(updateProfile, userIdx, profileImgUrl, nickName);

    return updateProfileRow;
};

async function selectLikes(connection, articleIdx, userIdx) {
    const selectLikesQuery = `
                SELECT status
                FROM LikedArticle
                WHERE articleIdx = ${articleIdx} and userIdx = ${userIdx};
                `;
    const [likesRow] = await connection.query(selectLikesQuery, articleIdx, userIdx);

    return likesRow;
};

async function updateLikes(connection, articleIdx, userIdx, status) {
    const updateLikesQuery = `
                UPDATE LikedArticle
                SET status = '${status}'
                WHERE articleIdx = ${articleIdx} and userIdx = ${userIdx};
                `;
    const [updatelikeRow] = await connection.query(updateLikesQuery, articleIdx, userIdx, status);

    return updatelikeRow;
};

async function insertLike(connection, insertLikeParams) {
    const insertLikeQuery = `
                INSERT INTO LikedArticle(articleIdx, userIdx)
                VALUES (?, ?);
                `;
    const insertLikeRow = await connection.query(insertLikeQuery, insertLikeParams);

    return insertLikeRow;
};

async function selectLikesByUserIdx(connection, userIdx, isAd) {
    const selectLikesByUserIdxQuery = `
                SELECT Article.idx, 
                case when isAd = 'N'
                            then '중고거래'
                        else '동네홍보'
                    end as isAd,
                    case when isAd = 'N'
                            then User.town
                        else null
                    end as town, 
                    title,
                    case when price = 0 and isAd = 'N'
                            then '무료나눔'
                        when isAd = 'Y' and price = 0
                            then '가격없음'
                        else price
                    end as price,
                    case
                        when pullUpStatus = 'N'
                            then 'N'
                        else '끌올'
                        end as pullUpStatus,
                    case
                        when timestampdiff(second, Article.updatedAt, current_timestamp) < 60
                            then concat(timestampdiff(second, Article.updatedAt, current_timestamp), '초 전')
                        when timestampdiff(minute, Article.updatedAt, current_timestamp) < 60
                            then concat(timestampdiff(minute, Article.updatedAt, current_timestamp), '분 전')
                        when timestampdiff(hour, Article.updatedAt, current_timestamp) < 24
                            then concat(timestampdiff(hour, Article.updatedAt, current_timestamp), '시간 전')
                        when timestampdiff(day, Article.updatedAt, current_timestamp) < 7
                            then concat(timestampdiff(day, Article.updatedAt, current_timestamp), '일 전')
                        when timestampdiff(week, Article.updatedAt, current_timestamp) = 1
                            then '지난 주'
                        when timestampdiff(week, Article.updatedAt, current_timestamp) < 4 and timestampdiff(week, Article.updatedAt, current_timestamp) > 1
                            then concat(timestampdiff(week, Article.updatedAt, current_timestamp), '주 전')
                        when timestampdiff(month, Article.updatedAt, current_timestamp) = 1
                            then '지난 달'
                        when timestampdiff(month, Article.updatedAt, current_timestamp) < 12 and timestampdiff(month, Article.updatedAt, current_timestamp) > 1
                            then concat(timestampdiff(day, Article.updatedAt, current_timestamp), '개월 전')
                        when timestampdiff(year, Article.updatedAt, current_timestamp) = 1
                            then '지난 해'
                        else concat(timestampdiff(year, Article.updatedAt, current_timestamp), '년 전')
                        end as updateAt,
                    case when liked is null
                        then 0
                        else liked
                        end as likeCount,
                    case when chat is null
                        then 0
                        else chat
                        end as chatCount,
                    case when comments is null
                            then 0
                        else comments
                    end as commentCount,
                    case when Article.status = 'SOLD'
                        then '거래완료'
                        when Article.status = 'RESERVED'
                            then '예약중'
                        else Article.status
                        end as status
                FROM Article
                    left join User on Article.userIdx = User.idx
                    left join ArticleImg on ArticleImg.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle group by articleIdx) l on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as comments from Comment group by articleIdx) com on com.articleIdx = Article.idx
                    join (select articleIdx, status, updatedAt from LikedArticle where userIdx = ${userIdx}) liked on liked.articleIdx = Article.idx
                WHERE hide != 'Y' and Article.status != 'DELETED' and liked.status = 'ACTIVE'
                group by Article.idx
                ORDER BY liked.updatedAt DESC;
                `;
    const [likeByUserIdxRow] = await connection.query(selectLikesByUserIdxQuery, userIdx, isAd);

    return likeByUserIdxRow;
};

async function selectUserByLocation (connection, userIdx, currentLatitude, currentLongitude, userLatitude, userLongitude) {
    const selectUserByLocationQuery = `
                SELECT idx,
                (6371*acos(cos(radians(${userLatitude}))*cos(radians(${currentLatitude}))*cos(radians(${currentLongitude})
                -radians(${userLongitude}))+sin(radians(${userLatitude}))*sin(radians(${currentLatitude})))) as distance
                FROM User
                WHERE idx = ${userIdx}
                HAVING distance <= 1
                ORDER BY distance 
                LIMIT 0,300;
                `;
    const [userLocationRow] = await connection.query(selectUserByLocationQuery, userIdx, currentLatitude, currentLongitude, userLatitude, userLongitude);

    return userLocationRow;
};

async function updateTownAuth (connection, userIdx) {
    const updateTownAuthQuery = `
                UPDATE User
                SET townAuth = townAuth + 1
                WHERE idx = ?;
                `;
    const updateTownAuthRow = await connection.query(updateTownAuthQuery, userIdx);

    return updateTownAuthRow;
};

async function insertToken(connection, userIdx, token) {
    const insertTokenQuery = `
                INSERT INTO Token(userIdx, jwt)
                VALUES(${userIdx}, '${token}');
                `;
    const insertTokenRow = await connection.query(insertTokenQuery, userIdx, token);

    return insertTokenRow;
};

async function selectJWT(connection, userIdx) {
    const selectJWTQuery = `
                SELECT jwt, userIdx
                FROM Token
                WHERE userIdx = ?;
                `;
    const [selectJWTRow] = await connection.query(selectJWTQuery, userIdx);

    return selectJWTRow;
};

async function deleteJWT(connection, userIdx) {
    const deleteJWTQuery = `
                DELETE FROM Token
                WHERE userIdx = ?;
                `;
    const deleteJWTRow = await connection.query(deleteJWTQuery, userIdx);

    return deleteJWTRow;
};

async function withDrawUser(connection, userIdx) {
    const withDrawUserQuery = `
                UPDATE User
                SET status = 'DELETED'
                WHERE idx = ?;
                `;
    const withDrawUserRow = await connection.query(withDrawUserQuery, userIdx);

    return withDrawUserRow;
};

async function updateUserPhoneNumber(connection, updateParams) {
    const updateUserAccountQuery = `
                UPDATE User
                SET phoneNumber = ?
                WHERE idx = ?;
                `;

    const updateAccountRow = await connection.query(updateUserAccountQuery, updateParams);

    return updateAccountRow;
};

async function updateUserEmail(connection, updateParams) {
    const updateUserAccountQuery = `
                UPDATE User
                SET email = ?
                WHERE idx = ?;
                `;

    const updateAccountRow = await connection.query(updateUserAccountQuery, updateParams);

    return updateAccountRow;
};

async function selectFollow(connection, userIdx, followUserIdx) {
    const selectFollowQuery = `
                SELECT status, followUserIdx
                FROM Following
                WHERE userIdx = ${userIdx} and followUserIdx = ${followUserIdx};
                `;
    const [selectFollowRow] = await connection.query(selectFollowQuery, userIdx);

    return selectFollowRow;
};

async function updateFollow(connection, userIdx, followUserIdx, status) {
    const updateFollowQuery = `
                UPDATE Following
                SET status = '${status}'
                WHERE userIdx = ${userIdx} and followUserIdx = ${followUserIdx};
                `;
    const [updateFollowRow] = await connection.query(updateFollowQuery, userIdx, followUserIdx, status);

    return updateFollowRow;
};

async function insertFollow(connection, userIdx, followUserIdx) {
    const insertFollowQuery = `
                INSERT INTO Following(userIdx, followUserIdx) 
                VALUES (${userIdx}, ${followUserIdx});
                `;
    const insertFollowRow = await connection.query(insertFollowQuery, userIdx, followUserIdx);

    return insertFollowRow;
};

async function selectFollowUsers(connection, userIdx) {
    const selectFollowUsersQuery = `
                SELECT nickName,
                    town,
                    profileImgUrl,
                    Following.status
                FROM Following
                    join User on User.idx = Following.followUserIdx
                WHERE userIdx = ? and Following.status = 'ACTIVE';
                `;
    const [selectFollowUsersRow] = await connection.query(selectFollowUsersQuery, userIdx);

    return selectFollowUsersRow;
};

async function selectUserByArticle(connection, articleIdx) {
    const selectUserByArticleQuery = `
                SELECT userIdx
                FROM Article
                WHERE idx = ?;
                `;
    const [userRow] = await connection.query(selectUserByArticleQuery, articleIdx);

    return userRow;
};

module.exports = {
    insertUser,
    selectUserPhoneNumber,
    selectUserAccount,
    selectUserNickName,
    selectLatitude,
    selectLongitude,
    selectUserByIdx,
    selectUserProfile,
    updateProfile,
    selectLikes,
    updateLikes,
    insertLike,
    selectLikesByUserIdx,
    selectUserByLocation,
    updateTownAuth,
    insertToken,
    selectJWT,
    deleteJWT,
    withDrawUser,
    updateUserPhoneNumber,
    updateUserEmail,
    selectFollow,
    updateFollow,
    insertFollow,
    selectFollowUsers,
    selectUserByArticle
};
