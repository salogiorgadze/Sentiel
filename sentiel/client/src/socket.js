import {io} from 'socket.io-client';

const socket = io('http://localhost:5001', {
    autoConnect: false, // avtomatiurad ar ჩაირთოს
    withCredentials: true // გააყოლოს cookieები სოკეტური კავშირისასაც უსაფრტხოებისთვის
});

export default socket;