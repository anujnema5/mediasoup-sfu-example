const config = {
    port: 3031,
    workerSettings: {
        // rtcMinPort and MaxPort are just arbitary ports for 
        // our traffic useful for firewall or networking rules


        // WebRTC applications need UDP ports for communication.
        // By specifying a range (e.g., 40000-41000), you can allow only these ports through firewalls or NAT, making it easier to configure network rules.

        rtcMinPort: 40000,
        rtcMaxPort: 41000,
        // log level you want to set
        logLevel: 'warn',
        logTags: [
            'info',
            'ice',
            'dtls',
            'rtp',
            'srtp',
            'rtcp'
        ]
    },

    routerMediaCodecs: [
        {
            kind: "audio",
            mimeType: "audio/opus",
            clockRate: 48000,
            channels: 2
        },
        // we have two video codecs for 
        // different devices like from playstation and more source
        // sabke codec alasg hai isliye humne 2 codedcs banaye
        {
            kind: "video",
            mimeType: "video/H264",
            clockRate: 90000,
            parameters:
            {
                "packetization-mode": 1,
                "profile-level-id": "42e01f",
                "level-asymmetry-allowed": 1
            }
        },
        {
            kind: "video",
            mimeType: "video/VP8",
            clockRate: 90000,
            parameters:
            {
                // "packetization-mode": 1,
                // "profile-level-id": "42e01f",
                // "level-asymmetry-allowed": 1
            }
        }
    ],
    WebRtcTransport: {
        listenIps: [
            {
                ip: '127.0.0.1',
                announcedIp: null // replace by public IP address
            }
        ],
        //For a typical video stream with HD quality, you might set maxIncomingBitrate 
        //around 5 Mbps (5000 kbps) to balance quality and bandwidth.
        //4K Ultra HD: 15 Mbps to 25 Mbps
        maxIncomingBitrate: 5000000, // 5 Mbps, default is INF
        initialAvailableOutgoingBitrate: 5000000 // 5 Mbps, default is 600000
    }
}

module.exports = config