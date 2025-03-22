<template>
    <div v-if="job" class="job-detail">
      <h2>{{ job.titre }}</h2>
      <p><strong>Description :</strong> {{ job.description }}</p>
      <p><strong>Salaire :</strong> {{ job.salaire }}</p>
      <p><strong>Date de création :</strong> {{ job.date }}</p>
      <button @click="$emit('close')">Fermer</button>
    </div>
  </template>

<script>
export default {
  name: "JobDetail",
  props: {
    job: Object, // Reçoit les données du job sélectionné
  },
};
</script>