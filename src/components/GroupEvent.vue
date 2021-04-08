<template>
  <div ref="outerDiv">
    <a-row class="somemorepadding"  style="padding: 30px 30px 5px 0px; margin-bottom: 30px; background: #1890ff">
      <div style="margin-left: 4%; display: flex">
        <h1 class="leftaligned" style="white-space: nowrap">
          <label style="color: #eeeeee; font-family: 'Cantarell'; font-size: 120%">
            Event:
          </label>
          <label style="color: white; font-family: 'Cantarell Light'; font-size: 140%; margin-left: 10px">
            {{groupEvent.name}}
          </label>
        </h1>
        <div style="display: flex; flex-direction: column; justify-content: center; margin-left: 30px; margin-bottom: 15px;">
          <a-button ref='editGroupEventButton'
                    size="small" shape="circle" icon='edit' type="ghost"
                    @click="editGroupEvent"
                    v-if="groupEvent.name"
                    style="margin-top: 5px"
          />
        </div>
      </div>
    </a-row>
    <div style="display: flex; justify-content: stretch; flex-wrap: nowrap">
      <div style="min-width: 250px; max-width: 250px; margin-left: 4%">
        <affix relative-element-selector="#top-table-div" style="width: 250px">
          <div style="padding-top: 40px">
            <div style="white-space: nowrap; display: flex; justify-content: space-between">
              <h2>
                Group Members:
              </h2>
              <a-button size="small" shape="circle" icon='edit'
                        @click="editGroupMembers"
                        :enabled="!groupMembersLoading"
                        style="margin-top: 5px"/>
            </div>
            <a-list :loading="groupMembersLoading">
              <a-list-item v-for="member of groupMembers" :key="`memberName${member._id}`" style="display: block">
                <a-tooltip placement="right" title="You can customize this using Gravatar!">
                  <a-avatar shape="square" icon="user" :src='member.gravatar' style="margin-right:24px" />
                </a-tooltip>
                <label style="align-self: center">
                  {{member.name}}
                </label>
              </a-list-item>
              <a-list-item v-if="groupMembersLoading" style="margin-top: 30px"></a-list-item>
            </a-list>
          </div>
        </affix>
      </div>
      <div style="max-width: 960px; width: 100%; margin-left: 10%; margin-right: 5%">
        <a-tabs @change="tabChanged" style="font-family: Cantarell" v-model="activeTab">
          <a-tab-pane tab="Manage Expenses" key="expenses">
            <div id="top-table-div">
              <div style="margin: 0px 0px 10px 0px;
                          min-height: 60px;
                          padding: 10px 0px 10px 0px;
                          display: flex;"
              >
                <a-button size="large" type="primary"
                          @click="addExpense()"
                          :enabled="!groupMembersLoading"
                          style="margin-right: 10px"
                >Add Expense</a-button>
                <a-button size="large" type="primary"
                          @click="addPayment()"
                          :enabled="!groupMembersLoading"
                          style="margin-right: auto"
                >Add Payment</a-button>
                <div style="max-width: 50%; width: 300px; display: flex; flex-direction: column; justify-content: center; margin-left: 20px; margin-right: 20px">
                  <a-input placeholder="Search for expenses..."
                           v-model="searchString"
                           :disabled="expenses.length === 0 && !searchString"
                           allow-clear
                  ></a-input>
                </div>
                <div style="display: flex; width: 250px; flex-direction: column; justify-content: center">
                  <a-range-picker v-model="dateRange"
                                  :disabled="expenses.length === 0 && dateRange.length === 0"
                  >
                  </a-range-picker>
                </div>
              </div>
              <div style="margin-bottom: 10px">
                <a-checkbox @change="allSelectedChanged($event.target.checked)"
                            :checked="allExpensesSelected" :indeterminate="someButNotAllExpensesSelected"
                            style="font-size: 16px; padding-bottom: 5px; padding-top: 5px"
                >Select all</a-checkbox>
                <span v-if="selectedExpenses.length > 0" >
                <span style="font-weight: bold; font-size: 16px">
                    {{selectedExpenses.length}} entr{{selectedExpenses.length === 1 ? 'y' : 'ies'}} selected.
                </span>
                  <a-button :disabled="selectedExpenses.length < 2" size="default" shape="circle" icon='edit'
                            @click="editMultipleExpenses(selectedExpenses)"/>
                  <a-popconfirm title="Delete all selected expenses?" @confirm="deleteMultipleExpenses(selectedExpenses)">
                    <a-icon slot="icon" type="question-circle" style="color: red" />
                    <a-button :disabled="selectedExpenses.length < 2" size="default" shape="circle" icon='delete'/>
                  </a-popconfirm>
                  <a-button shape="circle" icon="download" @click="downloadExpensesCsv(selectedExpenses)"/>
                </span>
              </div>
              <a-table id="expenses-table"
                       :columns="columns"
                       :rowKey="expense => `tableRow${expense._id}`"
                       :dataSource="expenses"
                       :pagination="expenses.length > 20 ? {pageSize: 20} : false"
                       v-if="expenses.length > 0 || expensesLoading"
                       :loading="expensesLoading"
                       :rowClassName="expense => expense.isSelected ? 'table-row-selected' : 'table-row-not-selected'"
              >
                <template slot="description" slot-scope="expense">
                  <div @click="editExpense(expense, 'description')"
                       style="cursor: pointer;display: flex; align-items: center; justify-content: space-between">
                    <span style="display: inline-block; justify-content: stretch">
                      {{expense.description}}
                    </span>
                    <a-tooltip v-if="expense.isDirectPayment" placement="top" :title="`Direct payment from
                      ${groupMembers[expense.payingGroupMember].name} to ${groupMembers[expense.sharingGroupMembers[0]].name}`">
                      <a-icon type="arrow-right" style="color: #40a9ff; font-size: 18px"  />
                    </a-tooltip>
                  </div>
                </template>
                <template slot="amount" slot-scope="expense">
                  <div @click="editExpense(expense, 'amount')"
                       class="rightaligned currency-label" style="white-space: nowrap; cursor: pointer">
                    {{groupEvent.currencyPrefix}} {{expense.amount | currency}}
                  </div>
                </template>
                <template slot="payingGroupMember" slot-scope="expense">
                  <div @click="editExpense(expense, 'payingGroupMember')" style="cursor: pointer">
                    {{groupMembers[expense.payingGroupMember].name}}
                  </div>
                </template>
                <template slot="sharingGroupMembers" slot-scope="expense">
                  <div @click="editExpense(expense, !expense.isDirectPayment ? 'splitting' : 'paidToGroupMember')"
                       style="cursor: pointer">
                    <div v-if="expense.sharingGroupMembers.length > 0">
                      {{expense.sharingGroupMembers.map(m => groupMembers[m].name).reduce((a, b) => a + ", " + b)}}
                    </div>
                    <div v-else-if="!expense.proportionalSplitting"><i>Everyone</i></div>
                    <div v-else-if="expense.proportionalSplitting.splitType === 'percentages'">
                      {{Object.values(expense.proportionalSplitting.percentages)
                      .filter(p => p.percentage > 0)
                      .map(p => `${groupMembers[p.groupMember].name} (${(p.percentage*100)
                        .toLocaleString('en', {maximumFractionDigits: 2})}%)`)
                      .reduce((a, b) => a + ", " + b)}}
                    </div>
                    <div v-else-if="expense.proportionalSplitting.splitType === 'amounts'">
                      {{Object.values(expense.proportionalSplitting.amounts)
                      .filter(a => a.amount > 0)
                      .map(a => `${groupMembers[a.groupMember].name} (${a.amount
                        .toLocaleString('en', {maximumFractionDigits: 2})}${groupEvent.currencyPrefix})`)
                      .reduce((a, b) => a + ", " + b)}}
                    </div>
                  </div>
                </template>
                <template slot="date" slot-scope="expense">
                  <div @click="editExpense(expense, 'date')" style="cursor: pointer">
                    {{new Date(expense.date) | dateFormat('DD.MM.YYYY')}}
                  </div>
                </template>
                <template slot="actions" slot-scope="expense">
                  <div style="white-space: nowrap">
                    <!-- <a-button size="small" shape="circle" icon='edit' @click="editExpense(expense)"/> -->
                    <a-icon type="edit" @click="editExpense(expense)" style="margin-right: 3px"/>
                    <a-popconfirm title="Delete this expense?" @confirm="deleteExpense(expense)">
                      <a-icon slot="icon" type="question-circle" style="color: red" />
                      <!-- <a-button size="small" shape="circle" icon='delete'/> -->
                      <a-icon type="delete" style="cursor: pointer"/>
                    </a-popconfirm>
                    <a-checkbox @change="expenseSelectionChanged(expense, $event.target.checked)"
                                v-model="expense.isSelected" style="margin-left: 10px"/>
                  </div>
                </template>
              </a-table>
              <label v-else-if="searchTimeout || searchString || dateRange.length > 0" style="font-family: Cantarell; font-size: 110%">
                No expenses match your search.
              </label>
              <label v-else style="font-family: Cantarell; font-size: 110%">
                There are no expenses yet. Add an expense to get started!
              </label>
            </div>
          </a-tab-pane>
          <a-tab-pane tab="Settle Debts" key="transactions" style="font-family: Cantarell">
            <h2>Transactions</h2>
            <div v-if="transactions.length > 0 || transactionsLoading">
              These transactions settle all debts between the group members:
              <a-list :loading="transactionsLoading"
                      style="margin-top: 10px">
                <a-list-item v-for="transaction of transactions" :key="transaction.source + transaction.target">
                  <div style="font-size: 110%">
                    <label style="margin-right: 1ex;">#{{transactions.indexOf(transaction) + 1}}:</label>
                    <b class="formatting-inline-label">{{groupMembers[transaction.source].name}}</b>
                    pays <label class="formatting-inline-label currency-label" style="font-size: 115%">
                    {{groupEvent.currencyPrefix}} {{transaction.amount | currency}}</label>
                    to <b class="formatting-inline-label">{{groupMembers[transaction.target].name}}</b>
                    <a-button ref='settleTransactionButton'
                              @click="settleTransaction(transaction)"
                              style="margin-right: auto"
                    >Settle</a-button>
                  </div>
                </a-list-item>
                <a-list-item v-if="transactionsLoading" style="margin-top: 30px"></a-list-item>
              </a-list>
            </div>
            <div v-else>
              There are no debts to settle!
            </div>
          </a-tab-pane>
          <a-tab-pane tab="Share Event" key="share" style="font-family: Cantarell">
            <h2>
              Share this Group Event!
            </h2>
            You can share this group event with your friends by sending them this URL:
            <div style="display: flex; margin-top: 20px">
              <div style="display: flex; flex-direction: column; justify-content: center;">
                <a-icon type="link" style="margin-right: 15px; font-size: 24px"></a-icon>
              </div>
              <a-tooltip placement="right" title="Click to copy this link!">
                <label class="link-label"
                       @click="copyUrl"
                >{{groupEventURL}}</label>
              </a-tooltip>
            </div>
          </a-tab-pane>
          <a-tab-pane tab="Export" key="export" style="font-family: Cantarell">
            <h2>Export Group Event</h2>
            <a-button size="large" type="primary"
                      :enabled="this.expenses && this.expenses.length > 0"
                      @click="downloadExpensesCsv(expenses)"
            >Export as CSV</a-button>
            <p>Export all expenses to a CSV file. CSV files can be opened in Excel, Libre Office Calc and
              similar programs. Use this option if you want the data in a human-readable format.</p>
            <a-button size="large" type="primary"
                      :enabled="this.expenses"
                      @click="downloadRawData"
            >Export raw data</a-button>
            <p>Export the raw data of this group event in JSON format. Can be used to backup the data and import it
              again on this site. Use this option if you want to backup the data and you
              do not need a human-readable format.</p>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <a-modal ref="enterExpenseModal"
             v-model="enterExpenseModalVisible"
             :destroyOnClose="true"
             :title="enterExpenseMode === 'multi-edit' ?
                `Edit ${multiEditDialogExpenses.length} Selected ${
                !multiEditDialogExpenses[0].isDirectPayment ? 'Expenses' : 'Payments'}`
                : `${enterExpenseMode === 'add' ? 'Add' : 'Edit'} ${
                !currentDialogExpense || !currentDialogExpense.isDirectPayment ? 'Expense' : 'Payment'}`"
             @ok="expenseModalOkPressed"
             :confirm-loading="enterExpenseLoading"
    >
      <enter-expense-form ref="expenseForm"
                        :groupMembers="groupMembers"
                        :inputExpense="currentDialogExpense"
                        :multiEditInputExpenses="multiEditDialogExpenses"
                        :groupEvent="groupEvent"
                        :focusInput="enterExpenseFocusAttribute"
                        :mode="enterExpenseMode"
                        @submit="expenseModalOkPressed"
      >
      </enter-expense-form>
    </a-modal>
    <a-modal ref="editGroupMembersModal"
             v-model="editGroupMembersModalVisible"
             :destroyOnClose="true"
             title="Manage Group Members"
             @ok="groupMembersModalOkPressed"
             :confirm-loading="enterGroupMembersLoading"
    >
      <enter-group-members-form ref="enterGroupMembersForm"
                                :inputGroupMembers="groupMembers"
                                :groupEventId="groupEvent._id"
                                :inputGroupMembersExist="true"
                                @submit="groupMembersModalOkPressed"
                                @loading="enterGroupMembersLoading=true"
      > <!-- maxListHeight="500px" -->
      </enter-group-members-form>
    </a-modal>
    <a-modal ref="editGroupEventModal"
             v-model="editGroupEventModalVisible"
             :destroyOnClose="true"
             title="Edit Group Event"
             @ok="groupEventModalOkPressed"
             :confirm-loading="enterGroupEventLoading"
    >
      <enter-group-event-form ref="enterGroupEventForm"
                              :name="groupEvent.name"
                              :currency="groupEvent.currencyPrefix"
                              :groupEventId="groupEvent._id"
                              @submit="groupEventModalOkPressed"
      > <!-- maxListHeight="500px" -->
      </enter-group-event-form>
    </a-modal>
    <a ref="invisibleDownloadLink" display="none" />
  </div>
</template>

<script>
import Vue from 'vue'
import 'ant-design-vue/dist/antd.css'
import Antd from 'ant-design-vue'
import VueFilterDateFormat from 'vue-filter-date-format'
import Affix from 'vue-affix'
import moment from 'moment'
import VueClipboard from 'vue-clipboard2'

import EnterExpense from '@/components/EnterExpense'
import GroupMembers from '@/components/GroupMembers'
import EnterGroupEvent from '@/components/EnterGroupEvent'
import GroupBillSplitterService from '@/services/groupbillsplitterservice'
import CsvExportExpenses from '@/services/csvExportExpenses'

let gravatar = require('gravatar')

Vue.use(Antd)
Vue.use(VueFilterDateFormat)
Vue.use(Affix)
Vue.use(VueClipboard)

export default {
  name: 'GroupEvent',
  data () {
    return {
      enterExpenseModalVisible: false,
      editGroupMembersModalVisible: false,
      editGroupEventModalVisible: false,
      groupEvent: {},
      groupMembers: {},
      expenses: [],
      transactions: [],
      currentDialogExpense: null,
      expensesLoading: false,
      groupMembersLoading: false,
      transactionsLoading: false,
      enterExpenseLoading: false,
      enterGroupMembersLoading: false,
      enterGroupEventLoading: false,
      searchString: '',
      searchTimeout: null,
      dateRange: [],
      selectedExpenses: [], // new Set(), TODO use Set again (have to solve problems with Vue reactivity + Sets first)
      multiEditDialogExpenses: [], // becomes a copy of selectedExpenses in multi-edit mode, null in single-edit mode
      // valid values: 'description', 'amount', 'payingGroupMember', 'paidToGroupMember, 'splitting', 'date', null
      enterExpenseFocusAttribute: '',
      enterExpenseMode: '', // 'add', 'edit' or 'multi-edit'
      activeTab: 'expenses',
      columns: [
        {
          title: 'Description',
          // sorter: true,
          width: '30%',
          scopedSlots: { customRender: 'description' },
          key: 'actionsDescription'
        },
        {
          title: 'Amount',
          sorter: (a, b) => a.amount - b.amount,
          width: '12%',
          scopedSlots: { customRender: 'amount' },
          key: 'actionsAmount'
        },
        {
          title: 'Paid By',
          // sorter: true,
          width: '15%',
          scopedSlots: { customRender: 'payingGroupMember' },
          key: 'paidByColumn'
        },
        {
          title: 'Shared By',
          width: '35%',
          scopedSlots: { customRender: 'sharingGroupMembers' },
          key: 'sharedByColumn'
        },
        {
          title: 'Date',
          min_width: '20%',
          sorter: (a, b) => {
            return moment(a.date).isAfter(moment(b.date)) ? 1 : -1
          },
          defaultSortOrder: 'descend',
          scopedSlots: { customRender: 'date' },
          key: 'dateColumn'
        },
        {
          title: 'Actions',
          width: '15%',
          scopedSlots: {customRender: 'actions'},
          key: 'actionsColumn'
        }]
    }
  },
  filters: { // https://stackoverflow.com/questions/48132763/reduce-decimal-places-and-add-commas-using-vue-js
    currency (amount) {
      const amt = Number(amount)
      return (amt && amt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})) || '0'
    }
  },
  components: {
    'enter-expense-form': EnterExpense,
    'enter-group-members-form': GroupMembers,
    'enter-group-event-form': EnterGroupEvent
  },
  methods: {
    // Fetch methods are used to fetch data from the server and update the model
    fetchData () {
      this.expensesLoading = this.groupMembersLoading = true
      let params = this.$route.params
      let groupEventPromise = GroupBillSplitterService.fetchGroupEvent(params.id)
      let groupMembersPromise = GroupBillSplitterService.fetchMembers(params.id)
      let expensesPromise = GroupBillSplitterService.fetchExpenses(params.id, this.searchString, this.dateRange)
      Promise.all([groupEventPromise, groupMembersPromise, expensesPromise])
        .then(values => {
          this.setData(values[0].data, values[1].data, values[2].data)
        })
        .catch(err => {
          this.setData({}, [], [])
          console.log(err)
          this.showLoadingError()
        })
    },
    fetchExpenses () {
      this.expensesLoading = true
      GroupBillSplitterService.fetchExpenses(this.$route.params.id, this.searchString, this.dateRange)
        .then(expenses => this.setExpenses(expenses.data))
        .catch(err => {
          this.setData({}, [], [])
          console.log(err)
          this.showLoadingError()
        })
    },
    fetchGroupMembers () {
      this.groupMembersLoading = true
      GroupBillSplitterService.fetchMembers(this.$route.params.id)
        .then(groupMembers => this.setGroupMembers(groupMembers.data))
        .catch(err => {
          this.setData({}, [], [])
          console.log(err)
          this.showLoadingError()
        })
    },
    fetchTransactions () {
      this.transactionsLoading = true
      GroupBillSplitterService.fetchTransactions(this.$route.params.id)
        .then(transactions => this.setTransactions(transactions.data))
        .catch(err => {
          this.setData({}, [], [])
          console.log(err)
        })
    },
    setData (groupEvent, groupMembers, expenses) {
      this.groupEvent = groupEvent

      this.setGroupMembers(groupMembers)
      this.setExpenses(expenses)

      this.expensesLoading = this.groupMembersLoading = this.transactionsLoading = false
    },
    setExpenses (expenses) {
      for (let e of expenses) {
        e.amount = parseFloat(e.amount.$numberDecimal)
      }
      this.expenses = expenses
      this.selectedExpenses = []
      // this.fetchedExpenses = expenses
      this.expensesLoading = false
    },
    setGroupMembers (groupMembers) {
      this.groupMembers = {}
      for (let member of groupMembers) {
        if (member.email) {
          member.gravatar = gravatar.url(member.email, {d: 404})
        }
        let id = member._id.toString()
        this.groupMembers[id] = member
      }
      this.groupMembersLoading = false
    },
    setTransactions (transactions) {
      for (let t of transactions) {
        t.amount = parseFloat(t.amount)
      }
      this.transactions = transactions
      this.transactionsLoading = false
    },
    // Methods for editing expenses and handling the expense form overlay ('Modal')
    addExpense (inputExpense = null) {
      this.currentDialogExpense = inputExpense
      this.multiEditDialogExpenses = null
      this.enterExpenseFocusAttribute = 'description'
      this.enterExpenseMode = 'add'
      this.enterExpenseModalVisible = true
    },
    addPayment () {
      this.addExpense({isDirectPayment: true})
    },
    editExpense (expense, focusAttribute = 'description') {
      this.currentDialogExpense = expense
      this.multiEditDialogExpenses = null
      this.enterExpenseFocusAttribute = focusAttribute
      this.enterExpenseMode = 'edit'
      this.enterExpenseModalVisible = true
    },
    deleteExpense (expense) {
      let expenseIndex = this.expenses.findIndex(e => e._id === expense._id)
      this.expenses.splice(expenseIndex, 1)
      if (expense.isSelected) {
        this.expenseSelectionChanged(expense, false) // deselect expense if it was selected
      }
      return GroupBillSplitterService.deleteExpense(this.$route.params.id, expense._id)
        .then()
        .catch(err => {
          console.log('Deleting expense failed: ' + err)
          this.fetchData()
        })
    },
    editMultipleExpenses (expenses) {
      if (!expenses.every(e => e.isDirectPayment === expenses[0].isDirectPayment)) {
        this.$warning({title: 'Expenses and direct payments selected!',
          content: 'You cannot edit expenses and direct payments at the same time. Please select only ' +
            'one of the two kinds.'})
        return
      }
      this.currentDialogExpense = null
      this.multiEditDialogExpenses = expenses
      this.enterExpenseFocusAttribute = null
      this.enterExpenseMode = 'multi-edit'
      this.enterExpenseModalVisible = true
    },
    deleteMultipleExpenses (expenses) {
      let selectedExpenses = [...expenses]
      for (let expense of selectedExpenses) {
        this.deleteExpense(expense)
      }
    },
    expenseModalOkPressed () {
      this.$refs.expenseForm.okPressed(this.expenseModalOkFinished)
    },
    expenseModalOkFinished (expense, formType) {
      this.enterExpenseLoading = true
      let sendToServerPromise
      if (formType === 'add') {
        // Add new expense to list and post it to server
        sendToServerPromise = this.handleAddExpenseFinished(expense)
      } else if (formType === 'edit') {
        // Replace edited expense in list and put it on server
        sendToServerPromise = this.handleEditExpenseFinished(expense)
      } else if (formType === 'multi-edit') {
        // Update all changed fields locally on each selected expense
        sendToServerPromise = this.handleMultiEditExpensesFinished(expense)
      }
      // After the server request is finished:
      sendToServerPromise.then(() => {
        // update the transactions
        if (this.activeTab === 'transactions') {
          this.fetchTransactions()
        }
      }).catch(err => {
        // Handle errors potential errors
        console.log(`${formType === 'add' ? 'Adding expense'
          : formType === 'edit' ? 'Editing expense' : 'Editing multiple expenses'} failed: ` + err)
        this.fetchData()
      }).finally(() => {
        // Loading finished, close the modal
        this.enterExpenseLoading = false
        this.enterExpenseModalVisible = false
      })
    },
    // Extracted method to handle adding an expense after OK was clicked
    handleAddExpenseFinished (expense) {
      // Add expense to local expense list if it matches search criteria
      expense._id = ''
      if (this.matchesSearch(expense, this.searchString, this.dateRange)) {
        this.expenses.push(expense)
      }
      expense._id = undefined
      // Send the new expense to the server
      return GroupBillSplitterService.postExpense(this.$route.params.id, expense)
        .then(res => { expense._id = res.data.data._id })
    },
    // Extracted method to handle updating an edited expense after OK was clicked
    handleEditExpenseFinished (expense) {
      // Update expense in local expense list if it matches the search, else remove locally; update selection
      let expenseIndex = this.expenses.findIndex(e => e._id === expense._id)
      if (this.matchesSearch(expense, this.searchString, this.dateRange)) {
        if (!this.expenses[expenseIndex].isSelected) {
          this.expenses.splice(expenseIndex, 1, expense)
        } else {
          this.expenseSelectionChanged(this.expenses[expenseIndex], false)
          this.expenses.splice(expenseIndex, 1, expense)
          expense.isSelected = true
          this.expenseSelectionChanged(expense, true)
        }
      } else {
        if (this.expenses[expenseIndex].isSelected) {
          this.expenseSelectionChanged(this.expenses[expenseIndex], false)
        }
        this.expenses.splice(expenseIndex, 1)
      }
      // Send the update to the server
      return GroupBillSplitterService.putExpense(this.$route.params.id, expense._id, expense)
    },
    // Extracted method to handle updating multiple edited expenses after OK was clicked
    handleMultiEditExpensesFinished (updateFields) {
      // Change the updated fields in the local expenses that match the search criteria
      for (let selectedExpense of this.multiEditDialogExpenses) {
        for (let key of Object.keys(updateFields)) {
          selectedExpense[key] = updateFields[key]
        }
        // manually fix conflicting `sharingGroupMembers`/`proportionalSplitting` values
        if (updateFields.proportionalSplitting) {
          selectedExpense.sharingGroupMembers = []
        } else if (updateFields.sharingGroupMembers) {
          selectedExpense.proportionalSplitting = undefined
        }

        // If the expense does not meet the search criteria anymore, delete it from currently shown expenses
        if (!this.matchesSearch(selectedExpense, this.searchString, this.dateRange)) {
          let expenseIndex = this.expenses.findIndex(e => e._id === selectedExpense._id)
          this.expenses.splice(expenseIndex, 1)
        }
      }
      // Send changes to server
      return GroupBillSplitterService.putMultipleExpenses(this.$route.params.id,
        this.multiEditDialogExpenses.map(e => e._id), updateFields)
    },
    // Methods for handling the edit group members overlay ('Modal')
    editGroupMembers () {
      this.enterGroupMembersLoading = false
      this.editGroupMembersModalVisible = true
    },
    groupMembersModalOkPressed () {
      this.$refs.enterGroupMembersForm.okPressed(this.groupMembersModalOkFinished)
    },
    groupMembersModalOkFinished () {
      this.editGroupMembersModalVisible = false
      this.fetchGroupMembers()
    },
    editGroupEvent () {
      this.$refs.editGroupEventButton.$el.blur()
      this.enterGroupEventLoading = false
      this.editGroupEventModalVisible = true
    },
    // Methods for handling the edit group event overlay ('Modal')
    groupEventModalOkPressed () {
      this.$refs.enterGroupEventForm.okPressed(this.groupEventModalOkFinished)
    },
    groupEventModalOkFinished (groupEvent) {
      this.enterGroupEventLoading = true
      GroupBillSplitterService.putGroupEvent(groupEvent._id, groupEvent)
        .then(() => {
          this.groupEvent = groupEvent
          this.editGroupEventModalVisible = false
        })
        .catch(err => {
          this.$message.destroy()
          this.$message.error('Could not put group event on server: ' + err)
        })
        .finally(() => {
          this.enterGroupEventLoading = false
        })
    },
    settleTransaction (transaction) {
      let description = this.groupMembers[transaction.source].name +
        ' → ' + this.groupMembers[transaction.target].name
      let payment = {
        amount: transaction.amount,
        payingGroupMember: transaction.source,
        sharingGroupMembers: [transaction.target],
        date: Date.now(),
        description: description,
        isDirectPayment: true
      }
      this.addExpense(payment)
      // GroupBillSplitterService.postExpense(this.$route.params.id, payment)
      //   .then(res => {
      //     payment._id = res.data.data._id
      //   })
      //   .catch(err => {
      //     console.log('Adding expense failed: ' + err)
      //     this.fetchData()
      //   })
    },
    // Load transactions when the tab is switched there
    tabChanged (key) {
      if (key === 'transactions') {
        this.transactions = []
        this.fetchTransactions()
      }
    },
    // Helper method used when inserting/editing expenses while filter is active
    matchesSearch (expense, searchString, dateRange) {
      if (dateRange.length > 0 && (dateRange[0] > expense.date || dateRange[1] < expense.date)) {
        return false
      }
      if (expense.description.toLowerCase().includes(searchString.toLowerCase()) ||
        this.groupMembers[expense.payingGroupMember].name.toLowerCase().includes(searchString.toLowerCase())) {
        return true
      }
      for (let member of expense.sharingGroupMembers) {
        if (this.groupMembers[member].name.toLowerCase().includes(searchString.toLowerCase())) {
          return true
        }
      }
      return false
    },
    copyUrl () {
      this.$copyText(this.groupEventURL)
      this.$message.success('Copied group event URL to clipboard!')
    },
    // If a wrong URL is supplied, show error and lead user back to landing page
    showLoadingError () {
      this.$error({
        title: 'Group Event data could not be loaded!',
        content: 'Click OK to go back to the landing page.',
        onOk: () => this.$router.push({name: 'LandingPage'})
      })
    },
    expenseSelectionChanged (expense, selectionValue) {
      if (selectionValue) {
        this.selectedExpenses.push(expense)
      } else {
        let expenseIndex = this.selectedExpenses.findIndex(e => e._id === expense._id)
        if (expenseIndex >= 0) {
          this.selectedExpenses.splice(expenseIndex, 1)
        }
      }
    },
    allSelectedChanged (isChecked) {
      if (isChecked) {
        // Select all
        for (let expense of this.expenses) {
          expense.isSelected = true
        }
        this.selectedExpenses = [...this.expenses]
      } else {
        // Deselect all
        for (let expense of this.expenses) {
          expense.isSelected = false
        }
        this.selectedExpenses = []
      }
    },
    downloadStringAsFile (string, fileName, fileType) {
      let blob = new Blob([string], { type: fileType })

      // Credits: https://gist.github.com/danallison/3ec9d5314788b337b682
      let a = this.$refs.invisibleDownloadLink
      a.download = fileName
      a.href = URL.createObjectURL(blob)
      a.dataset.downloadurl = [fileType, a.download, a.href].join(':')
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1500)
    },
    downloadExpensesCsv (expenses) {
      let csv = CsvExportExpenses.expensesToCsv(expenses, this.groupMembers, this.groupEvent.currencyPrefix)
      this.downloadStringAsFile(csv, `${this.groupEvent.name}.csv`, 'text/csv')
    },
    downloadRawData () {
      GroupBillSplitterService.fetchExpenses(this.$route.params.id).then(expensesRes => {
        let rawData = {groupEvent: this.groupEvent, groupMembers: this.groupMembers, expenses: expensesRes.data}
        let jsonString = JSON.stringify(rawData)
        this.downloadStringAsFile(jsonString, `${this.groupEvent.name}.json`, 'application/json')
      })
    }
  },
  created () {
    document.title = 'Group Event | Group Bill Splitter'
    this.fetchData()
  },
  watch: {
    $route () {
      document.title = 'Group Event | Group Bill Splitter'
      this.fetchData()
    },
    groupEvent () {
      document.title = `${this.groupEvent.name} | Group Bill Splitter`
    },
    // self-made 'debounce' feature to delay the search request
    // (in order to not have to import some huge package)
    searchString () {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      var _fetchExpenses = this.fetchExpenses
      this.searchTimeout = setTimeout(() => {
        _fetchExpenses()
      }, 400)
    },
    dateRange () {
      this.fetchExpenses()
    }
  },
  computed: {
    groupEventURL () {
      return `https://groupbillsplitter.herokuapp.com/#/groupEvents/${this.groupEvent._id}`
    },
    allExpensesSelected () {
      return this.selectedExpenses.length === this.expenses.length && this.expenses.length > 0
    },
    someButNotAllExpensesSelected () {
      return this.selectedExpenses.length > 0 && this.selectedExpenses.length < this.expenses.length
    }
  }
}
</script>

<style>
  .leftaligned {
    text-align: left;
  }
  .rightaligned {
    text-align: right;
  }
  .flex {
    display: flex;
    justify-content: space-around;
    align-items: stretch;
  }
  .somemoremargin {
    margin: 30px
  }
  .somemorepadding {
    padding: 30px
  }
  .ant-table {
    font-family: "Cantarell"
  }
  .ant-list {
    font-family: "Cantarell"
  }
  .formatting-inline-label {
    margin-right: 0.3ex;
    margin-left: 0.3ex;
    font-size: 120%
  }
  .currency-label {
    word-spacing: -0.2ex;
    margin-right: 0.1ex
  }
  .link-label {
    padding: 5px;
    border: #cccccc solid 1px
  }
  .link-label:hover {
    padding: 5px;
    border: #bae7ff solid 1px;
    color: #1890ff
  }
  .table-row-not-selected {
     background-color: #ffffff;
   }
  .table-row-selected {
    background-color: #e6f3ff;
  }
</style>
