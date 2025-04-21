const express = require('express')
const http = require('http')
const {Server} = require('socket.io')
const mongoose = require('mongoose')
require('dotenv').config()

//creating express app and http server
//attack socket.io instance to server
const app = express()
const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket)=>{
    console.log("user connected", socket.id)

    socket.on('join', (chatId) => {
        socket.join(chatId)
        console.log(`Socket ${socket.id} joined room ${chatId}`)
    })

    socket.on('sendMessage', ({chatId, message}) => {
        socket.to(chatId).emit('receiveMessage', message)
    })


    socket.on("disconnect", () =>{
        console.log("user disconnected")
    })
})

const cors = require('cors')
const corsOptions = {
    origin: 'http://localhost:3000',  // Allow React app's port
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  // Allow sending cookies and authorization headers
};
app.use(cors(corsOptions));


//middleware setup for json and cors handling
app.use(express.json())

//socket.io event handler

//start server on port
//connect to mongodb
mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        //listen for requests
        //process.env.PORT is used to get port 4000 from .env file
    server.listen(process.env.PORT, ()=>{
    console.log('connected to db and listening on port', process.env.PORT);
})
    })
    .catch((error)=>{
        console.log(error)
    })


//mounting routes
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const messageRoutes = require('./routes/messageRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/messages', messageRoutes)
