// // import something here
// import io from 'socket.io-client'
// import { methods } from './CallTypes'

// // leave the export, even if you don't use it
// export default ({ app, router, Vue }) => {
//   // something to do
//   Vue.use({
//     async install (Vue, options = {}) {
//       const url = options.url ? options.url : 'ws://127.0.0.1:5000'
//       const socket = io(url)
//       const game = {
//         socket,
//         _players: [],
//         get players () {
//           return this._players
//         },
//         set players (players) {
//           console.log({ players })

//           this._players = players
//         },

//         connected: socket.connected,
//         join: player => socket.emit(methods.ADD_PLAYER, player),
//         subscribe: (event, callback) => socket.on(event, callback)
//       }
//       socket.on('connect', () => {})
//       socket.on('connect_timeout', _ => {
//         console.log('Connection Timeout')
//       })
//       socket.on('error', error => {
//         console.log(error)
//       })
//       socket.on(methods.PLAYER_JOINED, _ => {
//         socket.emit(methods.GET_PLAYERS, _players => (game.players = _players))
//       })

//       Vue.prototype.$game = game
//     }
//   })
// }
