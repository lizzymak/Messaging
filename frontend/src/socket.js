import {io} from 'socket.io-client'

const URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://messagingapp-oglg.onrender.com';

const socket = io(URL);

// const socket = io('http://localhost:5000')

export default socket