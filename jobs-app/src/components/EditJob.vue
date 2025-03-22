<template>
  <div>
    <h1>Editer un emploi</h1>
    <form @submit.prevent="editJob">
      <input v-model="new_job.titre" placeholder="Titre" required />
      <input v-model="new_job.salaire" placeholder="Salaire" required />
      <textarea v-model="new_job.description" placeholder="Description"></textarea>
      <button type="submit" >Editer</button>
    </form>
  </div>
</template>

<script>
export default {
  name : "EdditJob",
  props: {
    job: Object, // Reçoit les données du job sélectionné
  },
  data() {
    return {
      new_job: {
        id : this.job?.id ||"0",
        titre: this.job?.titre || "", // Ensure job exists before accessing its properties
        salaire: this.job?.salaire || "", // Access other properties similarly
        description: this.job?.description || ""
      },
    };
  },
  methods: {
    editJob() {
      const jobToEdit = { ...this.new_job};
      this.$emit("jobEdited", jobToEdit);
      alert("Emploi modifié !");
      console.log(jobToEdit);
      this.$router.push('/');
    }
  }
};
</script>

  