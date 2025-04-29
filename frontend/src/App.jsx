import {HashRouter as Router, Route, Routes} from 'react-router-dom'
import Login from './components/login.jsx'
import Dashboard from './components/dashboard.jsx'
import {UserProvider} from './context/userContext.js'
import Settings from './components/settings.jsx'
import './App.css';

function App(){
    return (
        <UserProvider> 
            <Router>
                <Routes>
                    <Route path='/' element={<Login/>}></Route>
                    <Route path="/users/:userId/dashboard" element={<Dashboard/>} />
                    <Route path="/users/:userId/settings" element={<Settings/>}/>
                </Routes>
            </Router>
        </UserProvider> 

);
}

export default App;