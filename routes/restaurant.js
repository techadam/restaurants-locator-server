const router = require('express').Router();
const Restaurant = require('../models/Restaurant');


router.get('/', async(req, res) => {
    try {
        const restaurants = await Restaurant.find({}); //Fetch all restaurants data
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

module.exports = router;