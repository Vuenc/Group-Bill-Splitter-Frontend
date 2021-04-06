import moment from 'moment'
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier

export default {
  expensesToCsv (expenses, groupMembers, currencyPrefix) {
    let csvStringifierHeader = [
      {id: 'description', title: 'Description'},
      {id: 'amount', title: 'Amount'},
      {id: 'type', title: 'Type'}, // direct payment or expense
      {id: 'date', title: 'Date'},
      {id: 'payingGroupMember', title: 'Paid by'},
      {id: 'paidTo', title: 'Paid to'}, // only in case of direct payment
      {id: 'splittingType', title: 'Splitting type'}
    ]
    for (let [id, member] of Object.entries(groupMembers)) {
      csvStringifierHeader.push({id: `shareOfMember${id}`, title: `Share of ${member.name}`})
    }
    const csvStringifier = createCsvStringifier(
      {header: csvStringifierHeader, alwaysQuote: true, recordDelimiter: '\r\n'})

    let expensesRows = expenses.map(e => {
      let row = {
        description: e.description,
        amount: e.amount,
        type: !e.isDirectPayment ? 'Expense' : 'Direct payment',
        date: moment(e.date).format('YYYY-MM-DD'),
        payingGroupMember: groupMembers[e.payingGroupMember].name,
        paidTo: !e.isDirectPayment ? null : groupMembers[e.sharingGroupMembers[0]].name
      }
      Object.keys(groupMembers).forEach(id => { row[`shareOfMember${id}`] = null })
      if (!e.isDirectPayment) {
        if (!e.proportionalSplitting && e.sharingGroupMembers && e.sharingGroupMembers.length > 0) {
          row.splittingType = 'Evenly between some'
          e.sharingGroupMembers.forEach(id => {
            row[`shareOfMember${id}`] = true
          })
        } else if (e.proportionalSplitting && e.proportionalSplitting.percentages) {
          row.splittingType = 'By percentages'
          let percentageMap = Object.fromEntries(e.proportionalSplitting
            .percentages.map(p => [p.groupMember, p.percentage * 100]))
          Object.keys(groupMembers).forEach(id => {
            row[`shareOfMember${id}`] = `${percentageMap[id] || 0} %`
          })
        } else if (e.proportionalSplitting && e.proportionalSplitting.amounts) {
          row.splittingType = 'By amounts'
          let amountsMap = Object.fromEntries(e.proportionalSplitting
            .amounts.map(a => [a.groupMember, a.amount]))
          Object.keys(groupMembers).forEach(id => {
            row[`shareOfMember${id}`] = `${currencyPrefix} ${amountsMap[id] || 0}`
          })
        } else {
          row.splittingType = 'Evenly between all'
        }
      }
      return row
    })

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(expensesRows)
  }
}
