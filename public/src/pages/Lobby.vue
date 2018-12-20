<template>
  <q-page class="flex flex-center">
    <div class="col-5 row">
      <div class="col-12">
        <q-list no-border>
          <q-list-header class="q-headline text-bold">Players</q-list-header>
          <q-item v-for="player in players" :key="player.socketId">
            <q-item-side icon="group"/>
            <q-item-main>{{player.name}}</q-item-main>
          </q-item>
        </q-list>
      </div>
      <div class="col-12">
        <q-btn
          @click="startGame"
          :disable="disabled"
          :color="disabled ? 'grey' : 'green'"
          label="Start game"
        />
      </div>
    </div>
  </q-page>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { methods } from '../store/Game/CallTypes'
import socket from '../store/Socket'

export default {
  name: 'lobby',
  created () {
    this.fetchPlayers()
    socket.on(methods.GAME_STARTING, () =>
      this.$router.push({ name: 'game' })
    )
  },
  data: () => ({
  }),
  computed: {
    ...mapGetters('game', ['players']),
    disabled () {
      return this.players.length < 2
    }
  },
  methods: {
    ...mapActions('game', ['fetchPlayers', 'start', 'subscribe']),
    startGame () {
      try {
        if (this.disabled) throw new Error('Not enough players')
        this.start()
        this.$router.push({ name: 'game' })
      } catch (error) {
        this.$q.notify({
          message: error.message,
          color: 'negative'
        })
      }
    }
  }

}
</script>
