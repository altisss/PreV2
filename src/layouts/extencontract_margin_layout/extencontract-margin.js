import React, { PureComponent } from 'react'
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
// import SelectBasic from "../form-basic/SelectBasic";
import ReactTable from "react-table";
import styled from 'styled-components'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import functionList from '../../constants/functionList';
import commuChanel from '../../constants/commChanel'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';


import { filterNumber } from '../../utils/filterNumber'
import { checkOtp, send_checkOTP } from '../../utils/checkOtp'
import { ModalConfirmGottenOTP } from '../../conponents/modal_confirm_gotten_otp/modal_confirm_gotten_otp'
import TableRepayMargin from '../repay_margin_layout/table-repay-margin'

const remote = require('electron').remote;

const LayoutWrapper = styled.div`
  div {
    .rt-tr {
      width: 100%;
    }
  }
`

class ExtenContract extends PureComponent {
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
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_ACT}_${this.component}`)
      })
    }
    this.state = {
      extendrpMargin: {},
      ctrInfo: {},
      acntItems: [],
      data: [],
      cfm_ext_ctr_mrg_overtime: false,
      cfm_ext_ctr_mrg_confirm: false,

      name: this.props.name,
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style,
      cfm_mrg_request: false,
      rpMargin: {
        acntNo: '00',
        contractNo: null,
        contractNo_require: false,
        loan_date: null,
        loan_amount: null,
        loan_current: null,
        interest_amount: null,
        avablAmt: 0,
        repayAmt: '',
        repayAmt_require: false
      },
    }
  }

  actn_curr = '';
  sub_curr = '';

  // -------------------------------
  currCtrInfo = {};
  extendrpMargin = {};
  acntItems = [];
  // -- get current margin contract list
  rpMarginListDataTable = [];
  rpMarginListTemple = [];
  getrpMarginlistFlag = false;
  getrpMarginlist_FunctNm = 'EXTENDMARGIN_001';
  getrpMarginlistFlag2 = false
  // -- send extended margin contract
  ctrInfo = {};
  extentDtnumb = '';
  cfmSendExtMarginFlag = false;
  cfmSendExtMargin_FunctNm = 'EXTENDMARGIN_002';

  cfmSendRepayMarginFlag = false;

  popin_window() {
    const current_window = remote.getCurrentWindow();
    // const state = {parent_id: this.state.parent_id, config: this.state.config, name: this.state.name, component: this.state.component}
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }
  // popin_window() {
  //   const current_window = remote.getCurrentWindow();
  //   window.ipcRenderer.send(commuChanel.popin_window, {state: this.state, component: this.component})
  //   current_window.close();
  // }

  column = [
    {
      Header: "#", show: true, width: 135, headerClassName: 'text-center', className: 'text-center',
      Cell: props => <><button type="button" onClick={() => this.chooseMrgContract(props.original, 1)} style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('ext_margin_contract')}</button>
        {" | "}<button type="button" onClick={() => this.chooseMrgContract2(props.original, 1)} style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('regit_repay')}</button></>
    },
    {
      Header: "contract_no", accessor: "c0", show: true, width: 150, headerClassName: 'text-center', className: 'text-center',
      Cell: props => <span className={props.original.c55 === 'Y' ? 'sellColor' : (props.original.c55 === 'N' ? 'buyColor' : 'oReangColor')}>{props.original.c0}</span>
    },
    { Header: "loan_date", accessor: "c3", show: true, width: 92, headerClassName: 'text-center', className: 'text-center' },
    {
      Header: "loan_date_expire", accessor: "c4", show: true, width: 128, headerClassName: 'text-center', className: 'text-center'
    },
    { Header: "loan_amount", accessor: "c27", show: true, width: 95, headerClassName: 'text-right', className: 'text-right' },
    { Header: "loan_current", accessor: "c28", show: true, width: 145, headerClassName: 'text-center', className: 'text-right' },
    { Header: "interest_contemp", accessor: "c37", show: true, width: 120, headerClassName: 'text-center', className: 'text-right' },
    { Header: "Overdue_interest_contemplated", accessor: "c38", show: true, width: 181, headerClassName: 'text-center', className: 'text-right' },
    { Header: "Renewed_interest_contemplated", accessor: "c39", show: true, width: 220, headerClassName: 'text-center', className: 'text-right' },
    { Header: "Prepayment_penalty_interest_contemplated", accessor: "c40", show: true, width: 260, headerClassName: 'text-center', className: 'text-right' },
    { Header: "extend_contract_number", accessor: "c50", show: true, width: 190, headerClassName: 'text-center', className: 'text-right' },
  ];

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
      this.extendrpMargin = agrs.state.extendrpMargin
    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      // update state after popin window
      this.setState(agrs.state)

    })
  }

  componentDidMount() {
    this.rpMargin = this.state.rpMargin;

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
      if (this.state.cfm_ext_ctr_mrg_confirm) this.setState({ cfm_ext_ctr_mrg_confirm: false });
      else if (this.state.cfm_ext_ctr_mrg_overtime) this.setState({ cfm_ext_ctr_mrg_overtime: false });
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
      change_theme(agrs)
      this.setState({ themePage: agrs })
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
      change_language(agrs, this.props)
      this.setState({ language: agrs })
    })
    window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
      const functionNm = msg['data'];
      if (functionNm === 'cfm_mrg_request') {
        this.setState({ cfm_mrg_request: true });
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
    if (this.getoddlotStklistFunct_ReqTimeOut) { clearTimeout(this.getoddlotStklistFunct_ReqTimeOut); }
    if (this.cfmSendOddlotOrderFunct_ReqTimeOut) { clearTimeout(this.cfmSendOddlotOrderFunct_ReqTimeOut); }
    if (this.getoddlotOrdlistFunct_ReqTimeOut) { clearTimeout(this.getoddlotOrdlistFunct_ReqTimeOut); }
    if (this.cnlOddLotOrderFunct_ReqTimeOut) { clearTimeout(this.cnlOddLotOrderFunct_ReqTimeOut); }
  }

  cfrmSendRepayMargin = (cfmTp) => {
    if (this.cfmSendRepayMarginFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_mrg_request: false });
      return;
    }

    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'objShareGlb', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, objShareGlb) => {
      //update session for popout component
      glb_sv.objShareGlb = objShareGlb

      const repayAmtStr = this.rpMargin['repayAmt'];
      const repayAmt = filterNumber(repayAmtStr);

      this.cfmSendRepayMarginFlag = true;
      // -- call service for place order
      const request_seq_comp = this.get_rq_seq_comp()
      const reqInfo = new requestInfo();
      reqInfo.reqFunct = this.cfmSendRepayMargin_FunctNm;
      reqInfo.component = this.component;
      reqInfo.receiveFunct = this.handle_cfrmSendRepayMargin
      // -- service info
      let svInputPrm = new serviceInputPrm();
      svInputPrm.WorkerName = 'ALTxLendingMargin';
      svInputPrm.ServiceName = 'ALTxLendingMargin_1402';
      svInputPrm.ClientSentTime = '0';
      svInputPrm.Operation = 'I';
      svInputPrm.InVal = ['1', this.rpMargin['contractNo'], repayAmt + ''];
      svInputPrm.TotInVal = svInputPrm.InVal.length;

      this.cfmSendRepayMarginFunct_ReqTimeOut = setTimeout(this.solvingMrgFunct_TimeOut,
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
    })

  }

  handle_cfrmSendRepayMargin = (reqInfoMap, message) => {
    this.cfmSendRepayMarginFlag = false;

    reqInfoMap.procStat = 2;

    const errmsg = message['Message'];
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, message['Code'], this.component)
        this.setState({ cfm_mrg_request: false });
      }
    } else {
      this.setState({ cfm_mrg_request: false });
      this.resetContractInfo();
      this.getAllofInfo();
      glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'success', '', false, '', this.component)

      const obj = {
        type: commuChanel.ACTION_SUCCUSS,
        data: 'history-list',
        component: this.component
      }
      inform_broadcast(commuChanel.ACTION_SUCCUSS, obj)
    }
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
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['objShareGlb','activeAcnt'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
      const objShareGlb = agrs.get('objShareGlb')
      const activeAcnt = agrs.get('activeAcnt')
      // update session for popout windows
      glb_sv.objShareGlb = objShareGlb

      this.acntItems = objShareGlb['acntNoList'];
      this.setState({ acntItems: this.acntItems });
      let acntStr = '';
      if (activeAcnt !== null && activeAcnt !== undefined &&
        activeAcnt.substr(11) !== '%') {
        acntStr = activeAcnt;
      } else {
        acntStr = objShareGlb['acntNoList'][0]['id'];
      }
      this.setState(prevState => ({
        extendrpMargin: {
          ...prevState.extendrpMargin,
          acntNo: acntStr,
          avablAmt: 0
        }
      }));
      this.extendrpMargin.acntNo = acntStr;
      this.extendrpMargin['avablAmt'] = 0;
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1];

      this.rpMargin['acntNo'] = acntStr;
      this.rpMargin['avablAmt'] = 0;
      this.setState(prevState => ({
        rpMargin: {
          ...prevState.rpMargin,
          acntNo: this.rpMargin.acntNo,
          avablAmt: this.rpMargin.avablAmt,
        }
      }))

      this.getrpMarginList()
    })

  }

  getMaxCurrLoan() {
    const repayAmt = Math.min(Number(this.rpMargin['avablAmt']), Number(this.rpMargin['lndCurr']) + Number(this.rpMargin['intAmt']));
    this.rpMargin['repayAmt'] = FormatNumber(repayAmt);
    this.setState(prevState => ({
      rpMargin: {
        ...prevState.rpMargin,
        repayAmt: this.rpMargin.repayAmt
      }
    }))
  }

  getrpMarginList2 = () => {
    if (this.getrpMarginlistFlag2) { return; }
    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
    //   const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
    //   glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning');
    //   return;
    // }
    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }

    this.getrpMarginlistFlag2 = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap handle_getrpMarginList
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getrpMarginlist_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_getrpMarginList2
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqLendingMargin';
    svInputPrm.ServiceName = 'ALTqLendingMargin_1402_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['OTSRPY', this.actn_curr, this.sub_curr, '6', '%', '0', 'z',''];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.getrpMarginlistFunct_ReqTimeOut = setTimeout(this.solvingMrgFunct_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    this.rpMarginListTemple = [];
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

  handle_getrpMarginList2 = (reqInfoMap, message) => {
    clearTimeout(this.getrpMarginlistFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    const errmsg = message['Message'];
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getrpMarginlistFlag2 = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, message['Code'], this.component)
      }
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
      } catch (err) {
        jsondata = [];
      }
      this.rpMarginListTemple = this.rpMarginListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getrpMarginlistFlag = false;
        this.dataFlag = false;
        for (let i = 0; i < this.state.data.length; i++) {
          for (let j = 0; j < this.rpMarginListTemple.length; j++) {
            if (this.state.data[i].c0 === this.rpMarginListTemple[j].c0) {
              this.state.data[i]['c57'] = FormatNumber(this.rpMarginListTemple[j].c20)
            }
          }
        }
      }
    }
  }






  refreshInfo() {
    this.getrpMarginList();
  }

  onAcntChange = (e) => {

    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['activeAcnt', 'objShareGlb'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {

      let activeAcnt = args.get('activeAcnt')
      const objShareGlb = args.get('objShareGlb')

      // update session for popout window
      glb_sv.objShareGlb = objShareGlb

      const value = e.target.value;
      activeAcnt = value;
      update_value_for_glb_sv({ component: this.component, key: 'activeAcnt', value: value })
      const pieces = value.split('.');
      this.actn_curr = pieces[0];
      this.sub_curr = pieces[1];
      this.currCtrInfo = {};
      this.getrpMarginList();
      this.setState(prevState => ({
        extendrpMargin: {
          ...prevState.extendrpMargin,
          acntNo: value
        }
      }));
    })

  }

  solvingMrgFunct_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    // glb_sv.setReqInfoMapValue(cltSeq, reqIfMap);
    this.req_component.set(cltSeq, reqIfMap);

    this.setState({ refreshFlag: '' });
    if (reqIfMap.reqFunct === this.getrpMarginlist_FunctNm) {
      this.getrpMarginlistFlag = false;
    } else if (reqIfMap.reqFunct === this.cfmSendExtMargin_FunctNm) {
      this.setState({ cfmSendExtMarginFlag: false });
      this.cfmSendExtMarginFlag = false;
    }
    glb_sv.openAlertModalModal('', 'common_InfoMessage', 'common_cant_connect_server', '', '', '', false, '', this.component)
  }

  getrpMarginList = () => {
    if (this.getrpMarginlistFlag) { return; }
    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }

    this.getrpMarginlistFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getrpMarginlist_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_getrpMarginList;
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqLendingMargin';
    svInputPrm.ServiceName = 'ALTqLendingMargin_Online_1404';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = [this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.getrpMarginlistFunct_ReqTimeOut = setTimeout(this.solvingMrgFunct_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    this.req_component.set(request_seq_comp, reqInfo)
    this.rpMarginListTemple = [];
    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm: svInputPrm
    })
  }

  handle_getrpMarginList = (reqInfoMap, message) => {
    const errmsg = message['Message'];
    clearTimeout(this.getrpMarginlistFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getrpMarginlistFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false);
      }
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
      } catch (err) {
        jsondata = [];
      }
      this.rpMarginListTemple = this.rpMarginListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getrpMarginlistFlag = false;
        let data = [...this.rpMarginListTemple];
        if (data) {
          data = data.map(item => {
            item.c3 = this.transDate(item.c3);
            item.c4 = this.transDate(item.c4);
            item.c27 = FormatNumber(item.c27);
            item.c28 = FormatNumber(item.c28);
            item.c37 = FormatNumber(item.c37);
            item.c38 = FormatNumber(item.c38);
            item.c39 = FormatNumber(item.c39);
            item.c40 = FormatNumber(item.c40);
            item.c50 = FormatNumber(item.c50);
            return item;
          })
        }
        this.setState({ data: data });
      }
    }
    // this.getrpMarginList2()
  }


  cfmSendExtMargin = (cfmTp) => {
    if (this.cfmSendExtMarginFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_ext_ctr_mrg_confirm: false });
      return;
    }
    if (this.extentDtnumb === '' || this.extentDtnumb === null) {
      const ermsg = 'plz_input_date_number_for_extend_contract';
      glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'ok', '', '', this.component)
      const elm = document.getElementById('extentDtnumb');
      if (elm) elm.focus();
      return;
    }

    const extendDt = filterNumber(this.extentDtnumb);
    this.cfmSendExtMarginFlag = true;
    this.setState({ cfmSendExtMarginFlag: true });
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap handle_cfmSendExtMargin
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.cfmSendExtMargin_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_cfmSendExtMargin
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTxLendingMargin';
    svInputPrm.ServiceName = 'ALTxLendingMargin_1404_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'I';
    svInputPrm.InVal = [this.ctrInfo['c0'], this.ctrInfo['c1'], extendDt + ''];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.cfmSendExtMarginFunct_ReqTimeOut = setTimeout(this.solvingMrgFunct_TimeOut,
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

  handle_cfmSendExtMargin = (reqInfoMap, message) => {
    const errmsg = message['Message'];
    clearTimeout(this.cfmSendExtMarginFunct_ReqTimeOut);
    this.setState({ cfmSendExtMarginFlag: false });
    this.cfmSendExtMarginFlag = false;
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false);
        this.setState({ cfm_ext_ctr_mrg_confirm: false });
      }
    } else {
      this.setState({ cfm_ext_ctr_mrg_confirm: false });
      this.refreshInfo();
      glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'success');
    }
  }

  // --- get history Margin contract
  chooseMrgContract = (item, acTp) => {
    if (this.state.cfmSendExtMarginFlag || !item) { return; }
    this.ctrInfo = item;
    this.setState({ ctrInfo: item });
    this.setState(prevState => ({
      ctrInfo: {
        ...prevState.ctrInfo,
        acntNo: ''
      }
    }));
    if (acTp === 1) {
      // if (item.c51 !== 'Y') return;
      if (item.c55 === 'Y') {
        this.setState({ cfm_ext_ctr_mrg_overtime: true });
        const elm = document.getElementById('bt_GotoRepayMargin');
        setTimeout(() => { if (elm) elm.focus(); }, 200);
        return;
      }
      this.setState({ cfm_ext_ctr_mrg_confirm: true });
      const elm = document.getElementById('extentDtnumb');
      setTimeout(() => { if (elm) elm.focus(); }, 200);
    } else if (acTp === 2) {
      //-- router to repay margin
      // this.gotoRepayMarginY();
    }
  }

  chooseMrgContract2 = (item, acTp) => {
    console.log('item', item)
    this.setState(prevState => ({
      rpMargin: {
        ...prevState.rpMargin,
        contractNo_require: false
      }
    }));

    if (this.cfmSendRepayMarginFlag) { return; }

    if (item['c0'] !== null && item['c0'] !== undefined) {
      this.currCtrInfo = item;
      this.getCtrForRepay(item, acTp);
      this.getCtrDetailInfoList(item['c0']);
    }
  }

  gotoRepayMargin = (acTp) => {
    // jQuery('#modal_ext_ctr_mrg_overtime').modal('hide');
    this.setState({ cfm_ext_ctr_mrg_overtime: false });
    if (acTp === 'Y') {
      this.gotoRepayMarginY();
    }
  }

  gotoRepayMarginY() {
    //-- contractNo
    // this.router.navigate(['pages/repay-margin'], { queryParams: { ctrno: this.ctrInfo['c0'] } });
    // this.props.history.push("/main-app/repay-margin");
  }

  modalAfterOpened = (key) => {
    if (key === 1) {
      const elm = document.getElementById('extentDtnumb');
      if (elm) elm.focus();
    } else if (key === 2) {
      const elm = document.getElementById('bt_GotoRepayMargin');
      if (elm) elm.focus();
    }
  }
  transTitle(item) {
    return { Header: this.props.t(item.Header), accessor: item.accessor, show: item.show, headerClassName: item.headerClassName, className: item.className, Cell: item.Cell, width: item.width };
  }
  transData(item) {
    if (this.dataFlag) {
      return {
        c0: item.c0, c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5, c6: item.c6, c7: item.c7, c8: item.c8,
        c9: item.c9
      }
    }
    if (Number(item.c9) > 999) {
      item.c9 = FormatNumber(item.c9);
    }
    if (Number(item.c3) > 999) {
      item.c3 = FormatNumber(item.c3);
    }
    if (Number(item.c4) > 999) {
      item.c4 = FormatNumber(item.c4);
    }
    if (Number(item.c8) > 999) {
      item.c8 = FormatNumber(item.c8);
    }
    if (Number(item.c7) > 999) {
      item.c7 = FormatNumber(item.c7);
    }
    this.dataFlag = true;
    return {
      c0: item.c0, c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5, c6: item.c6, c7: item.c7, c8: item.c8,
      c9: item.c9
    }
  }
  transTime = (value) => {
    if (value === '' || value === null) return value;
    const day = value.substr(0, 2);
    const month = value.substr(2, 2);
    const year = value.substr(4, 2);
    return (day + ':' + month + ':' + year);
  }

  transDate = (value) => {
    if (value === '' || value === null) return value;
    const day = value.substr(0, 2);
    const month = value.substr(2, 2);
    const year = value.substr(4, 4);
    return (day + '/' + month + '/' + year);
  }

  handleKeyPress = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which);
    const name = e.target.name;
    if (name === 'extentDtnumb' && code === 13) {
      this.cfmSendExtMargin('Y');
    }
  }

  handleExtend = (e) => {
    const value = e.target.value;
    const fixvalue = filterNumber(value);
    this.extentDtnumb = fixvalue;
    this.setState(prevState => ({
      ctrInfo: {
        ...prevState.ctrInfo,
        acntNo: FormatNumber(fixvalue)
      }
    }));
  }

  getNewInformation() {
    this.setState({ refreshFlag: 'fa-spin' });
    this.getrpMarginList();
  }


  getCtrDetailInfoList = (contractNo) => {
    if (contractNo === null || contractNo === undefined || contractNo.length === 0) { return; }
    if (this.getctrDetailListFlag) { return; }

    this.getctrDetailListFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap  hanlde_getCtrDetailInfoList
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getctrDetailList_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.hanlde_getCtrDetailInfoList
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqLendingMargin';
    svInputPrm.ServiceName = 'ALTqLendingMargin_1402_2';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['OTSDTL', contractNo];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.getctrDetailListFunct_ReqTimeOut = setTimeout(this.solvingMrgFunct_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    this.ctrDetailListTemple = [];
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

  hanlde_getCtrDetailInfoList = (reqInfoMap, message) => {
    clearTimeout(this.getctrDetailListFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    const errmsg = message['Message'];
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getctrDetailListFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, message['Code'], this.component)
      }
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
      } catch (err) {
        jsondata = [];
      }
      this.ctrDetailListTemple = this.ctrDetailListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getctrDetailListFlag = false;
        let data = [...this.ctrDetailListTemple];
        data = data.map(item => {
          item.c4 = this.transDate(item.c4);
          item.c5 = this.transDate(item.c5);
          for (let i = 6; i < 16; i++) {
            item['c' + i] = FormatNumber(item['c' + i]);
          }
          item.c17 = this.transDate(item.c17);
          item.c19 = this.transTime(item.c19);
          return item;
        })
        this.setState({ data_cancel: data });
      }
    }
  }

  getCtrForRepay(item, acTp) {
    this.rpMargin['contractNo'] = item['c0'];
    this.rpMargin['loan_date'] = item['c3'];
    this.rpMargin['lndAmt'] = item['c27'];
    this.rpMargin['lndCurr'] = item['c28'];
    this.rpMargin['intAmt'] = item['c37'];
    this.rpMargin['repayAmt'] = '';
    this.rpMargin['avablAmt'] = item['c57'] ? item['c57'] : 0;
    this.setState({ rpMargin: this.rpMargin })
    if (acTp === 1) {
      const elm = document.getElementById('rpMargin_repayAmtID');
      if (elm) elm.focus();

    }
  }

  handleChangePrice = (e) => {
    const value = filterNumber(e.target.value);
    if (value > 999) { this.rpMargin.repayAmt = FormatNumber(value); }
    else this.rpMargin.repayAmt = value;
    this.setState(prevState => ({
      rpMargin: {
        ...prevState.rpMargin,
        repayAmt: this.rpMargin.repayAmt
      }
    }))
  }

  validateInput = (e) => {
    if (this.state.rpMargin.repayAmt === null || this.state.rpMargin.repayAmt === "") {
      this.setState(prevState => ({
        rpMargin: {
          ...prevState.rpMargin,
          repayAmt_require: true
        }
      })
      );
    } else {
      this.setState(prevState => ({
        rpMargin: {
          ...prevState.rpMargin,
          repayAmt_require: false
        }
      })
      );
    }
  }

  openModalConfirmRepayMargin = () => {

    if (this.state.rpMargin.repayAmt === null || this.state.rpMargin.repayAmt === '') {
      this.setState(prevState => ({
        rpMargin: {
          ...prevState.rpMargin,
          repayAmt_require: true
        }
      }))
      return;
    }
      const repayAmtStr = this.rpMargin['repayAmt'];
      const avablAmt = this.rpMargin['avablAmt'];
      let repayAmt = ((repayAmtStr < 1000) ? repayAmtStr : filterNumber(repayAmtStr));
      if (repayAmt === null || repayAmt === undefined || isNaN(repayAmt)) { repayAmt = 0; }
      if (Number(repayAmt) <= 0) {
        const ermsg = 'repayAmt_not_correct';
        glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'rpMargin_repayAmtID', false, '', this.component)
        return;
      };
      if (Number(avablAmt) < Number(repayAmt)) {
        const ermsg = 'repay_amt_over_available';
        glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'rpMargin_repayAmtID', false, '', this.component)
        return;
      };
      if (Number(this.rpMargin['lndCurr']) + Number(this.rpMargin['intAmt']) < Number(repayAmt)) {
        const ermsg = 'repayAmt_cant_over_total_must_repay';
        glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'rpMargin_repayAmtID', false, '', this.component)
        return;
      };
      if (!glb_sv.checkOtp('cfm_mrg_request')) {
        if (window.location.pathname.includes('___')) {
          const ermsg = 'notify_user_enter_otp_in_main_screen';
          const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
          glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
        }
        return;
      };
      this.setState({ cfm_mrg_request: true });
  }
  handleChangeAccount = ({ value, label }) => {
    this.activeAcnt = value;
    const pieces = value.split('.');
    this.actn_curr = pieces[0];
    this.sub_curr = pieces[1].substr(0, 2);
    this.rpMargin.acntNo = value;
    this.setState(prevState => ({
      rpMargin: {
        ...prevState.rpMargin,
        acntNo: this.rpMargin.acntNo,
      }
    }));
    if (!glb_sv.flagProcessPopout) this.delayLoadData();
  }

  render() {
    const { t } = this.props;
    return (
      <div className='extend-contract' style={{ paddingTop: 10 }}>

        <div className="card form-cash-transaction">
          <div className="card-body widget-body">
            <TableRepayMargin
              rpMargin={this.state.rpMargin}
              t={t}
              handleChangePrice={this.handleChangePrice}
              validateInput={this.validateInput}
              handleKeyPress={this.handleKeyPress}
              openModalConfirmRepayMargin={this.openModalConfirmRepayMargin}
              handleChangeAccount={this.handleChangeAccount}
              get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
              component={this.component}
              req_component={this.req_component}
              get_rq_seq_comp={this.get_rq_seq_comp}
            />
          </div>
        </div>

        <ReactTable
          data={this.state.data}
          columns={this.column.map(item => this.transTitle(item))}
          pageSize={this.state.data.length < 10 ? 10 : this.state.data.length}
          showPagination={false}
          style={{
            height: 285,
            top: 5
          }}
          NoDataComponent={() => {
            return <div className="rt-noData hideClass">{this.props.t('common_NoDataFound')}</div>
          }}
          className="-striped -highlight"
        />

        {/* modal Xác thực gửi yêu cầu */}
        <Modal
          isOpen={this.state.cfm_mrg_request}
          size={"sm modal-notify"}
          onClosed={this.modalModalClose}
          onOpened={this.modalAfterOpened}>
          <ModalHeader>
            {t('common_notify')}
          </ModalHeader>
          <ModalBody>
            {t('confirm_register_margin_repay')}:
            <br /> {t('loan_contract_number')}: {this.state.rpMargin['contractNo']}
            <br /> {t('repay_amount')}: {this.state.rpMargin['repayAmt']} VNĐ?
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_send2SvmrgCfmOk"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.cfrmSendRepayMargin('Y')}>
                    {this.state.reqWithdrawFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.cfrmSendRepayMargin('N')}>
                    <span>{t('common_No')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>


        {/* Form gia hạn hợp đồng ký quỹ */}
        <Modal
          isOpen={this.state.cfm_ext_ctr_mrg_confirm}
          size={"md modal-notify"}
          // onClosed={this.modalModalClose}
          onOpened={() => this.modalAfterOpened(1)}>
          <ModalHeader>
            {t('sb_exten_ctrmargin')}
          </ModalHeader>
          <ModalBody>

            <div className="form-group row">
              <label style={{ textAlign: 'left' }} className="col-sm-3 control-label no-padding-right marginAuto">{t('contract_no')}</label>
              <div className="col-sm-9">
                <span className="form-control form-control-sm text-center">
                  {this.state.ctrInfo['c0']}
                </span>
              </div>
            </div>
            <div className="form-group row">
              <label style={{ textAlign: 'left' }} className="col-sm-3 control-label no-padding-right marginAuto">{t('loan_date')}</label>
              <div className="col-sm-3">
                <span className="form-control form-control-sm text-center">
                  {this.state.ctrInfo['c3']}
                </span>
              </div>
              <label style={{ textAlign: 'left' }} className="col-sm-3 control-label no-padding-right marginAuto">{t('loan_date_expire')}</label>
              <div className="col-sm-3">
                <span className="form-control form-control-sm text-center">
                  {this.state.ctrInfo['c4']}
                </span>
              </div>
            </div>
            <div className="form-group row">
              <label style={{ textAlign: 'left' }} className="col-sm-3 control-label no-padding-right marginAuto">{t('Số ngày gia hạn')}
              </label>
              <div className="col-sm-9">
                <input type="text" onKeyDown={this.handleKeyPress} id="extentDtnumb" name="extentDtnumb" value={this.state.ctrInfo.extentDtnumb}
                  onChange={this.handleExtend} autoFocus className="form-control form-control-sm text-right" autoComplete="off" />
              </div>
            </div>

          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_sendMsgmrgCfmOk"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.cfmSendExtMargin('Y')}>
                    {this.state.cfmSendExtMarginFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.cfmSendExtMargin('N')}>
                    <span>{t('common_No')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>

        {/* Form thông báo hết hạn hợp đồng ký quỹ */}
        <Modal
          isOpen={this.state.cfm_ext_ctr_mrg_overtime}
          size={"md modal-notify"}
          // onClosed={this.modalModalClose}
          onOpened={() => this.modalAfterOpened(2)}>
          <ModalHeader>
            {t('sb_exten_ctrmargin')}
          </ModalHeader>
          <ModalBody>
            <div class="form-group row">
              <label style={{ textAlign: 'left', whiteSpace: 'normal' }} class="col-sm-12 control-label no-padding-right">{t('contract_over_expire_date')}</label>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_GotoRepayMargin"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.gotoRepayMargin('Y')}>
                    <span>{t('common_Ok')}</span>
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.gotoRepayMargin('N')}>
                    <span>{t('common_No')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>
      </div >
    )
  }
}

export default translate('translations')(ExtenContract);