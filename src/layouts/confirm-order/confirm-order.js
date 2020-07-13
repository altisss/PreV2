import React, { PureComponent } from 'react'
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledTooltip } from 'reactstrap';
import ReactTable from "react-table";
import DatePicker from 'react-datepicker';
import { CSVLink } from "react-csv";
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import functionList from '../../constants/functionList';
import commuChanel from '../../constants/commChanel'

import { ReactComponent as IconExcel } from '../../conponents/translate/icon/excel.svg';
import { ReactComponent as IconZoom } from '../../conponents/translate/icon/magnifier-zoom-in-glyph-24.svg';

import SearchAccount from '../../conponents/search_account/SearchAccount';

const remote = require('electron').remote;

class ConfirmOrder extends PureComponent {
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
        window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeSuccsOtp}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.ESC_KEY}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.AFTER_OTP}_${this.component}`)
      })
    }
    this.state = {
      name: this.props.name,
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style,
      activeCode: glb_sv.activeCode,
      cfmOrder: {
        acntNo: '',
        action_stat: '',
      },
      confirm: {
        order_number: '',
        start_dt: '',
        end_dt: '',
        start_cf: '',
        end_cf: ''
      },
      start_cf: '',
      end_cf: '',
      from_dt: new Date(),
      to_dt: new Date(),
      data: [],
      columns: this.columnsH,
      acntItems: [],
      selected: null,
      cfmTicketOrderFlag: false,
      cfmAllTicketOrderYN: false,
      tooltipOpen_csv: false,
      arrayExcel: []
    }
  }

  // -- get order list on day
  cfmOrdListDataTable = [];
  cfmOrdListTemple = [];
  getcfmOrderlistFlag = false;
  getcfmOrderlist_FunctNm = 'CFMORDERSCR_001';
  // -- confirm Ticket order
  cfmTicketOrder_FunctNm = 'CFMORDERSCR_002';
  dataFlag = false;
  columnsH = [
    {
      Header: props => <span>&nbsp;</span>, show: true, headerClassName: 'text-center', className: 'text-center nowrap', width: 86, Cell: cellInfo => <span>
        <button disabled={cellInfo.original.c9 === this.props.t('common_confirmed')} onClick={() => this.clickCfm(cellInfo.original)} type="button" style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_confirm')}</button>
      </span>
    },
    { Header: this.props.t("sub_account"), accessor: "c13", show: true, minWidth: 92, headerClassName: 'text-center', className: 'text-center' },
    { Header: this.props.t("place_order_time"), accessor: "c10", show: true, minWidth: 132, headerClassName: 'text-center', className: 'text-center' },
    { Header: this.props.t("order_number"), accessor: "c1", show: true, minWidth: 76, headerClassName: 'text-center', className: 'text-center' },
    { Header: this.props.t("short_symbol"), accessor: "c2", show: true, minWidth: 62, headerClassName: 'text-center', className: 'text-center' },
    { Header: this.props.t("sell_buy_tp"), accessor: "c3", show: true, minWidth: 80, headerClassName: 'text-center' },
    { Header: this.props.t("order_status"), accessor: "c8", show: true, minWidth: 101, headerClassName: 'text-center' },
    { Header: this.props.t("qty"), accessor: "c4", show: true, minWidth: 86, headerClassName: 'text-center', className: 'text-right' },
    { Header: this.props.t("price_plc"), accessor: "c5", show: true, minWidth: 88, headerClassName: 'text-center', className: 'text-right' },
    { Header: this.props.t("qty_wait_match"), accessor: "c6", show: true, minWidth: 100, headerClassName: 'text-center', className: 'text-right' },
    { Header: this.props.t("sum_match_qty"), accessor: "c7", show: true, minWidth: 130, headerClassName: 'text-center', className: 'text-right' },
    { Header: this.props.t("confirm_stat"), accessor: "c9", show: true, minWidth: 138, headerClassName: 'text-center', className: 'text-center' }
  ]


  popin_window() {
    const current_window = remote.getCurrentWindow();
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }

  componentWillMount() {
    window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
      // update state after popout window
      agrs.state.from_dt = new Date(agrs.state.from_dt)
      agrs.state.to_dt = new Date(agrs.state.to_dt);
      // agrs.state.columns = this.columnsH;
      this.setState(agrs.state)
      this.setState({
        parent_id: agrs.parent_id,
        config: agrs.config,
      })
      change_theme(agrs.state.themePage)
      change_language(agrs.state.language, this.props)
      this.loadData();
    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      // update state after popin window
      agrs.state.from_dt = new Date(agrs.state.from_dt)
      agrs.state.to_dt = new Date(agrs.state.to_dt)
      this.setState(agrs.state)
    });

  }

  componentDidMount() {
    if (this.props.node) {
      this.loadData();
    }


    window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
      if (this.state.cfm_order_tickets) this.setState({ cfm_order_tickets: false });
      else {
        const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
        inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
      }
    })
    window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
      if (msg.data === 'confirmOrderTickets') this.setState({ cfm_order_tickets: true });
    })

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
    window.ipcRenderer.on(`${commuChanel.AFTER_OTP}_${this.component}`, (event, agrs) => {
      glb_sv.objShareGlb = agrs.objShareGlb;
    })
  }

  componentWillUnmount() {
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    if (this.getcfmOrderlistFunct_ReqTimeOut) { clearTimeout(this.getcfmOrderlistFunct_ReqTimeOut); }
    if (this.cfmTicketOrderFunct_ReqTimeOut) { clearTimeout(this.cfmTicketOrderFunct_ReqTimeOut); }

  }

  loadData = () => {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'objShareGlb', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, objShareGlb) => {

      glb_sv.objShareGlb = objShareGlb

      const workDt = glb_sv.objShareGlb['workDate'];
      if (workDt != null && workDt.length === 8) {
        const now = new Date(Number(workDt.substr(0, 4)), Number(workDt.substr(4, 2)) - 1, Number(workDt.substr(6, 2)));
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        this.setState({
          from_dt: firstDay,
          to_dt: now
        })

      }
      this.acntItems = glb_sv.objShareGlb['acntNoList'];
      const acntStr = glb_sv.objShareGlb['AcntMain'];
      const acntNm = glb_sv.objShareGlb['AcntMainNm'];
      this.cfmOrder = this.state.cfmOrder;
      this.confirm = this.state.confirm;
      this.cfmOrder['action_stat'] = 'N';
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1];
      this.cfmOrder['acntNo'] = pieacnt[0] + ' - ' + acntNm;

      this.setState({ acntItems: this.acntItems, });
      this.setState(prevState => ({
        cfmOrder: {
          ...prevState.cfmOrder,
          acntNo: this.cfmOrder.acntNo,
          action_stat: 'N'
        }
      }))
    })
  }

  cfmOrder_actionStat = (e) => {
    if (this.getcfmOrderlistFlag) { return; }
    const value = e.target.value;
    this.cfmOrder.action_stat = value
    this.setState(prevState => ({
      cfmOrder: {
        ...prevState.cfmOrder,
        action_stat: this.cfmOrder.action_stat
      }
    }))
    this.cfmOrdListDataTable = [];
  }
  solvingcfmOrder_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    if (reqIfMap.reqFunct === this.getcfmOrderlist_FunctNm) {
      this.getcfmOrderlistFlag = false;
    } else if (reqIfMap.reqFunct === this.cfmTicketOrder_FunctNm) {
      this.cfmTicketOrderFlag = false;
      this.setState({ cfmTicketOrderFlag: false, cfmAllTicketOrderYN: false });
    }
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning', '', false, '', this.component)
  }

  handle_getcfmOrderList = (reqInfoMap, message) => {
    clearTimeout(this.getcfmOrderlistFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getcfmOrderlistFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, message['Code']); }
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
      } catch (err) {
        jsondata = [];
      }
      this.cfmOrdListTemple = this.cfmOrdListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getcfmOrderlistFlag = false;
        this.dataFlag = false;
        let arrayExcel = JSON.parse(JSON.stringify(this.cfmOrdListTemple));
        arrayExcel = arrayExcel.map(item => {
          item.c0 = '\'' + item.c13;
          let c10 = item.c10;
          if (c10.length >= 14) {
            item.c10 = c10.substr(0, 2) + '/' + c10.substr(2, 2) + '/' + c10.substr(4, 4) + ' ' +
              c10.substr(8, 2) + ':' + c10.substr(10, 2) + ':' + c10.substr(12, 2);
          }
          let odrStatus;
          if (item['c8'] === '0') {
            odrStatus = this.props.t('in_core');
          } else if (item['c8'] === '1') {
            odrStatus = this.props.t('send_to_exchange');
          } else if (item['c8'] === '3') {
            odrStatus = this.props.t('wait_to_match');
          } else if (item['c8'] === '4') {
            odrStatus = this.props.t('match_all');
          } else if (item['c8'] === '5') {
            odrStatus = this.props.t('match_a_pieces');
          } else if (item['c8'] === '6') {
            odrStatus = this.props.t('wait_to_cancel_cfm');
          } else if (item['c8'] === '7') {
            odrStatus = this.props.t('confirm_cancel');
          } else if (item['c8'] === '8') {
            odrStatus = this.props.t('confirm_stop_order');
          } else if (item['c8'] === '9') {
            odrStatus = this.props.t('confirm_ice_order');
          } else if (item['c8'] === 'X') {
            odrStatus = this.props.t('reject');
          }
          item.odrStatus = odrStatus;
          if (item['c9'] === 'Y') {
            item.c19 = this.props.t('common_confirmed');
          } else {
            item.c19 = this.props.t('common_not_yet_confirmed');
          }
          return item;
        })
        this.setState({ data: this.cfmOrdListTemple, arrayExcel: arrayExcel });
      }
    }
  }

  // --- get orderlist function
  getcfmOrderList = () => {

    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }

    this.cfmOrder['start_dt'] = { year: this.state.from_dt.getFullYear(), month: this.state.from_dt.getMonth() + 1, day: this.state.from_dt.getDate() };
    const start_dtOld = this.cfmOrder['start_dt'];
    if (start_dtOld === null || start_dtOld === undefined || start_dtOld === '') {
      const ermsg = 'common_plz_input_from_date';
      glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'cfmOrder_start_dt', false, '', this.component)

      return;
    }
    let day = start_dtOld['day'] + '';
    let month = start_dtOld['month'] + '';
    let year = start_dtOld['year'];
    if (day === null || day === undefined || day === '' ||
      month === null || month === undefined || month === '' ||
      year === null || year === undefined || year === '') {
      const ermsg = 'common_plz_input_from_date';
      glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'cfmOrder_start_dt', false, '', this.component)

      return;
    }

    const pad = '00';
    day = pad.substring(0, pad.length - day.length) + day;
    month = pad.substring(0, pad.length - month.length) + month;
    const start_dt = year + month + day;

    this.cfmOrder['end_dt'] = { year: this.state.to_dt.getFullYear(), month: this.state.to_dt.getMonth() + 1, day: this.state.to_dt.getDate() };
    const end_dtOld = this.cfmOrder['end_dt'];
    if (end_dtOld === null || end_dtOld === undefined || end_dtOld === '') {
      const ermsg = 'common_plz_input_to_date';
      glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'cfmOrder_end_dt', false, '', this.component)
      return;
    };
    day = end_dtOld['day'] + '';
    month = end_dtOld['month'] + '';
    year = end_dtOld['year'];
    if (day === null || day === undefined || day === '' ||
      month === null || month === undefined || month === '' ||
      year === null || year === undefined || year === '') {
      const ermsg = 'common_plz_input_to_date';
      glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'cfmOrder_end_dt', false, '', this.component)

      return;
    };

    day = pad.substring(0, pad.length - day.length) + day;
    month = pad.substring(0, pad.length - month.length) + month;
    const end_dt = year + month + day;

    if (Number(end_dt) < Number(start_dt)) {
      const ermsg = 'common_start_dt_cant_over_end_dt';
      glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'cfmOrder_end_dt', false, '', this.component)
      return;
    }
    let acnt_stat = this.cfmOrder['action_stat'];
    if (acnt_stat === null || acnt_stat === undefined || acnt_stat === '') { acnt_stat = '%'; }
    this.getcfmOrderlistFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getcfmOrderlist_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_getcfmOrderList
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqOrder';
    svInputPrm.ServiceName = 'ALTqOrder_Verify_Order';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = [this.actn_curr, '%', start_dt, end_dt, acnt_stat];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.getcfmOrderlistFunct_ReqTimeOut = setTimeout(this.solvingcfmOrder_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    this.cfmOrdListTemple = [];
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

  openModalConfirmOrderTickets = (cfmTp, item) => {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'objShareGlb', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, objShareGlb) => {
      if (this.state.cfmTicketOrderFlag) { return; }
      if (cfmTp === 2) {
        if (item['c9'] !== this.props.t('common_not_yet_confirmed')) { return; }
        this.confirm['order_number'] = item['c1'];
        this.setState({ cfmAllTicketOrderYN: false });
        // --- inputservice ------------
        let ord_dt = item['c0'];
        ord_dt = ord_dt.substr(4, 4) + ord_dt.substr(2, 2) + ord_dt.substr(0, 2);
        this.cfmOrder['inputPrm'] = [item['c12'], item['c13'], '', item['c1'],
          ord_dt, ord_dt, '2'];

      } else {
        this.cfmOrder['start_dt'] = { year: this.state.from_dt.getFullYear(), month: this.state.from_dt.getMonth() + 1, day: this.state.from_dt.getDate() };
        const start_dtOld = this.cfmOrder['start_dt'];
        // if (start_dtOld === null || start_dtOld === undefined || start_dtOld === '') {
        //   const ermsg = 'common_plz_input_from_date';
        //   glb_sv.openAlertModal('', 'common_InfoMessage',  ermsg, '', 'warning', 'cfmOrder_start_dt', false, '', this.component)
        //   return;
        // }

        let day = start_dtOld['day'] + '';
        let month = start_dtOld['month'] + '';
        let year = start_dtOld['year'];
        // if (day === null || day === undefined || day === '' ||
        //   month === null || month === undefined || month === '' ||
        //   year === null || year === undefined || year === '') {
        //   const ermsg = 'common_plz_input_from_date';
        //   glb_sv.openAlertModal('', 'common_InfoMessage',  ermsg, '', 'warning', 'cfmOrder_start_dt', false, '', this.component)
        //   return;
        // }
        const pad = '00';
        day = pad.substring(0, pad.length - day.length) + day;
        month = pad.substring(0, pad.length - month.length) + month;
        const start_dt = year + month + day;
        this.start_cfm = day + '/' + month + '/' + year;

        this.cfmOrder['end_dt'] = { year: this.state.to_dt.getFullYear(), month: this.state.to_dt.getMonth() + 1, day: this.state.to_dt.getDate() };
        const end_dtOld = this.cfmOrder['end_dt'];
        // if (end_dtOld === null || end_dtOld === undefined || end_dtOld === '') {
        //   const ermsg = 'common_plz_input_to_date';
        //   glb_sv.openAlertModal('', 'common_InfoMessage',  ermsg, '', 'warning', 'cfmOrder_end_dt', false, '', this.component)
        //   return;
        // };

        day = end_dtOld['day'] + '';
        month = end_dtOld['month'] + '';
        year = end_dtOld['year'];
        // if (day === null || day === undefined || day === '' ||
        //   month === null || month === undefined || month === '' ||
        //   year === null || year === undefined || year === '') {
        //   const ermsg = 'common_plz_input_to_date';
        //   glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'cfmOrder_end_dt', false, '', this.component)
        //   return;
        // }
        day = pad.substring(0, pad.length - day.length) + day;
        month = pad.substring(0, pad.length - month.length) + month;
        const end_dt = year + month + day;
        this.end_cf = day + '/' + month + '/' + year;

        // if (Number(end_dt) < Number(start_dt)) {
        //   const ermsg = 'common_start_dt_cant_over_end_dt';
        //   glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'cfmOrder_end_dt', false, '', this.component)
        //   return;
        // }
        this.setState({ start_cf: this.start_cfm, end_cf: this.end_cf })
        this.confirm['start_dt'] = start_dt;
        this.confirm['end_dt'] = end_dt;
        this.setState({ cfmAllTicketOrderYN: true });
        // --- inputservice ------------
        this.cfmOrder['inputPrm'] = [this.actn_curr, '%', '', '', start_dt, end_dt, '1'];
      }
      if (!glb_sv.checkOtp('confirmOrderTickets')) {
        if (window.location.pathname.includes('___')) {
          const ermsg = 'notify_user_enter_otp_in_main_screen';
          const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
          glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
        }
        return;
      };
      this.setState({ cfm_order_tickets: true })

    })
  }

  handle_confirmOrderTicketsCfrm = (reqInfoMap, message) => {
    clearTimeout(this.cfmTicketOrderFunct_ReqTimeOut);
    this.cfmTicketOrderFlag = false;
    this.setState({ cfmTicketOrderFlag: false, cfmAllTicketOrderYN: false });
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    // -- process after get result --
    this.setState({ cfm_order_tickets: false })
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false);
      }
    } else {
      this.getcfmOrderList();
      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', '', false, '', this.component)
    }
  }

  confirmOrderTicketsCfrm = (cfmTp) => {
    if (this.cfmTicketOrderFlag) { return; }
    if (cfmTp === 'N') {
      this.cfmTicketOrderFlag = false;
      this.setState({ cfm_order_tickets: false, cfmAllTicketOrderYN: false })
      return;
    }

    this.cfmTicketOrderFlag = true;
    this.setState({ cfmTicketOrderFlag: true });
    const request_seq_comp = this.get_rq_seq_comp()
    // -- call service for place order
    // -- push request to request hashmap handle_confirmOrderTicketsCfrm
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.cfmTicketOrder_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_confirmOrderTicketsCfrm
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTxOrder';
    svInputPrm.ServiceName = 'ALTxOrder_0510_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'I';
    svInputPrm.InVal = this.cfmOrder['inputPrm'];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.cfmTicketOrderFunct_ReqTimeOut = setTimeout(this.solvingcfmOrder_TimeOut,
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

  onAcntChange = (e) => {
    const value = e.target.value;
    this.cfmOrder.acntNo = value;
    const pieces = value.split('.');
    this.actn_curr = pieces[0];
    this.sub_curr = pieces[1].substr(0, 2);

    // this.getcfmOrderList();
    this.cfmOrdListDataTable = [];
    this.setState(prevState => ({
      cfmOrder: {
        ...prevState.cfmOrder,
        acntNo: this.cfmOrder.acntNo
      }
    }))
  }

  modalAfterOpened = () => {
    const elm = document.getElementById('bt_msgBoxConfirmOrderTicketsCfmOk');
    if (elm) elm.focus();
  }

  transTitle(item) {
    return { Header: this.props.t(item.Header), accessor: item.accessor, show: item.show, headerClassName: item.headerClassName, className: item.className, Cell: item.Cell, minWidth: item.minWidth };
  }
  transDate = (value) => {
    const day = value.substr(0, 2);
    const month = value.substr(2, 2);
    const year = value.substr(4, 4);
    return (day + '/' + month + '/' + year);
  }
  transTime = (value) => {
    const day = value.substr(8, 2);
    const month = value.substr(10, 2);
    const year = value.substr(12, 2);
    return (day + ':' + month + ':' + year);
  }
  transOrder = (value) => {
    if (value === '0') {
      return this.props.t('in_core')
    } else if (value === '1') {
      return this.props.t('send_to_exchange')
    } else if (value === '3') {
      return this.props.t('wait_to_match')
    } else if (value === '4') {
      return this.props.t('match_all')
    } else if (value === '5') {
      return this.props.t('match_a_pieces')
    } else if (value === '6') {
      return this.props.t('wait_to_cancel_cfm')
    } else if (value === '7') {
      return this.props.t('confirm_cancel')
    } else if (value === '8') {
      return this.props.t('confirm_stop_order')
    } else if (value === '9') {
      return this.props.t('confirm_ice_order')
    } else if (value === 'X') {
      return this.props.t('reject')
    }

  }
  transData(item) {
    if (this.dataFlag) {
      return {
        c0: item.c0, c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5, c6: item.c6, c7: item.c7, c8: item.c8,
        c9: item.c9, c10: item.c10, c11: item.c11, c12: item.c12, c13: item.c13
      }
    }
    if (Number(item.c4) > 999) {
      item.c4 = FormatNumber(item.c4);
    }
    if (Number(item.c5) > 999) {
      item.c5 = FormatNumber(item.c5);
    }
    if (Number(item.c6) > 999) {
      item.c6 = FormatNumber(item.c6);
    }
    if (Number(item.c7) > 999) {
      item.c7 = FormatNumber(item.c7);
    }
    item.c10 = this.transDate(item.c10) + ' ' + this.transTime(item.c10);
    item.c3 = (item.c3 === '1' ? (this.props.t('buy_order')) : (this.props.t('sell_order')));
    item.c8 = this.transOrder(item.c8);
    item.c9 = (item.c9 === 'Y') ? this.props.t('common_confirmed') : this.props.t('common_not_yet_confirmed');
    return {
      c0: item.c0, c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5, c6: item.c6, c7: item.c7, c8: item.c8,
      c9: item.c9, c10: item.c10, c11: item.c11, c12: item.c12, c13: item.c13
    }
  }

  toggle = () => {
    this.setState({
      tooltipOpen_csv: !this.state.tooltipOpen_csv
    });
  }

  headersCSV = [
    { label: this.props.t('sub_account'), key: "c13" },
    { label: this.props.t('place_order_time'), key: "c10" },
    { label: this.props.t('order_number'), key: "c1" },
    { label: this.props.t('symbol'), key: "c2" },
    { label: this.props.t('sell_buy_tp'), key: "c18" },
    { label: this.props.t('order_status'), key: "odrStatus" },
    { label: this.props.t('qty'), key: "c4" },
    { label: this.props.t('price_plc'), key: "c5" },
    { label: this.props.t('qty_wait_match'), key: "c6" },
    { label: this.props.t('sum_match_qty'), key: "c7" },
    { label: this.props.t('confirm_stat'), key: "c19" }
  ];

  handleChangeAccount = ({ value, label }) => {
    // value: 888c000350.00
    // label: 888c000350.00 - Tạ Ngoc My
    this.activeAcnt = value;

    const pieces = value.split('.');
    this.actn_curr = pieces[0];
    this.sub_curr = pieces[1].substr(0, 2);
    if (this.cfmOrder) {
      this.cfmOrder.acntNo = value;

      this.cfmOrdListDataTable = [];
      this.setState(prevState => ({
        cfmOrder: {
          ...prevState.cfmOrder,
          acntNo: this.cfmOrder.acntNo
        }
      }))
    }
  }

  clickCfm = (rowInfo) => {
    let cfmOrder = { ...this.state.cfmOrder };
    if (rowInfo.c9 !== this.props.t('common_confirmed')) {
      this.openModalConfirmOrderTickets(2, rowInfo);
      this.setState({
        cfmOrder: cfmOrder
      });
      this.setState(prevState => ({
        cfmOrder: {
          ...prevState.cfmOrder,
          stkCd_require: false
        }
      }))
    }
  }

  render() {
    const { t } = this.props;
    const data = this.state.data.map(item => this.transData(item));
    this.dataFlag = true;

    return (
      <div className='confirm-order' >
        <div className="card form-cash-transaction" style={{ marginTop: 10 }}>
          <div className="card-body">
            <div className='page1'>
              <div className="form-group row ">
                <label className="col-sm-3 control-label no-padding-right text-left">{t('acnt_no')}</label>
                  <div className='col-sm-9 flex-1'>
                    <SearchAccount
                      handleChangeAccount={this.handleChangeAccount}
                      component={this.component}
                      req_component={this.req_component}
                      get_rq_seq_comp={this.get_rq_seq_comp}
                      get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                      language={this.state.language}
                      themePage={this.state.themePage}
                      style={this.state.style}
                      isShowDetail={true}
                    />
                  </div>
              </div>
              <div className="form-group row ">
                <label className="col-sm-3 control-label no-padding-right text-left">{t('common_proc_type')}</label>
                <div className="col-sm-9">
                  <select id="cfmOrder_action_stat" name="action_stat" onChange={this.cfmOrder_actionStat} className="form-control form-control-sm"
                    value={this.state.cfmOrder['action_stat']}>
                    <option value="">--
                            {t('common_all')}</option>
                    <option value="Y">
                      {t('common_confirmed')}</option>
                    <option value="N">
                      {t('common_not_yet_confirmed')}</option>
                  </select>
                </div>
              </div>
              <div className="form-group row date1 ">
                <label className="col-sm-3 control-label no-padding-right text-left" >{t('common_from_date')}
                  <span className="mustInput">*</span>
                </label>

                <DatePicker id='cfmOrder_start_dt' popperPlacement='left' scrollableYearDropdown selected={this.state.from_dt} dateFormat="dd/MM/yyyy" peekNextMonth showMonthDropdown showYearDropdown className="form-control form-control-sm text-right"
                  onChange={value => {
                    this.confirm.effect_dt = value;
                    this.setState({ from_dt: value })
                  }} />
              </div>
              <div className="form-group row date2 ">
                <label className="col-sm-3 control-label no-padding-right text-left" >{t('common_to_date')}
                  <span className="mustInput">*</span>
                </label>
                <DatePicker id='cfmOrder_end_dt' popperPlacement='left' scrollableYearDropdown dropdownMode='scroll' selected={this.state.to_dt} dateFormat="dd/MM/yyyy" peekNextMonth showMonthDropdown showYearDropdown className="form-control form-control-sm text-right"
                  onChange={value => {
                    this.confirm.exp_dt = value;
                    this.setState({ to_dt: value })
                  }} />
              </div>
              <div className="form-group row" style={{ marginTop: 25 }}>
                <div className='col-sm'>
                  <button className="btn btn-pill btn-sm btn-block pull-right btn-wizard" onClick={this.getcfmOrderList}>
                    <IconZoom style={{ verticalAlign: 'top' }} />&nbsp;{t('search_confirm_order')}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className='page2' id='table-cfm-ord' style={{paddingTop: '10px'}}>
          <div id='icon_cfm_ord' className="icon-advance" style={{ top: -1, left: 24, zIndex: 1 }}>
            <CSVLink filename={this.props.t('order_list_history') + '.csv'} headers={this.headersCSV} data={this.state.arrayExcel} target="_blank">
              <span id="Tooltip_cfm_ord" style={{ padding: 0, marginTop: 3 }}><IconExcel /></span>
            </CSVLink>
            <UncontrolledTooltip placement="bottom" target="Tooltip_cfm_ord">
              {this.props.t('common_ExportExcel')}
            </UncontrolledTooltip>
          </div>
          <ReactTable
            data={data}
            columns={this.columnsH}
            pageSize={this.state.data.length < 10 ? 10 : this.state.data.length}
            showPagination={false}
            style={{
              height: 285,
              marginBottom: 0,
              maxWidth: 1173
            }}
            NoDataComponent={() => {
              return <div className="rt-noData hideClass">{this.props.t('common_NoDataFound')}</div>
            }}
            className="-striped -highlight"
          />
        </div>

        <div style={{ paddingTop: 20, paddingRight: 20, marginBottom: 20 }}>
          <button className="btn btn-pill pull-right btn-wizard" onClick={(e) => this.openModalConfirmOrderTickets(1, '')}>
            {t('confirm_all_order_tickets')} &nbsp;
                  <i className="fa fa-check" />
          </button>
        </div>

        {/* modal Xác thực gửi yêu cầu */}
        <Modal
          isOpen={this.state.cfm_order_tickets}
          size={"sm modal-notify"}
          onClosed={this.modalModalClose}
          onOpened={this.modalAfterOpened}>
          <ModalHeader>
            {t('confirm_sell_oddlot')}
          </ModalHeader>
          <ModalBody>
            {!this.state.cfmAllTicketOrderYN && <div>
              {t('confirm_order_tickets_message')} , {t('order_number')}: {this.state.confirm['order_number']}?
                </div>}
            {this.state.cfmAllTicketOrderYN && <div>
              {t('confirm_corder_all_tickets_message')}. {t('common_from_date')}: {this.state.start_cf} {' '}
              {t('common_to_date')}: {this.state.end_cf}?
                </div>}
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_msgBoxConfirmOrderTicketsCfmOk"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.confirmOrderTicketsCfrm('Y')}>
                    {this.state.cfmTicketOrderFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.confirmOrderTicketsCfrm('N')}>
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

export default translate('translations')(ConfirmOrder);