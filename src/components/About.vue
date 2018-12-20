<template>
  <div>
    <a-row class="somemorepadding"  style="padding: 30px 30px 5px 0px; margin: 0px 0px 30px 0px; background: #1890ff">
      <a-col style="margin-left: 4%">
        <h1 class="leftaligned" style="white-space: nowrap">
          <label style="color: #eeeeee; font-family: 'Cantarell'; font-size: 120%">
            About
          </label>
        </h1>
      </a-col>
    </a-row>
    <a-row>
      <div style="display: flex; width: 100%">
        <div style="max-width: 550px; margin-left: auto; margin-right: auto; text-align: justify;">
          <h1>
            About Group Bill Splitter
          </h1>

          <b>Group Bill Splitter</b> is a Web App which lets you enter expenses of a group and split the expenses among
          the group members.
          It was developed as a submission for the Web App Development 2 course at
          <a href="https://www.wit.ie">W.I.T.</a> in 2018.

          The App was built using the MEVN stack: The frontend utilises VueJS and relies on a backend server based on
          NodeJS, the Express framework and a MongoDB database.

          <b>Group Bill Splitter</b> built in 2018 by Vincent Bürgin.<br><br>
        </div>
      </div>
    </a-row>
  </div>
</template>

<script>
import Vue from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

Vue.use(Antd)

export default {
  name: 'About'
}
</script>

<style scoped>
  .ant-table-placeholder {
    padding: 0px 0px;
  }
  .flex {
    display: flex;
    align-items: stretch;
  }
  .somemarginright {
    margin: 0px 10px 0px 0px;
  }
  .nowrap {
    white-space: nowrap;
  }
  .input-error {
    border-color: #f5222d
  }
  .input-error >>> .ant-select-selection {
    border-color: #f5222d;
  }
</style>
