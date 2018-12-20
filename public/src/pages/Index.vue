<template>
  <q-page class="flex flex-center">
    <div class="row justify-center">
      <div class="col-12 text-center">
        <h4 class="text-bold">Welcome to The Meyer Game</h4>
      </div>
      <q-input
        class="q-headline col-12"
        v-model="name"
        stack-label="Your Nickname"
      />
      <q-btn
        class="q-mt-md"
        label="Join the game"
        :disable="disabled"
        :color="disabled ? '': 'primary'"
        no-caps
        no-ripple
        @click="joinGame"
      />
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'PageIndex',
  data: () => ({
    name: ''
  }),
  computed: {
    disabled () {
      return this.name === ''
    }
  },
  methods: {
    ...mapActions('game', ['join']),
    joinGame () {
      this.join({name: this.name})
      this.$router.push({ name: 'lobby' })
    }
  }
}
</script>
