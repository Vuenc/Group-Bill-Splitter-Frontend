<template>
  <a-form @submit="$emit('submit')">
    <a-form-item label="Description">
      <a-input ref="firstInput" v-model="description" placeholder="What was paid for?" :class="{'input-error': $v.description.$error}"></a-input>
    </a-form-item>
    <a-form-item label="Amount">
      <div>
        <a-row type="flex" justify="space-between">
          <a-col :span=9  class="somemarginright">
            <a-input style="min-width: 100%"
                     v-model="amount"
                     placeholder="How much?"
                     :class="{'input-error': $v.amount.$error}"
                     @blur="formatAmount"
            ></a-input>
          </a-col>
          <a-col  style="flex-grow: 100; display: flex; justify-content: space-between">
              <label>{{currencyPrefix}}</label>
              <label class="ant-form-item ant-form-item-label nowrap somemarginright">Paid by:</label>
          </a-col>
          <a-col :span=10>
            <a-select ref="selectPayingGroupMemberElement"
                      placeholder="Who paid?"
                      style="min-width: 100%"
                      v-model="payingGroupMember"
                      :class="{'input-error': $v.payingGroupMember.$error}"
                      showSearch
                      :filterOption="matchesGroupMember"
            >
              <a-select-option v-for="member in groupMembers"
                               :key="member._id"
                               :value="member._id"
              >
                {{member.name}}</a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </div>
    </a-form-item>
    <a-form-item label="Shared by:" >
      <a-radio-group v-model="sharingMembersEnterType">
        <a-radio value="all" @click="sharingGroupMembers=[]">All group members (current and future members)</a-radio>
        <a-radio value="select" @click="focusSharedMemberSelection">Select group members:</a-radio>
        <a-select ref="selectSharingGroupMembersElement"
                  v-model="sharingGroupMembers"
                  mode="multiple"
                  style="width: 100%"
                  @focus="sharingMembersEnterType = 'select'"
                  :placeholder="sharingMembersEnterType === 'all' ? 'All users share the expense' : 'Select users...'"
                  :class="{'input-error': $v.sharingGroupMembers.$error}"
                  :filterOption="matchesGroupMember"
        >
          <a-select-option v-for="member in groupMembers"
                           :key="member._id"
                           :value="member._id"
                           :class="{'input-error': $v.payingGroupMember.$error}"
          >{{member.name}}</a-select-option>
        </a-select>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="Date:">
      <a-date-picker v-model=date></a-date-picker>
      <a-button html-type="submit" style="visibility: hidden"/>
    </a-form-item>
  </a-form>
</template>

<script>
import Vue from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import { required, decimal, requiredIf } from 'vuelidate/lib/validators'

let moment = require('moment')

Vue.use(Antd)

export default {
  name: 'EnterExpense',
  data () {
    return {
      description: '',
      amount: null,
      payingGroupMember: [],
      sharingGroupMembers: [],
      date: moment(),
      sharingMembersEnterType: 'all'
    }
  },
  props: ['groupMembers', 'inputExpense', 'currencyPrefix'],
  mounted () {
    this.$refs.firstInput.focus()
  },
  methods: {
    // Focus the 'sharing members' component on press of the radio button
    focusSharedMemberSelection () {
      this.$refs.selectSharingGroupMembersElement.focus()
    },
    // Validate the data and if its OK, confirm back to the parent element
    okPressed (confirmationCallback) {
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      let expense = {
        description: this.description,
        amount: this.amount,
        payingGroupMember: this.payingGroupMember,
        sharingGroupMembers: this.sharingGroupMembers,
        date: this.date.format('YYYY-MM-DD')
      }
      if (!this.inputExpense) {
        confirmationCallback(expense, 'added')
      } else {
        expense._id = this.inputExpense._id
        confirmationCallback(expense, 'edited')
      }
    },
    // Format the amount input box
    formatAmount () {
      if (this.amount) {
        this.$v.amount.$touch()
      }
      const numberAmount = Number(this.amount)
      if (numberAmount) {
        this.amount = numberAmount.toLocaleString('en', {minimumFractionDigits: 2, useGrouping: false})
      }
    },
    // Implements search function on select element
    matchesGroupMember (searchString, element) {
      return this.groupMembers[element.data.key].name.includes(searchString)
    }
  },
  created () {
    if (this.inputExpense) {
      this.description = this.inputExpense.description
      this.amount = this.inputExpense.amount
      this.payingGroupMember = this.inputExpense.payingGroupMember
      this.sharingGroupMembers = this.inputExpense.sharingGroupMembers
      if (this.inputExpense.date) {
        this.date = moment(this.inputExpense.date)
      }
      this.sharingMembersEnterType = this.sharingGroupMembers.length > 0 ? 'select' : 'all'
    }
  },
  validations: {
    description: {
      required
    },
    amount: {
      required,
      decimal
    },
    payingGroupMember: {
      required
    },
    date: {
      required
    },
    sharingGroupMembers: {
      requiredIf: requiredIf((vue) => vue.sharingMembersEnterType === 'select')
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
  .input-error {
    border-color: #f5222d
  }
  .input-error >>> .ant-select-selection {
    border-color: #f5222d;
  }
</style>
