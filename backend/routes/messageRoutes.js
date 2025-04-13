const express = require('express')
const router = express.Router()
const Message = require('../models/messageModel')
const Chat = require('../models/chatModel')

router.post('/send', async(req, res) => {
    try{
        const {chatId, senderId, content} = req.body
        if (!chatId || !senderId || !content) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const newMessage = new Message({
            chatId,
            senderId,
            content
        })
        await newMessage.save()
        res.status(201).json(newMessage)
    }
    catch(err){
        console.error("Error sending message:", err);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/:chatId', async(req, res) => {
    try{
        const {chatId} = req.params

        const messages = await Message.find({chatId}).sort({createdAt:1}).populate('senderId', 'username')
        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            content: msg.content,
            senderId: msg.senderId._id,
            senderUsername: msg.senderId.username,
            createdAt: msg.createdAt
        }))
        res.json(formattedMessages)
    }
    catch(err){
        console.error("Error fetching messages:", err);
        res.status(500).json({ message: "Internal server error" });
    }
})

module.exports = router
module.exports = router