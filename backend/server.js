const express = require('express')
const http = require('http')
const {Server} = require('socket.io')
const mongoose = require('mongoose')
require('dotenv').config()

//creating express app and http server
//attack socket.io instance to server
const app = express()
const server = http.createServer(app)


const allowedOrigins = [
    'http://localhost:3000',
    'https://https://messagingapp-frontend-lizzymak-lizzymaks-projects.vercel.app/',
    'https://messagingapp-oglg.onrender.com'
]

const io = new Server(server,{
    cors:{
        origin: allowedOrigins,
        methods: ["GET", "POST", "PATCH"],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
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
    origin: allowedOrigins,  // Allow React app's port
    methods: ['GET', 'POST', "PATCH"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  // Allow sending cookies and authorization headers
};
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))


//middleware setup for json and cors handling
app.use(express.json())



//start server on port
//connect to mongodb
const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        //listen for requests
        //process.env.PORT is used to get port 4000 from .env file
    server.listen(PORT, ()=>{
    console.log('connected to db and listening on port', PORT);
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
