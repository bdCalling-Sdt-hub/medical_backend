const cookieParser = require("cookie-parser");
const cors = require('cors');
const express = require("express");
const path = require('path');
const { LOCAL_CLIENT,CLIENT } = require("../config/defaults");
const applyMiddleware = (app)=>{
    
// middleware
app.use(cors({
    origin: [
        LOCAL_CLIENT,
        CLIENT,'*','http://103.161.9.133:3001'
    ],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
app.use(express.json());
app.use(cookieParser());
}

module.exports = applyMiddleware