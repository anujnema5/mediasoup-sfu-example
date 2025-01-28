const createProducer = async (localStream, producerTransport) => {
    return new Promise(async (resolve, reject) => {
        // GET THE AUDIUO AND VIDEO TRACKS SO WE CAN PRODUCE;
        const videoTrack = localStream.getVideoTracks()[0];
        const audioTracks = localStream.getAudioTracks()[0];

        try {
            // RUNNING THE PRODUCE METHOD WILL TELL THE TRANSPORT TO 
            // CONNECT EVENT TO FIRE!!

            console.log('Produce running on video!!');
            const videoProducer = await producerTransport.produce({ track: videoTrack })
            console.log('Produce running on audio!!');
            const audioProducer = await producerTransport.produce({ track: audioTracks });
            console.log('Producing finished');
            resolve({ videoProducer, audioProducer })
        }

        catch (error) {
            console.log(error)
        }
    })
}

export default createProducer;