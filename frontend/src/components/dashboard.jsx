import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import ChatWindow from './chatWindow'

const formatTimestamp = (timestamp) =>{
    if(!timestamp) return ''

    const date = new Date(timestamp)
    const now = new Date()
    const secInDay = 1000*60*60*24
    const diffinsec = now-date
    const diffInDays = Math.floor(diffinsec/secInDay)
    if (diffInDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInDays === 1) {
        return '1 day ago';
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}}

const Dashboard = () => {
    const [userSearch, setUserSearch] = useState('')
    const [chats, setChats] = useState([])
    const [activeChatId, setActiveChatId] = useState(null)
    const [activeChatUsername, setActiveChatUsername] = useState('')
    const currentUserId = localStorage.getItem('userId')
    
    //this updates activeChatID to change the screens current chat
    useEffect(() => {
        console.log("Updated activeChatId:", activeChatId);
        console.log("Updated activeChatUsername:", activeChatUsername);
    }, [activeChatId, activeChatUsername]);

    // this one is responsible for fetching chats when loaded or currentuser changes
    useEffect(() => {
        console.log("Requesting chats for user:", currentUserId)
        if (!currentUserId) {
            console.log("No user logged in");
            // navigate("/login");
            return;
        }
        const fetchChats = async () => {
            try{
                const response = await axios.get(`http://localhost:5000/api/user/${currentUserId}`)
                console.log(response.data);
                // setChats(response.data)
                const userChats = response.data
                
                const enrichedChats = []
                for (const chat of userChats){
                    try{
                        const msgRes = await axios.get(`http://localhost:5000/api/messages/${chat.chatId}`)
                        const messages = msgRes.data;
                        const latestMessage = messages.length > 0 ? messages[messages.length - 1].content : "No messages yet..."
                        const latestTimestamp = messages.length > 0 ? messages[messages.length - 1].createdAt : null
                        enrichedChats.push({ ...chat, latestMessage, latestTimestamp })
                    }
                    catch(err){

                    }
                }
                setChats(enrichedChats)
            }
            catch(err){
                console.log("error fetching chats", err)
            }
        }
        if(currentUserId) fetchChats()
    }, [currentUserId])
    const search = async (e) => {
        e.preventDefault()
        console.log("searching for user");
        try{
            const response = await axios.post('http://localhost:5000/api/user/userSearch',{
            username: userSearch,
            currentUserId
            })
            const chat = response.data
            console.log(chat)
            setActiveChatId(chat.chatId)
            setUserSearch('')
        }
        catch(err){
            console.log("error in search")
        }
    }

    return(
        <div className='home'>
            <div className='sidebar'>
                <div className='profile'>
                    <img src="/images/defaultPFP.jpg" alt="" />
                    <h2>Lizzy</h2>
                    <button className="icon-button"><span className="material-symbols-outlined">settings</span></button>
                </div>
                <form onSubmit={search}>
                    <input type="text" placeholder='Enter username' value={userSearch} onChange={(e) => setUserSearch(e.target.value)}/>
                    <button type="submit" className="icon-button"><span className="material-symbols-outlined">search</span></button>
                </form>
                <ul>
                    <h2><span className="material-symbols-outlined">person</span> Friends</h2>
                        {Array.isArray(chats) && chats.map(chat=>(
                            // <div key={chat._id}>{chat.username}</div>
                            <li key={chat._id} className={`chat-item ${chat.chatId === activeChatId ? 'active' : ''}`}
                            onClick={() => {
                            setActiveChatId(chat.chatId)
                            setActiveChatUsername(chat.username)}}>
                            <div className="chat-bubble">
                                <div className="chat-header">
                                    <p className="chat-username">{chat.username}</p>
                                 {chat.latestTimestamp && (<p className="chat-time">
                                    {formatTimestamp(chat.latestTimestamp)}</p>)}</div>
                                <p className="chat-preview">{chat.latestMessage || "No messages yet..."}</p>
                            </div>
                            </li>
                        ))}
                    
                </ul>
            </div>  
            <ChatWindow activeChatId={activeChatId} activeChatUsername={activeChatUsername} />
        </div>
    )
}

export default Dashboard