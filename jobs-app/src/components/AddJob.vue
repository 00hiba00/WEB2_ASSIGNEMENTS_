<template>
  <div>
    <h1>Ajouter un emploi</h1>
    <form @submit.prevent="addJob">
      <input v-model="new_job.titre" placeholder="Titre" required />
      <input v-model="new_job.salaire" placeholder="Salaire" required />
      <textarea v-model="new_job.description" placeholder="Description"></textarea>
      <button type="submit">Ajouter</button>
    </form>
  </div>
</template>

<script>
export default {
  name : "AddJob",
  data() {
    return {
      new_job: { title: '', salaire: '', description: '' }
    };
  },
  methods: {
    addJob() {
      const jobToAdd = { ...this.new_job, id: Date.now()};
      this.$emit("jobAdded", jobToAdd);
      alert("Emploi ajouté !");
      // Reset the form fields
      this.new_job = { titre: "", salaire: "", description: "" };
      this.$router.push('/');
    }
  }
};
</script>

  