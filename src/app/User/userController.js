const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const request = require('request');

const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const crypto = require('crypto');

const { smtpTransport } = require('../../../config/email');

const queryString = require('querystring');

var regPhoneNumber = /^\d{3}\d{3,4}\d{4}$/;

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

    return res.send(response(baseResponse.SUCCESS, {'인증번호': authNum}));
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
            return res.send(response(baseResponse.SERVER_ERROR));
        } else {
            return res.send(response(baseResponse.SUCCESS, {"인증번호": authNum}));
        }
        smtpTransport.close();
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
        return res.send(response(baseResponse.SUCCESS, {"지역": town}));
    });
};

/*
    API No. 4
    API Name : 회원가입 API
    [POST] /app/users
*/
// exports.postUsers = function(req, res) {

// }
