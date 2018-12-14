<template>
  <div>
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
            >
              <a-select-option v-for="member of groupMembers"
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
        >
          <a-select-option v-for="member of groupMembers"
                           :key="member._id"
                           :value="member._id"
                           :class="{'input-error': $v.payingGroupMember.$error}"
          >{{member.name}}</a-select-option>
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
      currencyPrefix: '€ ',
      sharingMembersEnterType: 'all'
    }
  },
  props: ['groupMembers', 'inputExpense'],
  mounted () {
    this.$refs.firstInput.focus()
  },
  methods: {
    focusSharedMemberSelection () {
      this.$refs.selectSharingGroupMembersElement.focus()
    },
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
        date: this.date
      }
      if (!this.inputExpense) {
        confirmationCallback(expense, 'added')
      } else {
        expense._id = this.inputExpense._id
        confirmationCallback(expense, 'edited')
      }
    },
    formatAmount () {
      if (this.amount !== '') {
        this.$v.amount.$touch()
      }
      const amt = Number(this.amount)
      if (amt) {
        this.amount = amt.toLocaleString(undefined, {minimumFractionDigits: 2})
      }
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
    border-color: #f5222d !important;
  }
</style>
