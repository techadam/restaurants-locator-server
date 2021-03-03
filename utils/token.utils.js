const jwt = require('jsonwebtoken');
const customId = require("custom-id");
const UserLogin = require('../models/UserLogin'); //User Login model

const createToken = async(req) => {

    const token_id = await customId({
        user_id : req.auth.id,
        date : Date.now(),
        randomLength: 4 
    });

    let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        req.connection.socket.remoteAddress

    const user_logins = await UserLogin.find({ user_id: req.auth.id ,token_deleted: false, ip_address: ip, device: req.headers["user-agent"]});

    user_logins.forEach(async(login) => {
        if(login){
            login.token_deleted = true;
            await login.save()
        }      
    });
    
    const token_secret = await customId({
        token_secret : ip,
        date : Date.now(),
        randomLength: 8 
    });

    const token = await UserLogin.create({
        user_id : req.auth.id,
        token_id : token_id,
        token_secret : token_secret,
        ip_address : ip ,
        device : req.headers["user-agent"]
    });

    const token_user = { id: req.auth.id , token_id: token_id  };
    const accessToken = await jwt.sign(token_user, process.env.ACCESS_TOKEN_SECRET);
    return accessToken;
};

module.exports = {
    generateToken: async(req, res, next) => {
        req.token = await createToken(req);
        return next();
    },

    sendToken: (req, res) => {
        const responseObject = {  auth: true,
        token: req.token,
        message: 'user found & logged in'}
        return res.status(200).json(responseObject);
    }
};