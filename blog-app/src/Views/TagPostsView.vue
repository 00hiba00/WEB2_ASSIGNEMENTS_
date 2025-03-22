<template>
    <div>
      <h1>Articles avec le tag: {{ tag }}</h1>
      <ul>
        <li v-for="post in filteredPosts" :key="post.id">
          <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import getPosts from '../composable/getPosts';
  
  export default {
    name: 'TagPostsView',
    props: ['tag'],
    data() {
      return {
        posts: [],
        // Récupère le tag de l'URL
      };
    },
    computed: {
      // Filtrer les articles qui contiennent le tag sélectionné
      filteredPosts() {
        return this.posts.filter(post => post.tags.includes(this.tag));
      }
    },
    async mounted(){
        try {
            this.posts = await getPosts();  // Fetch post data
        } catch (err) {
            console.error('Failed to fetch post:', err);
        }
    }
    }

  </script>
  