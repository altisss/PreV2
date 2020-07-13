import React, { PureComponent } from 'react'
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Input from "../../conponents/basic/input/Input";
import { toast } from 'react-toastify';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import functionList from '../../constants/functionList';
import commuChanel from '../../constants/commChanel'
import AlertModal from '../../conponents/basic/alert_modal/AlertModal.jsx'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';

const remote = require('electron').remote;

class BackgroundMessage extends PureComponent {
  constructor(props) {
    super(props)
    this.request_seq_comp = 0
    this.component = 'BackgroundMessage';
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.get_rq_seq_comp = () => {
      return ++this.request_seq_comp
    };
    // this.popin_window = this.popin_window.bind(this)
    this.req_component = new Map();
    if (this.props.node) {
      this.props.node.setEventListener("close", (p) => {
        window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config)
        window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeSuccsOtp}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_ACT}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.OPEN_OTP}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.event_ClientReqRcv}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CLOSE_MODAL_MESSAGE}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CLOSE_MODAL_OTP}_${this.component}`)
      })
    }
    this.login_FcntNm = 'login_FcntNm';

    this.state = {
      modalShow: false,
      // -- Otp number -----
      otpModal: {
        otpNum: '',
        // otpNum_requite: false,
        expTime: 0,
        otpLabel: 'OTP',
      },
      otpModalShow: false,
      sendingOtpNum: false,
      gettingOtp: false,
      firstShow: false,
    }
  }

  otp_SendReqFlag = false
  otp_Timeout = {}
  otp_Type = ''
  otp_interValExpide = {}
  otp_FcntNm = 'LOGIN-02'
  // -- confirm OTP number in case 3
  otpStatus = false // -- false: chưa gửi -> disable otp input + sending button, else ...
  gettingOtp = false
  getOtpMessage = ''
  gettingOtp_FunctNm = 'LOGIN-0008'

  // popin_window() {
  //   const current_window = remote.getCurrentWindow();
  //   window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
  //   current_window.close();
  // }

  componentDidMount() {

    window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
      console.log('this.req_component', agrs, this.req_component, agrs);
      reply_send_req(agrs, this.req_component)
    });

    window.ipcRenderer.on(`${commuChanel.event_SysMsg}_${this.component}`, (event, message) => {
      if (message['Code'] === 'XXXXX1') {
        const ls_msg = 'Server_is_busy_process_Please_try_again_later'
        glb_sv.openAlertModal('', 'common_InfoMessage', ls_msg, '', '', '', '', message['Code'])
        return
      } else if (message['Code'] === 'XXXXX2') {
        const messageEnt = {}
        messageEnt['type'] = glb_sv.misTypeReconect
        messageEnt['data'] = null
        window.ipcRenderer.send(commuChanel.misTypeReconect, messageEnt)
        return
      } else if (message['Code'] === 'XXXXX4') {
        const ls_msg = 'You_are_not_authentication_OTP'
        glb_sv.openAlertModal('', 'common_InfoMessage', ls_msg, '', 'warning', '', '', message['Code'])
      } else if (message['Code'] === 'XXXXX5' || message['Code'] === 'XXXX12' || message['Code'] === '080063') {
        const ls_msg = 'Please_try_to_re_login_to_use_our_services'
        glb_sv.authFlag = false
        glb_sv.openAlertModal('', 'common_InfoMessage', ls_msg, '', 'warning', '', '', message['Code'])
      } else if (message['Code'] === 'XXXXX6') {
        glb_sv.authFlag = false
        const ls_msg = 'You_already_loginged_other_session_System_will_disconnected_this_session_now'
        glb_sv.openAlertModal('', 'common_InfoMessage', ls_msg, '', 'warning', '', '', message['Code'])
      } else if (message['Code'] === 'XXXXX7') {
        glb_sv.authFlag = false
        const ls_msg = 'Your_session_time_out_System_will_disconnected_this_session_now'
        glb_sv.openAlertModal('', 'common_InfoMessage', ls_msg, '', 'warning', '', '', message['Code'])
      } else if (message['Code'] === 'XXXX10') {
        glb_sv.authFlag = false
        const ls_msg = 'Your_network_not_good_now_For_safly_reason_Please_try_to_login_again'
        glb_sv.openAlertModal('', 'common_InfoMessage', ls_msg, '', '', 'warning', '', message['Code'])
      }

    });

    this.commonEvent = glb_sv.commonEvent.subscribe(msg => {
      if (msg.type === commuChanel.SHOW_ALERT_MODAL) {
        const msgObj = msg.values
        let content = msgObj.isTrans === false ? msgObj.content : this.props.t(msgObj.content)

        this.setState({
          modalSize: msgObj.size,
          modalTitle: msgObj.title,
          modalContent: content,
          modalTextBtn: msgObj.textButton,
          modalAftClsFocus: msgObj.aftCloseFocus,
          modalBtnType: msgObj.btnType,
          modalShow: true,
          modalCallBack: msgObj.callback
        })
        if (msgObj.code) this.code = msgObj.code
        return
      }
    })

    this.event_SysMsg = socket_sv.event_SysMsg.subscribe(message => {
      if (message['Code'] === 'XXXX11') {
        // Reauthen thất bại
        let incrTm
        if (glb_sv.disconTime != null) {
          incrTm = new Date(glb_sv.disconTime.getTime() + glb_sv.discexpire * 60000) // -- tăng 30'
        } else {
          incrTm = new Date()
        }
        const curTime = new Date()
        const incrTmS = glb_sv.convDate2StrTime(incrTm)
        const curTimeS = glb_sv.convDate2StrTime(curTime)
        if (Number(curTimeS) > Number(incrTmS)) {
          glb_sv.authFlag = false
          this.setState({ cfm_try_connect_to_server: false })
          const ls_msg = 'Your_network_not_good_now_For_safly_reason_Please_try_to_login_again'
          glb_sv.openAlertModal('', 'common_InfoMessage', ls_msg, '', '', 'warning', '', message['Code'])
        } else {
          this.Autologin()
        }
      }
    });

    this.subcr_ClientReqRcv = socket_sv.event_ClientReqRcv.subscribe(message => {
      if (Number(message['Result']) === 0) {
        inform_broadcast(commuChanel.event_ClientReqRcv, message)
      }
    })

    window.ipcRenderer.on(`${commuChanel.event_ClientReqRcv}_${this.component}`, (event, message) => {
      console.log("event_ClientReqRcv", message)
      if (message != null) {
        // -- validate info result --
        const cltSeqResult = Number(message['ClientSeq'])
        if (cltSeqResult === null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
          return
        }
        const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
        if (reqInfoMap === null || reqInfoMap === undefined) {
          return
        }
        let timeResult
        // timeSend = reqInfoMap.reqTime;
        timeResult = new Date()
        reqInfoMap.resTime = timeResult
        const errmsg = message['Message']
        // -- Thông báo hết phiên làm việc => logout
        if (Number(message['Result']) === 0) {
          if (errmsg.length > 8) {
            if (errmsg.substr(2, 6) === '080063') {
              glb_sv.authFlag = false
              glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, '080063')
              return
            } else if (message['Code'] === 'XXXXX5') {
              glb_sv.authFlag = false
              const ls_msg = this.props.t('Please_try_to_re_login_to_use_our_services')
              glb_sv.openAlertModal(
                '',
                'common_InfoMessage',
                ls_msg,
                '',
                'warning',
                '',
                '',
                message['Code']
              )
              return
            }
          }
        }

        if (message['Result'] === '0' && message['Code'] && message['Code'] === '080128') {

          glb_sv.objShareGlb['sessionInfo']['Otp'] = ''

          let expOtp
          try {
            expOtp = JSON.parse(message['Data'])
          } catch (error) {
            // console.log('parse json error: ' + error)
            return
          }

          glb_sv.objShareGlb['sessionInfo']['OtpType'] = expOtp[0]['c1']
          glb_sv.objShareGlb['userInfo']['c22'] = 'Y'

          this.otpNumber = null
          if (expOtp[0]['c1'] === '3') {
            glb_sv.checkOtp('')
          } else {
            let reqOtpMessage = ''
            if (expOtp[0]['c1'] === undefined || Number(expOtp[0]['c1']) === 1) {
              reqOtpMessage = 'OTP'
            } else {
              if (glb_sv.activeCode === '102' || glb_sv.activeCode === '061') {
                reqOtpMessage = 'OTP ' + expOtp[0]['c2']
              } else {
                reqOtpMessage = 'OTP ' + expOtp[0]['c3'] + expOtp[0]['c2']
              }
            }
            const expTimeOtp = Number(expOtp[0]['c0']) || 60
            this.otpModalOpen(expTimeOtp, reqOtpMessage)
            if (this.otp_interValExpide) {
              clearInterval(this.otp_interValExpide)
            }
            this.otp_interValExpideFunct()
          }
        }
      }
    });
    window.ipcRenderer.on(`${commuChanel.CLOSE_MODAL_MESSAGE}_${this.component}`, (event, message) => {
      console.log("message", message)
      this.setState({ modalShow: false })

    });

    
  }

  componentWillUnmount() {
    if (this.commonEvent) this.commonEvent.unsubscribe();
    if (this.subcr_ClientReqRcv) this.subcr_ClientReqRcv.unsubscribe();
  }

  Autologin = () => {
    if (this.login_SendReqFlag) {
      return
    }
    this.login_SendReqFlag = true;
    // -- push request to request hashmap
    const request_seq_comp = this.get_rq_seq_comp()
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = this.login_FcntNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.login_FcntNm_result;
    // -- service info
    let svInputPrm = new serviceInputPrm()
    if (svInputPrm['Otp'] === '') {
      svInputPrm['Otp'] = 'NONE'
    }
    svInputPrm.WorkerName = 'ALTxCommon'
    svInputPrm.ServiceName = 'ALTxCommon_Login'

    svInputPrm.ClientSentTime = '0'
    svInputPrm.Operation = 'Q'
    svInputPrm.InCrpt = [1]
    svInputPrm.InVal = [glb_sv.mrkInfo1, glb_sv.mrkInfo2, '', window.navigator.userAgent]
    svInputPrm.TotInVal = 4;

    this.login_ReqTimeout = setTimeout(this.solvingTimeout,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    this.req_component.set(request_seq_comp, reqInfo)
    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm: svInputPrm
    })
  }

  login_FcntNm_result = (reqInfoMap, message) => {
    clearTimeout(this.login_ReqTimeout)
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
      return
    }
    this.login_SendReqFlag = false
    reqInfoMap.resTime = new Date()
    reqInfoMap.procStat = 2
    this.setState({ cfm_try_connect_to_server: false })
    if (Number(message['Result']) === 0) {
      glb_sv.authFlag = false
      const ls_msg = 'Your_network_not_good_now_For_safly_reason_Please_try_to_login_again'
      glb_sv.openAlertModal('', 'common_InfoMessage', ls_msg, '', '', '', '', message['Code'])
      return
    } else {
      let strdata = message['Data']
      strdata = glb_sv.filterStrBfParse(strdata)
      const dataArr = JSON.parse(strdata)
      const userInfo = dataArr[0]
      glb_sv.disconTime = null
      if (glb_sv.objShareGlb.workDate !== userInfo['c29']) {
        glb_sv.authFlag = false
        const ls_msg = 'Your_network_not_good_now_For_safly_reason_Please_try_to_login_again'
        glb_sv.openAlertModal('', 'common_InfoMessage', ls_msg, '', '', '', '', message['Code'])
        return
      }
      const messageEnt = {}
      messageEnt['type'] = glb_sv.misTypeReconect
      messageEnt['data'] = null;
      inform_broadcast(commuChanel.misTypeReconect, messageEnt);
    }
    return
  }

  handleModalClose = () => {
    this.setState({ modalShow: false })
    // if (!glb_sv.authFlag) window.location.reload(true);
    if (this.code) this.closedModalMsgSys(this.code);
    if (this.state.modalCallBack) {
      this.state.modalCallBack();
    }
  }
  afterModalOpen = () => {
    setTimeout(() => {
      glb_sv.focusELM('alertBtnId');
    }, 100);
  }

  afterModalClose = () => {
    if (this.state.modalAftClsFocus) {
      const elme = document.getElementById(this.state.modalAftClsFocus)
      if (elme) {
        setTimeout(() => {
          elme.focus()
        })
      }
    }
    if (this.code) this.closedModalMsgSys(this.code);

    if (this.state.modalCallBack) {
      this.state.modalCallBack();
    }
  }

  closedModalMsgSys(code) {
    if (
      code === 'EXPIRE' ||
      code === 'XXXXXX' ||
      code === 'XXXXX2' ||
      code === 'XXXXX5' ||
      code === 'XXXXX6' ||
      code === 'XXXXX7' ||
      code === 'XXXX10' ||
      code === 'XXXXX0' ||
      code === 'XXXX12' ||
      code === '080066' ||
      code === '080063'
    ) {
      if (window.location.href.includes('___')) window.close();
      else {
        localStorage.removeItem('lngUser');
        window.location.reload(true);
      }
    }

  }

  solvingTimeout = cltSeq => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) return
    const reqIfMap = this.req_component.get(cltSeq)
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) return
    if (reqIfMap.reqFunct === this.otp_FcntNm) {
      this.otp_SendReqFlag = false
      this.setState({ sendingOtpNum: false })
    } else if (reqIfMap.reqFunct === this.gettingOtp_FunctNm) {
      this.setState({ gettingOtp: false })
    } else if (reqIfMap.reqFunct === this.login_FcntNm) {
      this.login_SendReqFlag = false
      this.Autologin()
      return
    }
    const errmsg = 'common_cant_connect_server'
    glb_sv.openAlertModal('sm', 'common_notify', errmsg, 'OK', 'warning', '', true)
  }

  render() {
    const { t } = this.props;
    return (<div className="background-message">
      <AlertModal
        modalShow={this.state.modalShow}
        size={this.state.modalSize}
        afterClose={this.afterModalClose}
        afterOpened={this.afterModalOpen}
        modalClose={this.handleModalClose}
        title={t(this.state.modalTitle)}
        content={this.state.modalContent}
        textButton={this.state.modalTextBtn}
        btnType={this.state.modalBtnType}
      />
    </div>)
  }
}

export default translate('translations')(BackgroundMessage);