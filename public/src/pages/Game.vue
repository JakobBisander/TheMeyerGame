<template>
  <q-page>
    <div class="fixed-top-left q-pa-lg">
      <p class="q-headline text-bold">Score</p>
      <div class="row">
        <q-item v-for="player in players" :key="player.socketId">
          <q-item-side icon="person"/>
          <q-item-main>
            <q-item-tile class="q-headline" label>{{player.name}}</q-item-tile>
            <q-item-tile class="q-subheading" sublabel>{{player.score}}</q-item-tile>
          </q-item-main>
        </q-item>
      </div>
    </div>
    <div class="fixed-bottom-left q-pa-lg">
      <p class="q-headline text-bold">Log</p>
      <p class="q-subheadline text-faded">Previous calls</p>
      <q-input v-model="log" type="textarea" :rows="4" readonly/>
    </div>
    <div class="fixed-center flex flex-center">
      <div class="row col-12 gutter-lg">
        <div class="col-6 q-display-3 text-center">{{ dice[0] }}</div>
        <div class="col-6 q-display-3 text-center">{{ dice[1] }}</div>
      </div>
    </div>
    <div class="fixed-bottom q-pa-lg flex flex-center">
      <div class="row">
        <q-btn
          :disable="(!active || !rollEnabled)"
          :color="active && rollEnabled ? 'primary' :  'grey'"
          class="q-ma-sm q-px-lg"
          size="24px"
          label="Roll"
          @click="roll"
          no-caps
        />
        <q-btn
          :disable="!active || !liftEnabled"
          :color="active && liftEnabled ? 'primary' :  'grey'"
          class="q-ma-sm q-px-lg"
          size="24px"
          label="Lift"
          @click="sendLift"
          no-caps
        />
        <q-btn
          :disable="!active || !callEnabled"
          :color="active && callEnabled ? 'primary' :  'grey'"
          class="q-ma-sm q-px-lg"
          size="24px"
          label="Call"
          @click="callTheRoll(dice)"
          no-caps
        />
        <q-btn
          :disable="!active"
          :color="active ? 'primary' :  'grey'"
          class="q-ma-sm q-px-lg"
          size="24px"
          label="Lie"
          @click="lieDialog"
          no-caps
        />
      </div>
    </div>
    <q-modal ref="lieModal" class="q-pa-xl">
      <q-modal-layout>
        <div class="layout-padding flex">
          <div class="row gutter-md">
            <q-field class="col-6">
              <q-input
                stack-label="First number"
                type="number"
                min="1"
                max="6"
                v-model="lieDices[0]"
              />
            </q-field>
            <q-field class="col-6">
              <q-input
                stack-label="Second number"
                type="number"
                min="1"
                max="6"
                v-model="lieDices[1]"
              />
            </q-field>
            <q-btn label="Lie" @click="checkLie" no-ripple no-caps/>
          </div>
        </div>
      </q-modal-layout>
    </q-modal>
  </q-page>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import socket from '../store/Socket'
import { methods } from '../store/Game/CallTypes'
import { QModal, QModalLayout, QField } from 'quasar'

export default {
  name: 'game',
  components: {
    QModal, QModalLayout, QField },
  data: () => ({
    diceString: '',
    active: false,
    rollEnabled: false,
    liftEnabled: false,
    log: '',
    lieDices: [1, 1]
  }),
  created () {
    this.activeTurn()
    socket.on(methods.PLAYERS_TURN, () => {
      this.active = true
      this.rollEnabled = true
      this.addTolog('It is your turn!', true)
    })
    socket.on(methods.NEW_ROUND, score => {
      this.addTolog('New Round', true)
      socket.emit(methods.GET_PLAYERS, players => {
        this.$store.commit('game/SetPlayers', players)
      })
    })
    socket.on(methods.PLAYER_ROLL, dice => {
      this.liftEnabled = false
      this.rollEnabled = false
      this.diceString = dice
    })
    socket.on(methods.PLAYER_CALLED, data => {
      this.diceString = ''
      const { lastRoll, playerName } = data
      const message = `${playerName} says ${lastRoll[0]} and ${lastRoll[1]}`
      this.liftEnabled = true
      console.log({ message })
      this.addTolog(message, true)
    })
  },
  computed: {
    ...mapGetters('game', ['players']),
    dice () {
      return this.diceString.split('')
    },
    callEnabled () {
      return this.diceString !== ''
    }
  },
  methods: {
    ...mapActions('game', ['roll', 'lift', 'call', 'activeTurn', 'lie']),
    addTolog (message, notify) {
      this.log += message + '\n'
      if (!notify) return
      this.$q.notify({
        message,
        color: 'dark',
        position: 'top'
      })
    },
    deactivate () {
      this.active = false
      this.rollEnabled = false
      this.liftEnabled = false
    },
    checkLie () {
      try {
        for (const number of this.lieDices) {
          console.log({ number })
          if (number < 1 || number > 6) throw new Error('Lie is not valid, between 1 and 6')
        }
        this.lie(this.lieDices)
        this.$refs.lieModal.hide()
        this.lieDices = [1, 1]
      } catch (error) {
        this.$q.notify({
          message: error.message,
          color: 'negative'
        })
      }
    },
    sendLift () {
      this.liftEnabled = false
      this.lift()
    },
    callTheRoll (dice) {
      this.call(dice)
      this.deactivate()
    },
    lieDialog () {
      this.$refs.lieModal.show()
    }
  }
}
</script>
