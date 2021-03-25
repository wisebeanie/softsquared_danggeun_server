// 판매 글 생성 API
async function insertArticle(connection, insertArticleParmas) {
    const insertArticleQuery = `
                INSERT INTO Article(userIdx, title, description, price, categoryIdx, suggestPrice)
                VALUES (?, ?, ?, ?, ?, ?);
                `;
    const insertArticleRow = await connection.query(insertArticleQuery, insertArticleParmas);

    return insertArticleRow;
};

// 해당 판매글 이미지 생성 
async function insertArticleImg(connection, insertArticleImgParams) {
    const insertArticleImgQuery = `
                INSERT INTO ArticleImg(articleIdx, articleImgUrl)
                VALUES (?, ?);
                `;
    const insertArticleImgRow = await connection.query(insertArticleImgQuery, insertArticleImgParams);

    return insertArticleImgRow;
};

// 지역 광고글 생성
async function insertLocalAd (connection, insertLocalAdParmas) {
    const insertLocalAdQuery = `
                INSERT INTO Article(userIdx, title, description, price, categoryIdx, noChat, isAd, phoneNumber)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                `;
    const insertLocalAdRow = await connection.query(insertLocalAdQuery, insertLocalAdParmas);

    return insertLocalAdRow;
};

// 카테고리 별 기본 이미지 조회
async function selectCategoryImg (connection, categoryIdx) {
    const selectCategoryImgQuery = `
                SELECT categoryImgUrl
                FROM ArticleCategory
                WHERE idx = ?;
                `;
    const selectCategoryImgRow = await connection.query(selectCategoryImgQuery, categoryIdx);

    return selectCategoryImgRow[0];
};

// 판매글 카테고리 조회
async function selectArticleCategory (connection) {
    const selectArticleCategoryQuery = `
                SELECT category
                FROM ArticleCategory
                WHERE idx > 0 and idx < 16;    
                `;
    const [selectArticleCategoryRows] = await connection.query(selectArticleCategoryQuery);

    return selectArticleCategoryRows;
};

// 지역광고 카테고리 조회
async function selectLocalAdCategory (connection) {
    const selectLocalAdCategoryQuery = `
                SELECT category
                FROM ArticleCategory
                WHERE idx > 15 and idx < 23;    
                `;
    const [selectLocalAdCategoryRows] = await connection.query(selectLocalAdCategoryQuery);

    return selectLocalAdCategoryRows;
};

async function selectArticles (connection, latitude, longitude, categoryList, page) {
    var selectArticlesQuery = `
                SELECT Article.idx,
                    case when isAd = 'N'
                            then '중고거래'
                        else '동네홍보'
                    end as isAd,
                    title,
                    case when price = 0 and isAd = 'N'
                            then '무료나눔'
                        when isAd = 'Y' and price = 0
                            then null
                        else price
                    end as price,
                    User.town,
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
                    case when Article.status = 'RESERVED'
                            then '예약중'
                        else '판매중'
                        end as status
                FROM Article
                    left join User on Article.userIdx = User.idx
                    left join ArticleImg on ArticleImg.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle where status != 'DELETED' group by articleIdx) l on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as comments from Comment where Comment.status != 'DELETED' group by articleIdx) com on com.articleIdx = Article.idx
                    join (SELECT idx,
                        (6371*acos(cos(radians(User.latitude))*cos(radians(${latitude}))*cos(radians(${longitude})
                        -radians(User.longitude))+sin(radians(User.latitude))*sin(radians(${latitude}))))
                        as distance
                    FROM User
                    HAVING distance <= 6
                    LIMIT 0,300) point on point.idx = Article.userIdx
                WHERE Article.status != 'DELETED' and Article.status != 'SOLD' and hide != 'Y' and (`;
    // 카테고리 필터링

    if (typeof(categoryList) == "string") {
        selectArticlesQuery += `categoryIdx = ${categoryList})`
    } else {
        for (categoryListIdx in categoryList) {
            if (categoryList.length == 1) {
                selectArticlesQuery += `categoryIdx = ${categoryList[categoryListIdx]})`
            } else if (categoryListIdx == categoryList.length - 1) {
                selectArticlesQuery += `categoryIdx = ${categoryList[categoryListIdx]})`
            } else {
                selectArticlesQuery += `categoryIdx = ${categoryList[categoryListIdx]} or `;
            }
        }  
    }
 
    selectArticlesQuery += ` group by Article.idx
    ORDER BY pullUpStatus = 'N' ,Article.updatedAt DESC
    LIMIT ${5 * page - 5}, 5;`;

    const [selectArticleRows] = await connection.query(selectArticlesQuery, latitude, longitude, categoryList, page);

    return selectArticleRows;
};

async function selectArticleImg(connection, articleIdx) {
    const selectArticleImgQuery = `
                SELECT articleImgUrl
                FROM ArticleImg
                WHERE articleIdx = ?;
                `;
    const [articleImgRows] = await connection.query(selectArticleImgQuery, articleIdx);

    return articleImgRows;
};

async function selectArticleIdx(connection, articleIdx, userIdx) {
    const selectArticleIdxQuery = `
                select nickName,
                    profileImgUrl,
                    town,
                    manner,
                    title,
                    category,
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
                        end as updatedAt,
                    description,
                    case
                        when liked is null
                            then 0
                        else liked
                        end as likeCount,
                    case
                        when chat is null
                            then 0
                        else chat
                        end as chatCount,
                    viewed,
                    case
                        when LikedArticle.userIdx = ${userIdx} and LikedArticle.articleIdx = Article.idx and LikedArticle.status != 'DELETED'
                            then 'liked'
                        else 'no liked'
                        end as 'likedOrNot',
                    case
                        when price = 0
                            then '무료나눔'
                        else price
                        end as price,
                    suggestPrice,
                    case 
                        when Article.status = 'SALE'
                            then '판매중'
                        when Article.status = 'RESERVED'
                            then '예약중'
                        when Article.status = 'SOLD'
                            then '거래완료'
                        end as status
                from Article
                    join User on User.idx = Article.userIdx
                    join ArticleCategory on Article.categoryIdx = ArticleCategory.idx
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle where status != 'DELETED' group by articleIdx) l
                                on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c
                                on c.articleIdx = Article.idx
                    left join LikedArticle on LikedArticle.articleIdx = Article.idx
                where Article.idx = ${articleIdx};
                `;
    const [articleRow] = await connection.query(selectArticleIdxQuery, articleIdx, userIdx);

    return articleRow;
};

async function selectLocalAdIdx(connection, articleIdx, userIdx) {
    const selectLocalAdIdxQuery = `
                select nickName,
                    profileImgUrl,
                    town,
                    manner,
                    title,
                    category,
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
                        end as updatedAt,
                    description,
                    case
                        when liked is null
                            then 0
                        else liked
                        end as likeCount,
                    case
                        when chat is null
                            then 0
                        else chat
                        end as chatCount,
                    case
                        when comments is null
                            then 0
                        else comments
                        end as commentCount,
                    viewed,
                    case
                        when LikedArticle.userIdx = ${userIdx} and LikedArticle.articleIdx = Article.idx and LikedArticle.status != 'DELETED'
                            then 'liked'
                        else 'no liked'
                        end as 'likedOrNot',
                    case when price = 0
                        then '가격없음'
                    else price
                end as price,
                    noChat,
                    case 
                        when Article.status = 'SALE'
                            then '판매중'
                        when Article.status = 'RESERVED'
                            then '예약중'
                        when Article.status = 'SOLD'
                            then '거래완료'
                        end as status,
                    case when isAd = 'Y' and Article.phoneNumber != 'N'
                        then Article.phoneNumber
                    end as phoneNumber
                from Article
                    left join User on User.idx = Article.userIdx
                    left join ArticleCategory on Article.categoryIdx = ArticleCategory.idx
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle where status != 'DELETED' group by articleIdx) l
                                on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c
                                on c.articleIdx = Article.idx
                    left join LikedArticle on LikedArticle.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as comments from Comment where status != 'DELETED' group by articleIdx) com on com.articleIdx = Article.idx
                where Article.idx = ${articleIdx};
                `;
    const [localAdRow] = await connection.query(selectLocalAdIdxQuery, articleIdx, userIdx);

    return localAdRow;
};

async function checkIsAd(connection, articleIdx) {
    const checkIsAdQuery = `
                SELECT isAd
                FROM Article
                WHERE idx = ?;
                `;
    const [isAdRow] = await connection.query(checkIsAdQuery, articleIdx);

    return isAdRow;
};

async function addView(connection, articleIdx) {
    const addViewQuery = `
                UPDATE Article SET viewed = viewed + 1
                WHERE idx = ?
                `;
    const [addViewRow] = await connection.query(addViewQuery, articleIdx);

    return addViewRow;
};

async function selectArticleByArticleIdx(connection, articleIdx) {
    const selectArticleByArticleIdxQuery = `
                SELECT idx, userIdx, isAd
                FROM Article
                WHERE idx = ? and status != 'DELETED';
                `;
    const [articleIdxRow] = await connection.query(selectArticleByArticleIdxQuery, articleIdx);

    return articleIdxRow;
};

async function deleteImg(connection, articleIdx) {
    const deleteImgQuery = `
                DELETE FROM ArticleImg
                WHERE articleIdx = ?;
                `;
    const [deleteImgRow] = await connection.query(deleteImgQuery, articleIdx);

    return deleteImgRow;
};

async function updateArticle(connection, articleIdx, description, title, categoryIdx, price, suggestPrice) {
    const updateArticleQuery = `
                UPDATE Article
                Set description = '${description}',
                title = '${title}',
                categoryIdx = ${categoryIdx},
                price = ${price},
                suggestPrice = '${suggestPrice}'
                WHERE idx = ${articleIdx}
                `;
    const [editArticleRow] = await connection.query(updateArticleQuery, articleIdx, description, title, categoryIdx, price, suggestPrice);

    return editArticleRow;
};

async function updateLocalAd(connection, articleIdx, articleImgUrl, description, title, categoryIdx, price, phoneNumber, noChat) {
    const updateLocalAdQuery = `
                UPDATE Article
                Set description = '${description}',
                title = '${title}',
                categoryIdx = ${categoryIdx},
                price = ${price},
                phoneNumber = '${phoneNumber}',
                noChat = '${noChat}'
                WHERE idx = ${articleIdx}
                `;
    const [editArticleRow] = await connection.query(updateLocalAdQuery, articleIdx, articleImgUrl, description, title, categoryIdx, price, phoneNumber, noChat);

    return editArticleRow;
};

async function selectArticleByStatus(connection, userIdx, status) {
    const selectArticleByStatusQuery = `
                SELECT Article.idx,
                    case when isAd = 'N'
                            then '중고거래'
                        else '동네홍보'
                    end as isAd,    
                    title,
                    case when price = 0 and isAd = 'N'
                            then '무료나눔'
                        when isAd = 'Y' and price = 0
                            then null
                        else price
                    end as price,
                    User.town,
                    case
                        when pullUpStatus = 'N'
                            then 'N'
                        else '끌올'
                    end as pullUpStatus,
                    case when isAd = 'N'
                            then User.town
                        else null
                    end as town,
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
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle where status != 'DELETED' group by articleIdx) l on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as comments from Comment where status != 'DELETED' group by articleIdx) com on com.articleIdx = Article.idx
                WHERE Article.status = '${status}' and Article.userIdx = '${userIdx}' and hide != 'Y'
                group by Article.idx
                ORDER BY pullUpStatus = 'N' ,Article.updatedAt DESC;
                `;
    const [articleBystatusRow] = await connection.query(selectArticleByStatusQuery, userIdx, status);

    return articleBystatusRow;
};

async function selectHideArticles(connection, userIdx) {
    const selectHideArticlesQuery = `
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
                            then null
                        else price
                    end as price,
                    User.town,
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
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle where status != 'DELETED' group by articleIdx) l on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as comments from Comment where status != 'DELETED' group by articleIdx) com on com.articleIdx = Article.idx
                WHERE Article.hide = 'Y' and Article.userIdx = '${userIdx}' and Article.status != 'DELETED'
                group by Article.idx
                ORDER BY pullUpStatus = 'N' ,Article.updatedAt DESC;
                `;
    const [hideArticleRows] = await connection.query(selectHideArticlesQuery, userIdx);

    return hideArticleRows;
};

async function selectSalesUserIdx(connection, userIdx) {
    const selectSalesUserIdxQuery = `
                SELECT Article.idx,
                    case when isAd = 'N'
                            then '중고거래'
                        else '동네홍보'
                    end as isAd,
                    town,
                    title,
                    case when price = 0 and isAd = 'N'
                            then '무료나눔'
                        when isAd = 'Y' and price = 0
                            then null
                        else price
                    end as price,
                    User.town,
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
                        left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle where status != 'DELETED' group by articleIdx) l on l.articleIdx = Article.idx
                        left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                        left join (select articleIdx, COUNT(idx) as comments from Comment where status != 'DELETED' group by articleIdx) com on com.articleIdx = Article.idx
                    WHERE Article.userIdx = ? and hide != 'Y' and Article.status != 'DELETED'
                    group by Article.idx
                    ORDER BY pullUpStatus = 'N' ,Article.updatedAt DESC;
                    `;
    const [salesByUserIdxRows] = await connection.query(selectSalesUserIdxQuery, userIdx);

    return salesByUserIdxRows;
};

async function updateArticleStatus(connection, articleIdx, status) {
    const updateArticleStatusQuery = `
                UPDATE Article
                SET status = '${status}'
                WHERE idx = ${articleIdx}
                `;
    const [updateArticleRow] = await connection.query(updateArticleStatusQuery, articleIdx, status);

    return updateArticleRow;
};

async function updateArticleHide(connection, articleIdx, hideOrNot) {
    const updateArticleHideQuery = `
                UPDATE Article
                SET hide = '${hideOrNot}'
                WHERE idx = ${articleIdx};
                `;
    const [updateArticleHideRow] = await connection.query(updateArticleHideQuery, articleIdx, hideOrNot);

    return updateArticleHideRow;
};

async function searchArticles(connection, page, searchQueryList, latitude, longitude) {
    var searchArticlesQuery = `
                SELECT Article.idx,
                    case when isAd = 'N'
                            then '중고거래'
                    end as isAd,
                    title,
                    case when price = 0 
                            then '무료나눔'
                        else price
                    end as price,
                    town,
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
                    case when Article.status = 'RESERVED'
                        then '예약중'
                        else Article.status
                        end as status
                FROM Article
                    left join User on Article.userIdx = User.idx
                    left join ArticleImg on ArticleImg.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle where status != 'DELETED' group by articleIdx) l on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    join (SELECT idx,
                        (6371*acos(cos(radians(User.latitude))*cos(radians(${latitude}))*cos(radians(${longitude})
                        -radians(User.longitude))+sin(radians(User.latitude))*sin(radians(${latitude}))))
                        as distance
                    FROM User
                    HAVING distance <= 4
                    LIMIT 0,300) point on point.idx = Article.userIdx
                WHERE Article.isAd = 'N' and Article.status != 'DELETED' and Article.status != 'SOLD' and hide != 'Y' and `;
    for (searchQuery in searchQueryList) {
        if (searchQueryList.length == 1) {
            searchArticlesQuery += `(Article.title LIKE '%${searchQueryList[searchQuery]}%')`;
        } else if (searchQuery == searchQueryList.length - 1) {
            searchArticlesQuery += `(Article.title LIKE '%${searchQueryList[searchQuery]}%')`;
        } else {
            searchArticlesQuery += `(Article.title LIKE '%${searchQueryList[searchQuery]}%') or `;
        }
    }

    searchArticlesQuery += ` group by Article.idx
    ORDER BY pullUpStatus = 'N' ,Article.updatedAt DESC
    LIMIT ${5 * page - 5}, 5;`;

    const [searchArticleRows] = await connection.query(searchArticlesQuery, page, searchQuery, latitude, longitude);

    return searchArticleRows;
};

async function selectFollowUsersArticles(connection, userIdx) {
    const selectFollowUsersArticlesquery = `
                SELECT Article.idx,
                    case when isAd = 'N'
                            then '중고거래'
                        else '동네홍보'
                    end as isAd,
                    nickName,
                    title,
                    case when price = 0 and isAd = 'N'
                            then '무료나눔'
                        when isAd = 'Y' and price = 0
                            then null
                        else price
                    end as price,
                    town,
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
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle where status != 'DELETED' group by articleIdx) l on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as comments from Comment where status != 'DELETED' group by articleIdx) com on com.articleIdx = Article.idx
                    join Following on Following.followUserIdx = User.idx
                WHERE Article.status != 'DELETED' and hide != 'Y' and Following.userIdx = ?
                group by Article.idx;
                `;
    const [selectFollowUsersArticlesRow] = await connection.query(selectFollowUsersArticlesquery, userIdx);

    return selectFollowUsersArticlesRow;
};

async function selectUserByArticle(connection, articleIdx) {
    const selectUserByArticleQuery = `
                SELECT userIdx
                FROM Article
                WHERE idx = ?;
                `;
    const [userResult] = await connection.query(selectUserByArticleQuery, articleIdx);

    return userResult;
};

async function insertBuyer(connection, articleIdx, userIdx) {
    const insertBuyerQuery = `
                INSERT INTO BoughtArticle(articleIdx, userIdx)
                VALUES (${articleIdx}, ${userIdx});
                `;
    const buyerRow = await connection.query(insertBuyerQuery, articleIdx, userIdx);

    return buyerRow;
};

async function selectBoughtArticle(connection, userIdx) {
    const selectBoughtArticleQuery = `
                SELECT Article.idx,
                    case when isAd = 'N'
                            then '중고거래'
                        else '동네홍보'
                    end as isAd,
                    title,
                    case when price = 0 and isAd = 'N'
                            then '무료나눔'
                        when isAd = 'Y' and price = 0
                            then null
                        else price
                    end as price,
                    User.town,
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
                        end as status
                FROM Article
                    left join User on Article.userIdx = User.idx
                    left join ArticleImg on ArticleImg.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle where status != 'DELETED' group by articleIdx) l on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as comments from where status != 'DELETED' Comment group by articleIdx) com on com.articleIdx = Article.idx
                    join (select userIdx, articleIdx from BoughtArticle where userIdx = ?) d on d.articleIdx = Article.idx
                    group by Article.idx;
                `;
    const [boughtResult] = await connection.query(selectBoughtArticleQuery, userIdx);

    return boughtResult;
};

async function selectSearchWord(connection, searchQuery) {
    const selectSearchWordQuery = `
                SELECT searchWord
                FROM SearchWord
                WHERE searchWord = '${searchQuery}';
                `;
    const [searchWordRow] = await connection.query(selectSearchWordQuery, searchQuery);
    
    return searchWordRow;
};

async function insertSearchWord(connection, searchQuery) {
    const insertSearchWordQuery = `
                INSERT INTO SearchWord(searchWord)
                VALUES('${searchQuery}');
                `;
    const searchWordRow = await connection.query(insertSearchWordQuery, searchQuery);

    return searchWordRow;
};

async function updateSearchWord(connection, searchQuery) {
    const updateSearchWordQuery = `
                UPDATE SearchWord
                SET count = count + 1
                WHERE searchWord = '${searchQuery}';
                `;
    const updateResult = await connection.query(updateSearchWordQuery, searchQuery);

    return updateResult;
};

async function selectHotSearchWord(connection) {
    const selectHotSearchWordQuery = `
                select idx, searchWord,
                count,
                @vRank := @vRank + 1 as ranking
                    from SearchWord as s, (select @vRank := 0) r order by count DESC
                LIMIT 0, 15
                `;
    const [hotSearchWordRows] = await connection.query(selectHotSearchWordQuery);

    return hotSearchWordRows;
};

async function selectOldRanking(connection) {
    const selectOldRankingQuery = `
                SELECT searchWordIdx, ranking, changes
                FROM Ranking;
                `;
    const [oldRankingRow] = await connection.query(selectOldRankingQuery);

    return oldRankingRow;
};

async function insertRanking(connection, searchWordIdx, ranking, change) {
    const insertRankingQuery = `
                INSERT INTO Ranking(searchWordIdx, ranking, changes)
                VALUES(${searchWordIdx}, ${ranking}, '${change}');
                `;
    const insertRankingRow = await connection.query(insertRankingQuery, searchWordIdx, ranking, change);

    return insertRankingRow;
};

async function deleteRanking(connection) {
    const deleteRankingQuery = `
                DELETE FROM Ranking;
                `;
    const deleteRankingRow = await connection.query(deleteRankingQuery);
    
    return deleteRankingRow;
};

async function updateChange(connection, searchWordIdx, change) {
    const updateChangeQuery = `
                UPDATE Ranking
                SET changes = '${change}'
                WHERE searchWordIdx = ${searchWordIdx};
                `;
    const updateChangeRow = await connection.query(updateChangeQuery, searchWordIdx, change);

    return updateChangeRow;
};

async function selectRanking(connection) {
    const selectRankingQuery = `
                SELECT searchWord, ranking,
                case when changes is null or changes = ""
                    then 'new'
                    else changes
                end as changes
                FROM Ranking
                    join SearchWord on SearchWord.idx = Ranking.searchWordIdx
                group by searchWordIdx;
                `;
    const [rankingRow] = await connection.query(selectRankingQuery);
    return rankingRow;
};

module.exports = {
    insertArticle,
    insertArticleImg,
    insertLocalAd,
    selectCategoryImg,
    selectArticleCategory,
    selectLocalAdCategory,
    selectArticles,
    selectArticleImg,
    selectArticleIdx,
    checkIsAd,
    selectLocalAdIdx,
    addView,
    selectArticleByArticleIdx,
    deleteImg,
    updateArticle,
    updateLocalAd,
    selectArticleByStatus,
    selectHideArticles,
    selectSalesUserIdx,
    updateArticleStatus,
    updateArticleHide,
    searchArticles,
    selectFollowUsersArticles,
    selectUserByArticle,
    insertBuyer,
    selectBoughtArticle,
    selectSearchWord,
    insertSearchWord,
    updateSearchWord,
    selectHotSearchWord,
    selectOldRanking,
    insertRanking,
    deleteRanking,
    updateChange,
    selectRanking
};