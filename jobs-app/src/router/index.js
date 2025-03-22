import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../components/HomeView.vue';
import AddJob from '../components/AddJob.vue';
import EditJob from '../components/EditJob.vue';


const routes = [
  { path: '/', component: HomeView },
  { path: '/add', component: AddJob },
  { path: '/jobs/:id', component: EditJob },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
