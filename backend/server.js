const fs = require('fs') //we need this to read our keys. Part of node
const https = require('https') //we need this for a secure express server. part of node
const http = require('http') //we need this for a secure express server. part of node
//express sets up the http server and serves our front end
const express = require('express')
const app = express()
//seve everything in public statically
app.use(express.static('public'))

//get the keys we made with mkcert
const key = fs.readFileSync('./config/cert.key')
const cert = fs.readFileSync('./config/cert.crt')
const options = { key, cert }
//use those keys with the https module to have https
// const httpsServer = https.createServer(options, app)
const httpServer = http.createServer(app);
const socketio = require('socket.io')
const mediasoup = require('mediasoup')

const config = require('./config/config')
const createWorkers = require('./utilities/createWorker.js');
const getWorker = require('./utilities/getWorker.js');
const Client = require('./classes/Client.js');
const Room = require('./classes/Room.js');

//set up the socketio server, listening by way of our express https sever
const io = socketio(httpServer, {
    cors: [`http://localhost:5173`],
    cors: [`https://localhost:5173`],
    cors: [`https://192.168.1.44`]
})

//init workers, it's where our mediasoup workers will live
let workers = null
let client = null;
// master room array that contains all out Room object
const rooms = [];



// socketIo listeners
io.on('connect', socket => {
    console.log(`Socket connected ${socket.id}`)
    // THIS IS WHERE CLIENT/USER/SOCKET LIVES
    const handshake = socket.handshake // THIS IS WHERE AUTH AND QUERY LIVES
    // console.log(handshake)

    socket.on('joinRoom', async ({ userName, roomName }, ackCb) => {
        let newRoom = false;
        client = new Client(userName, socket);
        let requestedRoom = rooms.find(room => room.roomName === roomName);
        if (!requestedRoom) {
            newRoom = true;
            // MAKE THE NEW ROOM ADD A WORKER, ADD A ROUTER
            const workerToUse = await getWorker(workers);
            requestedRoom = new Room(roomName, workerToUse);
            await requestedRoom.createRouter(io);
            rooms.push(requestedRoom)
        }
        client.room = requestedRoom;
        client.room.addClient(client);
        socket.join(client.room.roomName);
        ackCb({
            routerRtpCapabilities: client.room.router.rtpCapabilities,
            newRoom
        })
    })

    socket.on('requestTransport', async ({ type }, ackCb) => {
        let clientTransportParams;

        if (type === 'producer') {
            clientTransportParams = await client.addTransport(type)
        } else if (type === 'consumer') {

        }

        ackCb(clientTransportParams);
    })

    socket.on('connectTransport', async ({ dtlsParameters, type }, ackCb) => {
        try {
            if (type === 'producer') {
                await client.upstreamTransport.connect({
                    dtlsParameters
                })
                ackCb('success')
            }

            else if (type === 'consumer') {

            }

        } catch (error) {
            console.log(error);
            ackCb('error')
        }
    })

    socket.on('startProducing', async ({ kind, rtpParameters }, askCb) => {
        // create a producer with rtpParameters were sent
        try {
            const newProducer = await client.upstreamTransport.produce({ kind, rtpParameters });
            // ADD THE PRODUCER TO THE CLIENT OBJECT
            client.addProducer(kind, newProducer);
            askCb(newProducer.id);
        }
        catch (error) {

        }
        // PLACEHOLDER 1: IF THIS IS AN AUDIOTRACK, THEN THIS IS NEW POSSIBLE SPEAKER;
        // PLACEHOLDER 2: IF THE ROOM IS POPULATED, THEN NOTIFY THE CONNECTED USER ABOUT NEW USER JOINED
    })

    socket.on('audioChange', typeOfChange => {
        console.log(typeOfChange)
        if (typeOfChange === "mute") {
            client?.producer?.audio?.pause()
        } else {
            client?.producer?.audio?.resume()
        }
    })
})

httpServer.listen(config.port, () => {
    console.log(`Server Running ${config.port}`)
})