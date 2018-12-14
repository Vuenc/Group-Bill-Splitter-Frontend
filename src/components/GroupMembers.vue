<template>
  <div>
    <a-list style="height: 500px; overflow-y: scroll; margin-top: 20px">
      <a-list-item v-for="member in groupMembers" :key="member.listId">
        <div :ref="'memberdiv-' + groupMembers.indexOf(member)"
             style="white-space: nowrap">
          <a-col>
            Member #{{groupMembers.indexOf(member) + 1}}:
          </a-col>
          <a-row>
            <a-col :span=8>
              <a-input v-model="member.member.name" placeholder="What's the name?"></a-input>
            </a-col>
            <a-col :offset=1 :span=12>
              <a-input v-model="member.member.email" placeholder="What's the email address? (optional)"></a-input>
            </a-col>
            <a-col :offset=1 :span=1>
              <a-button size="small"
                        shape="circle"
                        icon='delete'
                        style="margin-top: 3px"
                        @click="deleteMember(member)"
                        :loading="member.confirmDeleteLoading"/>
            </a-col>
          </a-row>
        </div>
      </a-list-item>
    </a-list>
    <div style="display: flex; justify-content: right; margin-top: 10px">
      <a-button @click="addMember">
        Add member
      </a-button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import 'ant-design-vue/dist/antd.css'
import Antd from 'ant-design-vue'

import GroupBillSplitterService from '@/services/groupbillsplitterservice'

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
    console.log(this.inputGroupMembers)
    let i = 0
    for (let memberId in this.inputGroupMembers) {
      groupMembers.push({
        listId: i++,
        newlyAdded: false,
        confirmDeleteLoading: false,
        member: this.cloneMember(this.inputGroupMembers[memberId])
      })
    }
    console.log(groupMembers)
    return {
      groupMembers,
      nextListId: i
    }
  },
  methods: {
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
    },
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
    okPressed (confirmationCallback) {
      let promises = this.applyChanges()
      Promise.all(promises)
        .then(() => {
          console.log('emitting...')
          confirmationCallback()
        })
    }
  },
  props: ['inputGroupMembers', 'groupEventId'],
  created () {
    this.$message.config({maxCount: 1})
  },
  beforeDestroy () {
    this.applyChanges()
  }
}
</script>

<style scoped>

</style>
