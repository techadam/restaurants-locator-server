const router = require('express').Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");


const { createUser } = require('../utils/db.utils');
const { generateToken, sendToken } = require('../utils/token.utils');
const blacklistToken = require('../middleware/blacklistToken');
const authenticateToken = require('../middleware/authenticateToken');


//Login user
router.post('/login', async (req, res, next) => {
    let userexists = null;

    //Verify that the user is logged in via a social handle
    const socialType = req.body.signin || null;

    if(socialType !== null) {
        //check if the user does not exist
        userexists = await createUser(req.body);
    }else{
        //check if the user does not exist
        userexists = await User.findOne({email: req.body.email });
        
        if (!userexists)
            return res.status(401).json({message: "Username or password is wrong"});

        //validate password
        const validPass = await bcrypt.compare(req.body.password, userexists.password);
        if (!validPass)
            return res.status(403).json({message: "Username or password is wrong"});
    }

    req.user = userexists
    req.auth = {
        id: req.user._id
    }

    next();

}, generateToken, sendToken);


//Logout user
router.delete('/logout', blacklistToken, async (req, res) => {
    return res.json({message:"User logged out."});
});


//Create user account
router.post('/register', async (req, res) => {
    
    //Get request data If validation is passed
    const {firstName, lastName, email, password} = req.body;

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    //Create new user
    const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPass
    });
    
    //Save user details into DB
    try {
        const emailExists = await User.findOne({email: email});

        if(emailExists) {
            return res.status(400).json({message: "An account already exist with that email"});
        }
        
        const savedUser = await user.save()
        
        //Get & Send saved user data
        res.status(201).json({id: savedUser._id});
    }catch(error) {
        res.status(500).json({error: error});
    }

});


//Get logged in user information
router.get('/user', authenticateToken, async(req, res) => {
    try {
        const userExists = await User.findOne({_id: req.user.id });

        if(!userExists) {
            return res.status(401).json({message: "Invalid user account"});
        }

        const { firstName, lastName, photo, email, socialType } = userExists
        
        //Get & Send saved user data
        res.status(201).json({data: { firstName, lastName, photo, email, socialType }});
    }catch(error) {
        res.status(500).json({error: error});
    }
});


module.exports = router;