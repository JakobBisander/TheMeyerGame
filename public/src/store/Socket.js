import io from 'socket.io-client'
const url = 'ws://127.0.0.1:5000'
const socket = io(url)

export default socket
