// import something here
import { methods } from './Game/CallTypes'
// leave the export, even if you don't use it
export default socket => {
  return store => {
    const module = 'game'
    socket.on('connect_timeout', _ => {
      console.log('Connection Timeout')
    })
    socket.on('error', error => {
      console.log(error)
    })
    socket.on(methods.PLAYER_JOINED, player => {
      store.commit(`${module}/${methods.PLAYER_JOINED}`, player)
    })
  }
}
// something to do
