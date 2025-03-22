const getPost = (id) => {
  // Return the promise from the fetch call so the caller can handle it properly
  return fetch(`http://localhost:3000/posts/${id}`)  // Use template literal to add the post id
      .then((response) => response.json())
      .then((data) => {
          console.log(data);  // Log the fetched data
          return data;  // Return the post data for further handling
      })
      .catch((err) => console.error('Error fetching post:', err));  // Handle errors
};

export default getPost;
