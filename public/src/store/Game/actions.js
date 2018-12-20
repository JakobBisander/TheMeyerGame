/*
export function someAction (context) {
}
*/
import { methods, plays } from './CallTypes'

export default socket => {
  return {
    join: ({ commit }, player) => {
      socket.emit(methods.ADD_PLAYER, player)
    },
    start: ({ commit }) => {
      socket.emit(methods.START_GAME)
    },
    fetchPlayers: ({ commit }) => {
      socket.emit(methods.GET_PLAYERS, players => {
        commit('SetPlayers', players)
      })
    },
    setPlayers: ({ commit }, players) => {
      commit('SetPlayers', players)
    },
    lie: ({ commit }, lie) => {
      socket.emit('lie', lie)
    },
    roll: _ => socket.emit(plays.ROLL),
    lift: _ => socket.emit(plays.LIFT),
    call: (context, dice) => socket.emit(plays.CALL, dice),
    activeTurn: _ => socket.emit(methods.ACTIVE_TURN),
    gameStart: ({ dispatch }) => {
      socket.on(methods.GAME_STARTING, () => dispatch(methods.GAME_STARTING))
    },
    subscribe: (event, callback) => socket.on(event, callback)
  }
}
