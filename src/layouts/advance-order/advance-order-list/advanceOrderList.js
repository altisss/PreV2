/* eslint-disable */
import React from 'react';
import OptionTable from '../../../conponents/optionTable/OptionTable';
import ReactTable from "react-table";
import columnInfo from './columnInfo.json';
import { CSVLink } from "react-csv";
import FormatNumber from '../../../conponents/formatNumber/FormatNumber';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledTooltip } from 'reactstrap';
import SelectBasic from "../../../conponents/basic/selectBasic/SelectBasic";
import Popover from 'react-tiny-popover';
import TimeSelect from '../../../conponents/table-option/time-select';
import TypeSelect from '../../../conponents/table-option/type-select';
import { ReactComponent as Reload } from '../../../conponents/translate/icon/reload-glyph-24.svg';
import { ReactComponent as IconExcel } from '../../../conponents/translate/icon/excel.svg';
import { ReactComponent as IconBullet } from '../../../conponents/translate/icon/bullet-list-70-glyph-24.svg';
import { ReactComponent as IconZoom } from '../../../conponents/translate/icon/magnifier-zoom-in-glyph-24.svg';
import { translate } from 'react-i18next'
import glb_sv from '../../../utils/globalSv/service/global_service'
import commuChanel from '../../../constants/commChanel'
import socket_sv from '../../../utils/globalSv/service/socket_service'
import { requestInfo } from '../../../utils/globalSv/models/requestInfo'
import { serviceInputPrm } from '../../../utils/globalSv/models/serviceInputPrm';
import functionList from '../../../constants/functionList'
import { reply_send_req } from '../../../utils/send_req';

class AdvanceOrderList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      columns: this.columnsH,
      columnInfo: columnInfo,
      heightScroll: 145,
      from_date: new Date(),
      to_date: new Date(),
      cfm_canclAdvOrder: false,
      getHistObj: {
        orderStatus: '%',
        start_dt: null,
        end_dt: null
      },
      advOrderCal: {
        shl: null,
        stkCd: null,
        qty: null,
        price: null,
        orderTp: null,
        sb_tp: null,
        status: null,
        ordDt: null,
        effect_dt: null,
        exp_dt: null,
        pCode: null,
      },
      acntItems: [],
      acntNo: '',
      isPopoverOpenSelect: false,
      isPopoverOpenMenu: false,
      forceUpdate: 0,
      refreshFlag: ''
    };
    this.handleColumnChange = this.handleColumnChange.bind(this);
    this.changeDivBottom = this.changeDivBottom.bind(this);
    this.arrayExcel = [];
    this.timeQuery = '0D';

    this.component = this.props.component
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.get_rq_seq_comp = this.props.get_rq_seq_comp
    this.req_component = this.props.req_component
  }
  columnInfo = columnInfo;
  // -- send cancel order function
  sendcanlAdvOrderC_FunctNm = 'ADVORDERSCR_004';
  sendcanlAdvOrderCfmFlag = false;
  sendcanlAdvOrderCFunct_ReqTimeOut;
  // -- get order list on day
  searchText;
  rowsOnPage = 10;
  sortBy = 'c1';
  sortOrder = 'desc';
  activePage = 1;
  advOrdListDataTable = [];
  advOrdListTemple = [];
  getAdvOrderlistFlag = false;
  getAdvOrderlist_FunctNm = 'ADVORDERSCR_005';
  getAdvOrderlistFunct_ReqTimeOut;
  // -- get history order list
  searchTextHist;
  rowsOnPageHist = 10;
  sortByHist = 'c1';
  sortOrderHist = 'desc';
  activePageHist = 1;
  advOrdListHistDataTable = [];
  advOrdListHistTemple = [];
  getAdvOrderlistHistFlag = false;
  getAdvOrderlistHist_FunctNm = 'ADVORDERSCR_006';
  getAdvOrderlistHistFunct_ReqTimeOut;

  // -- get daily advance order function
  getDailyAdvOrderFlag = false;

  columnsH = [
    {
      Header: props => <span>&nbsp;</span>, show: true, headerClassName: 'text-center', className: 'text-center nowrap', width: 55, Cell: cellInfo => <span>
        <button disabled={cellInfo.original.c8 === '2' || cellInfo.original.c8 === '3'} onClick={() => this.openCfmCancelOrder(cellInfo.original)} type="button" style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_Cancel')}</button>
      </span>
    },
    { Header: this.props.t("order_number"), accessor: "c17", show: true, width: 72, headerClassName: 'text-center', className: 'text-right' },
    { Header: this.props.t("short_symbol"), accessor: "c4", show: true, width: 75, headerClassName: 'text-center', className: 'text-center' },
    {
      Header: this.props.t("sell_buy_tp"), accessor: "c3", show: true, width: 77, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <span className={cellInfo.original['c3'] === '2' ? 'sellColor' : 'buyColor'}>{cellInfo.original['c3'] === '1' ? this.props.t('buy_order') : this.props.t('sell_order')}</span>
    },
    {
      Header: this.props.t("order_tp"), accessor: "c5", show: true, width: 130, headerClassName: 'text-center',
      Cell: cellInfo => <span>{this.props.t(this.translateOrderTp(cellInfo.original.c5))}</span>
    },
    { Header: this.props.t("session"), accessor: "c21", show: true, width: 108, headerClassName: 'text-center' },
    {
      Header: this.props.t("qty"), accessor: "c6", show: true, width: 81, headerClassName: 'text-center', className: 'text-right',
      Cell: cellInfo => <span>{FormatNumber(cellInfo.original.c6)}</span>
    },
    {
      Header: this.props.t("price"), accessor: "c7", show: true, width: 70, headerClassName: 'text-center', className: 'text-right',
      Cell: cellInfo => <span>{FormatNumber(cellInfo.original.c7)}</span>
    },
    {
      Header: this.props.t("effective_date"), accessor: "c9", show: true, width: 100, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <span>{this.transDate(cellInfo.original.c9)}</span>
    },
    {
      Header: this.props.t("expired_date"), accessor: "c10", show: true, width: 100, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <span>{this.transDate(cellInfo.original.c10)}</span>
    },
    { Header: this.props.t("order_status"), accessor: "c19", show: true, width: 95, headerClassName: 'text-center' },
    { Header: this.props.t("common_chanel"), accessor: "c20", show: true, width: 160, headerClassName: 'text-center' },
    {
      Header: this.props.t("processe_content"), accessor: "c14", show: true, width: 395, headerClassName: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c14 === '' || cellInfo.original.c14 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c14}</span>}</>
    },
    { Header: this.props.t("place_order_person"), accessor: "c11", show: true, width: 135, headerClassName: 'text-center', },
    {
      Header: this.props.t("place_order_time"), accessor: "c12", show: true, width: 150, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <span>{this.transDate(cellInfo.original.c12) + ' ' + this.transTime(cellInfo.original.c12)}</span>
    },
    {
      Header: this.props.t("time_put_order"), accessor: "c18", show: true, width: 135, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <span>{this.transDate(cellInfo.original.c18) + ' ' + this.transTime(cellInfo.original.c18)}</span>
    }];

  componentWillMount() {
    this.lengthtable = this.state.data.length;
  }
  componentDidMount() {
    this.advOrderCal = this.state.advOrderCal;
    this.getHistObj = this.state.getHistObj;

    window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
      if (msg.data === 'confirmCancelAdvOrd') this.setState({ cfm_canclAdvOrder: true });
    });
    window.ipcRenderer.on(`${commuChanel.ACTION_SUCCUSS}_${this.component}`, (event, msg) => {
      if (msg.data === 'advance-order-list') {
        setTimeout(() =>
          this.getHistAdvOrderList()
          , 1000);
      }
    });

    window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
      reply_send_req(agrs, this.req_component)
    });

    this.delayLoadData();
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.activeAcnt !== this.props.activeAcnt && this.props.activeAcnt) {
      this.activeAcnt = this.props.activeAcnt;
      this.actn_curr = this.activeAcnt.split('.')[0];
      this.sub_curr = this.activeAcnt.split('.')[1];
      if (this.workDateObj) this.getHistAdvOrderList();
    }
  }

  componentWillUnmount() {
    if (this.sendcanlAdvOrderCFunct_ReqTimeOut) { clearTimeout(this.sendcanlAdvOrderCFunct_ReqTimeOut); }
    if (this.getAdvOrderlistFunct_ReqTimeOut) { clearTimeout(this.getAdvOrderlistFunct_ReqTimeOut); }
    if (this.getAdvOrderlistHistFunct_ReqTimeOut) { clearTimeout(this.getAdvOrderlistHistFunct_ReqTimeOut); }
    if (this.getBankCashAmountFunct_ReqTimeOut) { clearTimeout(this.getBankCashAmountFunct_ReqTimeOut); }
    if (this.getBankAcntListFunct_ReqTimeOut) { clearTimeout(this.getBankAcntListFunct_ReqTimeOut); }
  }

  delayLoadData() {
    if (this.props.active_components && this.props.active_components.some(e => e === this.component)) {
      this.loadData();
    } else {
      setTimeout(() => {
        this.loadData();
      }, 100);
    }
  }

  loadData = () => {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
      this.localData = args.get('localData');
      this.activeAcnt = args.get('activeAcnt');
      glb_sv.objShareGlb = args.get('objShareGlb');

      this.acntItems = glb_sv.objShareGlb['acntNoList'];
      let acntStr = '';
      if (this.activeAcnt &&
        this.activeAcnt.substr(11) !== '%' &&
        this.activeAcnt !== '') {
        acntStr = this.activeAcnt;
      } else {
        acntStr = this.acntItems[0]['id'];
      }
      this.acntNo = acntStr;
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1];
      this.getHistObj['orderStatus'] = '%';

      this.setState({
        acntItems: this.acntItems,
        acntNo: this.acntNo
      })

      const workDt = glb_sv.objShareGlb['workDate'];
      if (workDt != null && workDt.length === 8) {

        this.workDateObj = new Date(Number(workDt.substr(0, 4)), Number(workDt.substr(4, 2)) - 1, Number(workDt.substr(6, 2)));
      } else this.workDateObj = new Date();
      this.getHistAdvOrderList();

      if (this.localData.columnsAdvOrd) {
        this.columnInfo = this.localData.columnsAdvOrd;
        this.setState({ columnInfo: this.columnInfo });
        this.columnInfo.map(item => {
          if (item.value === false) {
            const key = item.key.split('_')[0];
            const updateColumn = this.columnsH.find(o => o.accessor === key);
            updateColumn.show = false;
          }
        });
      } else if (this.state.columnInfo) {
        this.state.columnInfo.map(item => {
          if (item.value === false) {
            const key = item.key.split('_')[0];
            const updateColumn = this.columnsH.find(o => o.accessor === key);
            updateColumn.show = false;
          }
        })
      }

    });
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {
      component: this.component,
      value: ['localData', 'objShareGlb', 'activeAcnt'],
      sq
    });
  }

  sendcanlAdvOrderCResultProc = (reqInfoMap, message) => {
    clearTimeout(this.sendcanlAdvOrderCFunct_ReqTimeOut);
    this.sendcanlAdvOrderCfmFlag = false;
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false);
      }
    } else {
      this.setState({ cfm_canclAdvOrder: false })
      this.getHistAdvOrderList();
      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success');
    }

  }
  getAdvOrderlistHistResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getAdvOrderlistHistFunct_ReqTimeOut);
    this.setState({ refreshFlag: '' });
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getAdvOrderlistHistFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, message['Code']); }
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

      this.advOrdListHistTemple = this.advOrdListHistTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getAdvOrderlistHistFlag = false;

        if (this.advOrdListHistTemple !== []) {
          this.advOrdListHistTemple.map(item => {
            item.c6 = Number(item.c6);
            item.c7 = Number(item.c7);
          });
        }
        this.setState({ data: this.advOrdListHistTemple, getAdvOrderlistHistFlag: true });

      }
    }
  }

  solvingadvOrder_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }

    const timeResult = new Date()
    reqIfMap.resTime = timeResult
    reqIfMap.procStat = 4
    this.req_component.set(cltSeq, reqIfMap);
    console.log('solvingadvOrder_TimeOut',reqIfMap)
    if (reqIfMap.reqFunct === this.sendcanlAdvOrderC_FunctNm) {
      this.sendcanlAdvOrderCfmFlag = false;
    } else if (reqIfMap.reqFunct === this.getAdvOrderlistHist_FunctNm) {
      this.getAdvOrderlistHistFlag = false;
      this.setState({ refreshFlag: '' });
    }
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', 'OK', 'warning', '');
  }

  openCfmCancelOrder = (item) => {
    if (this.sendcanlAdvOrderCfmFlag) { return; }
    if (Number(item['c8']) === 2 || Number(item['c8']) === 3) { return; }

    this.advOrderCal['shl'] = item['c17'];
    this.advOrderCal['stkCd'] = glb_sv.getStkfull(item['c4']);
    this.advOrderCal['qty'] = item['c6'];
    this.advOrderCal['price'] = item['c7'];
    this.advOrderCal['orderTp'] = item['c5'];
    this.advOrderCal['sb_tp'] = item['c3'];
    this.advOrderCal['status'] = item['c8'] + '. ' + item['c19'];
    this.advOrderCal['ordDt'] = item['c22'];
    this.advOrderCal['effect_dt'] = item['c9'];
    this.advOrderCal['exp_dt'] = item['c10'];
    this.advOrderCal['pCode'] = null;
    this.setState({ advOrderCal: this.advOrderCal });
    if (!glb_sv.checkOtp('confirmCancelAdvOrd')) return;
    this.setState({ cfm_canclAdvOrder: true });
  }

  sendcanlAdvOrderCfm = (cfmTp) => {
    if (this.sendcanlAdvOrderCfmFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_canclAdvOrder: false })
      return;
    }

    this.sendcanlAdvOrderCfmFlag = true;
    const ordNumber = this.advOrderCal['shl'];
    const ordDt = this.advOrderCal['ordDt'];

    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.sendcanlAdvOrderC_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.sendcanlAdvOrderCResultProc;
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTxOrder';
    svInputPrm.ServiceName = 'ALTxOrder_0509_2';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'I';
    svInputPrm.InVal = [ordNumber, this.actn_curr, this.sub_curr, '', ordDt];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm
    })
    this.sendcanlAdvOrderCFunct_ReqTimeOut = setTimeout(this.solvingadvOrder_TimeOut, functionList.reqTimeout, request_seq_comp)
    reqInfo.inputParam = svInputPrm.InVal
    this.req_component.set(request_seq_comp, reqInfo)
  }

  getHistAdvOrderList = () => {
    if (this.getAdvOrderlistHistFlag) { return; }

    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }
    const from_date = new Date(this.workDateObj.getTime());
    const end_date = new Date(this.workDateObj.getTime());
    end_date.setDate(end_date.getDate() + parseInt(this.timeQuery));

    this.getHistObj['start_dt'] = { year: from_date.getFullYear(), month: from_date.getMonth() + 1, day: from_date.getDate() };
    const start_dtOld = this.getHistObj['start_dt'];
    let day = start_dtOld['day'] + '';
    let month = start_dtOld['month'] + '';
    let year = start_dtOld['year'];
    const pad = '00'
    day = pad.substring(0, pad.length - day.length) + day;
    month = pad.substring(0, pad.length - month.length) + month;
    const start_dt = year + month + day;

    this.getHistObj['end_dt'] = { year: end_date.getFullYear(), month: end_date.getMonth() + 1, day: end_date.getDate() };
    const end_dtOld = this.getHistObj['end_dt'];

    day = end_dtOld['day'] + '';
    month = end_dtOld['month'] + '';
    year = end_dtOld['year'];

    day = pad.substring(0, pad.length - day.length) + day;
    month = pad.substring(0, pad.length - month.length) + month;
    const end_dt = year + month + day;


    this.getAdvOrderlistHistFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getAdvOrderlistHist_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getAdvOrderlistHistResultProc;
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqOrder';
    svInputPrm.ServiceName = 'ALTqOrder_0509_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['2', this.actn_curr, this.sub_curr, start_dt, end_dt, this.getHistObj['orderStatus'], '%'];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    console.log("getHistAdvOrderList -> svInputPrm", svInputPrm)

    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm
    })
    this.getAdvOrderlistHistFunct_ReqTimeOut = setTimeout(this.solvingadvOrder_TimeOut, functionList.reqTimeout, request_seq_comp)
    reqInfo.inputParam = svInputPrm.InVal
    this.req_component.set(request_seq_comp, reqInfo)

    this.advOrdListHistTemple = [];
    this.setState({ data: [], refreshFlag: 'fa-spin' });
  }

  handleColumnChange(name, key, value) {
    const id = key.split('_')[0];
    const updateColumn = this.columnsH.find(o => o.accessor === id);
    if (updateColumn) updateColumn.show = value;
    this.setState({
      columns: [...this.columnsH]
    });

    const updateColumnInfo = this.columnInfo.find(o => o.key === key);
    if (updateColumnInfo) updateColumnInfo.value = value;
    this.localData.columnsAdvOrd = this.columnInfo;
    if (typeof (Storage) !== 'undefined') {
      localStorage.setItem('stateMainPage', JSON.stringify(this.localData));
    }
  }

  onOpenedModalcanclAdvOrde = () => {
    const elm = document.getElementById('buttonCfmCalOrder');
    if (elm) elm.focus();
  }

  refeshData = () => {
    this.getHistAdvOrderList();
  }

  changeDivBottom() {
    const messObj = {
      type: glb_sv.CHANGE_HEIGHT_DIV_BOTTOM
    };
    glb_sv.commonEvent.next(messObj);
  }

  translateOrderTp = (value) => {
    if (value === '01') {
      return 'order_Limit'
    } else if (value === '02') {
      return 'order_Mp'
    } else if (value === '03') {
      return 'order_ATO'
    } else if (value === '04') {
      return 'order_ATC'
    } else if (value === '06') {
      return 'order_MOK'
    } else if (value === '07') {
      return 'order_MAK'
    } else if (value === '08') {
      return 'order_MTL'
    } else if (value === '15') {
      return 'order_PLO'
    } else return value;
  }
  translateSessionTp = (value) => {
    if (value === '1') {
      return 'ATO_session'
    } else if (value === '2') {
      return 'continuity_session_morning'
    } else if (value === '3') {
      return 'continuity_session_afternoon'
    } else if (value === '4') {
      return 'ATC_session'
    } else if (value === '5') {
      return 'priceboard_Close'
    } else return value;
  }
  transDate = (value) => {
    if (value === '' || value == null) return value;
    const day = value.substr(0, 2);
    const month = value.substr(2, 2);
    const year = value.substr(4, 4);
    return (day + '/' + month + '/' + year);
  }
  transTime = (value) => {
    if (value === '' || value == null) return value;
    const day = value.substr(8, 2);
    const month = value.substr(10, 2);
    const year = value.substr(12, 2);
    return (day + ':' + month + ':' + year);
  }

  transTitle(item) {
    return { Header: this.props.t(item.Header), accessor: item.accessor, show: item.show, headerClassName: item.headerClassName, className: item.className, Cell: item.Cell, width: item.width };
  }
  headersCSV = [
    { label: this.props.t('order_number'), key: "c17" },
    { label: this.props.t('symbol'), key: "c4" },
    { label: this.props.t('sell_buy_tp'), key: "c3" },
    { label: this.props.t('order_tp'), key: "c5" },
    { label: this.props.t('session'), key: "c21" },
    { label: this.props.t('qty'), key: "c6" },
    { label: this.props.t('price'), key: "c7" },
    { label: this.props.t('effective_date'), key: "c9" },
    { label: this.props.t('expired_date'), key: "c10" },
    { label: this.props.t('order_status'), key: "c19" },
    { label: this.props.t('common_chanel'), key: "c20" },
    { label: this.props.t('processe_content'), key: "c14" },
    { label: this.props.t('place_order_person'), key: "c11" },
    { label: this.props.t('place_order_time'), key: "c12" },
    { label: this.props.t('time_put_order'), key: "c18" }
  ];

  handleKeyPress = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which);
    const name = e.target.name;
    if (name === 'buttonCfmCalOrder') {
      if (code === 27) {
        this.setState({ cfm_canclAdvOrder: false });
      }
    }
  }

  afterPopOverRender() {
    const timeQuery = this.timeQuery;
    const typeQuery = this.getHistObj['orderStatus'];
    setTimeout(() => {
      const elmInputTime = document.getElementById(timeQuery + '-option-time-advorderlist');
      const elmInputType = document.getElementById(typeQuery + '-option-type-advorderlist');
      if (elmInputTime && elmInputType) {
        elmInputTime.checked = true;
        elmInputType.checked = true;
      } else this.afterPopOverRender();
    }, 100);
  }

  handleSelectTime = (timeQuery) => {
    if (timeQuery !== this.timeQuery) {
      this.localData.bottom_tab = 'advance-order-list';
      this.timeQuery = timeQuery;
      this.getHistAdvOrderList();
    }
  }

  handleSelectType = (type) => {
    if (type !== this.getHistObj['orderStatus']) {
      this.localData.bottom_tab = 'advance-order-list';
      this.getHistObj['orderStatus'] = type;
      this.getHistAdvOrderList();
    }
  }

  render() {
    const { t } = this.props;
    return (
      <>
        <div className='content-bot tableOrd' style={{ marginTop: 15 }}>
          <div id='icon_advancelist' className='icon-advance'>
            <Popover
              isOpen={this.state.isPopoverOpenMenu}
              position={'top'}
              onClickOutside={() => this.setState({ isPopoverOpenMenu: false })}
              content={({ position, targetRect, popoverRect }) => (
                <div className='popover-search'>
                  <OptionTable t={t} columnInfo={this.state.columnInfo} onColumnChange={this.handleColumnChange} />
                </div>
              )}
            >
              <span id='Tooltip_advordlist_option' className='left5' onClick={() => this.setState({ isPopoverOpenMenu: !this.state.isPopoverOpenMenu }, () => this.afterPopOverRender())}>
                <span className="colorOption"><IconBullet /></span>
              </span>
            </Popover>
            <UncontrolledTooltip placement="top" target="Tooltip_advordlist_option" className='tooltip-custom'>
              {t('common_option_hide_column')}
            </UncontrolledTooltip>

            <CSVLink filename={t('place_advOrder_all_order') + '.csv'} data={this.arrayExcel} headers={this.headersCSV} target="_blank" style={{ color: 'inherit' }}>
              <span id='Tooltip_advordlist_csv' className="left5" placement="top" style={{ padding: 0, marginTop: 3 }}><IconExcel /></span>
            </CSVLink>
            <UncontrolledTooltip placement="top" target="Tooltip_advordlist_csv" className='tooltip-custom'>
              {t('common_ExportExcel')}
            </UncontrolledTooltip>

            <Popover
              isOpen={this.state.isPopoverOpenSelect}
              position={'top'}
              onClickOutside={() => this.setState({ isPopoverOpenSelect: false })}
              content={({ position, targetRect, popoverRect }) => (
                <div className='popover-search'>
                  <div className='row padding-bottom-15'>
                    <div className='col popover-pagin' >
                      <TimeSelect handleSelectTime={this.handleSelectTime} t={t} nameInput='time-advorderlist' />
                    </div>
                  </div>
                  <div className='hr'></div>
                  <div className='row padding-top-15'>
                    <div className='col'>
                      <TypeSelect name='adv-ord-list' handleSelectType={this.handleSelectType} t={t} nameInput='type-advorderlist' />
                    </div>
                  </div>
                </div>
              )}
            >
              <span id='Tooltip_advordlist_time' className='left5' onClick={() => this.setState({ isPopoverOpenSelect: !this.state.isPopoverOpenSelect }, () => this.afterPopOverRender())}>
                <IconZoom />
              </span>
            </Popover>
            <UncontrolledTooltip placement="top" target="Tooltip_advordlist_time" className='tooltip-custom'>
              {t('common_button_sumbit_select')}
            </UncontrolledTooltip>

            <span id='Tooltip_advordlist_Refresh' onClick={() => this.refeshData()} style={{ padding: 0, marginLeft: 5, color: 'inherit' }}
              className={'btn btn-link undecoration cursor_ponter ' + this.state.refreshFlag}><Reload /></span>
            <UncontrolledTooltip placement="top" target="Tooltip_advordlist_Refresh" className='tooltip-custom'>
              {t('Refresh')}
            </UncontrolledTooltip>

          </div>
          <ReactTable
            data={this.state.data}
            columns={this.state.columns}
            pageSize={this.state.data.length < 2 ? 1 : this.state.data.length}
            showPagination={false}
            NoDataComponent={() => {
              return <div className="rt-noData hideClass">{this.props.t('common_NoDataFound')}</div>
            }}
            className="-striped -highlight"
          />
          <br />
        </div>

        {/* modal huy lenh */}
        <Modal
          isOpen={this.state.cfm_canclAdvOrder}
          size={"md modal-notify"}
          onOpened={this.onOpenedModalcanclAdvOrde}
        >
          <ModalHeader>
            {t('confirm_cancel_advance_order')}
          </ModalHeader>
          <ModalBody>
            <div className="form-group row">
              <label className="col-sm-2 control-label no-padding-right text-left marginAuto">{t('short_acnt_no')}</label>
              <div className="col-sm-10">
                <SelectBasic
                  inputtype={"text"}
                  name={"plcOrd_acntNo"}
                  value={this.state.acntNo}
                  options={this.state.acntItems}
                  onChange={this.onAcntNoChange}
                  disabled={true}
                  classextend={'form-control-sm text-center'}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-2 control-label no-padding-right text-left marginAuto">{t('short_symbol')}</label>
              <div className="col-sm-10">
                <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="form-control form-control-sm text-center">{
                  this.state.advOrderCal['stkCd']}</span>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-2 control-label no-padding-right text-left marginAuto">{t('order_number')}</label>
              <div className="col-sm-4">
                <span className="form-control form-control-sm text-center">{this.state.advOrderCal['shl']}</span>
              </div>
              <label className="col-sm-2 control-label no-padding-right text-left marginAuto">{t('sell_buy_tp')}</label>
              <div className="col-sm-4">
                <select disabled name="sb_tp" value={this.state.advOrderCal['sb_tp']} className="selectpicker form-control form-control-sm">
                  <option value="1">{t('priceboard_buy')}</option>
                  <option value="2">{t('priceboard_sell')}</option>
                </select>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-2 control-label no-padding-right text-left marginAuto">{t('qty')}</label>
              <div className="col-sm-4">
                <span className="form-control form-control-sm text-right">{FormatNumber(this.state.advOrderCal['qty'], 0, 0)}</span>
              </div>
              <label className="col-sm-2 control-label no-padding-right marginAuto">{t('price')}</label>
              <div className="col-sm-4">
                <div className="input-group input-group-xs">
                  <span className="form-control form-control-sm text-right">{FormatNumber(this.state.advOrderCal['price'], 0, 0)}</span>
                </div>
              </div>
            </div>

            <div className="form-group row">
              <label className="col-sm-2 control-label no-padding-right text-left marginAuto">{t('order_tp')}</label>
              <div className="col-sm-4">
                <span className="form-control form-control-sm">{t(this.translateOrderTp(this.state.advOrderCal.orderTp))}</span>
              </div>
              <label className="col-sm-2 control-label no-padding-right text-left marginAuto">{t('order_status')}</label>
              <div className="col-sm-4">
                <span className="form-control form-control-sm">{this.state.advOrderCal['status']}</span>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-2 control-label no-padding-right marginAuto">{t('effective_date')}</label>
              <div className="col-sm-4">
                <span className="form-control form-control-sm">{this.transDate(this.state.advOrderCal['effect_dt'])}</span>
              </div>
              <label className="col-sm-2 control-label no-padding-right marginAuto" style={{ whiteSpace: 'nowrap' }}>{t('expired_date')}</label>
              <div className="col-sm-4">
                <span className="form-control form-control-sm">{this.transDate(this.state.advOrderCal['exp_dt'])}</span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    color="wizard"
                    name='buttonCfmCalOrder'
                    onKeyDown={this.handleKeyPress}
                    id='buttonCfmCalOrder'
                    onClick={(e) => this.sendcanlAdvOrderCfm('Y')}>
                    {this.state.sendcanlAdvOrderCfmFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('confirm_cal')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.sendcanlAdvOrderCfm('N')}>
                    <span>{t('order_cancel')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>
      </>
    );
  }
}

export default translate('translations')(AdvanceOrderList);    