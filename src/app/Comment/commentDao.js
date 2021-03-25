async function selectParentComment(connection, parentCommentIdx) {
    const selectParentCommentQuery = `
                SELECT idx
                FROM Comment
                WHERE idx = ? and status != 'DELETED';
                `;
    const [parentCommentRow] = await connection.query(selectParentCommentQuery, parentCommentIdx);

    return parentCommentRow;
};

async function insertComment(connection, insertCommentParams) {
    const insertCommentQuery = `
                INSERT INTO Comment(articleIdx, userIdx, parentCommentIdx, content)
                VALUES(?, ?, ?, ?);
                `;
    const insertCommentRow = await connection.query(insertCommentQuery, insertCommentParams);

    return insertCommentRow;
};

async function selectComments(connection, articleIdx) {
    const selectCommentsQuery = `
                SELECT Comment.idx,
                    case
                        when Comment.status = 'DELETED'
                            then '삭제된 댓글입니다.'
                        else content
                    end as content,
                    profileImgUrl,
                    nickName,
                    case
                        when Comment.userIdx = Article.userIdx
                            then '작성자'
                        else 'N'
                        end as isWriter,
                    town,
                    case
                        when timestampdiff(second, Comment.updatedAt, current_timestamp) < 60
                            then concat(timestampdiff(second, Comment.updatedAt, current_timestamp), '초 전')
                        when timestampdiff(minute, Comment.updatedAt, current_timestamp) < 60
                            then concat(timestampdiff(minute, Comment.updatedAt, current_timestamp), '분 전')
                        when timestampdiff(hour, Comment.updatedAt, current_timestamp) < 24
                            then concat(timestampdiff(hour, Comment.updatedAt, current_timestamp), '시간 전')
                        when timestampdiff(day, Comment.updatedAt, current_timestamp) < 31
                            then concat(timestampdiff(day, Comment.updatedAt, current_timestamp), '일 전')
                        when timestampdiff(month, Comment.updatedAt, current_timestamp) < 12
                            then concat(timestampdiff(day, Comment.updatedAt, current_timestamp), '개월 전')
                        else concat(timestampdiff(year, Comment.updatedAt, current_timestamp), '년 전')
                    end as writingDate
                FROM Comment
                    join User on User.idx = Comment.userIdx
                    join Article on Article.idx = Comment.articleIdx
                WHERE articleIdx = ? and parentCommentIdx = 0
                ORDER BY Comment.createdAt;
                `;
    const [commentsRow] = await connection.query(selectCommentsQuery, articleIdx);

    return commentsRow;
};

async function selectNestedComments(connection, parentCommentIdx) {
    const selectNestedCommentsQuery = `
                SELECT Comment.idx,
                    case
                    when Comment.status = 'DELETED'
                        then '삭제된 댓글입니다.'
                    else content
                    end as content,
                    profileImgUrl,
                    nickName,
                    case
                        when Comment.userIdx = Article.userIdx
                            then '작성자'
                        else 'N'
                        end as isWriter,
                    town,
                    case
                        when timestampdiff(second, Comment.updatedAt, current_timestamp) < 60
                            then concat(timestampdiff(second, Comment.updatedAt, current_timestamp), '초 전')
                        when timestampdiff(minute, Comment.updatedAt, current_timestamp) < 60
                            then concat(timestampdiff(minute, Comment.updatedAt, current_timestamp), '분 전')
                        when timestampdiff(hour, Comment.updatedAt, current_timestamp) < 24
                            then concat(timestampdiff(hour, Comment.updatedAt, current_timestamp), '시간 전')
                        when timestampdiff(day, Comment.updatedAt, current_timestamp) < 31
                            then concat(timestampdiff(day, Comment.updatedAt, current_timestamp), '일 전')
                        when timestampdiff(month, Comment.updatedAt, current_timestamp) < 12
                            then concat(timestampdiff(day, Comment.updatedAt, current_timestamp), '개월 전')
                        else concat(timestampdiff(year, Comment.updatedAt, current_timestamp), '년 전')
                    end as writingDate
                FROM Comment
                    join User on User.idx = Comment.userIdx
                    join Article on Article.idx = Comment.articleIdx
                WHERE parentCommentIdx = ?
                ORDER BY Comment.createdAt;
                `;

    const [nestedCommentsRow] = await connection.query(selectNestedCommentsQuery, parentCommentIdx);

    return nestedCommentsRow;
};

async function selectCommentByIdx(connection, commentIdx) {
    const selectCommentByIdxQuery = `
                SELECT userIdx,
                    content,
                    status
                FROM Comment
                WHERE idx = ?;
                `;
    const [commentRow] = await connection.query(selectCommentByIdxQuery, commentIdx);

    return commentRow;
};

async function updateComment(connection, commentIdx) {
    const updateCommentQuery = `
                UPDATE Comment
                SET status = 'DELETED'
                WHERE idx = ${commentIdx};
                `;
    const updateCommentRow = await connection.query(updateCommentQuery, commentIdx);

    return updateCommentRow[0];
};

module.exports = {
    selectParentComment,
    insertComment,
    selectComments,
    selectNestedComments,
    selectCommentByIdx,
    updateComment
};