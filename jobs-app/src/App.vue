<template>
  <div id="app">
    <header>
      <nav>
        <router-link to="/">Accueil</router-link>
        <router-link to="/add">Ajouter un emploi</router-link>
        <router-link to="/jobs/:id">Editer un emploi</router-link>
      </nav>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script>

export default {
  name: "App",
};
</script>

