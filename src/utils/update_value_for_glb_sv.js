import commuChanel from '../constants/commChanel'
function update_value_for_glb_sv(value) {
    window.ipcRenderer.send(commuChanel.update_value_for_glb_sv, value)
}

export {update_value_for_glb_sv}