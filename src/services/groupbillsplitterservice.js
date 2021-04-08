import Api from '@/services/api'

let jsonHeaders = {headers: {'Content-type': 'application/json'}}

export default {
  fetchExpenses (groupEventId, searchString, dateRange) {
    let params = {}
    if (dateRange && dateRange.length > 0) {
      params['minDate'] = dateRange[0].format('YYYY-MM-DD')
      params['maxDate'] = dateRange[1].format('YYYY-MM-DD')
    }
    if (searchString) {
      params['memberNameSearch'] = searchString
      params['descriptionSearch'] = searchString
      params['or'] = 'true'
    }
    return Api().get(`/groupEvents/${groupEventId}/expenses`, {params})
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
  putGroupEvent (groupEventId, groupEvent) {
    return Api().put(`/groupEvents/${groupEventId}`, groupEvent, jsonHeaders)
  },
  putGroupMember (groupEventId, groupMemberId, member) {
    return Api().put(`/groupEvents/${groupEventId}/members/${groupMemberId}`, member, jsonHeaders)
  },
  putExpense (groupEventId, expenseId, expense) {
    return Api().put(`/groupEvents/${groupEventId}/expenses/${expenseId}`, expense, jsonHeaders)
  },
  putMultipleExpenses (groupEventId, expenseIds, updateFields) {
    updateFields.expenseIds = expenseIds
    return Api().put(`/groupEvents/${groupEventId}/expenses`, updateFields, jsonHeaders)
  },
  deleteGroupMember (groupEventId, groupMemberId) {
    return Api().delete(`/groupEvents/${groupEventId}/members/${groupMemberId}`)
  },
  deleteExpense (groupEventId, expenseId) {
    return Api().delete(`/groupEvents/${groupEventId}/expenses/${expenseId}`)
  },
  fetchPopularPercentagesSplittings (groupEventId, maxCount) {
    let params = {}
    if (maxCount) {
      params.maxCount = maxCount
    }
    return Api().get(`groupEvents/${groupEventId}/proportionalSplittings-popular`, {params})
  },
  fetchRecentPercentagesSplittings (groupEventId, maxCount) {
    let params = {}
    if (maxCount) {
      params.maxCount = maxCount
    }
    return Api().get(`groupEvents/${groupEventId}/proportionalSplittings-recent`, {params})
  }
}
