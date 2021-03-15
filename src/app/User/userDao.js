// 모든 유저 조회
async function selectUser(connection) {
  const selectUserListQuery = `
                SELECT email, nickname 
                FROM UserInfo;
                `;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}

// 이메일로 회원 조회
async function selectUserEmail(connection, email) {
  const selectUserEmailQuery = `
                SELECT nickName 
                FROM User
                WHERE email = ?;
                `;
  const [emailRows] = await connection.query(selectUserEmailQuery, email);
  return emailRows;
};

// 전화번호로 회원 조회
async function selectUserPhoneNumber(connection, phoneNumber) {
    const selectUserPhoneNumberQuery = `
                SELECT nickName
                FROM User
                WHERE phoneNumber = ?;
                `;
    const [phoneNumberRows] = await connection.query(selectUserPhoneNumberQuery, phoneNumber);
    return phoneNumberRows;
};

// userId 회원 조회
async function selectUserId(connection, userId) {
  const selectUserIdQuery = `
                 SELECT id, email, nickname 
                 FROM UserInfo 
                 WHERE id = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, userId);
  return userRow;
}

// 유저 생성
async function insertUser(connection, insertUserParams) {
  const insertUserQuery = `
        INSERT INTO User(nickName, phoneNumber, profileImgUrl, town, countryIdx)
        VALUES (?, ?, ?, ?, ?);
        `;
    const insertUserRow = await connection.query(
        insertUserQuery,
        insertUserParams
    );

    return insertUserRow;
}

module.exports = {
  selectUser,
  selectUserEmail,
  selectUserId,
  insertUser,
  selectUserPhoneNumber
};
