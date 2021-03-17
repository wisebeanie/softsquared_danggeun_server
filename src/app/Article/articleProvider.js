const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const articleDao = require("./articleDao");

exports.categoryImgCheck = async function(categoryIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const categoryImgCheckResult = await articleDao.selectCategoryImg(connection, categoryIdx);
    connection.release();

    return categoryImgCheckResult[0].categoryImgUrl;
};