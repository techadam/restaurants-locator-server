const router = require('express').Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");


const { generateToken, sendToken } = require('../utils/token.utils');
const blacklistToken = require('../middleware/blacklistToken');

router.post('/login', async (req, res, next) => {

    //check if the user does not exist
    const userexists = await User.findOne({email: req.body.email });
    if (!userexists)
        return res.status(401).json({message: "Username or password is wrong"});

    //validate password
    const validPass = await bcrypt.compare(req.body.password, userexists.password);
    if (!validPass)
        return res.status(403).json({message: "Username or password is wrong"});

    req.user = userexists
    req.auth = {
        id: req.user._id
    }

    next();

}, generateToken, sendToken);


router.delete('/logout', blacklistToken, async (req, res) => {
    return res.json({message:"User logged out."});
});


router.post('/register', async (req, res) => {
    
    //Get request data If validation is passed
    const {firstName, lastName, email, password} = req.body

    //Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(password, salt)

    //Create new user
    const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPass
    })
    
    //Save user details into DB
    try {
        const emailExists = await User.findOne({email: email});

        if(emailExists) {
            return res.status(400).json({message: "An account already exist with that email"})
        }
        
        const savedUser = await user.save()
        
        //Get & Send saved user data
        res.status(201).json({id: savedUser._id})
    }catch(error) {
        res.json({error: error})
    }

});


module.exports = router;