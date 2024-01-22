<template>
    <!-- <div style="max-width: 50%; width: 300px; display: flex; flex-direction: column; justify-content: center; margin-left: 20px; margin-right: 20px"> -->
        <a-input placeholder="Search for expenses..."
                    v-model="searchString"
                    :disabled="false && expenses.length === 0 && !searchString"
                    allow-clear
        ></a-input>
    <!-- </div> -->
</template>
  
<script>
//   import Vue from 'vue'
//   import 'ant-design-vue/dist/antd.css'
//   import Antd from 'ant-design-vue'
//   import VueFilterDateFormat from 'vue-filter-date-format'
//   import Affix from 'vue-affix'
//   import moment from 'moment'
//   import VueClipboard from 'vue-clipboard2'

//   import EnterExpense from '@/components/EnterExpense'
//   import GroupMembers from '@/components/GroupMembers'
//   import EnterGroupEvent from '@/components/EnterGroupEvent'
//   import GroupBillSplitterService from '@/services/groupbillsplitterservice'
//   import CsvExportExpenses from '@/services/csvExportExpenses'

//   let gravatar = require('gravatar')

//   Vue.use(Antd)
//   Vue.use(VueFilterDateFormat)
//   Vue.use(Affix)
//   Vue.use(VueClipboard)

export default {
    name: 'SearchBar',
    data () {
        return {
            searchString: '',
            searchTimeout: null,
        }
    },
    methods: {
        initiateSearch() {
            this.$emit("search", this.searchString)
        }
    },
    watch: {
        // self-made 'debounce' feature to delay the search request
        // (in order to not have to import some huge package)
        searchString () {
            var i
            i += 1
            let j = i
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
            }
            
            this.searchTimeout = setTimeout(this.initiateSearch, 400)
        }
    }
}
</script>

</style>
