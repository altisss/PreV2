import commuChanel from '../constants/commChanel'
function get_glb_sv(component, sq) {
    window.ipcRenderer.send(commuChanel.get_glb_sv, {component, sq})
}

function reply_get_glb_sv (glb_sv, component, sq){
    window.ipcRenderer.send(commuChanel.reply_get_glb_sv, {glb_sv, component, sq})
}

function get_socket_sv(component, sq) {
    window.ipcRenderer.send(commuChanel.get_socket_sv, {component, sq})
}

function reply_get_socket_sv (socket_sv, component, sq){
    window.ipcRenderer.send(commuChanel.reply_get_socket_sv, {socket_sv, component, sq})
}

function get_socket_n_glb_sv(component, sq) {
    window.ipcRenderer.send(commuChanel.get_socket_n_glb_sv, {component, sq})
}

function reply_get_socket_n_glb_sv (glb_sv, socket_sv, component, sq){
    window.ipcRenderer.send(commuChanel.reply_get_socket_n_glb_sv, {glb_sv, socket_sv, component, sq})
}

export {get_glb_sv, reply_get_glb_sv, reply_get_socket_sv, get_socket_sv, get_socket_n_glb_sv, reply_get_socket_n_glb_sv}