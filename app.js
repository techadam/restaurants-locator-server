const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors')

const httpServer = require("http").createServer(app);
const options = {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
};
const io = require("socket.io")(httpServer, options);

dotenv.config();

//connect to DB
mongoose.connect(`${process.env.MONGO_URI}`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, () => {
	console.log('connected to DB')
});

app.use(express.json());
app.use(cors());


//Helper functions
const { saveRestaurant, getRestaurant } = require('./utils/db.utils');


//Routes
app.use('/auth', require('./routes/auth'));
app.use('/restaurant', require('./routes/restaurant'));

//Socket IO
io.on("connection", (socket) => {
    socket.on('create-restaurant', async(data, callback) => {
        const isSaved = await saveRestaurant(data);
        const saveStatus = (isSaved) ? true : false;
        
        callback({
            status: saveStatus
        });
    })
});

httpServer.listen(process.env.PORT || 5000, () => {
    console.log('Server is running on port 5000');
});


//Mongoose watch stream
const connection = mongoose.connection;

connection.once("open", () => {
    console.log("Setting change stream");

    const restaurantsChangeStream = connection.collection("restaurants").watch({fullDocument: "updateLookup"});

    restaurantsChangeStream.on("change", (change) => {
        switch(change.operationType) {
            case "insert": 
                io.emit('updatedRestaurants', change.fullDocument);

            case "update":
                io.emit('editedRestaurant', change.fullDocument);
        };
    });
});