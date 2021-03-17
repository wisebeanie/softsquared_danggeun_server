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


module.exports = {
    insertArticle,
    insertArticleImg,
    insertLocalAd,
    selectCategoryImg,
    selectArticleCategory,
    selectLocalAdCategory
};