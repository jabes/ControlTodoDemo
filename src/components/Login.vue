<template>
  <div class="container height-100">
    <div class="flex justify-center items-center height-100">
      <div class="flex-none">
        <div v-html="icons.logo"></div>
        <form v-on:submit.prevent>
          <p class="block color-red-light"
             v-if="error">{{ error }}</p>
          <div class="margin-bottom-200">
            <p>
              <input type="text"
                     placeholder="Username"
                     v-model="credentials.username">
              <span class="block margin-top-50 color-red-light"
                    v-if="errors.username">{{ errors.username }}</span>
            </p>
            <p>
              <input type="password"
                     placeholder="Password"
                     v-model="credentials.password">
              <span class="block margin-top-50 color-red-light"
                    v-if="errors.password">{{ errors.password }}</span>
            </p>
          </div>
          <div class="vertical-middle">
            <button class="btn secondary-white margin-right-100" v-on:click="submit()">Login</button>
            <router-link :to="{ name: 'sign-up' }">Sign-up</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
  import Auth from '../services/auth';

  export default {
    data() {
      return {
        credentials: {
          username: '',
          password: '',
        },
        error: '',
        errors: {
          username: '',
          password: '',
        },
        icons: {
          logo: require('!!svg-inline-loader!../images/logo.svg')
        },
      }
    },
    mounted() {
      Auth.setContext(this);
    },
    methods: {
      submit() {
        const credentials = this.credentials;
        const redirect = {name: 'dashboard'};
        Auth.login(credentials, redirect);
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import "../styles/variables.styl"

  form
    width 300px

  input
    $color-text = $colors['grey']
    $color-bg = $colors['white']
    display block
    width 100%
    margin 0
    padding 1em
    border-radius 5px
    font-size 18px
    color $color-text
    background $color-bg
    border none
</style>
