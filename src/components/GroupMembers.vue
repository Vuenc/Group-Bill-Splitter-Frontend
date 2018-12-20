<template>
  <a-form @submit="$emit('submit')">
    <a-list :style="`max-height: ${maxListHeight}; overflow-y: auto;`">
      <resize-observer @notify="listResized"/>
      <a-list-item v-for="(v, index) in $v.groupMembers.$each.$iter" :key="v.member.listId">
        <div style="white-space: nowrap; width: 100%">
          <a-col>
            Member #{{parseInt(index) + 1}}:
          </a-col>
          <div style="width: auto; display: flex; justify-content: space-between">
            <div style="width: 33%">
              <a-input :ref="'memberinput-' + index"
                        v-model="v.$model.member.name"
                       placeholder="What's the name?"
                       :class="{'input-error': v.member.name.$error}"
              ></a-input>
            </div>
            <div style="width: 56%">
              <a-input v-model="v.$model.member.email"
                       placeholder="What's the email address? (optional)"
                       :class="{'input-error': v.member.email.$error}"
              ></a-input>
            </div>
            <div style="margin-right: 5px">
              <a-button size="small"
                        shape="circle"
                        icon='delete'
                        tabindex="-1"
                        :disabled="groupMembers.length <= 1"
                        :ghost="groupMembers.length <= 1"
                        style="margin-top: 3px"
                        @click="deleteMember(v.$model)"
                        :loading="v.$model.confirmDeleteLoading"
              />
            </div>
          </div>
        </div>
      </a-list-item>
    </a-list>
    <div style="display: flex; justify-content: right; margin-top: 10px">
      <a-button @click="addMember">
        Add member
      </a-button>
    </div>
    <a-button html-type="submit" style="visibility: hidden"/>
  </a-form>
</template>

<script>
import Vue from 'vue'
import 'ant-design-vue/dist/antd.css'
import Antd from 'ant-design-vue'
import { ResizeObserver } from 'vue-resize'

import GroupBillSplitterService from '@/services/groupbillsplitterservice'
import { required, email } from 'vuelidate/lib/validators'

Vue.use(Antd)

export default {
  name: 'GroupMembers',
  columns: [
    {
      title: 'Group Member',
      dataIndex: ''
    },
    {
      title: 'Name',
      dataIndex: 'name',
      scopedSlots: { customRender: 'name' }
    },
    {
      title: 'Email',
      dataIndex: 'email',
      scopedSlots: { customRender: 'email' }
    }],
  data () {
    let groupMembers = []
    let i = 0
    for (let memberId in this.inputGroupMembers) {
      groupMembers.push({
        listId: i++,
        newlyAdded: !this.inputGroupMembersExist,
        confirmDeleteLoading: false,
        member: this.cloneMember(this.inputGroupMembers[memberId])
      })
    }
    return {
      groupMembers,
      nextListId: i,
      scrollBarVisible: false
    }
  },
  methods: {
    // Clone member so that parent component is not immediately affected by changes (useful when cancelling)
    cloneMember (member) {
      return {
        name: member.name,
        _id: member._id,
        email: member.email
      }
    },
    addMember () {
      this.groupMembers.push({
        listId: this.nextListId++,
        newlyAdded: true,
        confirmDeleteLoading: false,
        member: {
          name: '',
          email: ''
        }
      })
      this.memberAdded = true
    },
    // Try to delete a member (API method can fail if there are dependencies of the member)
    deleteMember (member) {
      if (member.newlyAdded) {
        this.groupMembers.splice(this.groupMembers.indexOf(member), 1)
      } else {
        member.confirmDeleteLoading = true
        GroupBillSplitterService.deleteGroupMember(this.groupEventId, member.member._id)
          .then(res => {
            this.groupMembers.splice(this.groupMembers.indexOf(member), 1)
          })
          .catch(err => {
            console.log('Group member could not be deleted: ' + err)
            member.confirmDeleteLoading = false
            this.$message.destroy()
            this.$message.error(`Group member ${member.member.name} can not be deleted since they are still a paying or sharing group member in at least one expense!`, 5)
          })
      }
    },
    // Add new members and edit existing ones if changes occurred
    applyChanges () {
      let promises = []
      for (let member of this.groupMembers) {
        if (member.newlyAdded) {
          promises.push(GroupBillSplitterService.postGroupMember(this.groupEventId, member.member))
        } else {
          let inputGroupMember = this.inputGroupMembers[member.member._id]
          if (member.member.name !== inputGroupMember.name ||
            member.member.email !== inputGroupMember.email) {
            promises.push(
              GroupBillSplitterService.putGroupMember(this.groupEventId, inputGroupMember._id, member.member))
          }
        }
      }
      return promises
    },
    // Validate data, and report back to parent component
    okPressed (confirmationCallback, groupEventId) {
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      if (groupEventId) {
        this.groupEventId = groupEventId
      }
      this.$emit('loading')
      let promises = this.applyChanges()
      Promise.all(promises)
        .then(() => {
          confirmationCallback()
        })
    },
    // Focus on the new input element once a new member is added
    listResized () {
      if (this.memberAdded) {
        let newInput = this.$refs['memberinput-' + (this.groupMembers.length - 1)][0].$el
        newInput.scrollIntoView()
        newInput.focus()
        this.memberAdded = false
      }
    }
  },
  props: ['inputGroupMembers', 'inputGroupMembersExist', 'groupEventId', 'maxListHeight', 'loading'],
  components: {'resize-observer': ResizeObserver},
  created () {
    this.$message.config({maxCount: 1})
  },
  validations: {
    groupMembers: {
      $each: {
        member: {
          name: {
            required
          },
          email: {
            email
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.input-error {
  border-color: #f5222d
}
</style>
