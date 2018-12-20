<template>
  <div style="height: 100%">
    <a-row class="somemorepadding"  style="padding: 30px 30px 5px 30px; margin: 0px 0px 30px 0px; height: 50%; background: #1890ff; display: flex; flex-direction: column-reverse">
      <h2 style="color: #dddddd; font-family: 'Cantarell'; font-size: 150%; text-align: center">
        Group Bill Splitter makes it easy to settle shared expenses with your friends!
      </h2>
      <h1 style="color: #eeeeee; font-family: 'Cantarell'; font-size: 450%; text-align: center; margin-bottom: 10px">
        <b>Group Bill Splitter</b>
      </h1>
    </a-row>
    <a-row style="text-align: center;">
      <div style="font-family: 'Cantarell'; font-size: 115%">
        <label style="font-size: 120%; margin-right: 20px">
          <b>Get started:</b>
        </label>
        <a-button type="primary" size="large" @click="createNewGroupEvent">
          Create a new Group Event!
        </a-button>
      </div>
    </a-row>
    <a-row style="font-family: 'Cantarell'; text-align: justify; font-size: 115%; margin-top: 40px">
      <a-col :offset=7 :span=10>
        You and your friends went on a holiday together?
        You cooked something fancy as a group?
        You had a big party and had to buy a lot of drinks?
        Either way, you now have a big pile of open bills and it's going to be quite a chaos to find out who has to pay
        how much money to who in order to settle all expenses.
        <br><br>
        With <b>Group Bill Splitter</b>, splitting the bills becomes much easier!
        You simply enter who participated and what expenses the people had, and you will get a list of transactions
        which settle all the debts.
        You can also add expenses which are not shared by the whole group, but only a part of the group.
      </a-col>
    </a-row>
  </div>
</template>

<script>
import Vue from 'vue'
import 'ant-design-vue/dist/antd.css'
import Antd from 'ant-design-vue'

Vue.use(Antd)
export default {
  name: 'LandingPage',
  methods: {
    createNewGroupEvent () {
      this.$router.push({name: 'CreateGroupEvent'})
    }
  },
  created () {
    document.title = 'Group Bill Splitter: Split Expenses with your Friends'
  }
}
</script>

<style scoped>
</style>
