import { methods } from './CallTypes'

export default {
  [methods.PLAYER_JOINED]: (state, player) => {
    console.log('here')

    state.players.push(player)
  },
  [methods.ADD_PLAYER]: (state, player) => state.players.push(player),
  SetPlayers: (state, players) => {
    console.log({ players })

    state.players = players
  },
  [methods.PLAYERS_TURN]: state => (state.gameState.activeTurn = true)
}
