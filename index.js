require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');

// Konek DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Web Konek Database!'))
    .catch(err => console.error(err));

// Model (Sama kayak Bot)
const Register = mongoose.model('Register', new mongoose.Schema({
    userId: String,
    username: String,
    nicknameBaru: String,
    tanggal: { type: Date, default: Date.now }
}));

// Realtime Watcher
mongoose.connection.once('open', () => {
    const stream = Register.watch();
    stream.on('change', (change) => {
        if(change.operationType === 'insert') {
            console.log("⚡ Data baru masuk!");
            io.emit('refresh_halaman');
        }
    });
});

// Route Halaman
app.get('/', async (req, res) => {
    const data = await Register.find().sort({ tanggal: -1 });
    res.render('index', { dataRegis: data });
});

// PORT (Penting buat Discloud)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Web jalan di port ${PORT}`));