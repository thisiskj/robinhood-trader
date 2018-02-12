<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <td>Symbol</td>
          <td>Change</td>
          <td>Price</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in results">
          <td>{{ r.symbol }}</td>
          <td>{{ r.last_pct }}%</td>
          <td>${{ r.last_price }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
const axios = require('axios');

export default {
  props: {
    route: {
      required: true
    }
  },
  data() {
    return {
      results: []
    }
  },
  mounted() {
    axios.get(`http://localhost:3000${this.route}`).then(res => this.results = res.data)
  }
}
</script>

<style lang="css">
</style>
