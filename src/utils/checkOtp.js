import { inform_broadcast } from "./broadcast_service";


// kiểm tra xem otp đã dc nhập chưa
function checkOtp(functNm, objShareGlb, component){
    console.log(objShareGlb)
    if (objShareGlb['userInfo']['c22'] && objShareGlb['userInfo']['c22'] === 'N') return true;
    if (objShareGlb['sessionInfo']['Otp'] == null ||
      objShareGlb['sessionInfo']['Otp'] === undefined ||
      objShareGlb['sessionInfo']['Otp'] === '') {
      const message = {};
      message['type'] = 'GETOTP';
      message['data'] = functNm;
      message['component'] = component
    //   this.commonEvent.next(message);
      inform_broadcast('GETOTP', message)
      return false;
    }
    return true;
}

function send_checkOTP(functNm, component) {
      const message = {};
      message['type'] = 'GETOTP';
      message['data'] = functNm;
      message['component'] = component
    //   this.commonEvent.next(message);
      inform_broadcast('GETOTP', message)
}

export {checkOtp, send_checkOTP}