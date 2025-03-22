<template>
    <div class="tag-cloud">
        <h3>Tags</h3>
        <ul>
            <li v-for="(count, tag) in tags" :key="tag">
                <router-link :to="`/tags/${tag}`">{{ tag }} ({{ count }})</router-link>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'TagCloud',
    props: {
        posts: {
            type: Array,
            required: true
        }
    },
    computed: {
        // Crée un objet qui contient le nombre d'occurrences de chaque tag
        tags() {
            if (!this.posts || this.posts.length === 0) return {};
            const tagCount = {};
            this.posts.forEach(post => {
                post.tags.forEach(tag => {
                    if (tagCount[tag]) {
                        tagCount[tag]++;
                    } else {
                        tagCount[tag] = 1;
                    }
                });
            });
            return tagCount;
        }
    }
}
</script>

<style>
/* Tag Cloud */
.tag-cloud {
  position: fixed; /* Fix the component on the screen */
  top: 20px;       /* Distance from the top */
  right: 20px;     /* Distance from the right */ 
  background-color: #ecf9ec;
  padding: 10px;
  border: 1px solid #27ae60;
  border-radius: 8px;
  max-width: 300px;
  margin: 10px auto;
  text-align: left;
}

.tag-cloud h3 {
  margin: 0 0 10px 0;
  color: #27ae60;
  font-size: 18px;
}

.tag-cloud ul {
  padding: 0;
  margin: 0;
}

.tag-cloud li {
  list-style-type: none;
  margin: 5px 0;
}

.tag-cloud a {
  text-decoration: none;
  color: #2c3e50;
  font-size: 14px;
  font-weight: bold;
  transition: color 0.3s ease;
}

.tag-cloud a:hover {
  color: #27ae60;
}
</style>