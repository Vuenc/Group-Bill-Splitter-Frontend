<template>
  <div>
    <a-form-item label="Description">
      <a-input ref="firstInput" v-model="description" placeholder="What was payed for?"></a-input>
    </a-form-item>
    <a-form-item label="Amount">
      <div>
        <a-row type="flex" justify="space-between">
          <a-col :span=9  class="somemarginright">
            <a-input style="min-width: 100%" v-model="amount" placeholder="How much?"></a-input>
          </a-col>
          <a-col  style="flex-grow: 100; display: flex; justify-content: space-between">
              <label>{{currencyPrefix}}</label>
              <label class="ant-form-item ant-form-item-label nowrap somemarginright">Paid by:</label>
          </a-col>
          <a-col :span=10>
            <a-select ref="selectPayingGroupMemberElement"
                      placeholder="Who paid?"
                      style="min-width: 100%"
                      v-model="payingGroupMemberName"
                      showSearch>
              <a-select-option v-for="name in groupMemberNames" :key="name">{{name}}</a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </div>
    </a-form-item>
    <a-form-item label="Shared by:" >
      <a-radio-group v-model="sharingMembersEnterType">
        <a-radio value="all" @click="sharingGroupMemberNames=[]">All group members (current and future members)</a-radio>
        <a-radio value="select" @click="focusSharedMemberSelection">Select group members:</a-radio>
        <a-select ref="selectSharingGroupMembersElement"
                  v-model="sharingGroupMemberNames"
                  mode="multiple"
                  style="width: 100%"
                  @focus="sharingMembersEnterType = 'select'"
                  :placeholder="sharingMembersEnterType === 'all' ? 'All users share the expense' : 'Select users...'">
          <a-select-option v-for="name in groupMemberNames"
                           :key="name"
          >{{name}}</a-select-option>
        </a-select>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="Date:">
      <a-date-picker v-model=date></a-date-picker>
    </a-form-item>
  </div>
</template>

<script>
import Vue from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
let moment = require('moment')

Vue.use(Antd)

export default {
  name: 'AddExpense',
  data () {
    return {
      description: '',
      amount: null,
      payingGroupMemberName: '',
      sharingGroupMemberNames: [],
      date: moment(),
      currencyPrefix: '€ ',
      groupMemberNames: ['Alice', 'Bob', 'Eve'],
      sharingMembersEnterType: 'all'
    }
  },
  props: ['validChanged'],
  mounted () {
    this.$refs.firstInput.focus()
    this.validChanged(false)
  },
  beforeDestroy () {
    console.log('Destroyed!')
  },
  methods: {
    focusSharedMemberSelection () {
      this.$refs.selectSharingGroupMembersElement.focus()
    }
  },
  computed: {
    isValid () {
      let valid = this.description !== '' &&
        this.amount !== null &&
        this.payingGroupMemberName !== '' &&
        (this.sharingMembersEnterType === 'all' ||
         this.sharingGroupMemberNames.length > 0)
      return valid
    }
  },
  watch: {
    isValid (valid) {
      this.validChanged(valid)
    }
  }
}
</script>

<style scoped>
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
</style>
