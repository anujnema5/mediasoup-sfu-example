const os = require('os');
const totalThread = os.cpus().length; // maximum numbers of allowed workers

const mediasoup = require('mediasoup');
const config = require('../config/config.js');

const createWorker = () => new Promise(async (resolve, reject) => {
    let workers = [];
    // loop to create each worker
    for (let index = 0; index < totalThread; index++) {
        const worker = await mediasoup.createWorker({
            rtcMinPort: config.workerSettings.rtcMinPort,
            rtcMaxPort: config.workerSettings.rtcMaxPort,
            logLevel: config.workerSettings.logLevel,
            logTags: config.workerSettings.logTags
        })

        worker.on('dies', () => {
            // this should never happen but if it does, kill process
            process.kill(1);
        })
        workers.push(worker);
    }

    resolve(workers);
})
module.exports = createWorker;