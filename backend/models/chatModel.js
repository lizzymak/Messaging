const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    members: [{type:mongoose.Schema.Types.ObjectId, ref: 'User'}],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
})

module.exports = mongoose.model('Chat', chatSchema)