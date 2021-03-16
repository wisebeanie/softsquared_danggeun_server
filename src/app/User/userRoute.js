module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 1. 인증번호 전송 API
    app.post('/app/auth/phonenumber', user.authSendPhoneNumber);

    // 2. 이메일 인증 API
    app.post('/app/auth/email', user.authSendEmail);

    // 3. 동네 검색 API
    app.get('/app/auth/town', user.authGetTown);

    // 4. 회원가입 API
    app.post('/app/users', user.postUsers);

    // 5. 로그인 API
    app.post('/app/login', user.login);

    // 6. 인증번호 인증 API
    app.post('/app/auth/certification', user.authCertify);

    // 7. 자동 로그인 API
    app.get('/app/auto-login', jwtMiddleware, user.check);

    // jwt를 사용하기 위해 jwtMiddleware 를 체이닝 방식으로 추가하는 예제
    // app.get('/app/users/:userId', jwtMiddleware, user.getUserById);

};
