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
    
    ARTICLE_ISAD_EMPTY : { "isSuccess": false, "code": 2034, "message": "isAd를 입력해주세요." },
    ARTICLE_ARTICLEIDX_EMPTY : { "isSuccess": false, "code": 2035, "message": "articleIdx를 입력해주세요." },
 
    ARTICLE_ISAD_WRONG : { "isSuccess": false, "code": 2036, "message": "userIdx가 있으면 판매글만 조회 가능합니다." },

    COMMENT_ARTICLEIDX_EMPTY : { "isSuccess": false, "code": 2037, "message": "articleIdx를 입력해주세요." },
    COMMENT_USERIDX_EMPTY : { "isSuccess": false, "code": 2038, "message": "userIdx를 입력해주세요." },
    COMMENT_CONTENT_EMPTY : { "isSuccess": false, "code": 2039, "message": "댓글을 입력해주세요." },
    COMMENT_CONTENT_LENGTH : { "isSuccess": false, "code": 2040, "message": "댓글의 길이는 100자 이내로 입력해주세요." },

    COMMENT_STATUS_ERROR_TYPE : { "isSuccess": false, "code": 2041, "message": "status는 DELETED로만 변경가능합니다." },
    COMMENT_NO_CHANGES : { "isSuccess": false, "code": 2042, "message": "content나 status중 하나는 입력되어야 합니다." },
    COMMENT_COMMENTIDX_EMPTY : { "isSuccess": false, "code": 2043, "message": "commentIdx를 입력해주세요." },

    LOCALAD_PHONENUMBER_ERROR_TYPE : { "isSuccess": false, "code": 2044, "message": "전화번호는 00000000000으로 입력해주세요." },
    COMMENT_STATUS_EMPTY : { "isSuccess": false, "code": 2045, "message": "status를 입력해주세요." },

    ARTICLE_ARTICLEIDX_WRONG : { "isSuccess": false, "code": 2046, "message": "articleIdx를 확인해주세요." },

    MODIFY_ARTICLEIMG_EMPTY : { "isSuccess": false, "code": 2047, "message": "articleImgUrl을 입력해주세요." },
    MODIFY_DESCRIPTION_EMPTY : { "isSuccess": false, "code": 2048, "message": "description을 입력해주세요." },
    MODIFY_TITLE_EMPTY : { "isSuccess": false, "code": 2049, "message": "title을 입력해주세요" },
    MODIFY_PRICE_EMPTY : { "isSuccess": false, "code": 2050, "message": "price를 입력해주세요." },
    MODIFY_CATEGORY_IDX_EMPTY : { "isSuccess": false, "code": 2051, "message": "categoryIdx를 입력해주세요." },
    MODIFY_SUGGESTPRICE_EMPTY : { "isSuccess": false, "code": 2052, "message": "suggestPrice를 입력해주세요." },
    MODIFY_NOCHAT_EMPTY : { "isSuccess": false, "code": 2053, "message": "noChat을 입력해주세요." },
    MODIFY_PHONENUMBER_EMPTY : { "isSuccess": false, "code": 2054, "message": "phoneNumber를 입력해주세요" },
    MODIFY_ARTICLE_WRONG : { "isSuccess": false, "code": 2055, "message": "phoneNumber와 noChat은 판매글에서 수정 불가합니다." },
    MODIFY_LOCALAD_WRONG : { "isSuccess": false, "code": 2056, "message": "suggestPrice는 판매글에서 수정 가능합니다." },

    USER_USERIDX_EMPTY : { "isSuccess": false, "code": 2057, "message": "userIdx를 입력해주세요." },

    PROFILE_PROFILEIMG_EMPTY : { "isSuccess": false, "code": 2058, "message": "프로필 사진을 입력해주세요." },
    PROFILE_NICKNAME_EMPTY : { "isSuccess": false, "code": 2059, "message": "닉네임을 입력해주세요." },
    
    ARTICLE_STATUS_ERROR_TYPE : { "isSuccess": false, "code": 2060, "message": "status는 SALE, SOLD, HIDE 중 하나로 입력해주세요." },
    ARTICLE_STATUS_EMPTY : { "isSuccess": false, "code": 2061, "message": "status를 입력해주세요." },

    LOCALAD_CANT_CATEGORY_SEARCH : { "isSuccess": false, "code": 2062, "message": "카테고리 필터는 판매 글만 가능합니다." },

    ARTICLE_EDIT_STATUS_WRONG : { "isSuccess": false, "code": 2063, "message": "status는 RESERVED, SALE, SOLD, DELETED, HIDE 중 하나로 입력해주세요" },
   
    ARTICLE_HIDE_OR_NOT_EMPTY : { "isSuccess": false, "code": 2064, "message": "hideOrNot을 입력해주세요" },

    AUTH_LATITUDE_EMPTY : { "isSuccess": false, "code": 2065, "message": "현재 위도를 입력해주세요." },
    AUTH_LONGITUDE_EMPTY : { "isSuccess": false, "code": 2066, "message": "현재 경도를 입력해주세요." },

    AUTH_INPUT_WRONG : { "isSuccess": false, "code": 2067, "message": "address와 currentLatitude, currentLongitude는 같이 입력할 수 없습니다." },

    MODIFY_ACCOUNT_WRONG : { "isSuccess": false, "code": 2068, "message": "phoneNumber나 email 둘중 하나는 반드시 입력되어야합니다." },
    CANT_MODIFY_BOTH : { "isSuccess": false, "code": 2069, "message": "phoneNumber와 email 둘 중 하나만 입력해주세요" },

    SEARCH_SEARCHQUERY_EMPTY : { "isSuccess": false, "code": 2070, "message": "검색어를 입력해주세요" },
    USER_FOLLOWUSER_EMPTY : { "isSuccess": false, "code": 2071, "message": "followUserIdx를 입력해주세요." },

    CHAT_ARTICLEIDX_EMPTY : { "isSuccess": false, "code": 2072, "message": "articleIdx를 입력해주세요." },
    CHAT_CHATROOMIDX_EMPTY : { "isSuccess": false, "code": 2073, "message": "chatroomIdx를 입력해주세요." },
    CHAT_SENDERIDX_EMPTY : { "isSuccess": false, "code": 2074, "message": "senderIdx를 입력해주세요." },
    CHAT_CONTENT_EMPTY : { "isSuccess": false, "code": 2075, "message": "content를 입력해주세요." },

    ARTICLE_IMG_WRONG : { "isSuccess": false, "code": 2076, "message": "이미지는 배열로 입력해주세요." },

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

    ARTICLE_ARTICLE_NOT_EXIST : { "isSuccess": false, "code": 3012, "message": "해당 글이 존재하지 않습니다." },
    ARTICLE_ARTICLE_CANNOT_SEE : { "isSuccess": false, "code": 3013, "message": "해당 글은 볼 수 없습니다." },

    COMMENT_ARTICLE_IS_AD_ERROR : { "isSuccess": false, "code": 3014, "message": "댓글은 판매글에는 달 수 없습니다." },
    COMMENT_PARENT_COMMENT_NOT_EXIST : { "isSuccess": false, "code": 3015, "message": "대댓글을 달 댓글이 존재하지 않습니다." },
    COMMENT_ARTICLE_NOT_IS_AD : { "isSuccess": false, "code": 3016, "message": "댓글은 판매글에서는 볼 수 없습니다." },

    COMMENT_NOT_EXIST : { "isSuccess": false, "code": 3017, "message": "해당 댓글이 존재하지 않습니다." },

    USER_USER_NOT_EXIST : { "isSuccess": false, "code": 3018, "message": "해당 유저는 존재하지 않습니다." },

    AUTH_TOWN_FAIL : { "isSuccess": false, "code": 3019, "message": "동네 인증에 실패했습니다." },

    ALREADY_LOGIN : { "isSuccess": false, "code": 3020, "message": "이미 로그인된 유저입니다." },
    NOT_LOGIN : { "isSuccess": false, "code": 3021, "message": "로그인되지 않았습니다." },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
    

 
}