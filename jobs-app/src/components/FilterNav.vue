<template>
  <input v-model="search" placeholder="search a job...." >
    
</template>

<script>


export default {
  name: "FiltreNav",
  data() {
    return {
      search: "",
    };
  },
  watch: {
    search(newValue) {
      this.$emit("search-updated", newValue);
    },
  },
};
</script>
