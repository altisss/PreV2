import React, { PureComponent } from 'react';
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Input from "../../conponents/basic/input/Input";
import { toast } from 'react-toastify';
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import functionList from '../../constants/functionList';
import commuChanel from '../../constants/commChanel'


import { checkToast } from '../../utils/check_toast'
import { focusELM } from '../../utils/focus_elm'
import { filterNumber } from '../../utils/filterNumber'
import HistoryList from '../../conponents/history_table_for_cash_transaction/history/historyList'
import { TabPane } from 'reactstrap'
import SearchAccount from '../../conponents/search_account/SearchAccount';

const remote = require('electron').remote;

class CashinAdvance extends PureComponent {
  constructor(props) {
    super(props)
    this.request_seq_comp = 0
    this.component = this.props.component
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.get_rq_seq_comp = () => {
      return ++this.request_seq_comp
    };
    this.popin_window = this.popin_window.bind(this)
    this.req_component = new Map();
    if (this.props.node) {
      this.props.node.setEventListener("close", (p) => {
        window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config)
        window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.ESC_KEY}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeSuccsOtp}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_ACT}_${this.component}`)
      })
    }
    this.state = {
      cashPia: {
        pia_amount: '',
        pia_amount_require: false,
        acntNo: '',
        cashAvaiable: null,
        totalAmtApr: null,
        totalAmt: null,
        tempFee: 0,
      },
      cfmSendCashInAdvanceFlag: false,
      acntItems: [],
      showInfos: true,
      refreshFlag: '',
      name: this.props.name,
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style,
      cfm_inform_otp: false,
      tempFeeCalc: ''
    }
  }
  // -- get selling order list (for pia)
  getCashPialistFlag = false;
  getCashPialist_FunctNm = 'CASHADVSCR_001';
  getTempFeePiaFunctNm = 'CASHADVSCR_002';// -- get temp fee
  // -- send request to PIA
  cfmSendCashInAdvance_FunctNm = 'CASHADVSCR_003';

  popin_window() {
    const current_window = remote.getCurrentWindow();
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }

  componentWillMount() {
    window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
      // update state after popout window
      this.setState(agrs.state)
      this.setState({
        parent_id: agrs.parent_id,
        config: agrs.config,

      })
      change_theme(agrs.state.themePage)
      change_language(agrs.state.language, this.props)
      this.cashPia = agrs.state.cashPia

    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      // update state after popin window
      this.setState(agrs.state)

    })
    if (!this.props.node) {
      window.ipcRenderer.on(`gottenOtp_${this.component}`, (event, msg) => {
        if (this.component === msg.component) {
          console.log(msg)
          this.setState({ cfm_inform_otp: true })
        }
      })
    }

  }

  componentDidMount() {
    this.cashPia = this.state.cashPia;


    window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
      change_theme(agrs)
      // glb_sv.themePage = agrs
      this.setState({ themePage: agrs })
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
      change_language(agrs, this.props)
      // glb_sv.language = agrs
      this.setState({ language: agrs })
    })

    window.ipcRenderer.once(`${commuChanel.bf_popin_window}_${this.component}`, (event, agrs) => {
      this.popin_window()
    })

    window.ipcRenderer.once(commuChanel.popin_window, (event, agrs) => {
      window.ipcRenderer.send(commuChanel.disable, agrs.state.config)
    })

    window.ipcRenderer.once(`${commuChanel.bf_popout}_${this.component}`, (event, agrs) => {
      bf_popout(this.component, this.props.node, this.state)
    })

    window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
      reply_send_req(agrs, this.req_component)
    })

    window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
      if (this.state.cfm_pia_request) this.setState({ cfm_pia_request: false });
      // else {
      //   const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
      //   inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
      // }
    })

    window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
      if (msg.data === 'openModalPIA') {
        this.setState({ cfm_pia_request: true });
        this.getTempFeePia()
      }
    })
    window.ipcRenderer.on(`${commuChanel.AFTER_OTP}_${this.component}`, (event, agrs) => {
      glb_sv.objShareGlb = agrs.objShareGlb;
    })
    this.delayLoadData();
  }

  componentWillUnmount() {
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    this.request_seq_comp = 0
    if (this.getCashPialistFunct_ReqTimeOut) { clearTimeout(this.getCashPialistFunct_ReqTimeOut); }
    if (this.cfmSendCashInAdvanceFunct_ReqTimeOut) { clearTimeout(this.cfmSendCashInAdvanceFunct_ReqTimeOut); }

  }

  delayLoadData() {
    if (!glb_sv.flagProcessPopout) {
      this.loadData();
    } else {
      setTimeout(() => {
        this.loadData();
      }, 100);
    }
  }

  loadData() {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['activeAcnt', 'objShareGlb'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {

      glb_sv.objShareGlb = agrs.get('objShareGlb');
      this.activeAcnt = agrs.get('activeAcnt');

      if (!this.activeAcnt) return;

      let acntStr = this.activeAcnt;

      this.cashPia['acntNo'] = acntStr;
      this.cashPia['totalAmt'] = 0;
      this.cashPia['tempFee'] = 0;
      this.setState(prevState => ({
        cashPia: {
          ...prevState.cashPia,
          acntNo: this.cashPia.acntNo,
          totalAmt: 0,
          tempFee: 0
        }
      }))
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1].substr(0, 2);
      console.log('loadData')
      this.getcashPiaList();
    })

  }


  handle_getcashPiaList = (reqInfoMap, message) => {
    const errmsg = message['Message'];
    clearTimeout(this.getCashPialistFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getCashPialistFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, message['Code'], this.component)
      }
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata, totalAmt, totalAmtApr, tempFee;
      try {
        jsondata = JSON.parse(message['Data']);
        totalAmt = jsondata[0]['c10'];
        totalAmtApr = jsondata[0]['c11'];
        tempFee = jsondata[0]['c9'];
      } catch (err) {
        // glb_sv.logMessage(err);
        jsondata = [];
        totalAmt = 0;
        totalAmtApr = 0;
        tempFee = 0;
      }
      this.cashPia['totalAmt'] = Number(totalAmt);
      this.cashPia['totalAmtApr'] = Number(totalAmtApr);
      this.cashPia['tempFee'] = Number(tempFee);
      this.setState(prevState => ({
        cashPia: {
          ...prevState.cashPia,
          totalAmtApr: this.cashPia['totalAmtApr'],
          totalAmt: this.cashPia['totalAmt'],
          tempFee: this.cashPia['tempFee']
        }
      }))
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getCashPialistFlag = false;
      }
    }
  }

  getcashPiaList = () => {
    if (this.getCashPialistFlag) { return; }
    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }

    this.getCashPialistFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap handle_getcashPiaList
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getCashPialist_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_getcashPiaList
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqLendingAdvance';
    svInputPrm.ServiceName = 'ALTqLendingAdvance_1302_3';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = [' ', this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.getCashPialistFunct_ReqTimeOut = setTimeout(this.solvingPiaFunct_TimeOut,
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

  solvingPiaFunct_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    this.setState({ refreshFlag: '' });
    console.log('solvingPiaFunct_TimeOut', reqIfMap.reqFunct)
    if (reqIfMap.reqFunct === this.getCashPialist_FunctNm) {
      this.getCashPialistFlag = false;
    } else if (reqIfMap.reqFunct === this.cfmSendCashInAdvance_FunctNm) {
      this.setState({ cfm_pia_request: false, cfmSendCashInAdvanceFlag: false });
      this.cfmSendCashInAdvanceFlag = false;
      glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', '', '', null, '', this.component)
    } else if (reqIfMap.reqFunct === this.getTempFeePiaFunctNm) {
      this.setState({ tempFeeCalc: 0 })
    }
  }

  handleChangePia = (e) => {
    const value = glb_sv.filterNumber(e.target.value);
    if (value > 999) { this.cashPia.pia_amount = FormatNumber(value); }
    else this.cashPia.pia_amount = value;
    this.setState(prevState => ({
      cashPia: {
        ...prevState.cashPia,
        pia_amount: this.cashPia.pia_amount
      }
    }))
  }

  validateInput = () => {
    if (this.state.cashPia.pia_amount === null || this.state.cashPia.pia_amount === "" || this.state.cashPia.pia_amount === 0) {
      this.setState(prevState => ({
        cashPia: {
          ...prevState.cashPia,
          pia_amount_requite: true
        }
      })
      );
    } else {
      this.setState(prevState => ({
        cashPia: {
          ...prevState.cashPia,
          pia_amount_requite: false
        }
      })
      );
    }
  }

  handle_cfrmSendCashInAdvance = (reqInfoMap, message) => {
    clearTimeout(this.cfmSendCashInAdvanceFunct_ReqTimeOut);
    this.setState({ cfmSendCashInAdvanceFlag: false });
    this.cfmSendCashInAdvanceFlag = false;
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    const errmsg = message['Message'];
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, '', this.component)
        this.setState({ cfm_pia_request: false })
      }
    } else {
      this.setState({ cfm_pia_request: false })
      this.cashPia['totalAmt'] = 0;
      this.cashPia['pia_amount'] = 0;
      this.setState(prevState => ({
        cashPia: {
          ...prevState.cashPia,
          pia_amount: this.cashPia['pia_amount'],
          totalAmt: this.cashPia['totalAmt']
        }
      }));
      console.log('handle_cfrmSendCashInAdvance')
      this.getcashPiaList();
      glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'success', '', false, '', this.component)

      const obj = {
        type: commuChanel.ACTION_SUCCUSS,
        data: 'history-list',
        component: this.component
      }
      inform_broadcast(commuChanel.ACTION_SUCCUSS, obj)
    }
  }


  cfrmSendCashInAdvance = (cfmTp) => {
    if (this.cfmSendCashInAdvanceFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_pia_request: false })
      return;
    }

    this.cfmSendCashInAdvanceFlag = true;
    const pia_amountStr = this.cashPia['pia_amount'];
    const pia_amount = filterNumber(pia_amountStr);

    this.setState({ cfm_pia_request: true })
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap handle_cfrmSendCashInAdvance
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.cfmSendCashInAdvance_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_cfrmSendCashInAdvance
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTxLendingAdvance';
    svInputPrm.ServiceName = 'ALTxLendingAdvance_1302_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'I';
    svInputPrm.InVal = [' ', ' ', ' ', this.actn_curr, this.sub_curr, ' ', ' ', ' ', pia_amount + ''];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.cfmSendCashInAdvanceFunct_ReqTimeOut = setTimeout(this.solvingPiaFunct_TimeOut,
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

  openModalConfirmPIA = () => {

    if (this.state.cashPia.pia_amount === null || this.state.cashPia.pia_amount === '') {
      focusELM('cashPia_request_pia');
      checkToast(toast, 'warn', this.props.t('pia_require'), 'pia_require');
      return;
    }
    const pia_amountStr = this.cashPia['pia_amount'];
    const total_pia = this.cashPia['totalAmt'];
    let pia_amount = filterNumber(pia_amountStr);
    if (pia_amount === null || pia_amount === undefined || isNaN(pia_amount)) { pia_amount = 0; }
    if (Number(pia_amount) <= 0) {
      focusELM('cashPia_request_pia');
      checkToast(toast, 'warn', this.props.t('pia_amount_not_correct'), 'pia_amount_not_correctt');
      return;
    };
    if (Number(total_pia) < Number(pia_amount)) {
      focusELM('cashPia_request_pia');
      checkToast(toast, 'warn', this.props.t('pia_amount_over_available'), 'pia_amount_over_availablee');
      return;
    };
    if (!glb_sv.checkOtp('openModalPIA')) {
      if (window.location.pathname.includes('___')) {
        const ermsg = 'notify_user_enter_otp_in_main_screen';
        const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
        glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
      }
      return;
    };
    this.setState({ cfm_pia_request: true });
    this.getTempFeePia()
  }

  getTempFeePia = () => {
    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }
    const pia_amountStr = this.cashPia['pia_amount'];
    const pia_amount = glb_sv.filterNumber(pia_amountStr);
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    const request_seq_comp = this.get_rq_seq_comp();
    reqInfo.reqFunct = this.getTempFeePiaFunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getTempFeePiaFunctNm_ResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqLendingAdvance';
    svInputPrm.ServiceName = 'ALTqLendingAdvance_1302_8';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = [' ', this.actn_curr, this.sub_curr, pia_amount + ''];
    svInputPrm.TotInVal = svInputPrm.InVal.length;


    this.getTempFeePiaFunctNm_ReqTimeOut = setTimeout(this.solvingPiaFunct_TimeOut,
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

  getTempFeePiaFunctNm_ResultProc = (reqInfoMap, message) => {

    clearTimeout(this.getTempFeePiaFunctNm_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    reqInfoMap.procStat = 2;
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, message['Code']); }
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata, tempFee;
      try {
        jsondata = JSON.parse(message['Data']);
        tempFee = Number(jsondata[0]['c0'])
        // console.log('KQ lấy phí tạm tính:', message['Data'])
      } catch (err) {
        // glb_sv.logMessage(err);
        jsondata = [];
        tempFee = 0;
      }
      this.setState({ tempFeeCalc: FormatNumber(tempFee) })
    }
  }

  modalAfterOpened = () => {
    const elm = document.getElementById('bt_send2SvPiaCfmOk');
    if (elm) elm.focus();
  }

  extendInfo = () => {
    this.setState({ showInfos: !this.state.showInfos })
  }

  translateNo(value) {
    if (value > 999) { return (FormatNumber(value)); }
    else return (value);
  }

  handleKeyPress = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which);
    const name = e.target.name;
    if (name === 'cashPia_request_pia' && code === 13) {
      this.openModalConfirmPIA();
    }
  }

  setPiaAll = () => {
    let pia_amt_num = this.state.cashPia['totalAmt'];
    if (!pia_amt_num) pia_amt_num = 0
    const pia_amt = this.translateNo(pia_amt_num)
    this.cashPia.pia_amount = pia_amt_num
    this.setState(prevState => ({
      cashPia: {
        ...prevState.cashPia,
        pia_amount: pia_amt
      }
    })
    );
  }

  handleChangeAccount = ({ value, label }) => {
    this.activeAcnt = value;

    const pieces = value.split('.');
    this.actn_curr = pieces[0];
    this.sub_curr = pieces[1].substr(0, 2);
    this.cashPia.acntNo = value;
    this.setState(prevState => ({
      cashPia: {
        ...prevState.cashPia,
        acntNo: this.cashPia.acntNo
      }
    }))
    if (!glb_sv.flagProcessPopout) {
      console.log('handleChangeAccount')
      this.getcashPiaList();
    };
  }

  render() {
    const { t } = this.props
    const total = this.translateNo(this.state.cashPia.totalAmtApr + this.state.cashPia.totalAmt);
    return (
      <div className='cashin-advance ' style={{ padding: 10 }}>
        <div className="card form-cash-transaction">
          <div className="card-body widget-body">
            <div className="form-group row">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('trans_sub_account')}
              </label>
              <div className='col-sm-7 no-padding-left'>
                <SearchAccount
                  handleChangeAccount={this.handleChangeAccount}
                  component={this.component}
                  req_component={this.req_component}
                  get_rq_seq_comp={this.get_rq_seq_comp}
                  get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                  language={this.props.language}
                  themePage={this.props.themePage}
                  style={this.props.style}
                  isShowDetail={true}
                />
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 col-sm control-label no-padding-right text-left">{t('total_pia_amount')}</label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {total}
                </span>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('cash_of_PIA')}<span className="mustInput">*</span></label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <Input
                  inputtype={"text"}
                  name={"cashPia_request_pia"}
                  value={this.state.cashPia.pia_amount}
                  onChange={this.handleChangePia}
                  onBlur={this.validateInput}
                  onKeyDown={this.handleKeyPress}
                  classextend={'form-control-sm text-right'}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 'unset' }}>

              <span className="cursor_ponter" style={{ color: '#00d3b8', display: 'inline-block', width: '100%', whiteSpace: 'nowrap', fontSize: 12 }}>
                <span onClick={this.setPiaAll} style={{ float: 'right' }}>{t('PIA_all_money')}</span>
              </span>
            </div>
            <div className="hr" style={{ clear: 'both', marginBottom: 10 }}></div>

            <div className="form-group row ">
              <label className="col-sm-5 col-sm control-label no-padding-right text-left">{t('total_pia_amount_wait_approve')}</label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {FormatNumber(this.state.cashPia['totalAmtApr'], 0, 0)}
                </span>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 col-sm control-label no-padding-right text-left">{t('total_pia_amount_wait_remain')}</label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {FormatNumber(this.state.cashPia['totalAmt'], 0, 0)}
                </span>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 col-sm control-label no-padding-right text-left">{t('pia_loan_fee')}</label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {FormatNumber(this.state.cashPia['tempFee'], 0, 0)}
                </span>
              </div>
            </div>
            {/* </React.Fragment>} */}
            <div className="form-group row" style={{ marginTop: 25 }}>
              <div className='col-sm fullWidthButton'>
                <button className="btn btn-pill btn-sm btn-block pull-right btn-wizard" onClick={this.openModalConfirmPIA}>
                  {t('common_button_sumbit')} &nbsp;
                        <i className="fa fa-check" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* <div style={{ paddingBottom: 36, marginTop: 7 }}>
          <button className="btn btn-pill pull-right btn-wizard" onClick={this.openModalConfirmPIA}>
            {t('common_button_sumbit')} &nbsp;
                  <i className="fa fa-check" />
          </button>
        </div> */}

        <div
          id="divBottom"
          className="panel-body"
          style={{ height: 'calc(100% - 35px)' }}>
          <TabPane tabId="3" data-tut="reactour__bottom_transactionlist">
            <HistoryList t={t}
              getList={this.state.getList}
              get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
              component={this.component}
              req_component={this.req_component}
              get_rq_seq_comp={this.get_rq_seq_comp}
              name={this.state.name}
              activeAcnt={this.state.cashPia.acntNo}
            />
          </TabPane>
        </div>

        {/* modal Xác thực gửi yêu cầu */}
        <Modal
          isOpen={this.state.cfm_pia_request}
          size={"sm modal-notify"}
          onClosed={this.modalModalClose}
          onOpened={this.modalAfterOpened}>
          <ModalHeader>
            {t('common_notify')}
          </ModalHeader>
          <ModalBody>
            {t('confirm_pia_message')} {this.state.cashPia['pia_amount']} {'VNĐ; '} {this.state.tempFeeCalc !== '' && t('pia_loan_fee')} {this.state.tempFeeCalc} {this.state.tempFeeCalc !== '' && 'VNĐ'}?
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_send2SvPiaCfmOk"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.cfrmSendCashInAdvance('Y')}>
                    {this.state.cfmSendCashInAdvanceFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.cfrmSendCashInAdvance('N')}>
                    <span>{t('common_No')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>
      </div>
    )
  }
}

export default translate('translations')(CashinAdvance);