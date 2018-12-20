<template>
  <a-form @submit="$emit('submit')">
    <a-form-item label="Name">
      <a-input ref="firstInput"
               v-model="groupEvent.name"
               placeholder="How's the event called??"
               :class="{'input-error': $v.groupEvent.name.$error}"/>
    </a-form-item>
    <a-form-item label="Currency">
      <a-select v-model="groupEvent.currencyPrefix"
                placeholder="What currency did you pay in?"
                :class="{'input-error': $v.groupEvent.currencyPrefix.$error}"
      >
        <a-select-option value="€">Euro (€)</a-select-option>
        <a-select-option value="$">USD ($)</a-select-option>
        <a-select-option value="£">GPB (£)</a-select-option>
      </a-select>
      <a-button html-type="submit" style="visibility: hidden"/>
    </a-form-item>
  </a-form>
</template>

<script>
import Vue from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import { required } from 'vuelidate/lib/validators'

Vue.use(Antd)

export default {
  name: 'EnterGroupEvent',
  data () {
    return {
      groupEvent: {}
    }
  },
  props: ['name', 'currency', 'groupEventId'],
  created () {
    this.groupEvent = {name: this.name, currencyPrefix: this.currency, _id: this.groupEventId}
  },
  methods: {
    // Validate data and report back to the parent component
    okPressed (confirmationCallback) {
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      confirmationCallback(this.groupEvent, 'added')
    }
  },
  validations: {
    groupEvent: {
      name: {
        required
      },
      currencyPrefix: {
        required
      }
    }
  }
}
</script>

<style scoped>
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
