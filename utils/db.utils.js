const Restaurant = require('../models/Restaurant');

module.exports = {
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