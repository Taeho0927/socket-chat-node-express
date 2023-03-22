const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const ColorHash =  require('color-hash').default;


dotenv.config(); //.env 파일에 접근하려면 반드시 필요함
const webSocket = require('./socket');
const indexRouter = require('./routes');
const connect = require('./schemas');

const app = express();
app.set('port', process.env.PORT || 8005);
app.set('view engine', 'html');
nunjucks.configure('views',{
    express: app,
    watch: true,
});
connect();


const sessionMiddleware = session({
    // 모든 request마다 기존에 있던 session에 아무런 변경사항이 없을 시 그 session을 다시 저장하는 옵션
    resave: false,
    /*
    request가 들어오면 해당 request에서 새로 생성된 session에 아무런 작업이 이루어지지 않은 상황
    true = 클라이언트 서버 방문 횟수에 따라 등급을 달리 하고 싶을 경우
    false = empty session obj의 쌓임 방지, 쿠키 사용 정책을 준수하기 위해
    */
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie : {
        httpOnly: true,
        secure: false,
    },
});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'public'))); // 스태틱 파일 경로를 설정함
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);

app.use((req, res, next)=>{
    if(!req.session.color){
        const colorHash = new ColorHash();
        req.session.color = colorHash.hex(req.sessionID);
        console.log(req.session.color, req.sessionID);
    }
    next();
});

app.use('/',indexRouter);

app.use((req, res, next)=>{
    const error = new Error(`${req.method}${req.url}라우터는 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next)=>{
    res.locals.message = err.messagel
    res.locals.error = process.env.NODE_ENV !== 'production' ? err :{};
    res.status(err.status || 500);
    res.render('error');
});

const server = app.listen(app.get('port'),()=>{
    console.log(app.get('port'),'번 포트에서 대기중');
});

webSocket(server, app, sessionMiddleware);