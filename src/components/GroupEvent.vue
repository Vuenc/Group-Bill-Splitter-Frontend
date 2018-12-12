<template>
  <div>
    <a-row class="somemoremargin">
      <h1 class="leftaligned">
        Group Event: {{groupEvent.name}}
      </h1>
    </a-row>
    <a-row>
      <a-col :offset=1 :span=4>
        <a-affix>
          <div>
            <div class="somemorepadding">
              <h3>
                Group members:
              </h3>
              <a-list>
                <a-list-item v-for="member of groupMembers" :key="member.name">
                  <a-avatar shape="square" :src='member.avatar' style="margin-right:24px" />
                  <label style="align-self: center">
                    {{member.name}}
                  </label>
                </a-list-item>
              </a-list>
            </div>
          </div>
        </a-affix>
      </a-col>
      <a-col :offset=2 :span=11>
        <div style="margin: 0px 0px 10px 0px">
          <a-button size="large" type="primary" style="margin: 0px 10px 0px 0px"
                    @click="addExpenseModalVisible=true">Add Expense</a-button>
          <a-button size="large">Settle Expenses</a-button>
        </div>
        <a-table :columns="columns"
                 :rowKey="record => record.name"
                 :dataSource="expenses"
                 :pagination="false"
        >
          <template slot="amount" slot-scope="amount">
              <div class=rightaligned>
                {{groupEvent.currencyPrefix}}{{amount | currency}}
              </div>
          </template>
          <template slot="description" slot-scope="description">
            <div>
              {{description}}
            </div>
          </template>
          <template slot="payingGroupMember" slot-scope="payingGroupMember">
            <div>
              {{payingGroupMember.name}}
            </div>
          </template>
          <template slot="sharingGroupMembers" slot-scope="sharingGroupMembers">
            <div>
              {{sharingGroupMembers.length > 0 ? sharingGroupMembers.map(m => groupMembers[m].name).reduce((a, b) => a + ", " + b) : 'All'}}
            </div>
          </template>
          <template slot="date" slot-scope="date">
            <div>
              {{new Date(date) | dateFormat('DD.MM.YYYY')}}
            </div>
          </template>
        </a-table>
      </a-col>
    </a-row>
    <a-modal ref="addExpenseModal"
             v-model="addExpenseModalVisible"
             :destroyOnClose="true"
             @ok="addExpenseOk">
      <add-expense-form :isValid="addedExpenseValid" :validChanged="valid => addedExpenseValid = valid">
      </add-expense-form>
    </a-modal>
  </div>
</template>

<script>
import Vue from 'vue'
import 'ant-design-vue/dist/antd.css'
import Antd from 'ant-design-vue'
import VueFilterDateFormat from 'vue-filter-date-format'
import AddExpense from '@/components/AddExpense'

import GroupBillSplitterService from '@/services/groupbillsplitterservice'

Vue.use(Antd)
Vue.use(VueFilterDateFormat)

export default {
  name: 'GroupEvent',
  data () {
    return {
      addExpenseModalVisible: false,
      addedExpenseValid: false,
      groupEvent: {},
      groupMembers: {},
      expenses: [],
      columns: [{
        title: 'Amount',
        dataIndex: 'amount',
        // sorter: true,
        width: '10%',
        scopedSlots: { customRender: 'amount' }
      },
      {
        title: 'Description',
        dataIndex: 'description',
        // sorter: true,
        width: '35%',
        scopedSlots: { customRender: 'description' }
      },
      {
        title: 'Payed By',
        dataIndex: 'payingGroupMember',
        // sorter: true,
        width: '10%',
        scopedSlots: { customRender: 'payingGroupMember' }
      },
      {
        title: 'Shared By',
        dataIndex: 'sharingGroupMembers',
        width: '35%',
        scopedSlots: { customRender: 'sharingGroupMembers' }
      },
      {
        title: 'Payment Date',
        dataIndex: 'date',
        width: '10%',
        scopedSlots: { customRender: 'date' }
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
    'add-expense-form': AddExpense
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
        .catch(err => console.log(err))
    },
    setData (groupEvent, groupMembers, expenses) {
      this.groupEvent = groupEvent

      this.groupMembers = {}
      for (let member of groupMembers) {
        let id = member._id.toString()
        this.groupMembers[id] = member
      }

      for (let e of expenses) {
        e.amount = parseFloat(e.amount.$numberDecimal)
      }
      console.log(expenses)
      this.expenses = expenses
    },
    addExpenseOk () {
      console.log('Checked OK')
      if (this.addedExpenseValid) {
        this.addExpenseModalVisible = false
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
</style>
