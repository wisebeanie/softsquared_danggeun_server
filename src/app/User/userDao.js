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
                    when isCertified = 0
                        then '미인증'
                    else isCertified
                    end as 'townCertification',
                    date_format(createdAt, '%Y년 %c월 %d일 가입') as 'createdAt',
                    case when sellProduct is null
                        then 0
                        else sellProduct
                    end as sellCount
                FROM User
                left join (select userIdx, Count(userIdx) as 'sellProduct' from Article where Article.status != 'DELETED' and Article.hide != 'Y' group by userIdx) s on s.userIdx = User.idx
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

module.exports = {
  insertUser,
  selectUserPhoneNumber,
  selectUserAccount,
  selectUserNickName,
  selectLatitude,
  selectLongitude,
  selectUserByIdx,
  selectUserProfile,
  updateProfile
};
