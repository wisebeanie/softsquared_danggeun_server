const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("./userProvider");
const userService = require("./userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const request = require('request');

const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const crypto = require('crypto');

const { smtpTransport } = require('../../../config/email');

const queryString = require('querystring');
const { count } = require("console");

var regPhoneNumber = /^\d{3}\d{3,4}\d{4}$/;
var regAddress = /.*\s*동/;

const nodeCache = require('node-cache');
const { type } = require("os");
const cache = new nodeCache();

const articleProvider = require("../Article/articleProvider");

/**
 * API No. 1
 * API Name : 인증번호 전송 API
 * [POST] /app/auth/phonenumber
 */
exports.authSendPhoneNumber = async function (req, res) {

    /*
     * Body: phoneNumber
     */
    const { phoneNumber } = req.body;
    const myPhone = '01047937231';

    // 캐시 데이터 삭제
    cache.del(phoneNumber);

    // 인증번호
    const authNum = Math.floor((Math.random() * (9999 - 1000 + 1)) + 1000);

    // 빈 값 체크
    if (!phoneNumber)
        return res.send(response(baseResponse.AUTH_PHONENUMBER_EMPTY));

    // 길이 체크
    if (phoneNumber.length < 10)
        return res.send(response(baseResponse.AUTH_PHONENUMBER_LENGTH));

    // 형식 체크 (by 정규표현식)
    if (!regPhoneNumber.test(phoneNumber))
        return res.send(response(baseResponse.AUTH_PHONENUMBER_ERROR_TYPE));

    const serviceId = 'ncp:sms:kr:264572059694:danggeun';
    const secretKey = 'OxTlHjWVlCvDQrNX7EMBC5TV9gbTSeTaRFKuF1HP';
    const accessKey = 'hDSCla09J9VjtnhrWETM';

    const method = 'POST';
    const space = " ";
    const newLine = "\n";
    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${serviceId}/messages`;
    const url2 = `/sms/v2/services/${serviceId}/messages`;

    const timestamp = Date.now().toString();

	const hmac = crypto.createHmac('sha256', secretKey);
    const mes = [];
    mes.push(method);
    mes.push(space);
    mes.push(url2);
    mes.push(newLine);
    mes.push(timestamp);
    mes.push(newLine);
    mes.push(accessKey);

    const signature = hmac.update(mes.join('')).digest('base64');
    
    request({
        method: method,
        json: true,
        url: url,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-ncp-iam-access-key' : accessKey,         
            'x-ncp-apigw-timestamp': timestamp,
            'x-ncp-apigw-signature-v2': signature.toString()
        },
        body: {
            "type":"SMS",
            "contentType":"COMM",
            "countryCode":"82",
            "from": myPhone,
            "content":`[당근마켓]\n인증번호 [${authNum}]`,        
            "messages":[
                {
                    "to":`${phoneNumber}`,         
                }
            ]
        }
    }, function (err, res, html) {
        if (err) res.send(response(baseResponse.SERVER_ERROR));
    });

    // 캐시 데이터 저장
    cache.set(phoneNumber, authNum, 600);
    
    return res.send(response(baseResponse.SUCCESS, {'authNumber': authNum}));
};

/*
    API No. 2
    API Name : 이메일 인증 API
    [POST] /app/auth/email
*/
exports.authSendEmail = function(req, res) {
    /*
        Body : snedEmail
    */
    const authNum = Math.floor((Math.random() * (999999 - 100000 + 1)) + 100000);

    const { sendEmail } = req.body;

    // Validation 처리
    if (!sendEmail) {
        return res.send(response(baseResponse.AUTH_EMAIL_EMPTY));
    } else if (sendEmail.length > 30) {
        return res.send(response(baseResponse.AUTH_EMAIL_LENGTH));
    } else if (!regexEmail.test(sendEmail)) {
        return res.send(response(baseResponse.AUTH_EMAIL_ERROR_TYPE));
    }

    // TODO 이메일을 가지고 있는 유저 있는지 확인
    
    const mailOptions = {
        from: "harry7231@naver.com",
        to: sendEmail,
        subject: "[당근마켓] 인증 관련 이메일 입니다.",
        text: `[인증번호] ${authNum}`
    };

    const result = smtpTransport.sendMail(mailOptions, (error, responses) => {
        if (error) {
            console.log(error);
            smtpTransport.close();
            return res.send(response(baseResponse.SERVER_ERROR));
        } else {
            smtpTransport.close();
            
            // 캐시 데이터 저장
            cache.set(sendEmail, authNum, 600);

            return res.send(response(baseResponse.SUCCESS, {"authNumber": authNum}));
        }
    });
}

/*
    API No. 3
    API Name : 동네 검색 API
    [GET] /app/auth/town?address=
*/
exports.authGetTown = function(req, res) {
    // QueryString : address
    const address = req.query.address;

    if (!address) {
        return res.send(response(baseResponse.AUTH_ADDRESS_EMPTY));
    } else if (!regAddress.test(address)) {
        return res.send(response(baseResponse.AUTH_ADDRESS_ERROR_TYPE));
    }

    const encodedAddress = queryString.escape(address);

    const kakaoOptions = {
        url: `https://dapi.kakao.com/v2/local/search/address.json?query=${encodedAddress}`,
        method: 'GET',
        headers: {
            'Authorization': 'KakaoAK e343cf5efb2c897511358685c027474c'
        },
        encoding: 'utf-8'
    };

    request(kakaoOptions, function (err, responses, body) {
        if (err) {
            return res.send(response(baseResponse.SERVER_ERROR));
        }
        var town = [];
        const kakaoPlaces = JSON.parse(body);
        for (document of kakaoPlaces.documents) {
            town.push(document.address_name);
        }
        
        if (town.length < 1) {
            return res.send(response(baseResponse.ADDRESS_NOT_EXIST));
        }

        return res.send(response(baseResponse.SUCCESS, {"town": town}));
    });
};

/*
    API No. 4
    API Name : 회원가입 API
    [POST] /app/users
*/
exports.postUsers = async function(req, res) {
    /*
        Body : nickName, phoneNumber, profileImgUrl, town, countryIdx
    */
    var {nickName, phoneNumber, profileImgUrl, town, countryIdx} = req.body;

    if (!nickName) {
        return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));
    } else if (!phoneNumber) {
        return res.send(response(baseResponse.SIGNUP_PHONENUMBER_EMPTY));
    } else if (!town) {
        return res.send(response(baseResponse.SIGNUP_TOWN_EMPTY));
    } else if (!countryIdx) {
        return res.send(response(baseResponse.SIGNUP_COUNTRYIDX_EMPTY));
    } 

    if (phoneNumber.length < 10) {
        return res.send(response(baseResponse.SIGNUP_PHONENUMBER_LENGTH));
    }

    if (!regPhoneNumber.test(phoneNumber)) {
        return res.send(response(baseResponse.SIGNUP_PHONENUMBER_ERROR_TYPE));
    } else if (!regAddress.test(town)) {
        return res.send(response(baseResponse.SIGNUP_ADDRESS_ERROR_TYPE));
    }

    if (!profileImgUrl) {
        profileImgUrl = 'https://lh3.googleusercontent.com/proxy/RiHjEIJM-FqkPogYJrlhw29zvwQ1sLO7nSatg90AikhUeqDCPEtTydF8h-wv_GUCihWh04ADonDG9YmJo1mVpr-mdzkZ-oqAHje3NN3ZANGSILg-JuK39v8JVEU8pcCwBtvHtC4y7UxKZxrRNY4HjeXXNN_GA699GgbgHnMwPg';
    }

    const encodedTown = queryString.escape(town);

    const kakaoOptions = {
        url: `https://dapi.kakao.com/v2/local/search/address.json?query=${encodedTown}`,
        method: 'GET',
        headers: {
            'Authorization': 'KakaoAK e343cf5efb2c897511358685c027474c'
        },
        encoding: 'utf-8'
    };

    request(kakaoOptions, async function (err, responses, body) {
        if (err) {
            console.log(err);
            return res.send(response(baseResponse.SERVER_ERROR));
        }
        var addresses = [];
        const kakaoPlaces = JSON.parse(body);
        for (document of kakaoPlaces.documents) {
            addresses.push(document.address_name);
        }
        
        if (addresses.length == 0) {
            return res.send(response(baseResponse.SIGNUP_ADDRESS_WRONG));
        } else {
            const town = kakaoPlaces.documents[0].address_name;
            const longitude = kakaoPlaces.documents[0].x;
            const latitude = kakaoPlaces.documents[0].y;
            const signUpResponse = await userService.createUser(nickName, phoneNumber, profileImgUrl, town, countryIdx, longitude, latitude);
            return res.send(signUpResponse);
        }
    });
};

/*
    API No. 5
    API Name : 로그인 API
    [POST] /app/login
    body : phoneNumber
*/
exports.login = async function(req, res) {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.send(response(baseResponse.SIGNIN_PHONENUMBER_EMPTY));
    } else if (phoneNumber.length < 10) {
        return res.send(response(baseResponse.SIGNIN_PHONENUMBER_LENGTH));
    } else if (!regPhoneNumber.test(phoneNumber)) {
        return res.send(response(baseResponse.SIGNIN_PHONENUMBER_ERROR_TYPE));
    }

    const signInResponse = await userService.postSignIn(phoneNumber);

    return res.send(signInResponse);
};

/*
    API No. 6
    API Name : 핸드폰 인증번호 인증 API
    [POST] /app/auth/phonenumber/certification
*/
exports.authPhoneCertify = function (req, res) {
    /*
        Body : phoneNumber, authNumber
    */
    const { phoneNumber, authNumber } = req.body;
    
    // 캐시 데이터 조회
    const value = cache.get(phoneNumber);

    if (!phoneNumber) {
        return res.send(response(baseResponse.AUTH_PHONENUMBER_EMPTY));
    } else if (!authNumber) {
        return res.send(response(baseResponse.AUTH_AUTHNUMBER_EMPTY));
    }

    if (phoneNumber.length < 10) {
        return res.send(response(baseResponse.AUTH_PHONENUMBER_LENGTH));
    } else if (authNumber < 1000 || authNumber > 10000) {
        return res.send(response(baseResponse.AUTH_PHONE_AUTHNUMBER_LENGTH));
    }

    if (!regPhoneNumber.test(phoneNumber))
        return res.send(response(baseResponse.AUTH_PHONENUMBER_ERROR_TYPE));

    if (!value) {
        res.send(response(baseResponse.AUTH_AUTHNUMBER_NOT_EXIST));
    } else {
        if (value != authNumber) {
            return res.send(response(baseResponse.AUTH_AUTHNUMBER_INCORRECT));
        } else {
            return res.send(response(baseResponse.SUCCESS));
        }
    }

};

/*
    API No. 7
    API Name : 자동 로그인 API
    [GET] /app/auto-login
*/
exports.check = async function (req, res) {
    // jwt - userIdx

    const userIdxFromJWT = req.verifiedToken.userIdx;

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdxFromJWT);

    if (!userIdxFromJWT) {
        return res.send(errResponse(baseResponse.SIGNIN_JWT_TOKEN_NOT_EXIST));
    } else if (token == checkJWT[0].jwt) {
        return res.send(response(baseResponse.SUCCESS, {"userIdx": userIdxFromJWT}));
    } else {
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));
    }
};

/*
    API No. 8
    API Name : 이메일 인증번호 인증 API
    [POST] /app/auth/email/certification
*/
exports.authEmailCertify = function (req, res) {
    /*
        Body : sendEmail, authNumber
    */
    const { sendEmail, authNumber } = req.body;
    
    // 캐시 데이터 조회
    const value = cache.get(sendEmail);

    if (!sendEmail) {
        return res.send(response(baseResponse.AUTH_EMAIL_EMPTY));
    } else if (!authNumber) {
        return res.send(response(baseResponse.AUTH_AUTHNUMBER_EMPTY));
    }

    if (sendEmail.length > 30) {
        return res.send(response(baseResponse.AUTH_EMAIL_LENGTH));
    } else if (authNumber < 100000 || authNumber > 1000000) {
        return res.send(response(baseResponse.AUTH_EMAIL_AUTHNUMBER_LENGTH));
    }

    if (!regexEmail.test(sendEmail))
        return res.send(response(baseResponse.AUTH_EMAIL_ERROR_TYPE));

    if (!value) {
        res.send(response(baseResponse.AUTH_AUTHNUMBER_NOT_EXIST));
    } else {
        if (value != authNumber) {
            return res.send(response(baseResponse.AUTH_AUTHNUMBER_INCORRECT));
        } else {
            return res.send(response(baseResponse.SUCCESS));
        }
    }
};

/*
    API No. 18
    API Name : 마이페이지 조회 API
    [GET] /app/users/{userIdx}
*/
exports.getUserByIdx = async function(req, res) {
    // Path Variable : userIdx
    const userIdx = req.params.userIdx;

    if (!userIdx) {
        return res.send(response(baseResponse.USER_USERIDX_EMPTY));
    }

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 
    const userIdxResult = await userProvider.retrieveUserByIdx(userIdx);

    return res.send(response(baseResponse.SUCCESS, userIdxResult[0]));
};

/*
    API No. 19
    API Name : 유저 프로필 조회 API
    [GET] /app/users/{userIdx}/profile
*/
exports.getUserProfile = async function(req, res) {
    // Path Variable : userIdx
    const userIdx = req.params.userIdx;
    
    if (!userIdx) {
        return res.send(response(baseResponse.USER_USERIDX_EMPTY));
    } 
    const userProfileResult = await userProvider.retrieveUserProfile(userIdx);

    return res.send(userProfileResult);
};

/*
    API No. 20
    API Name : 프로필 수정 API
    [PATCH] /app/users/{userIdx}/profile
*/
exports.patchUserProfile = async function(req, res) {
    // Path Variable : userIdx
    const userIdx = req.params.userIdx;

    /*
        Body : profileImgUrl, nickName
    */
    const { profileImgUrl, nickName } = req.body;

    if (!userIdx) {
        return res.send(response(baseResponse.USER_USERIDX_EMPTY));
    }

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    if (!profileImgUrl) {
        return res.send(response(baseResponse.PROFILE_PROFILEIMG_EMPTY));
    } else if (!nickName) {
        return res.send(response(baseResponse.PROFILE_NICKNAME_EMPTY));
    }

    const editProfileResult = await userService.editProfile(userIdx, profileImgUrl, nickName);
    return res.send(editProfileResult);
};

/*
    API No. 21
    API Name : 판매 내역 조회 API (판매 상태에 따라)
    [GET] /app/users/{userIdx}/sales?status=
*/
exports.getUserSales = async function(req, res) {
    // Path Variable : userIdx
    const userIdx = req.params.userIdx;
    // Query String
    const status = req.query.status;


    if (!userIdx) {
        return res.send(response(baseResponse.USER_USERIDX_EMPTY));
    } else if (status != 'SALE' && status != 'SOLD' && status != 'HIDE' && status) {
        return res.send(response(baseResponse.ARTICLE_STATUS_ERROR_TYPE));
    }

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);

    if (status == 'HIDE' && (checkJWT.length < 1 || token != checkJWT[0].jwt)) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    }

    if (!status) {
        // 판매 내역 전체 조회
        const salesByUserIdx = await articleProvider.retrieveSalesByUserIdx(userIdx);
        return res.send(salesByUserIdx);
    } else if (status == 'SALE' || status == 'SOLD') {
        // 판매중 or 판매완료 내역 조회
        const userSalesResult = await articleProvider.retrieveSales(userIdx, status);
        return res.send(userSalesResult);
    } else {
        // 숨김 게시글 조회
        const userSalesResult = await articleProvider.retrieveHideArticles(userIdx);
        return res.send(userSalesResult);
    }
};

/*
    API No. 23
    API Name : 관심 등록 API
    [POST] /app/users/likes
*/
exports.postLikes = async function(req, res) {
    /*
        Body : articleIdx, userIdx
    */
    const { articleIdx, userIdx } = req.body;


    if (!articleIdx) {
        return res.send(response(baseResponse.ARTICLE_ARTICLEIDX_EMPTY));
    } else if (!userIdx) {
        return res.send(response(baseResponse.USER_USERIDX_EMPTY));
    }

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    const likeByUserIdx = await userProvider.retrieveLikes(articleIdx, userIdx);

    if (likeByUserIdx.length > 0) {
        // 좋아요가 이미 존재
        if (likeByUserIdx[0].status == "DELETED") {
            // 삭제된 좋아요 다시 누르기
            const activateLikes = await userService.updateLikeStatus(articleIdx, userIdx, likeByUserIdx[0].status);
            return res.send(activateLikes);
        } else {
            // 좋아요 취소
            const deleteLikes = await userService.updateLikeStatus(articleIdx, userIdx, likeByUserIdx[0].status);
            return res.send(deleteLikes);
        }
    } else {
        // 새로 좋아요 생성
        const insertLikeResponse = await userService.insertLike(articleIdx, userIdx);
        return res.send(insertLikeResponse);
    }
}

/*
    API No. 24
    API Name : 관심 목록 조회 API 
    [GET] /app/users/{userIdx}/likes
*/
exports.getUserLikes = async function(req, res) {
    // Path Variable : userIdx
    const userIdx = req.params.userIdx;


    if (!userIdx) {
        return res.send(response(baseResponse.USER_USERIDX_EMPTY));
    } 
    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    const likesListResult = await userProvider.retrieveLikesByUserIdx(userIdx);

    return res.send(likesListResult);
};

/*
    API No. 25
    API Name : 동네 인증 API
    [POST] /app/auth/users/{userIdx}/town
*/
exports.patchTownAuth = async function(req, res) {
    // Path Variable : userIdx
    const userIdx = req.params.userIdx;

    /*
        Body : currentLatitude, currentLongitude
    */
    const {currentLatitude, currentLongitude} = req.body;

    if (!userIdx) {
        return res.send(response(baseResponse.ARTICLE_USERIDX_EMPTY));
    } 
    
    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    } 

    if (!currentLatitude) {
        return res.send(response(baseResponse.AUTH_LATITUDE_EMPTY));
    } else if (!currentLongitude) {
        return res.send(response(baseResponse.AUTH_LONGITUDE_EMPTY));
    }

    // 유저에 저장된 동네 위경도 값
    const userLatitude = await userProvider.retrieveLatitude(userIdx);
    const userLongitude = await userProvider.retrieveLongitude(userIdx);

    const patchTownAuthResponse = await userService.patchTownAuth(userIdx, currentLatitude, currentLongitude, userLatitude.latitude, userLongitude.longitude);

    return res.send(patchTownAuthResponse);
};

/*
    API No. 27
    API Name : 로그아웃 API
    [GET] /app/logout
*/
exports.logOut = async function(req, res) {
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const token = req.headers['x-access-token'];    
    const checkJWT = await userProvider.checkJWT(userIdxFromJWT);
    if (checkJWT.length < 1) {
        return res.send(response(baseResponse.NOT_LOGIN));
    } else if (token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));
    } 

    const logOutResponse = await userService.deleteJWT(userIdxFromJWT);
    
    return res.send(logOutResponse);
}

/*
    API No. 28
    API Name : 탈퇴하기 API
    [PATCH] /app/users/{userIdx}/withdraw
*/
exports.withDrawUser = async function(req, res) {
    // Path Varialble : userIdx
    const userIdx = req.params.userIdx;

    if (!userIdx) {
        return res.send(response(baseResponse.ARTICLE_USERIDX_EMPTY));
    } 

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    }

    const withDrawUserResponse = await userService.withDrawUser(userIdx);

    return res.send(withDrawUserResponse);
};

/*
    API No. 29
    API Name : 특정 유저 계정/정보 수정
    [PATCH] /app/users/:userIdx/accounts
*/
exports.patchAccount = async function(req, res) {
    // Path Variable : userIdx
    const userIdx = req.params.userIdx;

    if (!userIdx) {
        return res.send(response(baseResponse.ARTICLE_USERIDX_EMPTY));
    } 

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    }

    /*
        Body : phoneNumber, email
    */
    const { phoneNumber, email } = req.body;

    if (!phoneNumber && !email) {
        return res.send(response(baseResponse.MODIFY_ACCOUNT_WRONG));
    }
    if (phoneNumber && !regPhoneNumber.test(phoneNumber)) {
        return res.send(response(baseResponse.AUTH_PHONENUMBER_ERROR_TYPE));
    } else if (email && !regexEmail.test(email)) {
        return res.send(response(baseResponse.AUTH_EMAIL_ERROR_TYPE));
    } else if (phoneNumber && email) {
        return res.send(baseResponse.CANT_MODIFY_BOTH);
    }

    if (email  && email.length > 30) {
        return res.send(response(baseResponse.AUTH_EMAIL_LENGTH));
    }

    const patchAccountResponse = await userService.updateUserAccount(userIdx, phoneNumber, email);

    return res.send(patchAccountResponse);
};

/*
    API No. 30
    API Name : 관심 등록 API
    [POST] /app/users/{userIdx}/following
*/
exports.postFollow = async function(req, res) {
    // Path Variable : userIdx
    const userIdx = req.params.userIdx;

    if (!userIdx) {
        return res.send(response(baseResponse.ARTICLE_USERIDX_EMPTY));
    } 

    /*
        Body : followUserIdx
    */
    const { followUserIdx } = req.body;

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    }

    if (!followUserIdx) {
        return res.send(response(baseResponse.USER_FOLLOWUSER_EMPTY));
    }

    const followUserResult = await userProvider.retrieveFollow(userIdx, followUserIdx);

    if (followUserResult.length > 0) {
        // 이미 팔로일한 유저
        if (followUserResult[0].status == "DELETED") {
            // 다시 팔로우
            const activateFollow = await userService.updateFollow(userIdx, followUserIdx, 'ACTIVE');
            return res.send(activateFollow);
        } else {
            // 팔로우 취소
            const deleteFollow = await userService.updateFollow(userIdx, followUserIdx, 'DELETED');
            return res.send(deleteFollow);
        }
    } else {
        // 새로 생성
        const followResponse = await userService.followUser(userIdx, followUserIdx);
        return res.send(followResponse);
    }
};

/*
    API No. 31
    API Name : 필로잉 유저 조회 API
    [GET] /app/users/{userIdx}/following
*/
exports.getFollow = async function(req, res) {
    // Path Variable : userIdx;
    const userIdx = req.params.userIdx;

    if (!userIdx) {
        return res.send(response(baseResponse.ARTICLE_USERIDX_EMPTY));
    } 

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    }

    const followResult = await userProvider.retrieveFollowUsers(userIdx);
    
    return res.send(response(baseResponse.SUCCESS, followResult));
};

/*
    API No. 32
    API Name : 필로잉 유저의 판매글 조회 API
    [GET] /app/users/{userIdx}/following/articles
*/
exports.getFollowUserArticles = async function(req, res) {
    // Path Variable : userIdx;
    const userIdx = req.params.userIdx;

    if (!userIdx) {
        return res.send(response(baseResponse.ARTICLE_USERIDX_EMPTY));
    } 

    const token = req.headers['x-access-token'];
    const checkJWT = await userProvider.checkJWT(userIdx);
    if (checkJWT.length < 1 || token != checkJWT[0].jwt) {
        return res.send(response(baseResponse.USER_IDX_NOT_MATCH));
    }

    const followUserArticlesResult = await articleProvider.retrieveFollowUsersArticles(userIdx);

    return res.send(response(baseResponse.SUCCESS, followUserArticlesResult));
};