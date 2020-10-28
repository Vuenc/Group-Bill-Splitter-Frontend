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
        <a-radio-group v-model="sharingMembersEnterType" @change="changeSharedBy">
          <a-radio value="all">All group members (current and future members)</a-radio>
          <a-radio value="select" @click="focusSharedMemberSelection">Split evenly between:</a-radio>
          <a-select ref="selectSharingGroupMembersElement"
                    v-model="sharingGroupMembers"
                    mode="multiple"
                    style="width: 100%"
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
            <a-popover title="Recent splittings" placement="top" trigger="focus">
              <a-radio-button value="percentage">
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
            <a-radio-button value="amount">Split by amount</a-radio-button>
          </a-radio-group>
        </a-radio-group>
        <div v-for="(member, memberIndex) in groupMembers"
             :key="'percentage' + member._id" v-show="splitType === 'percentage'">
          <a-col  style="flex-grow: 100; display: flex; justify-content: space-between" :offset=1 :span=7>
            <label class="ant-form-item ant-form-item-label nowrap somemarginright">{{member.name}}:</label>
          </a-col>
          <a-col>
            <a-input-number :ref="`percentageInput${memberIndex}`" :default-value="100" :min="0" :max="100" v-model="splitPercentages[member._id]"
                            :formatter="value => `${value}%`" :parser="value => value.replace('%', '')"/>
          </a-col>
        </div>
        <div v-for="(member, memberIndex) in groupMembers"
             :key="'amount' + member._id" v-show="splitType === 'amount'">
          <a-col  style="flex-grow: 100; display: flex; justify-content: space-between" :offset=1 :span=7>
            <label class="ant-form-item ant-form-item-label nowrap somemarginright">{{member.name}}:</label>
          </a-col>
          <a-col>
            <a-input-number :ref="`amountInput${memberIndex}`"  :default-value="100" :min="0" :max="100" v-model="splitAmounts[member._id]"
                            :formatter="value => `${value}${currencyPrefix}`" :parser="value => value.replace(currencyPrefix, '')"/>
          </a-col>
        </div>
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
      sharingMembersEnterType: 'all', // valid: 'all', 'select', 'split'
      isDirectPayment: false,
      splitType: 'none', // valid: 'none', 'percentage', 'amount'
      splitPercentages: Object.fromEntries(Object.keys(this.groupMembers).map(id => [id, 0])),
      splitAmounts: Object.fromEntries(Object.keys(this.groupMembers).map(id => [id, 0])),
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
      if (this.splitType === 'percentage') {
        this.$nextTick(() => this.$refs['percentageInput' + firstMemberId][0].focus())
      } else if (this.splitType === 'amount') {
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
    },
    // Empty member selection and split type when different radio button is selected
    changeSharedBy () {
      console.log('changeSharedBy')
      if (this.sharingMembersEnterType !== 'select') {
        this.sharingGroupMembers = []
      }
      if (this.sharingMembersEnterType !== 'split') {
        this.splitType = 'none'
      } else {
        this.splitType = 'percentage'
      }
    },
    changeSplitType () {
      if (this.sharingMembersEnterType !== 'split') {
        this.sharingMembersEnterType = 'split'
      }
      this.focusProportionalSplittingInput()
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
      this.isDirectPayment = this.inputExpense.isDirectPayment
    } else {
      this.isDirectPayment = this.addDirectPayment
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
