import { createRouter, createWebHistory } from 'vue-router';
import CreatePost from '../Views/CreatePostView.vue';
import PostDetail from '../Views/PostDetailView.vue';
import HomeView from '@/Views/HomeView.vue';
import TagPostsView from '@/Views/TagPostsView.vue';


const routes = [
  { path: '/', component: HomeView },
  { path: '/create', component: CreatePost },
  { path: '/post/:id', component: PostDetail, props: true },
  { path: '/tags/:tag', component: TagPostsView, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
