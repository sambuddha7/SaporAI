const axios = require('axios');

function fetchYouTubeData(apiUrl) {
    return axios.get(apiUrl)
      .then((response) => {
        if (response.status === 200) {
          return response.data; // Return the JSON data
        } else {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      })
      .catch((error) => {
        throw error;
    });
}
module.exports = {
  fetchYouTubeData,
};