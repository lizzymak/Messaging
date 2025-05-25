import { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import axios from 'axios';
import kaomoji from '../kaomoji';

const ChatWindow = ({activeChatId, activeChatUsername}) => {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const currentUserId = localStorage.getItem('userId')
    const messagesRef = useRef(null);
    const [showKaomojiPicker, setShowKaomojiPicker] = useState(false)

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

     const backendURL = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://messagingapp-oglg.onrender.com'

    
    useEffect(() => {
        //fetch messages when active ChatId changes
        const fetchMessages = async () => {
            try{
                const response = await axios.get(`${backendURL}/api/messages/${activeChatId}`)
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
            if(Notification.permission === 'granted'){
                new Notification('New Message', {
                    body:`${message.content}`,
                })
            }
            setMessages((prevMessages) => [...prevMessages, message])
        })
        return () =>{
            socket.off('receiveMessage')
        }
    }, [activeChatId])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (newMessage.trim() === '') return //prevents empty messages

        try{
            const response = await axios.post(`${backendURL}/api/messages/send`, {
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

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if(file){
            const reader = new FileReader()
            reader.onloadend = () =>{
                setNewMessage(`[image]${reader.result}`)
            }
            reader.readAsDataURL(file)
        }
    }


    return(
        <div className="chat-window" >
            {activeChatId ? (
                <>
                    <h2>{activeChatUsername || "Select a chat"}</h2>
                    <div className="messages-container" ref={messagesRef}>
                    {messages.length > 0 ? (
    messages.map((msg) => {
        const isImage = msg.content.startsWith("[image]");
        const imageUrl = isImage ? msg.content.replace("[image]", "") : null;

        return (
            <div key={msg._id} className="message-wrapper">
                <span className={`message-username ${msg.senderId === currentUserId ? 'sent-wrapper' : 'received-wrapper'}`}>
                    {msg.senderId === currentUserId ? 'You' : msg.senderUsername}
                </span>
                <div className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}>
                    {isImage ? (
                        <img src={imageUrl} alt="sent pic" className="sent-image" />
                    ) : (
                        <p className="message-text">{msg.content}</p>
                    )}
                </div>
            </div>
        );
    })
) : (
    <p>No messages yet...</p>
)}

</div>

                    <form onSubmit={handleSendMessage} className="send-message-form">
                        <input type="file" accept='image/*' style={{display:'none'}} id='imageUpload' onChange={(e)=>handleImageSelect(e)}/>
                        <button type='button' onClick={()=>document.getElementById('imageUpload').click()}><span className="material-symbols-outlined">add</span></button>


                        <button type='button'  onClick={() => setShowKaomojiPicker((prev) => !prev)}><span className="material-symbols-outlined">face</span></button>
                        {showKaomojiPicker && (
        <div className='kaomoji-box'>
        {kaomoji.map((k) => (
            <button key={k} onClick={() => {
                setNewMessage((prev) => prev + ' ' + k);
                setShowKaomojiPicker(false);
            }}>{k}</button>
        ))}
        </div>)}
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
                <p style={{color:'white'}}>Select a chat to start messaging</p>
            )}
        </div>
    )
}

export default ChatWindow