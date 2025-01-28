// import config from '../../backend/config/config.js';
import createProducerTransport from '../utilities/createProducerTransport.js';
import './style.css'
import buttons from './uiStuff/uiButtons.js';

import { Device } from 'mediasoup-client';
import { io } from 'socket.io-client';
import createProducer from '../utilities/createProducer.js';

// FOR LOCAL ONLY NO HTTPS
let device = null
let localStream = null;
let producerTransport = null;
let audioProducer = null;
let videoProducer = null;
const socket = io.connect(`http://localhost:3031`)

socket.on('connect', () => {
  console.log('Connected')
})

const joinRoom = async () => {
  const username = document.getElementById('username').value;
  const roomName = document.getElementById('room-input').value;

  const joinRoomResp = await socket.emitWithAck('joinRoom', { username, roomName });
  console.log(joinRoomResp)
  device = new Device();
  await device.load({ routerRtpCapabilities: joinRoomResp.routerRtpCapabilities })
  console.log(device);

  // PLACEHOLDER .... START MAKING THE TRANSPORT FOR CURRENT SPEAKERS
  buttons.control.classList.remove('d-none');
}

const enableFeed = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  })

  buttons.localMediaLeft.srcObject = localStream;
  buttons.enableFeed.disabled = true;
  buttons.sendFeed.disabled = false;
  buttons.muteBtn.disabled = false;
}

const sendFeed = async () => {
  // CREATE A TRANSPORT FOR THIS CLIENT'S UPSTREAM
  // IT WILL HAMDLE BOTH AUDIO AND VIDEO PRODUCERS
  producerTransport = await createProducerTransport(socket, device);
  // console.log('We have the producer transport. Time to produce');
  const producers = await createProducer(localStream, producerTransport)
  audioProducer = producers.audioProducer;
  videoProducer = producers.videoProducer;
  buttons.hangUp.disabled = false;
}

const muteAudio = () => {
  // mute at the producer level, to keep the transport, and all
  // other mechanism in place
  if (audioProducer.paused) {
    // currently paused. User wants to unpause
    audioProducer.resume()
    buttons.muteBtn.innerHTML = "Audio On"
    buttons.muteBtn.classList.add('btn-success') //turn it green
    buttons.muteBtn.classList.remove('btn-danger') //remove the red
    // unpause on the server
    socket.emit('audioChange', 'unmute')
  } else {
    //currently on, user wnats to pause
    audioProducer.pause()
    buttons.muteBtn.innerHTML = "Audio Muted"
    buttons.muteBtn.classList.remove('btn-success') //turn it green
    buttons.muteBtn.classList.add('btn-danger') //remove the red
    socket.emit('audioChange', 'mute')
  }
}

buttons.joinRoom.addEventListener('click', joinRoom);
buttons.enableFeed.addEventListener('click', enableFeed);
buttons.sendFeed.addEventListener('click', sendFeed);
buttons.muteBtn.addEventListener('click', muteAudio)