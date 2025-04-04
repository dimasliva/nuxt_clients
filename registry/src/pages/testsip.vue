<template>
    <v-btn @click="onClick">sip</v-btn>
    <v-btn @click="call">call</v-btn>
    <v-btn @click="audioplay">audioplay</v-btn>
    <v-btn @click="stopCall">stopCall</v-btn>
</template>

<script setup lang="ts">
import * as JsSIP from "jssip"
import { type RTCSession } from "jssip/lib/RTCSession";
import type { UAConfiguration } from "jssip/lib/UA";
import { URI, Web } from "sip.js";
import { MediaApiSection } from "~/src/common/lib/MoApi/ApiSectionsV1/MediaApiSection";

JsSIP.debug.enable('JsSIP:*');

let coolPhone: JsSIP.UA;
let simpleUser: Web.SimpleUser;
let extraHeaders: string[] = [];
const diC = useSessionContainer();
const mediaSection = diC.get(MediaApiSection);
let session: RTCSession;
let remoteAudio: HTMLAudioElement;



const setAuthHeaders = async () => {

    let cred = await mediaSection.getSipGatewayCredential();
    extraHeaders = [`Api-user: ${cred.username}`, `Api-psw: ${cred.password}`];
    coolPhone?.registrator().setExtraHeaders(extraHeaders);

    if (cred.ttl) {
        let timeout = ((cred.ttl < 10) ? cred.ttl : cred.ttl - 10) * 1000;

        setTimeout(() => {
            setAuthHeaders();
        }, timeout);
    }
}



const audioplay = async () => {

    var audio = new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3');
    audio.play();
}

const onClick = async () => {


    var socket = new JsSIP.WebSocketInterface('wss://rtu-webrtc.uiscom.ru:443/');//wss://medhost.org:4443/' wss://pbxms3.novofon.com:4443/ //wss://rtu-webrtc.uiscom.ru:443;
    var configuration: UAConfiguration = {
        sockets: [socket],
        uri: 'sip:0355395@rtu-webrtc.uiscom.ru:443', //sip:284229-102@pbxms3.novofon.com
        //contact_uri: 'sip:284229-102@pbx.novofon.com',
        password: 'r2evaTMV5s',//'jCn3MkKnZ2'
        connection_recovery_max_interval: 30,
        connection_recovery_min_interval: 2,
        display_name:'284229-102',
        register: true,
        register_expires: 600
        //  authorization_jwt: "fdgdfg"
    };

    coolPhone = new JsSIP.UA(configuration);
    await setAuthHeaders();

    coolPhone.on('registered', function (e) { console.debug("@sip registred as" + e.response.getHeaders("Contact")[0]) });
    coolPhone.on('unregistered', function (e) { console.debug("@sip unregistered") });
    coolPhone.on('registrationFailed', function (e) { console.debug("@sip registrationFailed") });

    remoteAudio = new Audio();
    remoteAudio.autoplay = true;


    coolPhone.on("newRTCSession", function (data) {
        session = data.session;

        if (session.direction == 'outgoing') {
            // outgoing call session here

            session.connection.addEventListener('track', async (event) => {
                const [remoteStream] = event.streams;
                remoteAudio.srcObject = remoteStream;
            });
        }
        else {
            //incoming  call session here
            session.on("progress", function () {

                session.answer();
                session.connection.addEventListener('track', async (event) => {
                    const [remoteStream] = event.streams;
                    remoteAudio.srcObject = remoteStream;
                });
            });

        }

        /*
        var dtmfSender;

        session.on("progress", function () {
        });

        session.on("confirmed", function () {
        });
        session.on("ended", function () {
            //the call has ended
        });
        session.on("failed", function () {
            // unable to establish the call
        });
*/

        //play a DTMF tone (session has method `sendDTMF` too but it doesn't work with Catapult server right)
        // dtmfSender.insertDTMF("1");
        // dtmfSender.insertDTMF("#");
    });


    coolPhone.start();


}


const call = () => {

    var eventHandlers = {
        'progress': function (e) {
            console.log('@call is in progress');
        },
        'failed': function (e) {
            console.log('@call failed with cause: ' + e.cause + "  code: " + e.message.status_code);
        },
        'ended': function (e) {
            console.log('@call ended with cause: ' + e.cause);
        },
        'confirmed': function (e) {
            console.log('@call confirmed');
        }
    };

    var options = {
        'eventHandlers': eventHandlers,
        'mediaConstraints': { 'audio': true, 'video': false },

        pcConfig:
        {
            hackStripTcp: true,
            rtcpMuxPolicy: 'require',
            iceServers: []
        },

        rtcOfferConstraints:
        {
            offerToReceiveAudio: 1, // Принимаем только аудио
            offerToReceiveVideo: 0
        }
    };


    coolPhone.call('sip:101@pbx.novofon.com', options);
}


const stopCall = async () => {
    session.terminate();
}


</script>