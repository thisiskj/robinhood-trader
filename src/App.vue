<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <router-view/>
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            KJs Trader
          </h1>
          <h2 class="subtitle">
            To the moon.
          </h2>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h1 class="title">Live Screeners</h1>
        <h2 class="subtitle">
          A <strong>live</strong> look into the market finding top gainers and losers today
        </h2>
        <div class="columns">
          <div class="column">
            <screener route="/sp500/gainers/live"></screener>
          </div>
          <div class="column">
            <screener route="/sp500/losers/live"></screener>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h1 class="title">Robinhood Screeners</h1>
        <h2 class="subtitle">
          Ask <strong>Robinhood</strong> what it thinks is the top gainers and losers today
        </h2>
        <div class="columns">
          <div class="column">
            <screener route="/sp500/gainers/robinhood"></screener>
          </div>
          <div class="column">
            <screener route="/sp500/losers/robinhood"></screener>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <div class="content has-text-centered">
          <p>
            <strong>KJs Trader</strong> by <a href="https://github.com/thisiskj">Kevin Jadunandan</a>. The source code is licensed
            <a href="http://opensource.org/licenses/mit-license.php">MIT</a>.
          </p>
        </div>
      </div>
    </footer>

  </div>
</template>

<script>
const axios = require('axios');
import Screener from '@/components/Screener'

export default {
  name: 'home',
  components: {
    Screener
    // HelloWorld
  },
  mounted() {
    axios.get('http://localhost:3000/test')
      .then(r => console.log(r))
  }
}
</script>
