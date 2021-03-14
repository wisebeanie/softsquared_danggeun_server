module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" }, // ?

    //Request error
    AUTH_PHONENUMBER_EMPTY : { "isSuccess": false, "code": 2001, "message": "핸드폰 번호를 입력해주세요." },
    AUTH_PHONENUMBER_LENGTH : { "isSuccess": false, "code": 2002, "message": "핸드폰번호의 길이는 10자 이상입니다." },
    AUTH_PHONENUMBER_ERROR_TYPE : { "isSuccess": false, "code": 2003, "message": "핸드폰번호는 00000000000으로 입력해주세요." },

    AUTH_EMAIL_EMPTY : { "isSuccess": false, "code": 2004, "message": "이메일을 입력해주세요." },
    AUTH_EMAIL_LENGTH : { "isSuccess": false, "code": 2005, "message": "이메일은 30자 이내로 입력해주세요." },
    AUTH_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2006, "message": "이메일의 형식을 확인해주세요." },
    // Response error
    
    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
 
 
}
