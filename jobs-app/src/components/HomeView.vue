
<template>
  <div>
  <AddJob @job-added="addJobToList" />
  <FilterNav @search-updated="filterJobs" />
    <ul>
      <li v-for="(job, index) in filteredJobs" :key="index" >
        <p>{{ job.titre }}<button @click="selectJob(job)"> voir details</button>
        <button @click="supprimer(index)">supprimer</button> <button @click="startEdit(job)">Editer</button></p>
      </li>
    </ul>
  <JobDetail v-if="selectedJob" :job="selectedJob" @close="selectedJob = null" />
  <EditJob v-if="edit" :job="selectedJobE" @job-edited="editJobInList" ></EditJob>
</div>
</template>

<script>


import EditJob from "./EditJob.vue";
import AddJob from "./AddJob.vue";
import JobDetail from "@/components/JobDetail.vue";
import FilterNav from "@/components/FilterNav.vue";

export default {
  components: {
    JobDetail,
    FilterNav,
    AddJob,
    EditJob,
  },
   name: "HomeView",
   data(){
    return {
        edit : false,
        selectedJob : null,
        selectedJobE : null,
        jobs : [],
        searchQuery:"",
    } 
   },
   computed: {
    filteredJobs() {
      return this.jobs.filter((job) =>
        job.titre.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
   methods : {
      selectJob(job){
        this.selectedJob = job;
      },
      filterJobs(query) {
      this.searchQuery = query;
    },
      addJobToList(added){
        this.jobs.push(added);
      },
      supprimer(index){
        const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer ce job?");
        if (confirmation) {
          this.jobs.splice(index, 1);  // Supprimer le job si l'utilisateur confirme
  }
      },
      editJobInList(query){
        console.log("edit");
        const indice = this.jobs.findIndex(job => job.id === query.id);
        this.jobs[indice] = query;
        this.edit = false;
      },
      startEdit(job) {
        console.log("start edit");
        this.selectedJobE = job; // Stocker le job à modifier
        this.edit = true; // Activer l'affichage du formulaire
    },
   },
   mounted(){
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
          console.log("data fetched");
          this.jobs = data;
        })
   }
}
</script>

