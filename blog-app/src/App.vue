<template>
  <div>
    <nav-bar></nav-bar>
    <router-view></router-view>
  </div>
</template>

<script>


import NavBar from './components/NavBar.vue';


export default {
  components: { NavBar},
  name: 'App',
}
</script>

<style>
body, html {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  background-color: #f9fdf9;
  color: #2c3e50;
}
footer {
  text-align: center;
  padding: 10px;
  background-color: #2ecc71;
  color: white;
  font-size: 14px;
  margin-top: 20px;
}
</style>
