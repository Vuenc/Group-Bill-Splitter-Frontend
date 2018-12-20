<template>
  <div id="app">
    <a-menu mode="horizontal" theme="dark" :selectedKeys="[]" style="background: #1890ff">
      <a-menu-item @click="navigateHome">
        <a-icon type="home"/>
        <label style="color: #ffffff; font-family: 'Cantarell'; cursor: pointer">
          <b>Group Bill Splitter</b>
        </label>
      </a-menu-item>
      <a-menu-item @click="navigateAbout">
        <a-icon type="info"/>
        <label style="color: #ffffff; font-family: 'Cantarell'; cursor: pointer">
          About
        </label>
      </a-menu-item>
    </a-menu>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    navigateHome () {
      this.$router.push({name: 'LandingPage'})
    },
    navigateAbout () {
      this.$router.push({name: 'About'})
    }
  }
}
</script>

<style>
#app {
  font-family: 'Cantarell', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
