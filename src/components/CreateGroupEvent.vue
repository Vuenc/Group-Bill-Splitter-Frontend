<template>
  <div>
    <a-row class="somemorepadding"  style="padding: 30px 30px 5px 30px; margin: 0px 0px 30px 0px; background: #1890ff">
      <a-col :offset=1>
        <h1 class="leftaligned" style="white-space: nowrap">
          <label style="color: #eeeeee; font-family: 'Cantarell'; font-size: 120%">
            Create new Group Event
          </label>
        </h1>
      </a-col>
    </a-row>
    <a-row>
      <a-col :offset="8" :span="7">
        <a-form>
          <a-form-item label="Name">
            <a-input v-model="name"
                     placeholder="For which event do you want to split expenses?"
                     :class="{'input-error': $v.name.$error}"/>
          </a-form-item>
          <a-form-item label="Currency">
            <a-select v-model="currency.currency"
                      placeholder="What currency did you pay in?"
                      :class="{'input-error': $v.currency.$error}"
            >
              <a-select-option value="€">Euro (€)</a-select-option>
              <a-select-option value="$">USD ($)</a-select-option>
              <a-select-option value="£">GPB (£)</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Group Members:">
            <enter-group-members-form ref="enterGroupMembersForm"
                                      style="margin-top: -5px"
                                      :inputGroupMembersExist="false"
                                      :inputGroupMembers="[{name: '', email: ''}]"
            /> <!-- maxListHeight="320px" -->
          </a-form-item>
          <a-form-item>
            <a-row>
              <a-col :span=24 :style="{textAlign: 'right'}">
                <a-button type="primary"
                          @click="createEvent"
                          :loading="postEventLoading">Create Event!</a-button>
              </a-col>
            </a-row>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import GroupMembers from '@/components/GroupMembers'
import Vue from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import GroupBillSplitterService from '@/services/groupbillsplitterservice'
import { required } from 'vuelidate/lib/validators'

Vue.use(Antd)

export default {
  name: 'CreatePage',
  data () {
    return {
      name: '',
      currency: {},
      groupEventId: '',
      postEventLoading: false
    }
  },
  components: {'enter-group-members-form': GroupMembers},
  methods: {
    createEvent () {
      this.$v.$touch()
      this.$refs.enterGroupMembersForm.$v.$touch()
      if (this.$v.$error || this.$refs.enterGroupMembersForm.$v.$error) {
        this.$message.destroy()
        this.$message.error('Please enter valid data!', 3)
        return
      }

      this.postEventLoading = true
      GroupBillSplitterService.postGroupEvent({name: this.name, currencyPrefix: this.currency.currency})
        .then(event => {
          this.groupEventId = event.data.data._id
          this.$refs.enterGroupMembersForm.okPressed(() => {
            this.$router.push({name: 'GroupEvent', params: {id: this.groupEventId}})
          }, this.groupEventId)
        })
        .catch(err => {
          console.log(err)
          this.$message.destroy()
          this.$message.error(`Group Event could not be created: ${err}`, 5)
          this.postEventLoading = false
        })
    },
    addMember () {
      if (this.groupMemberName) {
        this.groupMembers.push({name: this.groupMemberName})
        this.groupMemberName = ''
      }
    }
  },
  validations: {
    name: {
      required
    },
    // Double nesting necessary for select element to show placeholder
    currency: {
      currency: {
        required
      }
    }
  }
}
</script>

<style scoped>
  /* .content {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  } */
  .ant-table-placeholder {
    padding: 0px 0px;
  }
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
