<template>
    <div>
        <ul>
            <li v-for="(post, index) in posts" :key="index">
                <p>{{ post.title }} <button @click="selectPost(post)">Voir détails</button></p>
            </li>
        </ul>
        <single-post v-if="selectedPost" :post="selectedPost"></single-post>
        <div v-if="selectedPost" >
            <tag-cloud :posts="[selectedPost]"></tag-cloud>
        </div> 
        <div v-else>
            <tag-cloud :posts="posts"></tag-cloud>
        </div>
        
    </div>
</template>

<script>
import SinglePost from './SinglePost.vue';
import getPosts from '../composable/getPosts';
import TagCloud from './TagCloud.vue';


export default {
    name : "PostList",
    components : {
        SinglePost,
        TagCloud,
    },
    data(){
        return {
             // Load initial posts from data.json
            selectedPost: null,
            posts : [],
        }
    },
    methods: {
        selectPost(post) {
            this.selectedPost = post;
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
<style>
/* Post List */
/* Buttons */
button {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 8px 15px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #1e8449;
}
li {
  list-style-type: none;
  margin: 10px 0;
  padding: 10px;
  background-color: #ecf9ec;
  border: 1px solid #27ae60;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

li p {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}
</style>