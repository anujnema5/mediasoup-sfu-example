const config = require("../config/config");

class Client {
    constructor(userName, socket) {
        this.userName = userName;
        this.socket = socket;
        // INSTEAD OF CALLNIG THIS PRODUCER TRANSPORT, CALL IT UPSTREAM
        this.upstreamTransport = null

        // WE WILL HAVE AN AUDIO AND VIDEO CONSUMER
        this.producer = {}

        // INSTEAD OF CALLING THIS CONSUMER TRANSPORT, CALL IT DOWNSTREAM,
        // THIS IS CLIENT TRANSPORT FOR PULLING DATA
        this.downstreamTransport = [];
        // AN ARRAY OF CONSUMER EACH WOTH TWO PARTS (AUDIO AND TRACK)
        this.consumer = []
        this.room = null
    }

    addTransport(type) {
        return new Promise(async (resolve, reject) => {
            const {
                maxIncomingBitrate,
                initialAvailableOutgoingBitrate,
                listenIps
            } = config.WebRtcTransport

            const transport = await this.room.router.createWebRtcTransport({
                enableUdp: true,
                enableTcp: true, // always use UDP inless we cant
                preferUdp: true,
                listenInfos: listenIps,
                initialAvailableOutgoingBitrate
            })

            if (maxIncomingBitrate) {
                try {
                    await transport.setMaxIncomingBitrate(maxIncomingBitrate)
                } catch (error) {
                    console.log('Error setting bitrate');
                }
            }

            const clientTransportParams = {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            }

            if (type === 'producer') {
                this.upstreamTransport = transport
            } else if (type === 'consumer') {
                this.downstreamTransport = transport
            }

            resolve(clientTransportParams)
        })
    }

    addProducer(kind, newProducer) {
        this.producer[kind] = newProducer;
        if (kind === 'audio') {
            // ADD THIS TO OUR ACTIVE SPEAKER OBSERVER
            this.room.activeSpeakerObserver.addProducer({
                producerId: newProducer.id
            })
        }
    }
}

module.exports = Client;