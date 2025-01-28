const createProducerTransport = (socket, device) => {
    return new Promise(async (resolve, reject) => {
        // ASK THE SERVER TO MAKE A TRANSPORT AND SEND PARAMS
        const producerTransportParams = await socket.emitWithAck(
            'requestTransport', {
            type: 'producer'
        })

        // USE THE DEVICE TO CREATE FRONTEND TRANSPORT (SEND TRANSPORT) FROM producerTransportParams
        const producerTransport = await device.createSendTransport(producerTransportParams);

        producerTransport.on('connect', async ({ dtlsParameters }, callback, errBack) => {
            // EMIT CONNECT TRANSPORT EVENT
            // CONNECT WILL RUN ONLY ONE TIME
            const connectResp = await socket.emitWithAck('connectTransport', {
                dtlsParameters, type: 'producer'
            });
            console.log(connectResp, "connectResp is back");

            if (connectResp === 'success') {
                callback() // WE'RE CONNECTED MOVE FORWARD 
            }

            else if (connectResp === 'error') {
                errBack()
            }
        })

        producerTransport.on('produce', async (parameters, callBack, errBack) => {
            // EMIT START PRODUCING EVENT
            // PRODUCE WILL RUN TWO TIMES FOR BOTH AUDIO AND VIDEO

            console.log('produce is now running');
            const { kind, rtpParameters } = parameters
            const produceResp = await socket.emitWithAck('startProducing', { kind, rtpParameters });;
            console.log(produceResp, "produceResp is back")

            if (produceResp === 'error') {
                errBack();
            } else {
                callBack({ id: produceResp })
            }
        })
        // SEND TRANSPORT BACK TO MAIN
        resolve(producerTransport);
    })
}

export default createProducerTransport;