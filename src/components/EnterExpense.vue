<template>
  <a-form @submit.prevent="$emit('submit')">
    <a-form-item :label="'Description' + (mode !== 'multi-edit' ? '' :
      (description ? '' : ' (different values)'))"
                 :class="(mode !== 'multi-edit' || description) ? '' : 'leave-unchanged-form-item'">
      <a-input ref="descriptionInput" v-model="description" :placeholder="mode !== 'multi-edit' ?
                  'What was paid for?' : '(leave unchanged)'"
               :class="{'input-error': $v.description.$error}"></a-input>
    </a-form-item>
    <a-form-item :label="'Amount' + (mode !== 'multi-edit' ? '' :
      (amount ? '' : ' (different values)'))"
                 :class="(mode !== 'multi-edit' || amount) ? '' : 'leave-unchanged-form-item'">
      <div>
        <a-row type="flex" justify="space-between">
          <a-col :span=9  class="somemarginright">
            <a-input ref="amountInput"
                     style="min-width: 100%"
                     v-model="amount"
                     :placeholder="mode !== 'multi-edit' ? 'How much?' : '(leave unchanged)'"
                     :class="{'input-error': $v.amount.$error}"
                     @blur="formatAmount"
            ></a-input>
          </a-col>
          <a-col  style="flex-grow: 100; display: flex; justify-content: space-between">
              <label :class="(mode !== 'multi-edit' || payingGroupMember) ? '' : ' leave-unchanged-label'">
                {{groupEvent.currencyPrefix}}</label>
              <label :class="'ant-form-item ant-form-item-label nowrap somemarginright'
                + ((mode !== 'multi-edit' || payingGroupMember) ? '' : ' leave-unchanged-label')">Paid by:</label>
          </a-col>
          <a-col :span=10>
            <a-select ref="payingGroupMemberInput"
                      :placeholder="mode !== 'multi-edit' ? 'Who paid?' : '(leave unchanged)'"
                      style="min-width: 100%"
                      v-model="payingGroupMember"
                      :class="{'input-error': $v.payingGroupMember.$error}"
                      showSearch
                      :filterOption="true"
                      optionFilterProp="name"
                      :showAction="['focus', 'click']"
                      allow-clear
            >
              <a-select-option v-for="member in groupMembers"
                               :key="`payingMember${member._id}`"
                               :name="member.name"
                               :value="member._id"
              >
                {{member.name}}</a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </div>
    </a-form-item>
    <div v-if="!isDirectPayment">
      <a-form-item :label="'Shared by' + (mode !== 'multi-edit' ? '' :
          (sharingMembersEnterType ? '' : ' (different values)'))"
                   :class="(mode !== 'multi-edit' || sharingMembersEnterType) ? '' : 'leave-unchanged-form-item'">
        <a-radio-group v-model="sharingMembersEnterType">
          <a-radio value="all"
                   @keypress.enter.prevent="sharingMembersEnterType='all'"
          >All group members (current and future members)</a-radio>
          <a-radio value="select" style="margin-top: 5px; margin-bottom: 5px"
                   @click="focusSharedMemberSelection"
                   @keypress.enter.prevent="sharingMembersEnterType='select'; focusSharedMemberSelection()"
          >
            Split evenly between:</a-radio>
          <a-select ref="sharingGroupMembersInput"
                    v-model="sharingGroupMembers"
                    mode="multiple"
                    style="width: 100%; margin-bottom: 10px"
                    @focus="sharingMembersEnterType = 'select'"
                    placeholder="Select users..."
                    :class="{'input-error': $v.sharingGroupMembers.$error}"
                    :filterOption="true"
                    optionFilterProp="name"
                    allow-clear
                    v-force-tabindex-minus-one
          >
            <a-select-option v-for="member in groupMembers"
                             :key="`sharingMember${member._id}`"
                             :value="member._id"
                             :name="member.name"
                             :class="{'input-error': $v.payingGroupMember.$error}"
            >{{member.name}}</a-select-option>
          </a-select>
          <a-radio value="split" @keypress.enter.prevent="sharingMembersEnterType='split'">
            Split proportionally:
          </a-radio>
          <a-radio-group default-value="none" button-style="solid" v-model="splitType"
                         @change="changeSplitType">
            <a-radio-button value="percentages"
                            @keypress.enter.prevent="splitType='percentages'; changeSplitType()"
            >
              Split by percentage
            </a-radio-button>
            <a-radio-button value="amounts"
                            @keypress.enter.prevent="splitType='amounts'; changeSplitType()"
            >
              Split by amount</a-radio-button>
          </a-radio-group>
        </a-radio-group>
        <a-row style="margin-top: 3px; margin-bottom: 3px" v-show="!percentageSplitSuggestionsLoading">
          <a-col :span="!showOverflownSuggestionButtons ? 23 : 24"
                 :class="!showOverflownSuggestionButtons ? 'collapsed-suggestion-row' : 'opened-suggestion-row'">
            <a-tooltip v-for="(splitOption, index) in percentageSplitSuggestions" :key="`splitSuggestion${index}`"
                       placement="top"
                       :title="splitOption.map(p => `${groupMembers[p.groupMember].name}: ${p.percentage * 100}%`).join(', ')"
                       :mouseLeaveDelay="0"
            >
              <a-button v-model="splitOption.checked"
                        size="small" class="suggestion-button"
                        @click="loadProportionalSplitting({splitType: 'percentages', percentages: splitOption})"
                        tabindex="-1"
                        :ref="`splitSuggestionButton${index}`"
              >
                {{splitOption.map(p => `${p.percentage * 100}%`).join(' / ')}}
              </a-button>
            </a-tooltip>
          </a-col>
          <a-col :span=1 class="overflow-show-more-button-column"
                 v-show="overflownSplitSuggestions.length > 0 && !showOverflownSuggestionButtons">
            <a-tooltip title="Show more suggestions" placement="top" :mouseLeaveDelay="0">
              <a-button size="small" type="link" icon="double-right"
                        class="centered-icon-button"
                        @click="showOverflownSuggestionButtons = true"
                        tabindex="-1"
              />
            </a-tooltip>
          </a-col>
        </a-row>
        <a-row class="suggestions-loading-spinner" v-if="percentageSplitSuggestionsLoading">
          <a-spin size="small" />
        </a-row>
        <a-row v-for="(member, memberId) in groupMembers"
             :key="'percentages' + memberId"
             v-show="splitType === 'percentages' && percentageInputShown(memberId)">
          <a-col  style="flex-grow: 100; display: flex; justify-content: space-between" :offset=1 :span=7>
            <label class="ant-form-item ant-form-item-label nowrap somemarginright ellipsis-label">{{member.name}}:</label>
          </a-col>
          <a-col :span=5 class="somemarginright">
            <a-input :ref="`percentageInput${memberId}`"
                     v-model.number="splitPercentages[memberId]"
                     type="number" step="any"
                     @change="changeSplitPercentage(memberId)"
                     @focus="onPercentageInputFocus(memberId)"
                     @blur="onPercentageInputBlur(memberId)"
                     :class="{'input-error': ($v.splitPercentages.$each[memberId].$error) ||
                                  ($v.splitPercentages.$dirty && !$v.splitPercentages.valuesSumTo) ||
                                  (!$v.splitPercentages.sumNotTooLarge && splitPercentages[memberId] > 0)}"
            />
          </a-col>
          <a-col :span=1>
            <label>%</label>
          </a-col>
          <a-col :offset=1 :span=5
                 v-show="splitPercentages[memberId] >= 0 && splitPercentages[memberId] <= 100 && amount">
            <label class="calculation-label">{{groupEvent.currencyPrefix}} {{amount * splitPercentages[memberId] / 100 | currency}}</label>
          </a-col>
        </a-row>
        <a-row  v-if="splitType === 'percentages' && !allPercentageInputsShown" >
          <a-col :offset=1>
            <a @click="percentageInputsDisableAutoHide=true" size="small" tabindex="-1">Show all</a>
          </a-col>
        </a-row>
        <a-row v-for="(member, memberId) in groupMembers"
             :key="'amounts' + memberId"
             v-show="splitType === 'amounts'  && amountInputShown(memberId)">
          <a-col  style="flex-grow: 100; display: flex; justify-content: space-between" :offset=1 :span=7>
            <label class="ant-form-item ant-form-item-label nowrap somemarginright ellipsis-label">{{member.name}}:</label>
          </a-col>
          <a-col :span=5 class="somemarginright">
            <a-input :ref="`amountInput${memberId}`"
                      v-model.number="splitAmounts[member._id]"
                     type="number" step="any"
                     @change="changeSplitAmount(memberId)"
                     @focus="onAmountInputFocus(memberId)"
                     @blur="onAmountInputBlur(memberId)"
                     :class="{'input-error': ($v.splitAmounts.$each[memberId].$error)
                                  || ($v.splitAmounts.$dirty && !$v.splitAmounts.valuesSumTo) ||
                                  (!$v.splitAmounts.sumNotTooLarge && splitAmounts[memberId] > 0)}"
            />
          </a-col>
          <a-col :span=1>
            <label>{{groupEvent.currencyPrefix}}</label>
          </a-col>
        </a-row>
        <a-row v-if="splitType === 'amounts' && !allAmountInputsShown" >
          <a-col :offset=1>
            <a @click="amountInputsDisableAutoHide=true" size="small" tabindex="-1" >Show all</a>
          </a-col>
        </a-row>
      </a-form-item>
    </div>
    <div v-if="isDirectPayment">
      <a-form-item>
        <a-row type="flex" justify="space-between">
          <a-col  style="flex-grow: 100; display: flex; justify-content: right">
            <label :class="'ant-form-item ant-form-item-label nowrap somemarginright'
              + ((mode !== 'multi-edit' || sharingGroupMembers.length > 0) ? '' : ' leave-unchanged-label')">Paid to:</label>
          </a-col>
          <a-col :span=10>
            <a-select ref="paidToGroupMemberInput"
                      :placeholder="mode !== 'multi-edit' ? 'To who?' : '(leave unchanged)'"
                      style="min-width: 100%"
                      v-model="sharingGroupMembers[0]"
                      :class="{'input-error': $v.sharingGroupMembers.$error}"
                      showSearch
                      :filterOption="true"
                      optionFilterProp="name"
                      :showAction="['focus', 'click']"
            >
              <a-select-option v-for="member in groupMembers"
                               :key="`receivingMember${member._id}`"
                               :value="member._id"
                               :name="member.name"
              >
                {{member.name}}</a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </a-form-item>
    </div>

    <a-form-item :label="'Date' + (mode !== 'multi-edit' ? '' :
                    (date ? '' : ' (different values)'))"
                 :class="(mode !== 'multi-edit' || date) ? '' : 'leave-unchanged-form-item'"
    >
      <a-date-picker ref="dateInput"
                     v-model=date
                     :placeholder="mode !== 'multi-edit' ? 'Select Date...' : '(leave unchanged)'"
                     :showAction="['focus', 'click']"
      />
      <a-button html-type="submit" style="visibility: hidden"/>
    </a-form-item>
  </a-form>
</template>

<script>
import Vue from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import { decimal, requiredIf, between, minValue } from 'vuelidate/lib/validators'
import moment from 'moment'
import GroupBillSplitterService from '@/services/groupbillsplitterservice'

Vue.use(Antd)

const isNearlyEqual = (num1, num2) => {
  const epsilon = 1.192092896e-07
  return Math.abs(num1 - num2) < epsilon
}

// If true, num1 >= num2 even accounting for a little error (num1 is at least epsilon greater)
const isSurelyGreaterOrEqual = (num1, num2) => {
  const epsilon = 1.192092896e-07
  return num1 - epsilon >= num2
}

// custom vuelidate validators
const valuesSumTo = (sumValueLambda) =>
  (obj, vue) => isNearlyEqual(Object.values(obj).reduce((total, x) => total + x, 0), sumValueLambda(vue))
const sumNotMoreThan = (sumValueLambda) => (obj, vue) =>
  isSurelyGreaterOrEqual(Object.values(obj).reduce((total, x) => total + x, 0), sumValueLambda(vue)) !== true

const validateIf = (validator, condition) =>
  (value, vue) => !condition() || validator(value, vue)
// caveat: real vue vm object is not passed in nested validators, e.g. $each

export default {
  name: 'EnterExpense',
  data () {
    return {
      description: '',
      amount: null,
      payingGroupMember: undefined, // only `undefined` ensures the placeholder in the ant-select element shows up
      sharingGroupMembers: [],
      date: moment(),
      sharingMembersEnterType: 'all', // valid: 'all', 'select', 'split'
      isDirectPayment: false,
      splitType: 'none', // valid: 'none', 'percentages', 'amounts'
      splitPercentages: Object.fromEntries(Object.keys(this.groupMembers).map(id => [id, null])),
      splitAmounts: Object.fromEntries(Object.keys(this.groupMembers).map(id => [id, null])),
      percentageSplitSuggestions: [],
      percentageSplitSuggestionsLoading: false,
      percentageInputsDisableAutoHide: false,
      amountInputsDisableAutoHide: false,
      focusedPercentageInputs: Object.fromEntries(Object.keys(this.groupMembers).map(id => [id, null])),
      focusedAmountInputs: Object.fromEntries(Object.keys(this.groupMembers).map(id => [id, null])),
      overflownSplitSuggestions: [],
      showOverflownSuggestionButtons: false,
      sumUpToCurrentPercentageInput: 0,
      sumUpToCurrentAmountInput: 0
    }
  },
  props: ['groupMembers', 'inputExpense', 'groupEvent', 'multiEditInputExpenses',
    'focusInput', // valid: 'description', 'amount', 'payingGroupMember', 'paidToGroupMember, 'splitting', 'date', null
    'mode' // valid: 'add', 'edit', 'multi-edit'
  ],
  filters: { // https://stackoverflow.com/questions/48132763/reduce-decimal-places-and-add-commas-using-vue-js
    currency (amount) {
      const amt = Number(amount)
      return (amt && amt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})) || '0'
    }
  },
  methods: {
    // Focus the 'sharing members' component on press of the radio button
    focusSharedMemberSelection () {
      this.$refs.sharingGroupMembersInput.focus()
    },
    // Focus the first number input on selection of proportional splitting
    focusProportionalSplittingInput () {
      let firstMemberId = Object.keys(this.groupMembers)[0]
      if (this.splitType === 'percentages') {
        this.focusedPercentageInputs[firstMemberId] = true
        this.$nextTick(() => this.$refs['percentageInput' + firstMemberId][0].focus())
      } else if (this.splitType === 'amounts') {
        this.focusedAmountInputs[firstMemberId] = true
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
        date: this.date ? this.date.format('YYYY-MM-DD') : undefined,
        isDirectPayment: this.isDirectPayment
      }
      if (this.sharingMembersEnterType === 'split') {
        if (this.splitType === 'percentages') {
          expense.proportionalSplitting = { splitType: this.splitType,
            percentages: Object.entries(this.splitPercentages)
              .filter(p => p[1] > 0)
              .map(p => { return {groupMember: p[0], percentage: p[1] / 100} }) }
        } else if (this.splitType === 'amounts') {
          expense.proportionalSplitting = { splitType: this.splitType,
            amounts: Object.entries(this.splitAmounts)
              .filter(a => a[1] > 0)
              .map(a => { return {groupMember: a[0], amount: a[1]} }) }
        }
      }

      if (this.mode === 'edit') {
        expense._id = this.inputExpense._id
      } else if (this.mode === 'multi-edit') {
        if (this.sharingMembersEnterType === 'all') {
          expense.sharingGroupMembers = []
        } else if (this.sharingMembersEnterType === 'split' || !this.sharingMembersEnterType) {
          // Unset sharingGroupMembers if proportional splitting or no splitting is selected
          expense.sharingGroupMembers = undefined
        }
        // Delete entries that have no entries and should therefore stay unchanged
        Object.entries(expense).forEach(([key, val]) => val || this.VALID_FALSY_VALUES.has(val) || delete expense[key])
      }
      confirmationCallback(expense, this.mode)
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
      this.updateSumUpToCurrentPercentageInput(memberId)
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
      this.updateSumUpToCurrentAmountInput(memberId)
    },
    // returns helper method which is used to check if multiple expenses have the same proportional splitting.
    hasSameSplittingAsFirstExpense (firstExpense) {
      let splittingsEqual = this.splittingsEqual // capture helper function into lambda context
      return function (e) {
        if (!e.proportionalSplitting ||
            e.proportionalSplitting.splitType !== firstExpense.proportionalSplitting.splitType) {
          return false
        }
        if (e.proportionalSplitting.splitType === 'percentages') {
          return splittingsEqual(firstExpense.proportionalSplitting.percentages,
            e.proportionalSplitting.percentages, 'percentage')
        } else if (e.proportionalSplitting.splitType === 'amounts') {
          return splittingsEqual(firstExpense.proportionalSplitting.amounts,
            e.proportionalSplitting.amounts, 'amount')
        }
      }
    },
    splittingsEqual (split1, split2, type) {
      // type: 'percentage' or 'amount'.
      let entries1 = split1.map(p => [p.groupMember, p[type]])
      let entries2 = Object.fromEntries(split2.map(p => [p.groupMember, p[type]]))

      // Check if all non-zero splitting entries of current expense have equal counterpart in first expense
      return split1.length === split2.length && entries1.every(([groupMember, val]) =>
        isNearlyEqual(val, 0) || isNearlyEqual(val, entries2[groupMember]))
    },
    loadProportionalSplitting (proportionalSplitting) {
      this.sharingMembersEnterType = 'split'
      this.splitType = proportionalSplitting.splitType
      if (this.splitType === 'percentages') {
        // initialize all values to 0
        Object.keys(this.splitPercentages).forEach(key => { this.splitPercentages[key] = 0 })
        // load available values
        for (let p of proportionalSplitting.percentages) {
          this.splitPercentages[p.groupMember] = p.percentage * 100
        }
      } else if (this.splitType === 'amounts') {
        // initialize all values to 0
        Object.keys(this.splitAmounts).forEach(key => { this.splitAmounts[key] = 0 })
        // load available values
        for (let a of proportionalSplitting.amounts) {
          this.splitAmounts[a.groupMember] = a.amount
        }
      }
    },
    initializeSingleEditMode: function (inputExpense) {
      // Initialize fields from inputExpense
      this.description = inputExpense.description
      this.amount = inputExpense.amount
      this.payingGroupMember = inputExpense.payingGroupMember
      this.sharingGroupMembers = inputExpense.sharingGroupMembers || [] // [] if not given
      if (inputExpense.date) {
        this.date = moment(inputExpense.date)
      }
      this.isDirectPayment = inputExpense.isDirectPayment || false // false if not given

      // Set sharing/proportional splitting type, load proportional splitting if present
      if (inputExpense.proportionalSplitting) {
        this.loadProportionalSplitting(inputExpense.proportionalSplitting)
      } else {
        this.sharingMembersEnterType = this.sharingGroupMembers.length > 0 ? 'select' : 'all'
      }
    },
    initializeMultiEditMode: function (multiEditInputExpenses) {
      // Initialize fields that are equal across all input expenses, or to empty values otherwise.
      let firstExpense = multiEditInputExpenses[0]
      this.description = multiEditInputExpenses.every(e => e.description === firstExpense.description)
        ? firstExpense.description : null
      this.amount = multiEditInputExpenses.every(e => isNearlyEqual(e.amount, firstExpense.amount))
        ? firstExpense.amount : null
      this.payingGroupMember = multiEditInputExpenses.every(e =>
        e.payingGroupMember === firstExpense.payingGroupMember) ? firstExpense.payingGroupMember : undefined
      let firstExpenseSharingGroupMembers = firstExpense.sharingGroupMembers.sort()
      this.sharingGroupMembers = multiEditInputExpenses.every(e => !e.proportionalSplitting &&
        e.sharingGroupMembers.length === firstExpenseSharingGroupMembers.length &&
        e.sharingGroupMembers.sort().every((member, index) => member === firstExpenseSharingGroupMembers[index]))
        ? firstExpense.sharingGroupMembers : undefined
      this.date = multiEditInputExpenses.every(e => e.date === firstExpense.date)
        ? moment(firstExpense.date) : null

      // Only set proportional splitting if it is enabled for all expenses and all have the same `splitType`
      if (firstExpense.proportionalSplitting &&
        multiEditInputExpenses.every(this.hasSameSplittingAsFirstExpense(firstExpense))) {
        this.loadProportionalSplitting(firstExpense.proportionalSplitting)
      } else if (!firstExpense.proportionalSplitting && this.sharingGroupMembers) {
        this.sharingMembersEnterType = this.sharingGroupMembers.length > 0 ? 'select' : 'all'
      } else {
        this.sharingMembersEnterType = null
      }

      // Parent component must ensure multiEditInputExpenses contains only one kind, either direct payments or expenses.
      this.isDirectPayment = firstExpense.isDirectPayment
      if (this.isDirectPayment && !this.sharingGroupMembers) {
        this.sharingGroupMembers = [] // Make sure no render errors due to accessing sharingGroupMembers occur
      }
    },
    percentageInputShown (groupMemberId) {
      return this.percentageInputsDisableAutoHide ||
        (this.anyPercentageInputFocused() && this.sumUpToCurrentPercentageInput < 100) ||
        this.splitPercentages[groupMemberId] > 0 ||
        isNearlyEqual(Object.values(this.splitPercentages).reduce((a, b) => a + b, 0), 100) !== true
    },
    amountInputShown (groupMemberId) {
      return this.amountInputsDisableAutoHide ||
        (this.anyAmountInputFocused() && this.sumUpToCurrentAmountInput < this.amount) ||
        this.splitAmounts[groupMemberId] > 0 ||
        !this.amount ||
        isNearlyEqual(Object.values(this.splitAmounts).reduce((a, b) => a + b, 0), this.amount) !== true
    },
    onPercentageInputFocus (memberId) {
      this.$refs[`percentageInput${memberId}`][0].$el.select()
      this.focusedPercentageInputs[memberId] = true
    },
    onPercentageInputBlur (memberId) {
      this.$nextTick(() => setTimeout(() => { this.focusedPercentageInputs[memberId] = false }, 1))
    },
    onAmountInputFocus (memberId) {
      this.$refs[`amountInput${memberId}`][0].$el.select()
      this.focusedAmountInputs[memberId] = true
    },
    onAmountInputBlur (memberId) {
      this.$nextTick(() => setTimeout(() => { this.focusedAmountInputs[memberId] = false }, 1))
    },
    anyPercentageInputFocused () {
      return !Object.values(this.focusedPercentageInputs).every(b => !b)
    },
    anyAmountInputFocused () {
      return !Object.values(this.focusedAmountInputs).every(b => !b)
    },
    updateSumUpToCurrentPercentageInput (memberId) {
      let sumUpToHere = Object.entries(this.splitPercentages).reduce(([sum, stop], [id, p]) => {
        return [stop ? sum : sum + p, stop || id === memberId]
      }, [0, false])[0]
      this.sumUpToCurrentPercentageInput = sumUpToHere
    },
    updateSumUpToCurrentAmountInput (memberId) {
      let sumUpToHere = Object.entries(this.splitAmounts).reduce(([sum, stop], [id, p]) => {
        return [stop ? sum : sum + p, stop || id === memberId]
      }, [0, false])[0]
      this.sumUpToCurrentAmountInput = sumUpToHere
    },
    fetchSplitSuggestions () {
      const maxPopularSplittings = 3
      const maxRecentSplittings = 3

      this.percentageSplitSuggestionsLoading = true

      let splittingSuggestionsPromise = Promise.all([
        GroupBillSplitterService.fetchPopularPercentagesSplittings(this.groupEvent._id, maxPopularSplittings),
        GroupBillSplitterService.fetchRecentPercentagesSplittings(this.groupEvent._id, maxRecentSplittings)
      ])
      splittingSuggestionsPromise
        .then(([popularRes, recentRes]) => this.loadSplitSuggestions(popularRes.data, recentRes.data))
        .catch(err => {
          console.log(err)
          this.percentageSplitSuggestionsLoading = false
        })
    },
    loadSplitSuggestions (popularSplittings, recentSplittings) {
      // Interleave the two arrays (first popular, first recent, second popular, second recent, etc.)
      let allSuggestions = Object.entries(popularSplittings).map(([i, s]) => ({priority: Number(i) * 2, s}))
        .concat(Object.entries(recentSplittings).map(([i, s]) => ({priority: Number(i) * 2 + 1, s})))
        .sort((i, j) => i.priority > j.priority)
        .map(k => k.s.percentages)
      // De-duplicate the combined array (individual arrays already de-duplicated)
      for (let i = allSuggestions.length - 1; i > 0; i--) {
        for (let j = 0; j < i; j++) {
          if (this.splittingsEqual(allSuggestions[i], allSuggestions[j], 'percentage')) {
            allSuggestions.splice(i, 1)
            break
          }
        }
      }
      this.percentageSplitSuggestions = allSuggestions
      this.percentageSplitSuggestionsLoading = false
    },
    calculateOverflownSplitSuggestions () {
      if (!this.$refs[`splitSuggestionButton0`]) {
        return
      }
      let firstButtonY = this.$refs[`splitSuggestionButton0`][0].$el.getBoundingClientRect().top
      this.overflownSplitSuggestions = Object.entries(this.percentageSplitSuggestions)
        .map(([i, suggestion]) => [this.$refs[`splitSuggestionButton${i}`][0], suggestion])
        .filter(([button, suggestion]) =>
          button.$el.getBoundingClientRect().top > firstButtonY)
        .map(([button, suggestion]) => suggestion)
    }
  },
  computed: {
    allPercentageInputsShown () {
      return this.percentageInputsDisableAutoHide ||
        (this.anyPercentageInputFocused() && this.sumUpToCurrentPercentageInput < 100) ||
        Object.values(this.splitPercentages).every(p => p > 0) ||
        isNearlyEqual(Object.values(this.splitPercentages).reduce((a, b) => a + b, 0), 100) !== true
    },
    allAmountInputsShown () {
      return this.amountInputsDisableAutoHide ||
        (this.anyAmountInputFocused() && this.sumUpToCurrentAmountInput < this.amount) ||
        Object.values(this.splitAmounts).every(a => a > 0) ||
        !this.amount ||
        isNearlyEqual(Object.values(this.splitAmounts).reduce((a, b) => a + b, 0), this.amount) !== true
    }
  },
  created () {
    // Constants
    // valid falsy values = falsy values that are considered valid as inputs of the expense form
    this.VALID_FALSY_VALUES = new Set([true, false, 0])

    if (!this.inputExpense || !this.inputExpense.isDirectPayment) {
      this.fetchSplitSuggestions()
    }

    if (this.mode === 'edit' || (this.mode === 'add' && this.inputExpense)) {
      // Initialize fields from input expense
      this.initializeSingleEditMode(this.inputExpense)
    } else if (this.mode === 'multi-edit') {
      // Initialize multi-edit mode
      this.initializeMultiEditMode(this.multiEditInputExpenses)
    }
    // Otherwise, nothing to initialize for adding a fresh expense
  },
  mounted () {
    // focusInput can be: 'description', 'amount', 'payingGroupMember', 'paidToGroupMember, 'splitting', 'date', null
    this.$nextTick(() => {
      let focusComponent = this.$refs[`${this.focusInput}Input`]
      if (this.focusInput === 'splitting') {
        if (this.sharingGroupMembers && this.sharingGroupMembers.length > 0) {
          // Focus sharing group members list for 'select' splitting
          this.$refs.sharingGroupMembersInput.focus()
        } else {
          // Focus proportional splitting input for 'percentages'/'amounts' splitting or do nothing for 'all' splitting
          this.focusProportionalSplittingInput()
        }
      } else if (this.focusInput === 'payingGroupMember' || this.focusInput === 'paidToGroupMember') {
        setTimeout(() => focusComponent.focus(), 150)
      } else if (this.focusInput === 'date') {
        focusComponent.focus()
        // Hacky way to scroll the date element into focus after the modal animation which I don't have control over
        for (let timeout of [100, 150]) {
          setTimeout(() => focusComponent.$el.scrollIntoView({behavior: 'smooth', block: 'start'}), timeout)
        }
      } else if (this.focusInput) {
        focusComponent.focus()
        focusComponent.select()
      }
    })
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
    },
    percentageSplitSuggestions () {
      console.log('updating')
      this.$nextTick(() => this.calculateOverflownSplitSuggestions())
    }
  },
  directives: {
    // Necessary on a-select: https://github.com/shentao/vue-multiselect/issues/401
    forceTabindexMinusOne: {
      inserted (_el) {
        let forceTabIndexMinusOneFunc = el => {
          el.setAttribute('tabindex', -1)
          for (let c of el.children) {
            forceTabIndexMinusOneFunc(c)
          }
        }
        forceTabIndexMinusOneFunc(_el)
      }
    }
  },
  validations () {
    // hacky way to access vue vm in *nested* custom validators: the following lambdas capture this vue object
    let vue = this

    // helper check methods for conditional validations
    const hasPercentagesSplitting = () => vue.sharingMembersEnterType === 'split' && vue.splitType === 'percentages'
    const hasAmountsSplitting = () => vue.sharingMembersEnterType === 'split' && vue.splitType === 'amounts'

    let validations = {
      description: {
        requiredIf: requiredIf(vue => vue.mode !== 'multi-edit')
      },
      amount: {
        requiredIf: requiredIf(vue => vue.mode !== 'multi-edit' ||
          (vue.sharingMembersEnterType === 'split' && vue.splitType === 'amounts')),
        decimal
      },
      payingGroupMember: {
        requiredIf: requiredIf(vue => vue.mode !== 'multi-edit')
      },
      date: {
        requiredIf: requiredIf(vue => vue.mode !== 'multi-edit')
      },
      sharingGroupMembers: {
        requiredIf: requiredIf((vue) => vue.sharingMembersEnterType === 'select')
      },
      splitPercentages: {
        $each: {
          decimal: validateIf(decimal, hasPercentagesSplitting),
          between: validateIf(between(0, 100), hasPercentagesSplitting)
        },
        valuesSumTo: validateIf(valuesSumTo(_ => 100), hasPercentagesSplitting),
        sumNotTooLarge: validateIf(sumNotMoreThan(_ => 100), hasPercentagesSplitting)
      },
      splitAmounts: {
        $each: {
          decimal: validateIf(decimal, hasAmountsSplitting),
          minValue: validateIf(minValue(0), hasAmountsSplitting)
        },
        valuesSumTo: validateIf(valuesSumTo(vue => vue.amount), hasAmountsSplitting),
        sumNotTooLarge: validateIf(sumNotMoreThan(vue => vue.amount), hasAmountsSplitting)
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
  .leave-unchanged-form-item >>> .ant-form-item-label > label,
  .leave-unchanged-label,
  .leave-unchanged-form-item >>> .ant-radio-wrapper,
  .leave-unchanged-form-item >>> .ant-radio-button-wrapper,
  .leave-unchanged-form-item >>> .ant-btn {
    color: #aaaaaa;
  }
  .calculation-label {
    color: #8c8c8c;
  }
  .suggestion-button >>> span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .centered-icon-button {
    display: flex;
    align-items: center;
  }
  .suggestion-button {
    margin-bottom: 6px;
    margin-inline: 0.5%;
    overflow: hidden;
    max-width: 49%;
  }
  .collapsed-suggestion-row {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    height: 24px;
    overflow: hidden;
  }
  .opened-suggestion-row {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    overflow: hidden;
  }
  .suggestions-loading-spinner {
    height: 24px;
    margin-top: 3px;
    margin-bottom: 3px;
  }
  .overflow-show-more-button-column {
    align-items: center;
    display: flex;
    justify-content: end;
    height: 24px
  }
  .ellipsis-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
