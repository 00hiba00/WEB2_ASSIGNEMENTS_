<template>
    <div>
        <nav>
            <router-link to="/">Home</router-link>
            <router-link to="/create">Add Post</router-link>
        </nav>
    </div>
</template>
<script>
export default {
    name : "NavBar",
    components : {},
    data(){
        return {}
    }
}
//heloq comment

</script>

<style>
/* Navbar */
nav {
  background-color: #2ecc71;
  padding: 10px 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
  border-bottom: 2px solid #27ae60;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

nav a {
  text-decoration: none;
  color: white;
  font-weight: bold;
  font-size: 18px;
  transition: color 0.3s ease;
}

nav a:hover {
  color: #ecf0f1;
}

</style>

