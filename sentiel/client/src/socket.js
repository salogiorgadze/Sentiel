import {io} from 'socket.io-client';

const socket = io('https://sentiel-app.onrender.com', {
    autoConnect: false, // avtomatiurad ar ჩაირთოს
    withCredentials: true // გააყოლოს cookieები სოკეტური კავშირისასაც უსაფრტხოებისთვის
});

export default socket;