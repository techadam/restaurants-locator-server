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
const { saveRestaurant, getRestaurants } = require('./utils/db.utils');


//Routes
app.use('/auth', require('./routes/auth'));
app.use('/restaurant', require('./routes/restaurant'));

io.on("connection", (socket) => {
    setInterval(() => {
        socket.broadcast.emit("newdata", "Yayaya")
    }, 5000)

    socket.on('create-restaurant', async(data, callback) => {
        const isSaved = await saveRestaurant(data)
        const saveStatus = (isSaved) ? true : false
        
        if(isSaved) {
            io.sockets.emit('updatedRestaurants', isSaved)
        }
        
        callback({
            status: saveStatus
        })
    })
});

httpServer.listen(process.env.PORT || 5000, () => {
    console.log('Server is running on port 5000');
});