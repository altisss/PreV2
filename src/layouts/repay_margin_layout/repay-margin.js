import React, { PureComponent } from 'react'
import ReactTable from "react-table";
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import styled from 'styled-components'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import functionList from '../../constants/functionList';
import commuChanel from '../../constants/commChanel'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';
import { toast } from 'react-toastify';
import { filterNumber } from '../../utils/filterNumber'
import { ModalConfirmGottenOTP } from '../../conponents/modal_confirm_gotten_otp/modal_confirm_gotten_otp'
import TableRepayMargin from './table-repay-margin'

const remote = require('electron').remote;

const LayoutWrapper = styled.div`
  div {
    .rt-tr {
      width: 100%;
    }
  }
`

class RepayMargin extends PureComponent {
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
      data: [],
      data_cancel: [],
      // columns: this.columnsData,
      columnsCancel: this.columnsCancel,
      selected: null,
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
      cfm_mrg_request: false,
      tooltipOpen_repay_max: false,
      acntItems: [],
      list_data: 'btn-bg-link',
      list_cancel: '',
      canclRpMarg: {},
      cfm_mrg_cancl_confirm: false,
      refreshFlag: '',
      activeTab: '1',

      name: this.props.name,
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style,
      cfm_inform_otp: false
    };
  }

  popin_window() {
    const current_window = remote.getCurrentWindow();
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }

  // -- get current margin contract list
  rpMarginListDataTable = [];
  rpMarginListTemple = [];
  getrpMarginlistFlag = false;
  getrpMarginlist_FunctNm = 'REPAYMARGIN_001';
  getrpMarginlistFunct_ReqTimeOut;
  // -- send repay margin
  cfmSendRepayMarginFlag = false;
  cfmSendRepayMargin_FunctNm = 'REPAYMARGIN_003';
  cfmSendRepayMarginFunct_ReqTimeOut;
  dataFlag = false; // flag xác định biến đổi data table
  currCtrInfo = {};
  // -- get repay info detail
  ctrDetailListDataTable = [];
  ctrDetailListTemple = [];
  getctrDetailListFlag = false;
  getctrDetailList_FunctNm = 'REPAYMARGIN_002';
  // -- cancel a margin contract
  canclRpMarg = {};
  cancelRepayMarginFlag = false;
  cancelRepayMargin_FunctNm = 'REPAYMARGIN_004';
  // -- get history of margin list
  getHistObj = {};
  histRpMrgListDataTable = [];
  histRpMrgListTemple = [];
  getHistRpMrgListFlag = false;
  getHistRpMrgList_FunctNm = 'REPAYMARGIN_005';

  columnsData = [
    {
      Header: "#", accessor: "c00", width: 130, show: true, headerClassName: 'text-center', className: 'text-center',
      Cell: props => <><button type="button" onClick={() => this.chooseMrgContract(props.original, 1)} style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('regit_repay')}</button> |
        <button type="button" onClick={() => this.chooseMrgContract(props.original, 2)} style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_Detail')}</button>
      </>
    },
    { Header: "common_index", accessor: "c00", width: 45, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "contract_no", accessor: "c0", width: 145, show: true, headerClassName: 'text-center', className: 'text-left' },
    { Header: "margin_contract_status", accessor: "c2", width: 195, show: true, headerClassName: 'text-center', className: 'text-left' },
    { Header: "loan_date", accessor: "c1", width: 92, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "loan_date_expire", accessor: "c5", width: 124, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "loan_term", accessor: "c6", width: 87, show: true, headerClassName: 'text-right', className: 'text-right' },
    { Header: "loan_amount", accessor: "c8", width: 112, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "loan_current", accessor: "c9", width: 148, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "interest_contemp", accessor: "c15", width: 115, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "Overdue_interest_contemplated", accessor: "c16", width: 178, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "Renewed_interest_contemplated", accessor: "c17", width: 210, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "Prepayment_penalty_interest_contemplated", accessor: "c18", width: 270, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "amount_paid", accessor: "c10", width: 105, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "interest_paid", accessor: "c11", width: 110, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "Overdue_Interest_paid", accessor: "c12", width: 145, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "Renewed_interest_paid", accessor: "c13", width: 161, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "Prepayment_penalty_interest_paid", accessor: "c14", width: 222, show: true, headerClassName: 'text-center', className: 'text-right' },
  ];

  columnsCancel = [
    {
      Header: "#", width: 40, show: true, headerClassName: 'text-center', className: 'text-center',
      Cell: props => <button type="button" disabled={props.original.c24 !== 'N'} onClick={() => this.openModalCancelRepayMrg(props.original)} style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_Cancel')}</button>
    },
    { Header: "contract_no", accessor: "c0", width: 145, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "process_number", accessor: "c1", width: 120, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "common_chanel", accessor: "c22", width: 150, show: true, headerClassName: 'text-center', className: 'text-' },
    { Header: "repay_date", accessor: "c4", width: 104, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "last_repay_date", accessor: "c5", width: 146, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "loan_current", accessor: "c6", width: 145, show: true, headerClassName: 'text-right', className: 'text-right' },
    { Header: "interest_in_time", accessor: "c7", width: 119, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "interest_overdeal", accessor: "c8", width: 119, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "interest_extends", accessor: "c9", width: 129, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "interest_penalty", accessor: "c10", width: 117, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "repay_amount", accessor: "c11", width: 122, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "interest_repay", accessor: "c12", width: 107, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "interest_overdeal_repay", accessor: "c13", width: 170, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "interest_extends_repay", accessor: "c14", width: 154, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "interest_penalty_repay", accessor: "c15", width: 158, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "common_work_user", accessor: "c16", width: 121, show: true, headerClassName: 'text-center', className: 'text-' },
    { Header: "common_work_time", accessor: "c17", width: 147, show: true, headerClassName: 'text-center', className: 'text-' },
    { Header: "approve_status", accessor: "c26", width: 133, show: true, headerClassName: 'text-center', className: 'text-' },
    { Header: "approve_time", accessor: "c19", width: 125, show: true, headerClassName: 'text-center', className: 'text-center' },
  ];

  componentWillMount() {
    window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
      this.setState(agrs.state)
      this.setState({
        parent_id: agrs.parent_id,
        config: agrs.config,
      })
      change_theme(agrs.state.themePage)
      change_language(agrs.state.language, this.props)
      this.rpMargin = agrs.state.rpMargin
    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      // update state after popin window
      this.setState(agrs.state)

    })

  }

  componentDidMount() {
    this.rpMargin = this.state.rpMargin;

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
      // console.log('this.req_component', agrs, this.req_component);
      reply_send_req(agrs, this.req_component)
    })

    window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
      if (this.state.cfm_mrg_request) this.setState({ cfm_mrg_request: false });
      if (this.state.cfm_mrg_cancl_confirm) this.setState({ cfm_mrg_cancl_confirm: false });
      // else {
      //   const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
      //   inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
      // }
    })

    window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
      const functionNm = msg['data'];
      if (functionNm === 'confirmRepayMargin') {
        this.setState({ cfm_mrg_request: true });
        setTimeout(() => {
          const elm = document.getElementById('bt_send2SvmrgCfmOk');
          if (elm) elm.focus();
        }, 300);
      } else if (functionNm === 'cancelRepayMrg') {
        this.setState({ cfm_mrg_cancl_confirm: true });
        setTimeout(() => {
          const elm = document.getElementById('bt_send2SvmrgCfmCancel');
          if (elm) elm.focus();
        }, 300);
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
    clearInterval(this.timeout);
    if (this.getrpMarginlistFunct_ReqTimeOut) { clearTimeout(this.getrpMarginlistFunct_ReqTimeOut); }
    if (this.cfmSendRepayMarginFunct_ReqTimeOut) { clearTimeout(this.cfmSendRepayMarginFunct_ReqTimeOut); }
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
      const objShareGlb = agrs.get('objShareGlb');
      const activeAcnt = agrs.get('activeAcnt');

      glb_sv.objShareGlb = objShareGlb

      this.acntItems = objShareGlb['acntNoList'];
      let acntStr = '';
      if (activeAcnt !== null && activeAcnt !== undefined && activeAcnt !== '' &&
        activeAcnt.substr(11) !== '%') {
        acntStr = activeAcnt;
      } else {
        acntStr = objShareGlb['acntNoList'][0]['id'];
      }
      this.rpMargin['acntNo'] = acntStr;
      this.rpMargin['avablAmt'] = 0;
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1];

      this.getrpMarginList();

      this.setState({ acntItems: this.acntItems });
      this.setState(prevState => ({
        rpMargin: {
          ...prevState.rpMargin,
          acntNo: this.rpMargin.acntNo,
          avablAmt: this.rpMargin.avablAmt,
        }
      }))
    })
  }

  solvingMrgFunct_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    if (reqIfMap.reqFunct === this.getrpMarginlist_FunctNm) {
      this.getrpMarginlistFlag = false;
      this.setState({ refreshFlag: '' });
    } else if (reqIfMap.reqFunct === this.cfmSendRepayMargin_FunctNm) {
      this.cfmSendRepayMarginFlag = false;
      this.setState({ cfmSendRepayMarginFlag: false });
    } else if (reqIfMap.reqFunct === this.cancelRepayMargin_FunctNm) {
      this.cancelRepayMarginFlag = false;
    } else if (reqIfMap.reqFunct === this.getHistRpMrgList_FunctNm) {
      this.getHistRpMrgListFlag = false;
    } else if (reqIfMap.reqFunct === this.getctrDetailList_FunctNm) {
      this.getctrDetailListFlag = false;
    }
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning', '', false, '', this.component)
  }

  handle_getrpMarginList = (reqInfoMap, message) => {
    clearTimeout(this.getrpMarginlistFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    const errmsg = message['Message'];
    console.log('handle_getrpMarginList',message)
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getrpMarginlistFlag = false;
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
        this.rpMarginListDataTable = this.rpMarginListTemple;
        this.dataFlag = false;
        this.setState({ data: [...this.rpMarginListTemple] });
        if (this.currCtrInfo !== null && this.currCtrInfo !== undefined) {
          if (this.rpMarginListDataTable.length > 0) {
            for (let i = 0; i < this.rpMarginListDataTable.length; i++) {
              if (this.rpMarginListDataTable[i]['c0'] === this.currCtrInfo['c0']) {
                this.currCtrInfo = this.rpMarginListDataTable[i];
                break;
              }
            }
          }
          // setTimeout(() => this.chooseMrgContract(this.currCtrInfo, 2), 500);
        }
      }
    }
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
    reqInfo.receiveFunct = this.handle_getrpMarginList
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqLendingMargin';
    svInputPrm.ServiceName = 'ALTqLendingMargin_1402_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['OTSRPY', this.actn_curr, this.sub_curr, '6', '%', '0', 'z', ''];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    console.log("getrpMarginList -> svInputPrm", svInputPrm)

    this.getrpMarginlistFunct_ReqTimeOut = setTimeout(this.solvingMrgFunct_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
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
      glb_sv.focusELM('rpMargin_repayAmtID');
      glb_sv.checkToast(toast, 'warn', this.props.t('repayAmt_not_correct'), 'repayAmt_not_correct');
      return;
    };
    if (Number(avablAmt) < Number(repayAmt)) {
      glb_sv.focusELM('rpMargin_repayAmtID');
      glb_sv.checkToast(toast, 'warn', this.props.t('repay_amt_over_available'), 'repay_amt_over_available');
      return;
    };
    if (Number(this.rpMargin['lndCurr']) + Number(this.rpMargin['intAmt']) < Number(repayAmt)) {
      glb_sv.focusELM('rpMargin_repayAmtID');
      glb_sv.checkToast(toast, 'warn', this.props.t('repayAmt_cant_over_total_must_repay'), 'repayAmt_cant_over_total_must_repay');
      return;
    };

    if (!glb_sv.checkOtp('confirmRepayMargin')) {
      if (window.location.pathname.includes('___')) {
        const ermsg = 'notify_user_enter_otp_in_main_screen';
        const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
        glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
      }
      return;
    };
    this.setState({ cfm_mrg_request: true });
  }

  handle_cfrmSendRepayMargin = (reqInfoMap, message) => {
    clearTimeout(this.cfmSendRepayMarginFunct_ReqTimeOut);
    this.cfmSendRepayMarginFlag = false;
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;

    const errmsg = message['Message'];
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, '', this.component)
        this.setState({ cfm_mrg_request: false });
      }
    } else {
      this.setState({ cfm_mrg_request: false });
      this.resetContractInfo();
      this.getrpMarginList();
      glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'success', '', false, '', this.component)

      const obj = {
        type: commuChanel.ACTION_SUCCUSS,
        data: 'history-list',
        component: this.component
      }
      inform_broadcast(commuChanel.ACTION_SUCCUSS, obj)
    }
  }

  cfrmSendRepayMargin = (cfmTp) => {
    if (this.cfmSendRepayMarginFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_mrg_request: false });
      return;
    }

    const repayAmtStr = this.rpMargin['repayAmt'];
    const repayAmt = filterNumber(repayAmtStr);

    this.cfmSendRepayMarginFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap handle_cfrmSendRepayMargin
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
        // glb_sv.logMessage(err);
        jsondata = [];
      }
      this.ctrDetailListTemple = this.ctrDetailListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getctrDetailListFlag = false;
        // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
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

  getCtrDetailInfoList = (contractNo) => {
    if (contractNo === null || contractNo === undefined || contractNo.length === 0) { return; }
    if (this.getctrDetailListFlag) { return; }
    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
    //   const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
    //   glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', '');
    //   return;
    // }

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

  handle_cfmcanclRpMargContract = (reqInfoMap, message) => {
    clearTimeout(this.cancelRepayMarginFunct_ReqTimeOut);
    this.cancelRepayMarginFlag = false;
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    const errmsg = message['Message'];
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, '', this.component)
      }
    } else {
      this.resetContractInfo();
      this.getrpMarginList();
      glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'success', '', false, '', this.component)
    }
  }

  cfmcanclRpMargContract = (cfmTp) => {
    if (this.cancelRepayMarginFlag) { return; }
    if (cfmTp === 'N') {
      // jQuery('#modal_mrg_cancl_confirm').modal('hide');
      return;
    }

    this.cancelRepayMarginFlag = true;
    const contract = this.canclRpMarg['contract'];
    const proceSeq = this.canclRpMarg['proceSeq'];
    const aprSeq = this.canclRpMarg['apprvSeq'];
    let aprDt = this.canclRpMarg['appDate'];
    if (aprDt != null && aprDt.length > 0) {
      aprDt = aprDt.substring(4, 8) + aprDt.substring(2, 4) + aprDt.substring(0, 2);
    }

    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.cancelRepayMargin_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_cfmcanclRpMargContract
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTxLendingMargin';
    svInputPrm.ServiceName = 'ALTxLendingMargin_1402';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'D';
    svInputPrm.AprStat = 'D';
    svInputPrm.AprSeq = aprSeq;
    svInputPrm.MakerDt = aprDt;
    svInputPrm.InVal = ['1', contract, proceSeq + ''];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.cancelRepayMarginFunct_ReqTimeOut = setTimeout(this.solvingMrgFunct_TimeOut,
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

  handle_getHistRpMrgContractList = (reqInfoMap, message) => {
    clearTimeout(this.getHistRpMrgLisFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    const errmsg = message['Message'];
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getHistRpMrgListFlag = false;
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
      this.histRpMrgListTemple = this.histRpMrgListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getHistRpMrgListFlag = false;
        this.histRpMrgListDataTable = this.histRpMrgListTemple;
      }
    }
  }

  // --- get history Margin contract 
  getHistRpMrgContractList = () => {
    if (this.getHistRpMrgListFlag) { return; }

    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }

    this.getHistObj['start_dt'] = { year: this.dtStart.getFullYear(), month: this.dtStart.getMonth() + 1, day: this.dtStart.getDate() };
    const start_dtOld = this.getHistObj['start_dt'];
    if (start_dtOld === null || start_dtOld === undefined || start_dtOld === '') {
      const ermsg = 'common_plz_input_from_date';
      glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', '', 'getHistObj_start_dt', false, '', this.component)
      return;
    }
    let day = start_dtOld['day'] + '';
    let month = start_dtOld['month'] + '';
    let year = start_dtOld['year'];
    if (day === null || day === undefined || day === '' ||
      month === null || month === undefined || month === '' ||
      year === null || year === undefined || year === '') {
      const ermsg = 'common_plz_input_from_date';
      glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', '', 'getHistObj_start_dt', false, '', this.component)
      return;
    }

    const pad = '00'
    day = pad.substring(0, pad.length - day.length) + day;
    month = pad.substring(0, pad.length - month.length) + month;
    const start_dt = year + month + day;

    this.getHistObj['end_dt'] = { year: this.dtEnd.getFullYear(), month: this.dtEnd.getMonth() + 1, day: this.dtEnd.getDate() };
    const end_dtOld = this.getHistObj['end_dt'];
    if (end_dtOld === null || end_dtOld === undefined || end_dtOld === '') {
      const ermsg = 'common_plz_input_to_date';
      glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', '', 'getHistObj_end_dt', false, '', this.component)
      return;
    };
    day = end_dtOld['day'] + '';
    month = end_dtOld['month'] + '';
    year = end_dtOld['year'];
    if (day === null || day === undefined || day === '' ||
      month === null || month === undefined || month === '' ||
      year === null || year === undefined || year === '') {
      const ermsg = 'common_plz_input_to_date';
      glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', '', 'getHistObj_end_dt', false, '', this.component)
      return;
    };

    day = pad.substring(0, pad.length - day.length) + day;
    month = pad.substring(0, pad.length - month.length) + month;
    const end_dt = year + month + day;
    if (Number(end_dt) < Number(start_dt)) {
      const ermsg = 'common_start_dt_cant_over_end_dt';
      glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', '', 'getHistObj_end_dt', false, '', this.component)
      return;
    }
    const ctr_type = this.getHistObj['ctr_type'];
    const ctr_status = this.getHistObj['ctr_status'];

    this.getHistRpMrgListFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getHistRpMrgList_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_getHistRpMrgContractList

    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqLendingMargin';
    svInputPrm.ServiceName = 'ALTqLendingMargin_1402_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['OTSHIS', this.actn_curr, this.sub_curr, ctr_type, ctr_status, start_dt, end_dt];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.getHistRpMrgLisFunct_ReqTimeOut = setTimeout(this.solvingMrgFunct_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    this.histRpMrgListTemple = [];
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

  openModalCancelRepayMrg = (item) => {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'objShareGlb', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, objShareGlb) => {
      if (item['c24'] !== 'N') { return; }
      this.canclRpMarg['contract'] = item['c0'];
      this.canclRpMarg['appStatus'] = item['c3'];
      this.canclRpMarg['proceSeq'] = item['c1'];
      this.canclRpMarg['apprvSeq'] = item['c21'];
      this.canclRpMarg['appDate'] = item['c20'];
      this.setState({ canclRpMarg: this.canclRpMarg })
      if (!glb_sv.checkOtp('cancelRepayMrg')) {
        if (window.location.pathname.includes('___')) {
          const ermsg = 'notify_user_enter_otp_in_main_screen';
          const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
          glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
        }
        return;
      };
      this.setState({ cfm_mrg_cancl_confirm: true });
    })

  }

  chooseMrgContract = (item, acTp) => {
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

  getCtrForRepay(item, acTp) {
    this.rpMargin['contractNo'] = item['c0'];
    this.rpMargin['loan_date'] = item['c1'];
    this.rpMargin['lndAmt'] = item['c8'];
    this.rpMargin['lndCurr'] = item['c9'];
    // this.rpMargin['intAmt'] = item['c15'];
    this.rpMargin['intAmt'] = item['c21'];
    this.rpMargin['repayAmt'] = '';
    this.rpMargin['avablAmt'] = item['c20'] ? item['c20'] : 0;
    this.setState({ rpMargin: this.rpMargin })
    if (acTp === 1) {
      // document.getElementById('rpMargin_repayAmtID').focus();

      const elm = document.getElementById('rpMargin_repayAmtID');
      if (elm) elm.focus();

    } else {
      this.handleShowCancelList();
    }
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

  resetContractInfo = () => {
    this.rpMargin['contractNo'] = null;
    this.rpMargin['loan_date'] = null;
    this.rpMargin['lndAmt'] = 0;
    this.rpMargin['lndCurr'] = 0;
    this.rpMargin['intAmt'] = 0;
    this.rpMargin['repayAmt'] = '';
    this.rpMargin['avablAmt'] = 0;
    this.setState({ rpMargin: this.rpMargin })
  }

  changAcntNo = (e) => {
    const value = e.target.value;
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['activeAcnt', 'objShareGlb'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
      let activeAcnt = args.get('activeAcnt')
      const objShareGlb = args.get('objShareGlb')

      // update session for popout window
      glb_sv.objShareGlb = objShareGlb

      activeAcnt = value;
      update_value_for_glb_sv({ component: this.component, key: 'activeAcnt', value: activeAcnt })
      const pieces = value.split('.');
      this.actn_curr = pieces[0];
      this.sub_curr = pieces[1].substr(0, 2);
      this.currCtrInfo = {};
      this.resetContractInfo();
      this.getrpMarginList();
      this.setState(prevState => ({
        rpMargin: {
          ...prevState.rpMargin,
          acntNo: value
        }
      }))
    })

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

  modalAfterOpened = () => {

    const elm = document.getElementById('bt_send2SvmrgCfmOk');
    if (elm) elm.focus();

    const elmm = document.getElementById('bt_send2SvmrgCfmCancel');
    if (elmm) elmm.focus();

  }

  transTitle(item) {
    return { Header: this.props.t(item.Header), accessor: item.accessor, show: item.show, headerClassName: item.headerClassName, className: item.className, Cell: item.Cell, width: item.width };
  }


  transDate = (value) => {
    if (value.length < 5) return value;
    else return value.substr(0, 2) + '/' + value.substr(2, 2) + '/' + value.substr(4, 4);
  }
  transTime(value) {
    if (value.length < 14) return value;
    else return value.substr(0, 2) + '/' + value.substr(2, 2) + '/' + value.substr(4, 4) + ' ' + value.substr(8, 2) + ':' + value.substr(10, 2) + ':' + value.substr(12, 2);
  }
  transData(item, index) {
    item.c00 = index + 1;
    if (this.dataFlag) {
      return {
        c00: item.c00, c0: item.c0, c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5, c6: item.c6, c7: item.c7, c8: item.c8,
        c9: item.c9, c10: item.c10, c11: item.c11, c12: item.c12, c13: item.c13, c14: item.c14, c15: item.c15, c16: item.c16, c17: item.c17,
        c18: item.c18, c19: item.c19, c20: item.c20, c21: item.c21, c22: item.c22
      }
    }
    item.c1 = this.transDate(item.c1);
    item.c5 = this.transDate(item.c5);
    item.c2 = item.c2 + '.' + item.c19;
    for (let i = 6; i < 19; i++) {
      item['c' + i] = FormatNumber(item['c' + i]);
    }
    item.c20 = FormatNumber(item.c20);
    item.c21 = FormatNumber(item.c21);
    item.c22 = FormatNumber(item.c22);

    return {
      c00: item.c00, c0: item.c0, c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5, c6: item.c6, c7: item.c7, c8: item.c8,
      c9: item.c9, c10: item.c10, c11: item.c11, c12: item.c12, c13: item.c13, c14: item.c14, c15: item.c15, c16: item.c16, c17: item.c17,
      c18: item.c18, c19: item.c19, c20: item.c20, c21: item.c21, c22: item.c22
    }
  }

  handleKeyPress = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which);
    const name = e.target.name;
    if (code === 13 && name === 'rpMargin_repayAmtID') {
      this.openModalConfirmRepayMargin();
    }
  }

  handleShowDataList = () => {
    this.setState({ list_data: 'btn-bg-link', list_cancel: '' });
  }

  handleShowCancelList = () => {
    this.setState({ list_data: '', list_cancel: 'btn-bg-link' });
    this.toggle(2)
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab + ''
      });
    }
    this.setState({ getList: tab });
  }

  confirm_gotten_otp = (cfmTp) => {
    this.setState({ cfm_inform_otp: false });
    window.ipcRenderer.send(commuChanel.open_main_window)
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
    const arrayTitle = this.columnsData.map(item => this.transTitle(item));
    const titleTableCancel = this.state.columnsCancel.map(item => this.transTitle(item));
    const data = this.state.data.map((item, index) => this.transData(item, index));
    this.dataFlag = true;

    const { t } = this.props
    return (
      <LayoutWrapper className='right-forbuy'>
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

        <div className='page1' >
          <Nav tabs role="tablist">
            <NavItem>
              <NavLink className={classnames({ active: this.state.activeTab === '1' })}
                onClick={() => { this.toggle(1) }}>{t('current_margin_contract_list')}
              </NavLink>
            </NavItem>
            <NavItem >
              <NavLink className={classnames({ active: this.state.activeTab === '2' })}
                onClick={() => { this.toggle(2) }}>{t('history_margin_contract_list')}
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent id='divBottom' className="panel-body" activeTab={this.state.activeTab} style={{ padding: 5 }}>
            <TabPane tabId="1">
              <ReactTable
                data={data}
                columns={arrayTitle}
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
            </TabPane>
            <TabPane tabId="2">
              <ReactTable
                data={this.state.data_cancel}
                columns={titleTableCancel}
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
            </TabPane >
          </TabContent>
        </div>


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

        {/* modal hủy hoàn trả margin */}
        <Modal
          isOpen={this.state.cfm_mrg_cancl_confirm}
          size={"sm modal-notify"}
          name='cfm_mrg_cancl_confirm'
          onClosed={this.modalModalClose}
          onOpened={this.modalAfterOpened}>
          <ModalHeader>
            {t('common_notify')}
          </ModalHeader>
          <ModalBody>
            {t('confirm_cancel_repay_margin')},
            {t('contract_no')}: {this.state.canclRpMarg['contract']}?
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_send2SvmrgCfmCancel"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.cfmcanclRpMargContract('Y')}>
                    {this.state.cancelRepayMarginFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.cfmcanclRpMargContract('N')}>
                    <span>{t('common_No')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>

        <ModalConfirmGottenOTP t={t} cfm_inform_otp={this.state.cfm_inform_otp}
          modalModalClose={this.modalModalClose}
          modalAfterOpened={this.modalAfterOpened}
          confirm_gotten_otp={this.confirm_gotten_otp}
          reqDepositFlag={this.state.cancelRepayMarginFlag}
        />
      </LayoutWrapper>
    )
  }
}


export default translate('translations')(RepayMargin);