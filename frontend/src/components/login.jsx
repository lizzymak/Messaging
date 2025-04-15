import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("Data being sent:");
        
        setError('')
        const url = isRegistering 
        ? 'http://localhost:5000/api/auth/register' 
        : 'http://localhost:5000/api/auth/login';
        
        try{
            const response = await axios.post(url, {username, password}, {
                headers: {
                'Content-Type': 'application/json',
            }})
            const {token, userId} = response.data
            localStorage.setItem('token', token)
            localStorage.setItem('userId', userId)
            navigate(`/users/${userId}/dashboard`)
            
        }
        catch(err){
            console.log("error during login", err.response?.data || err)
        }
    }

    return(
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left' }}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
          style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '200px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '200px' }}
        />
        <button type="submit" style={{ padding: '8px 15px', cursor: 'pointer' }}>
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      <p 
        onClick={() => setIsRegistering(!isRegistering)} 
        style={{ cursor: 'pointer', marginTop: '10px', color: 'blue' }}
      >
        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
      </p>
    </div>
    )
}

export default Login