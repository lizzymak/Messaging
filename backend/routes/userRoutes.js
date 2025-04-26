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

router.patch('/:currentUserId', async (req, res) => {
    const {currentUserId} = req.params
    const {profilePic, username, notificationSetting} = req.body
    try{
        const updatedFields = {}
        if(profilePic) updatedFields.profilePic = profilePic
        if(username) updatedFields.username = username
        if(notificationSetting) updatedFields.notificationSetting = notificationSetting

        const updatedUser = await User.findByIdAndUpdate(currentUserId, updatedFields, {new: true})
        res.status(200).json(updatedUser)

    }
    catch(err){
        res.status(500).json({ message: 'Failed to update profile' })
    }
})

router.get('/userInfo/:currentUserId', async (req, res) => {
    try{
        const {currentUserId} = req.params
        const user = await User.findOne({_id: currentUserId})
        const userInfo = {
            _id: user._id,
            username: user.username,
            profilePic: user.profilePic,
            notificationSetting: user.notificationSetting
        }
        res.json(userInfo)
    }
    catch(err){
        console.log(err, "error getting info")
    }
})



module.exports = router