import { useState, useEffect } from "react";
import {useNavigate} from 'react-router-dom'
import axios from 'axios'

const Settings = () => {
    const [selectedSetting, setSelectedSetting] = useState('profile')
    const [profilePic, setProfilePic] = useState('')
    const [notificationsEnabled, setNotificationsEnabled] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const currentUserId = localStorage.getItem('userId')
    const currentUsername = localStorage.getItem('userName')
    const navigate = useNavigate()
    const [username, setUsername] = useState(currentUsername)

    const goToDashboard = () => {
        navigate(`/users/${currentUserId}/dashboard`)
    }

     const backendURL = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://messagingapp-oglg.onrender.com'
  

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0]
        if(file){
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfilePic(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async() => {
        try{
            await axios.patch(`${backendURL}/api/user/${currentUserId}`, {
                ...(username && {username}),
                ...(profilePic && {profilePic})
            })
            setEditMode(false)
        }
        catch(err){
            console.log(err, "error saving")
        }
    }

    const handleToggle = async(checked) => {
        setNotificationsEnabled(checked)
        try{
            await axios.patch(`${backendURL}/api/user/${currentUserId}`, {
                notificationSetting: checked
            })
            if(checked){
                if(Notification.permission==='granted'){
                    console.log('already enabled')
                }
                else if(Notification.permission !== 'denied'){
                    Notification.requestPermission().then(permission => {
                        if(permission === 'granted'){
                            console.log('notifs allowed')
                        }
                    })
                }
            }
            else{
                console.log('notifs off')
            }
        }
        catch(err){

        }
    }

    const loadProfilePic = async() => {
        try{
            const response =  await axios.get(`${backendURL}/api/user/userInfo/${currentUserId}`)
            const userInfo = response.data
            if (userInfo && userInfo.profilePic) {
                setProfilePic(userInfo.profilePic)
                if(userInfo.notificationSetting !== undefined) setNotificationsEnabled(userInfo.notificationSetting)
            } 
        }
        catch(err){
            console.log('error getting pfp')
        }
    }

    useEffect(() => {
        loadProfilePic()
        
        
    }, [])


    return (
        <div className="home">
            <div className="sidebar">
                <div className='profile'>
                    <img src={profilePic || "/images/defaultPFP.jpg"} alt="No profile pic" />
                    <h2>{currentUsername}</h2>
                    <button className="icon-button" onClick={goToDashboard}><span className="material-symbols-outlined">arrow_back</span></button>
                </div>
                <ul className="settingsSidebar">
                    <li onClick={()=>setSelectedSetting('profile')} className={selectedSetting === 'profile' ? 'active': ''}>Profile</li>
                    <li onClick={()=>setSelectedSetting('notification')} className={selectedSetting === 'notification' ? 'active': ''}>Notifications</li>
                </ul>
            </div>

            <div className="settings-content">
            
                {selectedSetting === 'profile' && (
                    <>
                        <h2>Profile Settings</h2>
                        <div className="editArea">
                        
                        <div className="editPFP">
                            <img src={profilePic || "/images/defaultPFP.jpg"} alt="No profile pic" className="profilePic"/>
                            {editMode && (
                                <input type="file" accept='image/*' onChange={handleProfilePicChange}/>
                            )}
                        </div>

                        <div className="editUsername">
                            {editMode ?  (
                                <input type="text" placeholder="type new username..." onChange={(e)=>setUsername(e.target.value)}/>
                            ): (
                                <h2>{currentUsername}</h2>
                            )}
                        </div>

                        {!editMode ? (
                            <button onClick={() => setEditMode(true)}>edit</button>
                        ):(
                            <div className="edit-section">
                                <button onClick={handleSave}>Save</button>
                                <button onClick={()=>setEditMode(false)}>Cancel</button> 
                            </div>
                            
                        )}
                    </div>
                    </>
                    
                )}

                {selectedSetting === 'notification' && (
                    <>
                    <h2>Notification Settings</h2>
                    <div className="notification-settings">
                    <span class={`material-symbols-outlined notifIcon ${notificationsEnabled ? '' : 'active'}`}>notifications_off</span>
                        <label class="toggle-switch">
                            <input type="checkbox"
                            checked={notificationsEnabled}
                            onChange={(e)=>handleToggle(e.target.checked)} />
                            <span class="slider"></span>
                        </label>
                        <span class={`material-symbols-outlined notifIcon ${notificationsEnabled ? 'active' : ''}`}>notifications_active</span>
                    </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Settings