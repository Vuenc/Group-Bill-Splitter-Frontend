<template>
  <div>
    <a-row class="somemorepadding"  style="padding: 30px 30px 5px 30px; margin: 0px 0px 30px 0px; background: #1890ff">
      <a-col :offset=1>
        <h1 class="leftaligned" style="white-space: nowrap">
          <label style="color: #eeeeee; font-family: 'Cantarell'; font-size: 120%">
            Event:
          </label>
          <label style="color: white; font-family: 'Cantarell Light'; font-size: 140%; margin-left: 10px">
            {{groupEvent.name}}
          </label>
        </h1>
      </a-col>
    </a-row>
    <a-row>
      <a-col :offset=1 :span=4>
        <affix relative-element-selector="#top-table-div" style="width: 300px">
          <div class="somemorepadding">
            <div style="white-space: nowrap; display: flex; justify-content: space-between">
              <h2>
                Group Members:
              </h2>
              <a-button size="small" shape="circle" icon='edit' @click="editGroupMembers" style="margin-top: 5px"/>
            </div>
            <a-list>
              <a-list-item v-for="member of groupMembers" :key="member._id">
                <a-avatar shape="square" icon="user" :src='member.avatar' style="margin-right:24px" />
                <label style="align-self: center">
                  {{member.name}}
                </label>
              </a-list-item>
            </a-list>
          </div>
        </affix>
      </a-col>
      <a-col :offset=2 :span=12>
        <a-tabs @change="tabChanged">
          <a-tab-pane tab="Manage Expenses" key="expenses">
            <div id="top-table-div">
              <div @change="state => buttonAffixActivated = state">
                <div style="margin: 0px 0px 10px 0px; min-height: 60px; padding: 10px 0px 10px 0px">
                  <a-button :size="buttonAffixActivated ? 'large' : 'large'" type="primary" style="margin: 0px 10px 0px 0px"
                            @click="addExpense">Add Expense</a-button>
                </div>
              </div>
            <a-table id="expenses-table"
                     :columns="columns"
                     :rowKey="record => record._id"
                     :dataSource="expenses"
                     :pagination="expenses.length > 50 ? {pageSize: 50} : false"
            >
              <template slot="amount" slot-scope="amount">
                  <div class="rightaligned currency-label">
                    {{groupEvent.currencyPrefix}} {{amount | currency}}
                  </div>
              </template>
              <template slot="description" slot-scope="description">
                <div :class="labelHighlighted ? 'label-highlight' : ''">
                  <a-tooltip>
                    <template slot="title">
                      <a-icon type="edit"></a-icon>
                    </template>
                    <div style="display: flex; justify-content: stretch; cursor: pointer"
                         @mouseover="labelHighlighted=true"
                         @mouseleave="labelHighlighted=false"
                         @click="editExpense(_id, 'description')">
                      {{description}}
                    </div>
                  </a-tooltip>
                </div>
              </template>
              <template slot="payingGroupMember" slot-scope="payingGroupMember">
                <div>
                  {{groupMembers[payingGroupMember].name}}
                </div>
              </template>
              <template slot="sharingGroupMembers" slot-scope="sharingGroupMembers">
                <div v-if="sharingGroupMembers.length > 0">
                  {{sharingGroupMembers.map(m => groupMembers[m].name).reduce((a, b) => a + ", " + b)}}
                </div>
                <div v-else><i>Everyone</i></div>
              </template>
              <template slot="date" slot-scope="date">
                <div>
                  {{new Date(date) | dateFormat('DD.MM.YYYY')}}
                </div>
              </template>
              <template slot="actions" slot-scope="_id">
                <div style="white-space: nowrap">
                  <a-button size="small" shape="circle" icon='edit' @click="editExpense(_id)"/>
                  <a-button size="small" shape="circle" icon='delete' @click="deleteExpense(_id)"/>
                </div>
              </template>
            </a-table>
            </div>
          </a-tab-pane>
          <a-tab-pane tab="Settle Debts" key="transactions">
            <h2>Transactions</h2>
            These transactions settle all debts between the group members:
            <a-list style="margin-top: 10px">
              <a-list-item v-for="transaction of transactions" :key="transaction.source + transaction.target">
                <div style="font-size: 110%">
                  <label style="margin-right: 1ex;">#{{transactions.indexOf(transaction) + 1}}:</label>
                  <b class="formatting-inline-label">{{groupMembers[transaction.source].name}}</b>
                  pays <label class="formatting-inline-label currency-label">
                  {{groupEvent.currencyPrefix}} {{transaction.amount | currency}}</label>
                  to <b class="formatting-inline-label">{{groupMembers[transaction.target].name}}</b>
                </div>
              </a-list-item>
            </a-list>
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
    <a-modal ref="enterExpenseModal"
             v-model="enterExpenseModalVisible"
             :destroyOnClose="true"
             @ok="expenseModalOkPressed"
    >
      <enter-expense-form ref="expenseForm"
                        :groupMembers="groupMembers"
                        :inputExpense="currentDialogExpense"
                        :currencyPrefix="groupEvent.currencyPrefix"
                        @submit="expenseModalOkPressed"
      >
      </enter-expense-form>
    </a-modal>
    <a-modal ref="editGroupMembersModal"
                           v-model="editGroupMembersModalVisible"
                           :destroyOnClose="true"
                           @ok="groupMembersModalOkPressed"
    >
    <enter-group-members-form ref="enterGroupMembersForm"
                              :inputGroupMembers="groupMembers"
                              :groupEventId="groupEvent._id"
                              maxListHeight="500px"
                              :inputGroupMembersExist="true"
                              @submit="groupMembersModalOkPressed"
    >
    </enter-group-members-form>
  </a-modal>
  </div>
</template>

<script>
import Vue from 'vue'
import 'ant-design-vue/dist/antd.css'
import Antd from 'ant-design-vue'
import VueFilterDateFormat from 'vue-filter-date-format'
import Affix from 'vue-affix'
import moment from 'moment'

import EnterExpense from '@/components/EnterExpense'
import GroupMembers from '@/components/GroupMembers'
import GroupBillSplitterService from '@/services/groupbillsplitterservice'

Vue.use(Antd)
Vue.use(VueFilterDateFormat)
Vue.use(Affix)

export default {
  name: 'GroupEvent',
  data () {
    return {
      enterExpenseModalVisible: false,
      editGroupMembersModalVisible: false,
      groupEvent: {},
      groupMembers: {},
      expenses: [],
      transactions: [],
      buttonAffixActivated: false,
      currentDialogExpense: null,
      labelHighlighted: false,
      columns: [
        {
          title: 'Paid By',
          dataIndex: 'payingGroupMember',
          // sorter: true,
          width: '15%',
          scopedSlots: { customRender: 'payingGroupMember' }
        },
        {
          title: 'Description',
          dataIndex: 'description',
          // sorter: true,
          width: '30%',
          scopedSlots: { customRender: 'description' }
        },
        {
          title: 'Amount',
          dataIndex: 'amount',
          sorter: (a, b) => a.amount - b.amount,
          width: '12%',
          scopedSlots: { customRender: 'amount' }
        },
        {
          title: 'Shared By',
          dataIndex: 'sharingGroupMembers',
          width: '35%',
          scopedSlots: { customRender: 'sharingGroupMembers' }
        },
        {
          title: 'Date',
          dataIndex: 'date',
          width: '10%',
          sorter: (a, b) => {
            return moment(a.date).isAfter(moment(b.date)) ? 1 : -1
          },
          defaultSortOrder: 'descend',
          scopedSlots: { customRender: 'date' }
        },
        {
          title: 'Actions',
          dataIndex: '_id',
          width: '10%',
          scopedSlots: {customRender: 'actions'}
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
    'enter-group-members-form': GroupMembers
  },
  methods: {
    fetchData () {
      let params = this.$route.params
      let groupEventPromise = GroupBillSplitterService.fetchGroupEvent(params.id)
      let groupMembersPromise = GroupBillSplitterService.fetchMembers(params.id)
      let expensesPromise = GroupBillSplitterService.fetchExpenses(params.id)
      Promise.all([groupEventPromise, groupMembersPromise, expensesPromise])
        .then(values => {
          this.setData(values[0].data, values[1].data, values[2].data)
        })
        .catch(err => {
          this.setData({}, [], [])
          console.log(err)
        })
    },
    fetchGroupMembers () {
      GroupBillSplitterService.fetchMembers(this.$route.params.id)
        .then(groupMembers => this.setGroupMembers(groupMembers.data))
        .catch(err => {
          this.setData({}, [], [])
          console.log(err)
        })
    },
    fetchTransactions () {
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

      for (let e of expenses) {
        e.amount = parseFloat(e.amount.$numberDecimal)
      }
      this.expenses = expenses
    },
    setGroupMembers (groupMembers) {
      this.groupMembers = {}
      for (let member of groupMembers) {
        let id = member._id.toString()
        this.groupMembers[id] = member
      }
    },
    setTransactions (transactions) {
      for (let t of transactions) {
        t.amount = parseFloat(t.amount)
      }
      this.transactions = transactions
    },
    addExpense () {
      this.currentDialogExpense = null
      this.enterExpenseModalVisible = true
    },
    editExpense (id) {
      this.currentDialogExpense = this.expenses[this.expenses.findIndex(e => e._id === id)]
      this.enterExpenseModalVisible = true
    },
    deleteExpense (id) {
      let expenseIndex = this.expenses.findIndex(e => e._id === id)
      this.expenses.splice(expenseIndex, 1)
      GroupBillSplitterService.deleteExpense(this.$route.params.id, id)
        .then()
        .catch(err => {
          console.log('Deleting expense failed: ' + err)
          this.fetchData()
        })
    },
    expenseModalOkPressed () {
      this.$refs.expenseForm.okPressed(this.expenseModalOkFinished)
    },
    expenseModalOkFinished (expense, formType) {
      this.enterExpenseModalVisible = false
      if (formType === 'added') {
        // Add new expense to list and post it to server
        expense._id = ''
        this.expenses.push(expense)
        expense._id = undefined
        GroupBillSplitterService.postExpense(this.$route.params.id, expense)
          .then(res => {
            expense._id = res.data.data._id
          })
          .catch(err => {
            console.log('Adding expense failed: ' + err)
            this.fetchData()
          })
      } else if (formType === 'edited') {
        // Replace edited expense in list and put it on server
        let expenseIndex = this.expenses.findIndex(e => e._id === expense._id)
        this.expenses.splice(expenseIndex, 1, expense)
        GroupBillSplitterService.putExpense(this.$route.params.id, expense._id, expense)
          .then()
          .catch(err => {
            console.log('Editing expense failed: ' + err)
            this.fetchData()
          })
      }
    },
    editGroupMembers () {
      this.editGroupMembersModalVisible = true
    },
    groupMembersModalOkPressed () {
      this.$refs.enterGroupMembersForm.okPressed(this.groupMembersModalOkFinished)
    },
    groupMembersModalOkFinished () {
      this.editGroupMembersModalVisible = false
      this.fetchGroupMembers()
    },
    tabChanged (key) {
      if (key === 'transactions') {
        this.transactions = []
        this.fetchTransactions()
      }
    }
  },
  created () {
    this.fetchData()
  },
  watch: {
    $route () {
      this.fetchData()
    }
  }
}
</script>

<style>
  #components-layout-demo-basic {
    text-align: center;
  }
  #components-layout-demo-basic .ant-layout-header,
  #components-layout-demo-basic .xant-layout-footer {
    background: #ffffff;
    color: #fff;
  }
  #components-layout-demo-basic .xant-layout-footer {
    line-height: 1.5;
  }
  #components-layout-demo-basic .ant-layout-sider {
    background: #3ba0e9;
    color: #fff;
    line-height: 120px;
  }
  #components-layout-demo-basic .xant-layout-content {
    background: rgba(16, 142, 233, 1);
    color: #fff;
    min-height: 120px;
    line-height: 120px;
  }
  #components-layout-demo-basic > .xant-layout {
    margin-bottom: 48px;
  }
  #components-layout-demo-basic > .xant-layout:last-child {
    margin: 0;
  }
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
  .label-highlight {
    background: #feffe6;
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
    margin-right: 0.5ex
  }
</style>
