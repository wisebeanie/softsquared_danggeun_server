const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
    service: "Naver",
    auth: {
        user: "harry7231@naver.com",
        pass: "hyunbin7231"
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports={
    smtpTransport
}

// .gitignore에 등록