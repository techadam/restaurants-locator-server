const bcrypt = require("bcryptjs");
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');


module.exports = {
    createUser: async(data) => {
        const {firstName, lastName, email, signin, photo} = data

        //Hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash("12345678", salt)

        //Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            photo,
            socialType: signin,
            password: hashedPass
        })
        
        //Save user details into DB
        try {
            const userExists = await User.findOne({email: email});

            if(userExists) {
                //Verify previous social login is same
                if(userExists.socialType !== signin) {
                    console.log("update")
                    userExists.firstName = firstName;
                    userExists.lastName = lastName;
                    userExists.socialType = signin;
                    userExists.photo = photo;
                    userExists.save();
                }

                return userExists;
            }
            
            const savedUser = await user.save();
            //Get & Send saved user data
            return savedUser;
        }catch(error) {
            console.log(error);
            return false;
        }
    },
    saveRestaurant: async(data) => {
        const restaurant = new Restaurant(data)
        
        try {
            //Save restaurant to DB
           const newRes = await restaurant.save();
           return newRes;
        }catch(error) {
            return false;
        }
    },
    getRestaurant: async(id) => {
        try {
            //Save restaurant to DB
           const rest = await Restaurant.findById(id);
           return rest;
        }catch(error) {
            return false;
        }
    }
}