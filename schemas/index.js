const mongoose = require('mongoose');

const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;
const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@127.0.0.1:27017/admin`;

const connect = () =>{
    if(NODE_ENV !== 'production'){
        mongoose.set('debug', true);
    }
    try{
        mongoose.connect(MONGO_URL,{
            dbName: 'nodejs',
            useNewUrlParser: true,
        })
        console.log('MongoDB Connection Made');
    }catch(error){
        console.log('MongoDB Connection Failed',error);
    }
};

mongoose.connection.on('error',(error)=>{
    console.error('몽고디비 연결 에러', error);
});
mongoose.connection.on('disconnected', ()=>{
    consosle.error('몽고디비 연결 끊김, 재시도 중');
    connect();
});

module.exports = connect;