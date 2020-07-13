import {inform_broadcast} from './broadcast_service'
import commChanel from '../constants/commChanel'

function open_alert_modal (modalSize, modalTitle, modalContent, textBtn, typeBtn, idStr, isTransv, codesv, component) {
    const messObj = {
      type: commChanel.SHOW_ALERT_MODAL,
      values: {
        size: modalSize || "sm",
        title: modalTitle,
        content: modalContent,
        textButton: textBtn || "common_Ok",
        btnType: typeBtn || "warning",
        aftCloseFocus: idStr,
        isTrans: isTransv,
        code: codesv || " "
      },
      component: component
    };
    inform_broadcast(commChanel.SHOW_ALERT_MODAL, messObj)
    // this.commonEvent.next(messObj);
}
export {open_alert_modal}