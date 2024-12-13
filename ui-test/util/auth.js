//import axios from 'axios';
const axios = require('axios');

async function getAuthToken(email, password) {
    const response = await axios.post('https://api.recipesage.com/users/login', {
        email, password
    });
    return response.data.token;
}

module.exports = { getAuthToken };