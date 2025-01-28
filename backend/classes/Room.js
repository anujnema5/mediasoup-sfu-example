// Rooms are not a Mediasoup thing. Mediasoup cares about mediastreams, transports, 
// things like that. It doesnt care, or know, about rooms.
// Rooms can be inside of clients, clients inside of Rooms,
// transports can belong to rooms or clients, etc.

const config = require('../config/config');
const newDominantSpeaker = require('../utilities/newDominantSpeaker');


class Room {
    constructor(roomName, workerToUse) {
        this.roomName = roomName;
        this.worker = workerToUse;
        this.router = null;
        // ALL THE CLIENT OBJECT THAT ARE IN THE ROOM
        this.clients = [];
        // AN ARRAY OF IDS WITH THE MOST RECENT DOMINANT SPEAKER FIRST
        this.activeSpeakerList = [];
        this.activeSpeakerObserver = null;
    }

    addClient(client) {
        this.clients.push(client);
    }

    async createRouter(io) {
        return new Promise(async (resolve, reject) => {
            this.router = await this.worker.createRouter({
                mediaCodecs: config.routerMediaCodecs
            })
            this.activeSpeakerObserver = await this.router.createActiveSpeakerObserver({
                // under 0.3 sec is going to check 
                interval: 300 // 300 is default
            })
            this.activeSpeakerObserver.on('dominantspeaker', ds => newDominantSpeaker(ds, this, io))
            resolve()
        })
    }

    // createRouter() {
    //     return new Promise(async(resolve, reject)=> {

    //     })
    // }
}

module.exports = Room;