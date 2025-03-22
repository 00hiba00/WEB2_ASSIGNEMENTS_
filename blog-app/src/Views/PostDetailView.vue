<template>
    <div v-if="post">
        <h1>{{ post.title }}</h1>
        <p>{{ post.content }}</p>
        <tag-cloud :posts="[post]"></tag-cloud>
    </div>
</template>

<script>

import TagCloud from '../components/TagCloud.vue';
import getPost from '@/composable/getPost';

export default {
  components: { TagCloud },
    name: "PostDetail",
    props: ['id'], // Receives 'id' from the URL
    data() {
        return {
            post: null,

        };
    },
    async mounted(){
        try {
            this.post = await getPost(this.id);  // Fetch post data
        } catch (err) {
            console.error('Failed to fetch post:', err);
        }
    }
}
</script>
<style>
/* Post Details */
h1 {
  color: #27ae60;
  font-size: 24px;
  margin-bottom: 10px;
}

p {
  line-height: 1.6;
  font-size: 16px;
}
</style>
