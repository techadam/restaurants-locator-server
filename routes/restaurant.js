const router = require('express').Router();
const haversine = require('haversine')
const Restaurant = require('../models/Restaurant');

const authenticateToken = require('../middleware/authenticateToken');


router.get('', async(req, res) => {
    try {
        const restaurants = await Restaurant.find({}).sort({'updatedAt': -1}); //Fetch all restaurants data
        res.json({data: restaurants});
    }catch(err) {
        return res.status(500).json({error: err});
    }
})

router.post('/create', async(req, res) => {
    const {name, lat, log, address} = req.body; //Get request params

    if(!name || !lat || !log || !address) {
        //Verify that params are not empty
        return res.status(400).json({error: "All restaurant fields are required"});
    }
    
    const restaurant = new Restaurant({
        name,
        lat,
        log,
        address
    })

    try {
        //Save restaurant to DB
       const newRes = await restaurant.save();
       res.json({data: newRes});
    }catch(err) {
        return res.json({error: err});
    }

})

router.post('/get-dist', async(req, res) => {
    const {cord1, cord2} = req.body; //Get request params

    var haversine_m = haversine(cord1, cord2); //Results in meters (default)
    var haversine_km = haversine_m /1000; //Results in kilometers

    console.log("distance (in meters): " + haversine_m + "m");
    console.log("distance (in kilometers): " + haversine_km + "km");
})

module.exports = router;