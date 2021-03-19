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
                INSERT INTO Article(userIdx, title, description, price, categoryIdx, noChat, isAd)
                VALUES (?, ?, ?, ?, ?, ?, ?);
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

async function selectArticles (connection, latitude, longitude) {
    const selectArticlesQuery = `
                SELECT Article.idx,
                    title,
                    case when price = 0
                        then '무료나눔'
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
                        when timestampdiff(day, Article.updatedAt, current_timestamp) < 31
                            then concat(timestampdiff(day, Article.updatedAt, current_timestamp), '일 전')
                        else concat(timestampdiff(month, Article.updatedAt, current_timestamp), '개월 전')
                        end as updateAt,
                    case when liked is null
                        then 0
                        else liked
                        end as likeCount,
                    case when chat is null
                        then 0
                        else chat
                        end as chatCount
                FROM Article
                    left join User on Article.userIdx = User.idx
                    left join ArticleImg on ArticleImg.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle group by articleIdx) l on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    join (SELECT idx,
                        (6371*acos(cos(radians(User.latitude))*cos(radians(${latitude}))*cos(radians(${longitude})
                        -radians(User.longitude))+sin(radians(User.latitude))*sin(radians(${latitude}))))
                        as distance
                    FROM User
                    HAVING distance <= 4
                    LIMIT 0,300) point on point.idx = Article.userIdx 
                WHERE isAd = 'N' and Article.status = 'SALE'   
                group by Article.idx;
                `;
    const [selectArticleRows] = await connection.query(selectArticlesQuery, latitude, longitude);

    return selectArticleRows;
};

async function selectLocalAds (connection, latitude, longitude) {
    const selectLocalAdsQuery = `
                SELECT Article.idx,
                    title,
                    price,
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
                        when timestampdiff(day, Article.updatedAt, current_timestamp) < 31
                            then concat(timestampdiff(day, Article.updatedAt, current_timestamp), '일 전')
                        else concat(timestampdiff(month, Article.updatedAt, current_timestamp), '개월 전')
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
                        end as commentCount
                FROM Article
                    left join User on Article.userIdx = User.idx
                    left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle group by articleIdx) l on l.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    left join (select articleIdx, COUNT(idx) as comments from Comment group by articleIdx) com on com.articleIdx = Article.idx
                    join (SELECT idx,
                                    (6371*acos(cos(radians(User.latitude))*cos(radians(${latitude}))*cos(radians(${longitude})
                                    -radians(User.longitude))+sin(radians(User.longitude))*sin(radians(${latitude}))))
                                    as distance
                                FROM User
                                HAVING distance <= 4
                                LIMIT 0,300) point on point.idx = Article.userIdx
                WHERE isAd = 'Y' and Article.status = 'SALE'
                group by Article.idx;
                `;
    const [localAdListRows] = await connection.query(selectLocalAdsQuery, latitude, longitude);

    return localAdListRows;
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
                    when timestampdiff(day, Article.updatedAt, current_timestamp) < 31
                        then concat(timestampdiff(day, Article.updatedAt, current_timestamp), '일 전')
                    else concat(timestampdiff(month, Article.updatedAt, current_timestamp), '개월 전')
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
                        when timestampdiff(day, Article.updatedAt, current_timestamp) < 31
                            then concat(timestampdiff(day, Article.updatedAt, current_timestamp), '일 전')
                        else concat(timestampdiff(month, Article.updatedAt, current_timestamp), '개월 전')
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
                    price,
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

async function selectArticleUserIdx(connection, userIdx) {
    const selectArticleUserIdxQuery = `
                SELECT Article.idx,
                    title,
                    case when price = 0
                        then '무료나눔'
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
                        when timestampdiff(day, Article.updatedAt, current_timestamp) < 31
                            then concat(timestampdiff(day, Article.updatedAt, current_timestamp), '일 전')
                        else concat(timestampdiff(month, Article.updatedAt, current_timestamp), '개월 전')
                        end as updateAt,
                    case when liked is null
                        then 0
                        else liked
                        end as likeCount,
                    case when chat is null
                        then 0
                        else chat
                        end as chatCount
                    FROM Article
                        left join User on Article.userIdx = User.idx
                        left join ArticleImg on ArticleImg.articleIdx = Article.idx
                        left join (select articleIdx, COUNT(articleIdx) as liked from LikedArticle group by articleIdx) l on l.articleIdx = Article.idx
                        left join (select articleIdx, COUNT(idx) as chat from ChatRoom group by articleIdx) c on c.articleIdx = Article.idx
                    WHERE isAd = 'N' and Article.status = 'SALE' and Article.userIdx = ?
                    group by Article.idx;
                    `;
    const [articleByUserIdxRows] = await connection.query(selectArticleUserIdxQuery, userIdx);

    return articleByUserIdxRows;
};

async function selectArticleByArticleIdx(connection, articleIdx) {
    const selectArticleByArticleIdxQuery = `
                SELECT idx
                FROM Article
                WHERE idx = ? and status != 'DELETED';
                `;
    const [articleIdxRow] = await connection.query(selectArticleByArticleIdxQuery, articleIdx);

    return articleIdxRow;
};

async function insertComment(connection, insertCommentParams) {
    const insertCommentQuery = `
                INSERT INTO Comment(articleIdx, userIdx, parentCommentIdx, content)
                VALUES(?, ?, ?, ?);
                `;
    const insertCommentRow = await connection.query(insertCommentQuery, insertCommentParams);

    return insertCommentRow;
}

async function selectParentComment(connection, parentCommentIdx) {
    const selectParentCommentQuery = `
                SELECT idx
                FROM Comment
                WHERE idx = ? and status != 'DELETED';
                `;
    const [parentCommentRow] = await connection.query(selectParentCommentQuery, parentCommentIdx);

    return parentCommentRow;
};

module.exports = {
    insertArticle,
    insertArticleImg,
    insertLocalAd,
    selectCategoryImg,
    selectArticleCategory,
    selectLocalAdCategory,
    selectArticles,
    selectLocalAds,
    selectArticleImg,
    selectArticleIdx,
    checkIsAd,
    selectLocalAdIdx,
    addView,
    selectArticleUserIdx,
    selectArticleByArticleIdx,
    selectParentComment,
    insertComment
};