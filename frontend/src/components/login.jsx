import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate()

    const backendURL = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://messagingapp-backend-lizzymaks-projects.vercel.app'

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("Data being sent:");
        
        setError('')
        const url = isRegistering 
        ? `http://localhost:5000/api/auth/register`
        : `${backendURL}/api/auth/login`;
        
        try{
            const response = await axios.post(url, {username, password}, {
                headers: {
                'Content-Type': 'application/json',
            }})
            const {token, userId} = response.data
            localStorage.setItem('token', token)
            localStorage.setItem('userId', userId)
            localStorage.setItem('userName', username)
            navigate(`/users/${userId}/dashboard`)
            
        }
        catch(err){
            console.log("error during login", err.response?.data || err)
        }
    }

    return(
    <div className='login'>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit} className='login-form'>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" >
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      <p 
        onClick={() => setIsRegistering(!isRegistering)} 
        className='changeLogin'
      >
        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
      </p>
    </div>
    )
}

export default Login