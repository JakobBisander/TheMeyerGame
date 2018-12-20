import Vue from 'vue'
import Vuex from 'vuex'
import GameConnector from './GameConnector'
import game from './Game'
import socket from './Socket'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    plugins: [GameConnector(socket)],
    modules: {
      game: game(socket)
    },
    actions: {},
    mutations: {},
    state: {},
    getters: {}
  })
  return Store
}
