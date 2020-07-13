import commuChannel from '../constants/commChanel'

function inform_broadcast(channel, param) {
    // channel: the channel for sending broadcast
    // param: the param for sending broadcast
    window.ipcRenderer.send(commuChannel.Inform_Broadcast, {channel: channel, param: param})
};

function send_broadcast(agrs) {
    // console.log('send_broadcast', agrs)
    window.ipcRenderer.send(commuChannel.Send_Broadcast, agrs)
};

function inform_stkTradEvent_broadcast(channel, param) {
    // channel: the channel for sending broadcast
    // param: the param for sending broadcast
    window.ipcRenderer.send(commuChannel.Inform_stkTradEvent_Broadcast, {channel: channel, param: param})
};


function send_stkTradEvent_broadcast(agrs) {
    window.ipcRenderer.send(commuChannel.Send_stkTradEvent_Broadcast, agrs)
};



export {inform_broadcast, send_broadcast, inform_stkTradEvent_broadcast, send_stkTradEvent_broadcast};