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

async function selectArticle (connection, latitude, longitude) {
    const selectArticleQuery = `
                SELECT title,
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
                    articleImgUrl,
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
                WHERE isAd = 'N' and Article.status = 'Sale'
                group by Article.idx;
                `;
    const [selectArticleRows] = await connection.query(selectArticleQuery, latitude, longitude);

    return selectArticleRows;
};

async function selectLocalAd (connection, latitude, longitude) {
    const selectLocalAdQuery = `
                SELECT title,
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
                    articleImgUrl,
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
                    left join ArticleImg on ArticleImg.articleIdx = Article.idx
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
                WHERE isAd = 'Y' and Article.status = 'Sale'
                group by Article.idx;
                `;
    const [localAdListRows] = await connection.query(selectLocalAdQuery, latitude, longitude);

    return localAdListRows;
};

module.exports = {
    insertArticle,
    insertArticleImg,
    insertLocalAd,
    selectCategoryImg,
    selectArticleCategory,
    selectLocalAdCategory,
    selectArticle,
    selectLocalAd
};