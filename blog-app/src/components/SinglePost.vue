<template>
    <div v-if="post">
        <h1>{{ post.title }}</h1>
        <p> {{ get_snippet }}</p>
        <router-link :to="`/post/${post.id}`"> voir article complet</router-link>

    </div>
</template>

<script>

export default {
    name : "SinglePost",
    props : {
        post : Object,
    },
    data(){
        return{
            snippet :"",
        }
    },
    computed : {
        get_snippet(){
            console.log("snippet getted");
            return this.post.content.substring(0, 50);
        }

    }
}
</script>