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
                SELECT nickName, email
                FROM User
                WHERE email = ?;
                `;
  const [emailRows] = await connection.query(selectUserEmailQuery, email);
  return emailRows;
};

// 전화번호로 회원 조회
async function selectUserPhoneNumber(connection, phoneNumber) {
    const selectUserPhoneNumberQuery = `
                SELECT nickName, phoneNumber
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

module.exports = {
  selectUser,
  selectUserEmail,
  selectUserId,
  insertUser,
  selectUserPhoneNumber,
  selectUserAccount,
  selectUserNickName,
  selectLatitude,
  selectLongitude
};
