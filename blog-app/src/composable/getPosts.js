

const getPosts = () => {
   // return the promise from the fetch call so the caller can handle it properly
   return fetch('http://localhost:3000/posts')
   .then((response) => response.json())
   .then((data) => {
     console.log(data);
     // remove this to avoid scope issues. The data is only to be used by the promise handler
     return data;
   })
   .catch((err) => console.error('Error fetching posts:', err));
};

export default getPosts;
