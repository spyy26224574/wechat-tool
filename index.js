const {
    Wechaty
} = require('wechaty') // import { Wechaty } from 'wechaty'
import resource from './resource'
import welcome from './welcome'
import { roomTopic as staticTopic } from './config'

const bot = Wechaty.instance() // Global Instance

bot
    .on('scan', scan)
    .on('login', login)
    .on('room-join', roomJoin)
    .on('message', message)
    .start()


function scan(qrcode, status) {
    console.log(
        `Scan QR Code to login: ${status}\nhttps://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        qrcode
      )}`)
}

function login(user) {
    console.log(`User ${user} logined`)
}

/**
 * @description 消息处理函数
 * @param {} msg 
 */
async function message(msg) {
    const concat = msg.from();
    const content = msg.content();
    const room = msg.room();

    const roomTopic = await room.topic();

    if (/call:(.*)/.test(content) && room && roomTopic === staticTopic) {
        let keyroom = await bot.Room.find({
            topic: roomTopic
        })
        if (keyroom) {
            const r = /call:(.*)/.exec(content)[1];
            if(resource[r]) {
                await keyroom.say(resource[r], concat);
            }
        }
    }

    if (room) {
        console.log(`Room:${await room.topic()} Concact ${concat.name() }Content: ${content}`)
    }
}

/**
 * @description 有人加入群聊的事件
 * @param {*} room
 * @param {被邀请人的列表} inviteeList 
 * @param {邀请人} inviter
 */
async function roomJoin(room, inviteeList, inviter) {
    const roomTopic = await room.topic();
    if(roomTopic === staticTopic){
        inviteeList.forEach(async c => {
            await room.say(welcome.data, c)
        });
    }
}