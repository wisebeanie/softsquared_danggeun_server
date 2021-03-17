module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" }, // ?

    //Request error
    AUTH_PHONENUMBER_EMPTY : { "isSuccess": false, "code": 2001, "message": "핸드폰 번호를 입력해주세요." },
    AUTH_PHONENUMBER_LENGTH : { "isSuccess": false, "code": 2002, "message": "핸드폰번호의 길이는 10자 이상입니다." },
    AUTH_PHONENUMBER_ERROR_TYPE : { "isSuccess": false, "code": 2003, "message": "핸드폰번호는 00000000000으로 입력해주세요." },

    AUTH_EMAIL_EMPTY : { "isSuccess": false, "code": 2004, "message": "이메일을 입력해주세요." },
    AUTH_EMAIL_LENGTH : { "isSuccess": false, "code": 2005, "message": "이메일은 30자 이내로 입력해주세요." },
    AUTH_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2006, "message": "이메일의 형식을 확인해주세요." },
    
    AUTH_ADDRESS_EMPTY : { "isSuccess": false, "code": 2007, "message": "주소를 입력해주세요(동까지만)" },
    AUTH_ADDRESS_ERROR_TYPE : { "isSuccess": false, "code": 2008, "message": "주소는 동으로 끝내주세요" },
    
    SIGNUP_NICKNAME_EMPTY : { "isSuccess": false, "code": 2009, "message": "닉네임을 입력해주세요." },
    SIGNUP_PHONENUMBER_EMPTY : { "isSuccess": false, "code": 2010, "message": "전화번호를 입력해주세요." },
    SIGNUP_EMAIL_EMPTY : { "isSuccess": false, "code": 2011, "message": "이메일을 입력해주세요." },
    SIGNUP_TOWN_EMPTY : { "isSuccess": false, "code": 2012, "message": "동네를 입력해주세요." },
    SIGNUP_COUNTRYIDX_EMPTY : { "isSuccess": false, "code": 2013, "message": "국가를 입력해주세요" },
    
    SIGNUP_EMAIL_LENGTH : { "isSuccess": false, "code": 2014, "message": "이메일은 30자 이내로 입력해주세요." },
    SIGNUP_PHONENUMBER_LENGTH : { "isSuccess": false, "code": 2015, "message": "핸드폰번호의 길이는 10자 이상입니다." },
    
    SIGNUP_PHONENUMBER_ERROR_TYPE : { "isSuccess": false, "code": 2016, "message": "핸드폰번호는 00000000000으로 입력해주세요." },
    SIGNUP_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2017, "message": "이메일의 형식을 확인해주세요." },

    SIGNIN_PHONENUMBER_EMPTY : { "isSuccess": false, "code": 2018, "message": "전화번호를 입력해주세요." },
    SIGNIN_PHONENUMBER_LENGTH : { "isSuccess": false, "code": 2019, "message": "핸드폰번호의 길이는 10자 이상입니다." },
    SIGNIN_PHONENUMBER_ERROR_TYPE : { "isSuccess": false, "code": 2020, "message": "핸드폰번호는 00000000000으로 입력해주세요." },

    SIGNUP_ADDRESS_ERROR_TYPE : { "isSuccess": false, "code": 2021, "message": "주소는 동으로 끝내주세요" },
    
    AUTH_AUTHNUMBER_EMPTY : { "isSuccess": false, "code": 2022, "message": "인증번호를 입력해주세요." },
    AUTH_PHONE_AUTHNUMBER_LENGTH : { "isSuccess": false, "code": 2023, "message": "인증번호의 길이는 4입니다." },
    AUTH_EMAIL_AUTHNUMBER_LENGTH : { "isSuccess": false, "code": 2025, "message": "인증번호의 길이는 6입니다." },

    SIGNIN_JWT_TOKEN_NOT_EXIST : { "isSuccess": false, "code": 2024, "message": "해당 jwt토큰이 존재하지 않습니다." },

    ARTICLE_USERIDX_EMPTY : { "isSuccess": false, "code": 2026, "message": "userIdx를 입력해주세요." },
    ARTICLE_TITLE_EMPTY : { "isSuccess": false, "code": 2027, "message": "제목을 입력해주세요." },
    ARTICLE_DESCRIPTION_EMPTY : { "isSuccess": false, "code": 2028, "message": "설명을 입력해주세요" },
    ARTICLE_CATEGORYIDX_EMPTY : { "isSuccess": false, "code": 2029, "message": "카테고리를 입력해주세요" },
    ARTICLE_TITLE_LENGTH : { "isSuccess": false, "code": 2030, "message": "제목의 길이는 100자 이내로 입력해주세요." },
    ARTICLE_DESCRIPTION_LENGTH : { "isSuccess": false, "code": 2031, "message": "설명의 길이는 200자 이내로 해주세요." },
    
    USER_IDX_NOT_MATCH : { "isSuccess": false, "code": 2032, "message": "userIdx를 확인해주세요."}, 
 
    ARTICLE_CATEGORYIDX_WRONG : { "isSuccess": false, "code": 2033, "message": "categoryIdx를 확인해주세요." },
    // Response error
    ADDRESS_NOT_EXIST : { "isSuccess": false, "code": 3001, "message": "해당 동네는 존재하지 않습니다. 다시 입력해주세요." },
    COUNTRY_NOT_EXIST : { "isSuccess": false, "code": 3002, "message": "해당 국가는 존재하지 않습니다."},

    SIGNUP_REDUNDANT_PHONENUMBER : { "isSuccess": false, "code": 3003, "message": "이미 가입된 전화번호입니다." },
    SIGNUP_REDUNDANT_EMAIL : { "isSuccess": false, "code": 3004, "message": "이미 등록된 이메일입니다." },

    SIGNIN_PHONENUMBER_WRONG : { "isSuccess": false, "code": 3005, "message": "전화번호가 잘못되었습니다." },
    SIGNIN_INACTIVE_ACCOUNT : { "isSuccess": false, "code": 3006, "message": "비활성화 된 계정입니다. 고객센터에 문의해주세요." },
    SIGNIN_WITHDRAWAL_ACCOUNT : { "isSuccess": false, "code": 3007, "message": "탈퇴 된 계정입니다. 고객센터에 문의해주세요." },

    SIGNUP_ADDRESS_WRONG : { "isSuccess": false, "code": 3008, "message": "정확한 주소를 입력해주세요" },
    SIGNUP_REDUNDANT_NICKNAME : { "isSuccess": false, "code": 3009, "message": "중복된 닉네임입니다." },

    AUTH_AUTHNUMBER_NOT_EXIST : { "isSuccess": false, "code": 3010, "message": "인증번호를 받지 못했습니다." },
    AUTH_AUTHNUMBER_INCORRECT : { "isSuccess": false, "code": 3011, "message": "인증번호가 틀렸습니다." },


    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
    

 
}