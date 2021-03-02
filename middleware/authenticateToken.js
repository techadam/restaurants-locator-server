const jwt = require('jsonwebtoken');

const BlacklistToken = require('../models/BlacklistToken');
const UserLogin = require('../models/UserLogin');

const Blacklist = BlacklistToken

//MIDDLEWARE TO AUTHENTICTAE TOKEN BEFORE ACCESSING PROTECTED ROUTES
const authenticateToken = async(req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    const bearer = authHeader && authHeader.split(' ')[0];
    if (bearer != "Bearer")
        return res.sendStatus(401);
    
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null)
        return res.sendStatus(401);

    Blacklist.findOne({token: token })
        .then((found) => {
        
        if (found){
            details = {
                "Status":"Failure",
                "Details":'Token blacklisted. Cannot use this token.'
            }

            return res.status(401).json(details);
        }else{
          jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
            if (err)
                return res.sendStatus(403);
            
            if(payload) {
                const login = await UserLogin.findOne({user_id : payload.id, token_id: payload.token_id})
            
                if(login.token_deleted == true){
                    const blacklist_token = Blacklist.create({
                        token:token
                    });
                    return res.sendStatus(401)
                }
            }
            
            req.user = payload;
            
            next();
          });
        }
    });

}

module.exports = authenticateToken