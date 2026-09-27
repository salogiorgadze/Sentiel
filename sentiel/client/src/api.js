import axios from 'axios';

const api = axios.create({

    baseURL: 'https://sentiel-app.onrender.com', 
    

    withCredentials: true 
});

export default api;