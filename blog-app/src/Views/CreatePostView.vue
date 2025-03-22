<template>
    <div>
        <h1>Create New Post</h1>
        <form @submit.prevent="addPost">
            <input v-model="new_post.title" placeholder="Titre" required />
            <input v-model="new_post.tags" placeholder="tags (comma separated)" required />
            <textarea v-model="new_post.content" placeholder="Content"></textarea>
            <button type="submit">Ajouter</button>
        </form>
    </div>
</template>

<script>


export default {
    name: "CreatePost",
    data() {
        return {
            new_post: {
                title: "",
                tags: "",
                content: "",
            },
             // Initialize posts with the imported data
        };
    },
    methods: {
        addPost() {
            // Create a new post object
            const newPost = {
             // Generate new ID 
                title: this.new_post.title,
                tags: this.new_post.tags.split(", "), // Convert comma-separated tags to an array
                content: this.new_post.content,
            };

            fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPost), // Convert the post object to JSON
                })
                .then((response) => response.json())
                .then((data) => console.log("New post added:", data))
                .catch((err) => console.error(err));
            alert("Post ajouté avec succès !");
            this.$router.push('/'); // Navigate to homepage after adding the post
        }
    }
};
</script>
<style>
/* Forms */
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #ecf9ec;
  padding: 20px;
  border: 1px solid #27ae60;
  border-radius: 8px;
  width: 80%;
  max-width: 500px;
  margin: 20px auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

form input, form textarea {
  padding: 10px;
  border: 1px solid #27ae60;
  border-radius: 5px;
  font-size: 14px;
  width: 100%;
}

form textarea {
  resize: none;
  height: 100px;
}

form button {
  align-self: flex-end;
}
</style>
