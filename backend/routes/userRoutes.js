const express = require('express')
const router = express.Router()
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

router.post('/userSearch', async(req, res) => {
    const {username, currentUserId} = req.body
    try{
        console.log("Searching for user:", username)
        const otherUser = await User.findOne({username})
        if(!otherUser){
            return res.status(404).json({message: 'user not found'})
        }
        let chat = await Chat.findOne({
            members: {$all: [currentUserId, otherUser._id]}
        })
        if(!chat){
            chat = new Chat({members: [currentUserId, otherUser._id]})
            await chat.save()
            console.log('new chat created')
        }
        res.json({chatId: chat._id})
    }
    catch(err){

    }
})

router.get('/:currentUserId', async (req, res) => {
    try{
        const {currentUserId} = req.params
        console.log("currentUserId:", currentUserId);
        const chats = await Chat.find({members: currentUserId}).populate('members', 'username')
        const formattedChats = chats.map(chat=>{
            const otherUser = chat.members.find(user => user._id.toString() !== currentUserId)
            return{
                chatId: chat._id,
                username: otherUser ? otherUser.username : 'unknown'
            }
        })
        res.json(formattedChats)
    }
    catch(err){
        console.log(err)
    }
})

module.exports = router