import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import ChatWindow from './chatWindow'

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
                console.log("chats fetched");
                setChats(response.data)
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

            setChats(prevChats =>{
                const existingChat = prevChats.find(c => c._id == chat.chatId)
                return existingChat ? prevChats: [...prevChats, chat]
            })
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
                <h1>User Search</h1>
                <form onSubmit={search}>
                    <input type="text" placeholder='Enter username' value={userSearch} onChange={(e) => setUserSearch(e.target.value)}/>
                    <button type="submit">Search</button>
                </form>
                <ul>
                    <h1>Chats</h1>
                        {chats.map(chat=>(
                            // <div key={chat._id}>{chat.username}</div>
                            <li key={chat._id} onClick={() => {
                            setActiveChatId(chat.chatId)
                            setActiveChatUsername(chat.username)}}>{chat.username}</li>
                        ))}
                    
                </ul>
            </div>  
            <ChatWindow activeChatId={activeChatId} activeChatUsername={activeChatUsername} />
        </div>
    )
}

export default Dashboard