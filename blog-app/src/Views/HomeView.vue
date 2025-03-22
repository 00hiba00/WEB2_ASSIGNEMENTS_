<template>
    <div>
        <post-list></post-list>
    </div>
</template>

<script>
import PostList from '../components/PostList.vue'

export default {
    name : "HomeView",
    components : {PostList},
    data(){
        return {
            
        }
    }
}
</script>