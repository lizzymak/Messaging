import { useState, useEffect } from 'react';
import socket from '../socket';
import axios from 'axios';

const ChatWindow = ({activeChatId, activeChatUsername}) => {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const currentUserId = localStorage.getItem('userId')

    useEffect(() => {
        //fetch messages when active ChatId changes
        const fetchMessages = async () => {
            try{
                const response = await axios.get(`http://localhost:5000/api/messages/${activeChatId}`)
                setMessages(response.data)
            }
            catch(err){
                console.log('error fetching messages')
            }
        }
        if(activeChatId){
            fetchMessages()
            socket.emit('join', activeChatId)
        }
        socket.on('receiveMessage', (message) =>{
            setMessages((prevMessages) => [...prevMessages, message])
            console.log("it did something")
        })
        return () =>{
            socket.off('receiveMessage')
        }
    }, [activeChatId])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (newMessage.trim() === '') return //prevents empty messages

        try{
            const response = await axios.post('http://localhost:5000/api/messages/send', {
                chatId: activeChatId,
                senderId: currentUserId,
                content: newMessage
            })

            setMessages((prevMessages) => [...prevMessages, response.data])
            socket.emit('sendMessage', {
                chatId: activeChatId,
                message: response.data
            })
            setNewMessage('')
        }
        catch(err){
            console.log(err)
        }
    }

    return(
        <div className="chat-window">
            {activeChatId ? (
                <>
                    <h2>{activeChatUsername || "Select a chat"}</h2>
                    <div className="messages-container">
    {messages.length > 0 ? (
        messages.map((msg) => (
            <div key={msg._id} className="message-wrapper">
                <span className={`message-username ${msg.senderId ===currentUserId ? 'sent-wrapper': 'received-wrapper' }`}>
                    {msg.senderId === currentUserId ? 'You' : msg.senderUsername}
                </span>
                <div className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}>
                    <p className='message-text'>{msg.content}</p>
                </div>
            </div>
        ))
    ) : (
        <p>No messages yet...</p>
    )}
</div>
                    <form onSubmit={handleSendMessage} className="send-message-form">
                        <button type='button'><span className="material-symbols-outlined">add</span></button>
                        <button type='button'><span className="material-symbols-outlined">face</span></button>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            required
                        />
                        <button type="submit"><span className="material-symbols-outlined">send</span></button>
                    </form>
                </>
            ) : (
                <p>Select a chat to start messaging.</p>
            )}
        </div>
    )
}

export default ChatWindow