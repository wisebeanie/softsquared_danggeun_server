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

    // 6. 핸드폰 인증번호 인증 API
    app.post('/app/auth/phonenumber/certification', user.authPhoneCertify);

    // 7. 자동 로그인 API
    app.get('/app/auto-login', jwtMiddleware, user.check);

    // 8. 이메일 인증번호 인증 API
    app.post('/app/auth/email/certification', user.authEmailCertify);

    // 18. 마이페이지 조회 API
    app.get('/app/users/:userIdx', jwtMiddleware, user.getUserByIdx);

    // TODO 리뷰와 매너 리뷰평가 추가하기
    // 19. 특정 유저 프로필 조회 API
    app.get('/app/users/:userIdx/profile', user.getUserProfile);

    // 20. 프로필 수정 API
    app.patch('/app/users/:userIdx/profile', jwtMiddleware, user.patchUserProfile);

    // 21. 판매 내역 조회 API (판매 상태에 따라 조회)
    app.get('/app/users/:userIdx/sales', jwtMiddleware, user.getUserSales);

    // 23. 관심등록 API
    app.post('/app/users/likes', jwtMiddleware, user.postLikes);

    // 24. 관심 목록 조회 API (글 종류에 따라)
    app.get('/app/users/:userIdx/likes', jwtMiddleware, user.getUserLikes);

    // 25. 동네 인증 API
    app.patch('/app/auth/users/:userIdx/town', jwtMiddleware, user.patchTownAuth);

    // 27. 로그아웃 API
    app.get('/app/logout', jwtMiddleware, user.logOut);

    // 28. 탈퇴하기 API
    app.patch('/app/users/:userIdx/withdraw', jwtMiddleware, user.withDrawUser);

    // 29. 특정 유저 계정/정보 수정
    app.patch('/app/users/:userIdx/accounts', jwtMiddleware, user.patchAccount);

    // 30. 유저 팔로잉 API
    app.post('/app/users/:userIdx/following', jwtMiddleware, user.postFollow);

    // 31. 팔로잉 유저 조회 API
    app.get('/app/users/:userIdx/following', jwtMiddleware, user.getFollow);
    
    // 32. 필로잉 유저의 판매글 모아보기
    app.get('/app/users/:userIdx/following/articles', jwtMiddleware, user.getFollowUserArticles);
};
