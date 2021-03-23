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
                    case when isAd = 'N'
                            then User.town
                        else null
                    end as town,
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
                        else Article.status
                        end as status
                FROM Article
                    left join User on Article.userIdx = User.idx
                    left join ArticleImg on ArticleImg.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle group by articleIdx) l on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as comments from Comment group by articleIdx) com on com.articleIdx = Article.idx
                    join (SELECT idx,
                        (6371*acos(cos(radians(User.latitude))*cos(radians(${latitude}))*cos(radians(${longitude})
                        -radians(User.longitude))+sin(radians(User.latitude))*sin(radians(${latitude}))))
                        as distance
                    FROM User
                    HAVING distance <= 4
                    LIMIT 0,300) point on point.idx = Article.userIdx
                WHERE Article.status = 'SALE' and hide != 'Y'`;
    // 카테고리 필터링
    if (categoryList) {
        for (categoryListIdx in categoryList) {
            if (categoryList.length == 1) {
                selectArticlesQuery += `and categoryIdx = ${categoryList[categoryListIdx]}`
            } else if (categoryListIdx == categoryList.length - 1) {
                selectArticlesQuery += `categoryIdx = ${categoryList[categoryListIdx]})`
            } else {
                selectArticlesQuery += `and (categoryIdx = ${categoryList[categoryListIdx]} or `;
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
                        when LikedArticle.userIdx = ${userIdx} and LikedArticle.articleIdx = Article.idx
                            then 'liked'
                        else 'no liked'
                        end as 'likedOrNot',
                    case
                        when price = 0
                            then '무료나눔'
                        else price
                        end as price,
                    suggestPrice,
                    Article.status
                from Article
                    join User on User.idx = Article.userIdx
                    join ArticleCategory on Article.categoryIdx = ArticleCategory.idx
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle group by articleIdx) l
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
                        when LikedArticle.userIdx = ${userIdx} and LikedArticle.articleIdx = Article.idx
                            then 'liked'
                        else 'no liked'
                        end as 'likedOrNot',
                    case when price = 0
                        then '가격없음'
                    else price
                end as price,
                    noChat,
                    Article.status
                from Article
                    left join User on User.idx = Article.userIdx
                    left join ArticleCategory on Article.categoryIdx = ArticleCategory.idx
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle group by articleIdx) l
                                on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c
                                on c.articleIdx = Article.idx
                    left join LikedArticle on LikedArticle.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as comments from Comment group by articleIdx) com on com.articleIdx = Article.idx
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
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle group by articleIdx) l on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as comments from Comment group by articleIdx) com on com.articleIdx = Article.idx
                WHERE Article.status = '${status}' and Article.userIdx = '${userIdx}' and hide != 'Y'
                group by Article.idx
                ORDER BY pullUpStatus = 'N' ,Article.updatedAt DESC
                LIMIT ${5 * page - 5}, 5;
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
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle group by articleIdx) l on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as comments from Comment group by articleIdx) com on com.articleIdx = Article.idx
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
                        left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle group by articleIdx) l on l.articleIdx = Article.idx
                        left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                        left join (select articleIdx, COUNT(idx) as comments from Comment group by articleIdx) com on com.articleIdx = Article.idx
                    WHERE isAd = 'N' and Article.userIdx = ? and hide != 'Y' and Article.status != 'DELETED'
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
    updateArticleHide
};