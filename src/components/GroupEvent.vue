<template>
  <div>
    <a-row class="somemoremargin">
      <h1 class="leftaligned">
        Group Event: {{groupEvent.name}}
      </h1>
    </a-row>
    <a-row>
      <a-col offset=1 span=4>
        <a-affix>
          <div>
            <div class="somemorepadding">
              <h3>
                Group members:
              </h3>
              <a-list>
                <a-list-item v-for="member in groupMembers" :key="member">
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
      <a-col offset=2 span=11>
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
                {{groupEvent.currency_prefix}}{{amount | currency}}
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
              {{sharingGroupMembers.length > 0 ? sharingGroupMembers.map(m => m.name).reduce((a, b) => a + ", " + b) : 'All'}}
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

Vue.use(Antd)
Vue.use(VueFilterDateFormat)

export default {
  name: 'GroupEvent',
  data () {
    let groupMembers = [
      { name: 'Alice', avatar: 'https://randomuser.me/api/portraits/thumb/women/51.jpg' },
      { name: 'Bob', avatar: 'https://randomuser.me/api/portraits/thumb/men/42.jpg' },
      { name: 'Clive', avatar: 'https://randomuser.me/api/portraits/thumb/men/23.jpg' }
    ]
    let expenses = [
      { amount: '60', date: '2018-05-12', description: 'Camping', payingGroupMember: groupMembers[0], sharingGroupMembers: [groupMembers[0], groupMembers[1]] },
      { amount: '25', date: '2018-05-12', description: 'Lunch', payingGroupMember: groupMembers[1], sharingGroupMembers: [groupMembers[0]] },
      { amount: '50', date: '2018-05-12', description: 'Fuel', payingGroupMember: groupMembers[2], sharingGroupMembers: [groupMembers[1], groupMembers[2]] },
      { amount: '5', date: '2018-05-12', description: 'Groceries', payingGroupMember: groupMembers[0], sharingGroupMembers: [] }
    ]
    return {
      addExpenseModalVisible: false,
      addedExpenseValid: false,
      groupEvent: {
        name: 'Holiday Trip',
        currency_prefix: '€'
      },
      groupMembers,
      expenses: expenses.concat(expenses).concat(expenses).concat(expenses).concat(expenses).concat(expenses),
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
    addExpenseOk () {
      console.log('Checked OK')
      if (this.addedExpenseValid) {
        this.addExpenseModalVisible = false
      }
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
