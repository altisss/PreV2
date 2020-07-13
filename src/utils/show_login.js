import {inform_broadcast} from './broadcast_service'
import commChanel from '../constants/commChanel'

function showLogin(component){
    console.log(component)
    const msg = { type: commChanel.OPEN_MODAL_LOGIN, value: 'notify_required_login', component: component }
    inform_broadcast(commChanel.OPEN_MODAL_LOGIN, msg)
}

export {showLogin}