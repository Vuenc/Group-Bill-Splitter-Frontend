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
                               :key="`payingMember${member._id}`"
                               :value="member._id"
              >
                {{member.name}}</a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </div>
    </a-form-item>
    <div v-if="!isDirectPayment">
      <a-form-item label="Shared by:" >
        <a-radio-group v-model="sharingMembersEnterType">
          <a-radio value="all">All group members (current and future members)</a-radio>
          <a-radio value="select" style="margin-top: 5px; margin-bottom: 5px" @click="focusSharedMemberSelection">Split evenly between:</a-radio>
          <a-select ref="selectSharingGroupMembersElement"
                    v-model="sharingGroupMembers"
                    mode="multiple"
                    style="width: 100%; margin-bottom: 10px"
                    @focus="sharingMembersEnterType = 'select'"
                    placeholder="Select users..."
                    :class="{'input-error': $v.sharingGroupMembers.$error}"
                    :filterOption="matchesGroupMember"
          >
            <a-select-option v-for="member in groupMembers"
                             :key="`sharingMember${member._id}`"
                             :value="member._id"
                             :class="{'input-error': $v.payingGroupMember.$error}"
            >{{member.name}}</a-select-option>
          </a-select>
          <a-radio value="split">
            Split proportionally:
          </a-radio>
          <a-radio-group default-value="none" button-style="solid" v-model="splitType"
                         @change="changeSplitType">
            <a-popover title="Recent splittings" placement="top" trigger="hover">
              <a-radio-button value="percentages"
                              @click="changeSplitType">
                Split by percentage
              </a-radio-button>
              <template slot="content">
                <a-tooltip placement="top" :title="splitOption.description"
                           v-for="splitOption in percentageSplitSuggestions" :key="splitOption.name">
                  <a-button v-model="splitOption.checked" size="small" class="somemarginright">
                      {{splitOption.name}}
                  </a-button>
                </a-tooltip>
              </template>
            </a-popover>
            <a-radio-button value="amounts"
                            @click="changeSplitType">
              Split by amount</a-radio-button>
          </a-radio-group>
        </a-radio-group>
        <a-row v-for="(member, memberId) in groupMembers"
             :key="'percentages' + member._id" v-show="splitType === 'percentages'">
          <a-col  style="flex-grow: 100; display: flex; justify-content: space-between" :offset=1 :span=7>
            <label class="ant-form-item ant-form-item-label nowrap somemarginright">{{member.name}}:</label>
          </a-col>
          <a-col :span=5 class="somemarginright">
            <a-input :ref="`percentageInput${memberId}`"
                     v-model.number="splitPercentages[member._id]"
                     type="number" step="any"
                     @change="changeSplitPercentage(memberId)"
                     @focus="$refs[`percentageInput${memberId}`][0].$el.select()"
                     :class="{'input-error': ($v.splitPercentages.$each[memberId] && $v.splitPercentages.$each[memberId].$error)
                                  || !$v.splitPercentages.valuesSumTo}"
            />
          </a-col>
          <a-col :span=1>
            <label>%</label>
          </a-col>
        </a-row>
        <a-row v-for="(member, memberId) in groupMembers"
             :key="'amounts' + member._id" v-show="splitType === 'amounts'">
          <a-col  style="flex-grow: 100; display: flex; justify-content: space-between" :offset=1 :span=7>
            <label class="ant-form-item ant-form-item-label nowrap somemarginright">{{member.name}}:</label>
          </a-col>
          <a-col :span=5 class="somemarginright">
            <a-input :ref="`amountInput${memberId}`"
                      v-model.number="splitAmounts[member._id]"
                     type="number" step="any"
                     @change="changeSplitAmount(memberId)"
                     @focus="$refs[`amountInput${memberId}`][0].$el.select()"
                     :class="{'input-error': ($v.splitAmounts.$each[memberId] && $v.splitAmounts.$each[memberId].$error)
                                  || !$v.splitAmounts.valuesSumTo}"
            />
          </a-col>
          <a-col :span=1>
            <label>{{currencyPrefix}}</label>
          </a-col>
        </a-row>
      </a-form-item>
    </div>
    <div v-if="isDirectPayment">
      <a-form-item>
        <a-row type="flex" justify="space-between">
          <a-col  style="flex-grow: 100; display: flex; justify-content: right">
            <label class="ant-form-item ant-form-item-label nowrap somemarginright">Paid to:</label>
          </a-col>
          <a-col :span=10>
            <a-select ref="selectPayingGroupMemberElement"
                      placeholder="To who?"
                      style="min-width: 100%"
                      v-model="sharingGroupMembers[0]"
                      :class="{'input-error': $v.sharingGroupMembers.$error}"
                      showSearch
                      :filterOption="matchesGroupMember"
            >
              <a-select-option v-for="member in groupMembers"
                               :key="`receivingMember${member._id}`"
                               :value="member._id"
              >
                {{member.name}}</a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </a-form-item>
    </div>

    <a-form-item label="Date:">
      <a-date-picker v-model=date></a-date-picker>
      <a-button html-type="submit" style="visibility: hidden"/>
    </a-form-item>

    <!-- <a-form-item label="Split expense:" >
    <a-checkable-tag v-model="splitOption.checked" v-for="splitOption in splitOptions" :key="splitOption.name" >
      <a-tooltip placement="top" :title="splitOption.description">
        {{splitOption.name}}
      </a-tooltip>
    </a-checkable-tag>

    <a-radio-group default-value="Even" size="small" button-style="solid">
      <a-radio-button v-for="splitOption in splitOptions" :key="splitOption.name" :value="splitOption.name">
        <a-tooltip placement="top" :title="splitOption.description">
          {{splitOption.name}}
        </a-tooltip>
      </a-radio-button>
    </a-radio-group>
    </a-form-item>
    -->
  </a-form>
</template>

<script>
import Vue from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import { required, decimal, requiredIf, between, minValue } from 'vuelidate/lib/validators'

let moment = require('moment')

Vue.use(Antd)

const isNearlyEqual = (num1, num2) => {
  const epsilon = 1.192092896e-07
  return Math.abs(num1 - num2) < epsilon
}

// custom vuelidate validator
const valuesSumTo = (sumValueLambda) =>
  (obj, vue) => isNearlyEqual(Object.values(obj).reduce((total, x) => total + x, 0), sumValueLambda(vue))

export default {
  name: 'EnterExpense',
  data () {
    return {
      description: '',
      amount: null,
      payingGroupMember: [],
      sharingGroupMembers: [],
      date: moment(),
      sharingMembersEnterType: 'all', // valid: 'all', 'select', 'split'
      isDirectPayment: false,
      splitType: 'none', // valid: 'none', 'percentages', 'amounts'
      splitPercentages: Object.fromEntries(Object.keys(this.groupMembers).map(id => [id, null])),
      splitAmounts: Object.fromEntries(Object.keys(this.groupMembers).map(id => [id, null])),
      splitOptions: [{name: 'Even', description: 'Split evenly', checked: true},
        {name: '60% / 40%', description: 'Vincent: 60%, Sonja: 40%', checked: false},
        {name: '30% / 40% / 30%', description: 'Vincent: 30%, Sonja: 40%, Max: 30%', checked: false},
        {name: 'Custom...', description: 'Enter a custom splitting', checked: false}],
      percentageSplitSuggestions: [
        {name: '60% / 40%', description: 'Vincent: 60%, Sonja: 40%', checked: false},
        {name: '30% / 40% / 30%', description: 'Vincent: 30%, Sonja: 40%, Max: 30%', checked: false},
        {name: '35% / 65%', description: 'Vincent: 35%, Sonja: 65%', checked: false},
        {name: '20% / 20% / 30% / 20% / 10%', description: 'Vincent: 20%, Sonja: 20%, Max: 30%, Evelyn: 20%, Norman: 10%', checked: false},
        {name: '60% / 40% ', description: 'Max: 60%, Norman: 40%', checked: false}
      ]
    }
  },
  props: ['groupMembers', 'inputExpense', 'currencyPrefix', 'addDirectPayment'],
  mounted () {
    this.$refs.firstInput.focus()
  },
  methods: {
    // Focus the 'sharing members' component on press of the radio button
    focusSharedMemberSelection () {
      this.$refs.selectSharingGroupMembersElement.focus()
    },
    // Focus the first number input on selection of proportional splitting
    focusProportionalSplittingInput () {
      let firstMemberId = Object.keys(this.groupMembers)[0]
      if (this.splitType === 'percentages') {
        this.$nextTick(() => {
          let firstInput = this.$refs['percentageInput' + firstMemberId][0]
          firstInput.focus()
        })
      } else if (this.splitType === 'amounts') {
        this.$nextTick(() => this.$refs['amountInput' + firstMemberId][0].focus())
      }
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
        date: this.date.format('YYYY-MM-DD'),
        isDirectPayment: this.isDirectPayment
      }
      if (this.sharingMembersEnterType === 'split') {
        if (this.splitType === 'percentages') {
          expense.proportionalSplitting = { splitType: this.splitType,
            percentages: Object.entries(this.splitPercentages).map(p => { return {groupMember: p[0], percentage: p[1] / 100} }) }
        } else if (this.splitType === 'amounts') {
          expense.proportionalSplitting = { splitType: this.splitType,
            amounts: Object.entries(this.splitAmounts).map(a => { return {groupMember: a[0], amount: a[1]} }) }
        }
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
      let id = element.data.key.substring('sharingMember'.length)
      return this.groupMembers[id].name.includes(searchString)
    },
    changeSplitType () {
      if (this.sharingMembersEnterType !== 'split') {
        this.sharingMembersEnterType = 'split'
      }
      this.focusProportionalSplittingInput()
    },
    changeSplitPercentage (memberId) {
      let groupMemberEntries = Object.entries(this.groupMembers)
      let changeIndex = groupMemberEntries.findIndex(m => m[0] === memberId)
      let sum = groupMemberEntries.slice(0, changeIndex + 1)
        .map(entry => this.splitPercentages[entry[0]])
        .reduce((total, x) => total + x)
      let portion = Math.min(100, Math.max(0, (100 - sum) / (groupMemberEntries.length - (changeIndex + 1))))
      if (isNaN(portion)) {
        portion = null
      }
      for (let entry of groupMemberEntries.slice(changeIndex + 1)) {
        this.splitPercentages[entry[0]] = portion
      }
    },
    changeSplitAmount (memberId) {
      let groupMemberEntries = Object.entries(this.groupMembers)
      let changeIndex = groupMemberEntries.findIndex(m => m[0] === memberId)
      let sum = groupMemberEntries.slice(0, changeIndex + 1)
        .map(entry => this.splitAmounts[entry[0]])
        .reduce((total, x) => total + x)
      let portion = Math.min(this.amount, Math.max(0,
        (this.amount - sum) / (groupMemberEntries.length - (changeIndex + 1))))
      if (isNaN(portion)) {
        portion = null
      }
      for (let entry of groupMemberEntries.slice(changeIndex + 1)) {
        this.splitAmounts[entry[0]] = portion
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
      if (this.inputExpense.proportionalSplitting) {
        this.sharingMembersEnterType = 'split'
        this.splitType = this.inputExpense.proportionalSplitting.splitType
        if (this.splitType === 'percentages') {
          for (let p of this.inputExpense.proportionalSplitting.percentages) {
            this.splitPercentages[p.groupMember] = p.percentage * 100
          }
        } else if (this.splitType === 'amounts') {
          for (let a of this.inputExpense.proportionalSplitting.amounts) {
            this.splitAmounts[a.groupMember] = a.amount
          }
        }
      } else {
        this.sharingMembersEnterType = this.sharingGroupMembers.length > 0 ? 'select' : 'all'
      }
      this.isDirectPayment = this.inputExpense.isDirectPayment
    } else {
      this.isDirectPayment = this.addDirectPayment
    }
  },
  watch: {
    // Empty member selection and split type when different radio button is selected
    sharingMembersEnterType () {
      if (this.sharingMembersEnterType !== 'select') {
        this.sharingGroupMembers = []
      }
      if (this.sharingMembersEnterType !== 'split') {
        this.splitType = 'none'
      } else if (this.splitType === 'none') {
        this.splitType = 'percentages'
        this.changeSplitType()
      }
    }
  },
  validations () {
    // Static validations
    let validations = {
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
      },
      splitPercentages: { $each: {} }, // Dummy entry
      splitAmounts: { $each: {} } // Dummy entry
    }
    if (this.sharingMembersEnterType === 'split' && this.splitType === 'percentages') {
      // Validation of splitting percentages
      validations.splitPercentages = {
        $each: {
          decimal,
          between: between(0, 100)
        },
        valuesSumTo: valuesSumTo(_ => 100)
      }
    } else if (this.sharingMembersEnterType === 'split' && this.splitType === 'amounts') {
      // Validation of splitting amounts
      validations.splitAmounts = {
        $each: {
          decimal,
          minValue: minValue(0)
        },
        valuesSumTo: valuesSumTo(vue => vue.amount)
      }
    }
    return validations
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
