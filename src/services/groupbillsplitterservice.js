import Api from '@/services/api'

let jsonHeaders = {headers: {'Content-type': 'application/json'}}

export default {
  fetchExpenses (groupEventId) {
    return Api().get(`/groupEvents/${groupEventId}/expenses`)
  },
  fetchMembers (groupEventId) {
    return Api().get(`/groupEvents/${groupEventId}/members`)
  },
  fetchGroupEvent (groupEventId) {
    return Api().get(`/groupEvents/${groupEventId}`)
  },
  fetchTransactions (groupEventId) {
    return Api().get(`/groupEvents/${groupEventId}/transactions`)
  },
  postGroupEvent (groupEvent) {
    return Api().post(`/groupEvents`, groupEvent, jsonHeaders)
  },
  postGroupMember (groupEventId, member) {
    return Api().post(`/groupEvents/${groupEventId}/members`, member, jsonHeaders)
  },
  postExpense (groupEventId, expense) {
    return Api().post(`/groupEvents/${groupEventId}/expenses`, expense, jsonHeaders)
  },
  putGroupEvent (groupEvent) {
    return Api().put(`/groupEvents/${groupEvent._id}`, groupEvent, jsonHeaders)
  },
  putGroupMember (groupEventId, member) {
    return Api().put(`/groupEvents/${groupEventId}/members/${member._id}`, member, jsonHeaders)
  },
  putExpense (groupEventId, expense) {
    return Api().put(`/groupEvents/${groupEventId}/expenses/${expense._id}`, expense, jsonHeaders)
  }
}
