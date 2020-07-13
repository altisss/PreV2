import React from 'react';
import { translate } from 'react-i18next';
import socket_sv from '../../utils/globalSv/service/socket_service';
import glb_sv from '../../utils/globalSv/service/global_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import { stkPriceBoard } from '../../utils/globalSv/models/stkPriceBoard';
import { Chart } from "react-google-charts";
import { change_theme } from '../../utils/change_theme'
import { change_language } from '../../utils/change_language'
import { bf_popout } from '../../utils/bf_popout'
import { reply_send_req } from '../../utils/send_req'

import ChartComponent from '../../conponents/chart_stock_info/chart_stock_info';
import ChartIntraday from '../../conponents/chart_intraday/chart_intraday';
import MarketInformationTable from '../../conponents/market_information_table/market_information_table.js'
import BidAskTable from './bid_ask_table'
import TimeVolumePriceMachingTable from './time_volume_price_maching_table'

import commuChanel from '../../constants/commChanel'
import { getMsgObjectByMsgKey } from '../../utils/get_msg_obj_by_msg_key'
import { inform_broadcast } from '../../utils/broadcast_service'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';
import functionList from '../../constants/functionList';
import { filterNumber } from '../../utils/filterNumber';
import { on_subcribeIndexList, on_unSubStkList } from '../../utils/subcrible_functions'

const remote = require('electron').remote;

class StockInfoLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.component = this.props.component
    this.req_component = new Map();
    this.popin_window = this.popin_window.bind(this);
    if (this.props.node) {
      this.props.node.setEventListener("close", (p) => {
        on_unSubStkList(this.component)
        window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeChgStock}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.ESC_KEY}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeReconect}_${this.component}`)
        // window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.event_ServerPushMRKRcvChangeEpMsg}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.mrkInfoEvent}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_event_FinishSunbcribeFunct}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.event_FinishGetMrkInfo}_${this.component}`)

        // window.ipcRenderer.on(`${commuChanel.event_ServerPushMRKRcvChangeEpMsg}_${this.component}`)
        // window.ipcRenderer.on(`${commuChanel.event_FinishGetMrkInfo}_${this.component}`)
        // window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`)
      })
    }

    this.request_seq_comp = 0;
    this.get_rq_seq_comp = () => {
      return ++this.request_seq_comp
    };
    this.clientSeq = 0;
    this.state = {
      name: this.component.split('_')[3],
      StockInfoExten: {},
      stkInfoMatching: [],
      msgkey: '',
      isShow: false,
      dataInfoDetail: [],
      dataPieChart: [],
      deepNewsList: [],
      ChartData: [],
      time_ChartData: '3M',
      stkType: '',
      isShowChartPieChart: true,

      themePage: this.props.themePage,
      language: this.props.language,
      style: this.props.style,

    };

    // this.getEpMsgFunct = glb_sv.getMoreEp_msg;
    this.getMktInfo_SymbolInfo_FunctNm = 'getMktInfo_SymbolInfo_FunctNm';
    this.GET_MORE_EPMSG = 'GET_MORE_EPMSG'

    this.pieOptions = {
      title: "",
      // slices: {0: {color: '#006EFF'}, 1:{color: '#00FF08'}, 2:{color: 'blue'}, 3: {color: 'red'}, 4:{color: 'grey'}},
      legend: {
        textStyle: {
          color: "#d0cece",
          fontSize: 14
        }
      },
      tooltip: {
        showColorCode: true
      },
      backgroundColor: glb_sv.style[glb_sv.themePage].chartOverView.backgroundColor,
      chartArea: {
        left: 0,
        top: 0,
        width: "100%",
        height: "80%"
      },
      colors: ['yellow', 'blue', 'green', 'red', 'pink', 'orange', 'skyblue', 'purple', 'violet', 'black']
      // fontName: "Roboto"
    };
    //-------- get Deep News -------
    this.deepNewsList = [];
    this.getDeepNewsListFlag = false;
    this.getDeepNewsList_FunctNm = 'RECOMMSTK_004';
    this.getChartData = 'getChartData-stock-info';
  }

  cells = [];
  timeOut = [];
  varObjct = {};
  curStk = '';
  // stkList = [];
  stkNameEx;
  StockInfoExten = new stkPriceBoard();
  stkInfoMatching = [];
  rowsOnPage = 500000;
  sortBy = 'c0';
  sortOrder = 'desc';
  activePage = 1;
  // -- get lasted EP message ---------
  eP_msgkey = '';
  msgkey = '';
  stk_full_nm = ''; // code them
  ep_nexSeq = 0;
  ep_nexSubSeq = 0;
  getNextEPmsg = false;
  // --------- chart ----------
  stkT260 = 0;
  lengthBf = 0;
  finishGet = false;
  isShow = false;
  disabled = false;

  popin_window() {
    const current_window = remote.getCurrentWindow();
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }

  componentWillMount() {

    console.log('vào componentWillMount');
    window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
      this.setState(agrs.state)
      this.setState({
        parent_id: agrs.parent_id,
        config: agrs.config,
      })
      console.log(agrs.config)
      const msg = { type: commuChanel.misTypeChgStock, data: agrs.config.data, component: this.props.component };
      setTimeout(() => inform_broadcast(commuChanel.misTypeChgStock, msg), 100);

      change_theme(this.state.themePage)
      change_language(this.state.language, this.props)
    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      this.setState(agrs.state)
    })

  }

  listener() {
    window.ipcRenderer.on(`${commuChanel.mrkInfoEvent}_${this.component}`, (event, msgObject) => {
      if (msgObject.data.t55 === this.curStk) {
        if (msgObject.data == null) return;
        this.setState({ StockInfoExten: { ...msgObject.data } });
        const nodeArr = msgObject.change.split(':');
        const id = msgObject.data.itemName + 'extRrgt' + nodeArr[0];
        this.changeBackground(id, Number(nodeArr[1]), Number(nodeArr[2]));
      }
    })

    window.ipcRenderer.on(`${commuChanel.reply_send_event_FinishSunbcribeFunct}_${this.component}`, (event, message) => {
      if (message === 'SUBSCRIBE_EXTEND') {
        console.log(message, this.state.msgkey)
        this.getNewValues(this.state.msgkey); //-- Lấy dữ liệu tại đây
      }
    })

    window.ipcRenderer.on(`${commuChanel.event_FinishGetMrkInfo}_${this.component}`, (event, agrs) => {
      console.log(agrs, this.component)
      const message = agrs['message']
      const reqInfoMap = agrs['reqInfoMap']
      // get_glb_sv()
      // var sq2 = this.get_value_from_glb_sv_seq()
      // get_glb_sv()(this.component, sq2)
      // window.ipcRenderer.once(`${commuChanel.get_glb_sv}_${this.component}_${sq2}`, (event, agrs) => {

      // })
      const sq = this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'autionMatch_timePriceSumVol_Map', sq: sq })
      window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {

        if (reqInfoMap === null || reqInfoMap === undefined) { return; }
        if (reqInfoMap.reqFunct === this.GET_MORE_EPMSG) {
          clearTimeout(this.getEpMsgFunct_ReqTimeout);
          const timeResult = new Date();
          reqInfoMap.resTime = timeResult;
          reqInfoMap.procStat = 2;
          // glb_sv.setReqInfoMapValue(message, reqInfoMap);
          this.getNextEPmsg = false;

          const stkInfoMatching_fix = agrs.get(this.state.msgkey);
          const stkInfoMatching = stkInfoMatching_fix ? stkInfoMatching_fix : [];
          const dataPieChart = this.countPercentofArray(stkInfoMatching);
          this.setState({ stkInfoMatching, dataPieChart });
        }
      })

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
      console.log('this.req_component', JSON.stringify(this.req_component));
      reply_send_req(agrs, this.req_component)
    })

    window.ipcRenderer.on(`${commuChanel.misTypeChgStock}_${this.component}`, (event, message) => {
      // console.log(message)
      if (message.component !== this.component) return;
      const sq = this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['stkInfoTradviewMap', 'HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq: sq })
      window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
        const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
        const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
        const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')
        const stkInfoTradviewMap = agrs.get('stkInfoTradviewMap')

        const item = message

        console.log('event choice a stock', item, item['data']['t55'] !== this.curStk);
        this.setState({ isShow: true });
        setTimeout(() => this.isShow = true, 5000);
        this.stkInfoMatching = [];
        this.stkT260 = 0;
        // // -- reset chart tại đây -----------
        // this.StockInfoExten = new stkPriceBoard();
        // this.msgkey = null;
        // this.eP_msgkey = null;


        if (item['data'] !== null && item['data'] !== undefined) {
          if (item['data']['t55'] !== null && item['data']['t55'] !== undefined && item['data']['t55'] !== this.curStk) {
            this.msgkey = item['data']['itemName'];
            this.setState({ msgkey: this.msgkey })
            // const msgObj = glb_sv.getMsgObjectByMsgKey(this.msgkey);
            const msgObj = getMsgObjectByMsgKey(this.msgkey, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
            this.lengthBf = 0;
            this.finishGet = false;
            if (msgObj !== null && msgObj !== undefined) {
              this.StockInfoExten = msgObj;
              this.setState({ StockInfoExten: this.StockInfoExten });
              this.stkT260 = msgObj['t260']
            };
            const msgK = item['data']['itemName'].substr(0, 3) + '|EP|' + item['data']['itemName'].substr(4);
            this.eP_msgkey = msgK;
            this.curStk = item['data']['t55'];
            this.getMktInfo_SymbolInfo(item['data']['t55']);

            // const stkInfo = glb_sv.stkInfoTradviewMap.get(item['data']['t55']);
            const stkInfo = stkInfoTradviewMap.get(item['data']['t55']);

            this.stkType = 'stock';
            if (stkInfo) {
              this.stkType = stkInfo['type'];
            }
            this.setState({ stkType: this.stkType })

            let ls_sanGd;
            if (item['data']['U10'] === '05') { ls_sanGd = 'UPC'; }
            if (item['data']['U10'] === '01') { ls_sanGd = 'HOSE'; }
            if (item['data']['U10'] === '03') { ls_sanGd = 'HNX'; }
            this.stk_full_nm = item['data']['t55'].trim() + ' - ' + ls_sanGd + ' - ' + item['data']['U9'].trim();
            // glb_sv.objShareGlb['stkAtc'] = item['data'];
            // glb_sv.actStockCode = item['data']['t55'];
            update_value_for_glb_sv({ component: this.component, key: ['objShareGlb', 'stkAtc'], value: item['data'] })
            update_value_for_glb_sv({ component: this.component, key: 'actStockCode', value: item['data']['t55'] })

            this.subcribeOneStkExtend();
          }
        }
      })
    })

    window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
      const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
      inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
      // glb_sv.commonEvent.next(msg);
    })

    window.ipcRenderer.on(`${commuChanel.misTypeReconect}_${this.component}`, (event, msg) => {
      this.subcribeOneStkExtend();
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
      change_theme(agrs)
      this.setState({ themePage: agrs })
      this.setState({ isShowChartPieChart: false }, () => this.setState({ isShowChartPieChart: true }));
    })
    window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
      change_language(agrs, this.props)
      // glb_sv.language = agrs
      this.setState({ language: agrs })
    })

    window.ipcRenderer.on(`${commuChanel.event_ServerPushMRKRcvChangeEpMsg}_${this.component}`, (event, message) => {
      // console.log(message, this.state.StockInfoExten.itemName)
      const sq = this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'autionMatch_timePriceSumVol_Map', sq: sq })
      window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
        if (message === this.state.StockInfoExten.itemName) {
          const stkInfoMatching = agrs.get(this.state.msgkey);
          const dataPieChart = this.countPercentofArray(stkInfoMatching);
          // console.log(stkInfoMatching, this.state.msgkey)
          this.setState({ stkInfoMatching, dataPieChart });
        }
      })

    })
  }

  componentDidMount() {
    this.listener()



    if (this.props.node) {
      const msg = { type: commuChanel.misTypeChgStock, data: this.props.node._attributes.config.data, component: this.props.component };
      setTimeout(() => inform_broadcast(commuChanel.misTypeChgStock, msg), 100);
    }


  }

  componentWillUnmount() {
    // console.log(this.props.active_components)
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)

    if (this.getEpMsgFunct_ReqTimeout) { clearTimeout(this.getEpMsgFunct_ReqTimeout); }
    if (this.timeNewValueTradView) clearTimeout(this.timeNewValueTradView);
  }

  changeBackground = (id, oldValue, newValue) => {
    const elemm = document.getElementById(id);
    if (elemm === null || elemm === undefined) { return; }
    if (newValue < oldValue) {
      if (elemm.classList.contains('bk_blue')) { elemm.classList.remove('bk_blue'); }
      if (!elemm.classList.contains('bk_red')) { elemm.classList.add('bk_red'); }
      // if (this.timeOut[id]) { window.clearTimeout(this.timeOut[id]); }
      setTimeout(() => {
        if (elemm.classList.contains('bk_red')) {
          elemm.classList.remove('bk_red');
        }
      }, 500);
      return;
    } else if (newValue > oldValue) {
      if (elemm.classList.contains('bk_red')) { elemm.classList.remove('bk_red'); }
      if (!elemm.classList.contains('bk_blue')) { elemm.classList.add('bk_blue'); }
      // if (this.timeOut[id]) { window.clearTimeout(this.timeOut[id]); }
      setTimeout(() => {
        if (elemm.classList.contains('bk_blue')) {
          elemm.classList.remove('bk_blue');
        }
      }, 500);
      return;
    }
  }

  getDataObjTradingview() {
    // const nowdt = glb_sv.convDate2StrDt(new Date());
    // glb_sv.getNewValues(nowdt, );
  }

  subcribeOneStkExtend = () => {
    this.stkInfoMatching = [];
    const arrOne = [];
    arrOne.push(this.curStk);
    on_subcribeIndexList(arrOne, this.component, 'SUBSCRIBE_EXTEND' + `__${this.component}`)
  }

  getNewValues = (value) => {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['autionMatch_timePriceSumVol_Map', 'stkInfoTradviewMap', 'HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
      const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
      const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
      const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')
      const autionMatch_timePriceSumVol_Map = agrs.get('autionMatch_timePriceSumVol_Map')


      const msgObj = getMsgObjectByMsgKey(value, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST);

      if (msgObj !== null && msgObj !== undefined) {
        this.StockInfoExten = msgObj;
      } else {
        this.StockInfoExten = new stkPriceBoard();
      }
      this.setState({ StockInfoExten: this.StockInfoExten });
      let curLength = 0;
      this.stkInfoMatching = autionMatch_timePriceSumVol_Map.get(value) === undefined ? [] : autionMatch_timePriceSumVol_Map.get(value);
      this.setState({ stkInfoMatching: this.stkInfoMatching });
      if (this.stkInfoMatching === null || this.stkInfoMatching === undefined || this.stkInfoMatching.length === 0) {
        this.ep_nexSeq = 99999999;
        this.ep_nexSubSeq = 0;
        curLength = 10000;
      } else if (this.stkInfoMatching.length > 0 && this.stkInfoMatching.length < 10000) {
        this.ep_nexSeq = this.stkInfoMatching[this.stkInfoMatching.length - 1]['c3'] - 1;
        this.ep_nexSubSeq = this.stkInfoMatching[this.stkInfoMatching.length - 1]['c4'];
        curLength = 10000 - this.stkInfoMatching.length;
      } else {
        curLength = this.stkInfoMatching.length + 1;
      }
      if (curLength <= 10000) { this.getMore_EpMsg(this.ep_nexSeq, this.ep_nexSubSeq, curLength); }
    })

  }

  countPercentofArray(arr) {
    const percentArray = [];
    if (arr === undefined || arr === []) return [];
    arr.forEach(item => {
      if (percentArray.find(temp => temp === item.c2)) {
        return;
      } else {
        percentArray.push(item.c2);
      }

    });
    const result = [[this.props.t('price'), this.props.t('qty')]];
    percentArray.sort().forEach(item => {
      let total = 0;
      arr.forEach(temp => {
        if (temp.c2 === item) total = temp.c1 + total
      });
      result.push([FormatNumber(item, 0, 0), total]);
    })
    return result;
  }

  getMore_EpMsg = (nexSeq, nexSubSeq, numberRow) => {
    // glb_sv.logMessage('call get getMore_EpMsg seq: ' + nexSeq + ', subSeq: ' + nexSubSeq + ', rows: ' + numberRow);
    // console.log()
    if (this.getNextEPmsg) { return; }
    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReqMRK)) {
    //   return;
    // }
    this.getNextEPmsg = true;
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap --
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.GET_MORE_EPMSG
    reqInfo.procStat = 0;
    reqInfo.reqTime = new Date();
    reqInfo.component = this.component;
    reqInfo.receiveFunct = ''
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    this.req_component.set(request_seq_comp, reqInfo)
    const msgObj = { 'Command': 'RESEND', 'F1': this.eP_msgkey, 'F2': nexSeq, 'F3': nexSubSeq, 'F4': numberRow };
    // socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj));
    this.getEpMsgFunct_ReqTimeout = setTimeout(this.functSolveTimeOut, glb_sv.getTimeoutNum(2), request_seq_comp);
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReqMRK,
        reqFunct: reqInfo.reqFunct,
        msgObj: msgObj
      },
      svInputPrm: {}
    })
  }

  functSolveTimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    if (reqIfMap.reqFunct === this.GET_MORE_EPMSG) {
      this.getNextEPmsg = false;
      // glb_sv.setReqInfoMapValue(cltSeq, reqIfMap);
      this.req_component.set(cltSeq, reqIfMap);
    } else if (reqIfMap.reqFunct === this.getMktInfo_SymbolInfo_FunctNm) {
      this.getMktInfo_SymbolInfoFlag = false;
    } else if (reqIfMap.reqFunct === this.getDeepNewsList_FunctNm) {
      this.getDeepNewsListFlag = false;
    }
  }


  getMktInfo_SymbolInfo = (stk) => {
    if (this.getMktInfo_SymbolInfoFlag) { return; }
    this.getMktInfo_SymbolInfoFlag = true;
    // console.log(stk)
    // -- call service for place order
    // const clientSeq = socket_sv.getRqSeq();
    // -- push request to request hashmap
    const request_seq_comp = this.get_rq_seq_comp()
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getMktInfo_SymbolInfo_FunctNm;
    reqInfo.component = this.component
    reqInfo.receiveFunct = this.handle_getMktInfo_SymbolInfo;
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    // svInputPrm.ClientSeq = clientSeq;
    svInputPrm.WorkerName = 'ALTqMktInfo01';
    svInputPrm.ServiceName = 'ALTqMktInfo01_SymbolInfo';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['1', stk];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));

    this.getMktInfo_SymbolInfo_ReqTimeOut = setTimeout(this.functSolveTimeOut, functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    this.req_component.set(request_seq_comp, reqInfo)
    this.setState({ dataInfoDetail: [] });
    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm: svInputPrm
    })
  }


  handle_getMktInfo_SymbolInfo = (reqInfoMap, message) => {
    clearTimeout(this.getMktInfo_SymbolInfo_ReqTimeOut);
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getMktInfo_SymbolInfoFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
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
      jsondata.sort(this.compareListDetail);
      reqInfoMap.procStat = 2;
      this.getMktInfo_SymbolInfoFlag = false;
      this.setState({ dataInfoDetail: jsondata });
    }
  }

  compareListDetail(a, b) {
    if (Number(a.c6) < Number(b.c6)) {
      return -1;
    }
    if (Number(a.c6) > Number(b.c6)) {
      return 1;
    }
    return 0;
  }

  getColorPieChart = (index, data) => {
    // const sq= this.get_value_from_glb_sv_seq()
    // window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: ['themePage', 'style'], sq: sq})
    // window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
    // const themePage = agrs.get('themePage')
    const themePage = this.state.themePage
    // const style = agrs.get('style')
    const style = this.state.style

    const obj = data[index];
    if (obj === undefined) return style[themePage].price_basic_color;
    // const value = glb_sv.filterNumber(obj[0]);
    const value = filterNumber(obj[0])
    const TC = this.state.StockInfoExten.t260 ? this.state.StockInfoExten.t260 : 0;
    if (TC === 0) return style[themePage].price_basic_color;
    const FL = this.state.StockInfoExten.t333 ? this.state.StockInfoExten.t333 : 0;
    if (FL === 0) return style[themePage].price_floor_color;
    const CE = this.state.StockInfoExten.t332 ? this.state.StockInfoExten.t332 : 0;
    if (CE === 0) return style[themePage].price_ceil_color;
    // console.log(value,TC,FL,CE)
    if (value === FL) {
      return style[themePage].price_floor_color
    } else if (value < TC) {
      return style[themePage].price_basic_less
    } else if (value === TC) {
      return style[themePage].price_basic_color
    } else if (value > TC && value < CE) {
      return style[themePage].price_basic_over
    } else if (value === CE) {
      return style[themePage].price_ceil_color
    }
    // })

  }

  render() {
    const { t } = this.props;

    // console.log(this.state.StockInfoExten.t260, this.state.StockInfoExten.t333)
    const { StockInfoExten, dataInfoDetail } = this.state;
    return (
      // <div className="wizard wizard-modal" id={this.component}>
      //     <div className="wizard-modal-content" id="wizard-modal-content">
      //         <div className="wizard-modal-body" id={this.component + 'body'}>
      <div className='stock-info' style={{ marginTop: '3%' }}>
        {/* <div className='stock-info' style={{ marginTop: 14, minWidth: 1200, overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}> */}
        <div className="row" style={{ margin: 0, marginBottom: 5 }}>
          <div className="col-lg-4 col-12 padding5">
            <MarketInformationTable
              get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
              component={this.component}
              dataInfoDetail={dataInfoDetail}
              StockInfoExten={StockInfoExten} />
          </div>

          <div className="col-lg-4 col-12 padding5">
            <BidAskTable
              get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
              component={this.component}
              StockInfoExten={StockInfoExten} />
          </div>

          <div className="col-lg-4 col-12 padding5">
            <TimeVolumePriceMachingTable
              get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
              component={this.component}
              stkInfoMatching={this.state.stkInfoMatching}
              StockInfoExten={StockInfoExten} />
          </div>

        </div>

        <div className="row" style={{ margin: 0 }}>
          <div className="col-lg-4 col-12 padding5">
            <div className="card stockInfoExtent" style={{ marginBottom: '5px' }}>
              <div className="card-body widget-body chart-ohlc" style={{ height: 280, padding: 0 }}>
                <ChartComponent req_component={this.req_component}
                  t={t}
                  curStk={StockInfoExten.t55}
                  time={this.state.time_ChartData}
                  stkType={this.state.stkType}
                  themePage={this.state.themePage}
                  component={this.component}
                  get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                  get_rq_seq_comp={this.get_rq_seq_comp}
                  language=''
                  width={440}
                  height={280}
                />
                <span onClick={() => this.setState({ time_ChartData: '1W' })} className={'time_chart ' + (this.state.time_ChartData === '1W' ? 'active' : '')}>1W</span>{' '}
                <span onClick={() => this.setState({ time_ChartData: '1M' })} className={'time_chart ' + (this.state.time_ChartData === '1M' ? 'active' : '')}>1M</span>{' '}
                <span onClick={() => this.setState({ time_ChartData: '3M' })} className={'time_chart ' + (this.state.time_ChartData === '3M' ? 'active' : '')}>3M</span>{' '}
                <span onClick={() => this.setState({ time_ChartData: '6M' })} className={'time_chart ' + (this.state.time_ChartData === '6M' ? 'active' : '')}>6M</span>{' '}
                <span onClick={() => this.setState({ time_ChartData: '1Y' })} className={'time_chart ' + (this.state.time_ChartData === '1Y' ? 'active' : '')}>1Y</span>{' '}
                <span onClick={() => this.setState({ time_ChartData: '2Y' })} className={'time_chart ' + (this.state.time_ChartData === '2Y' ? 'active' : '')}>2Y</span>{' '}
                <span onClick={() => this.setState({ time_ChartData: '3Y' })} className={'time_chart ' + (this.state.time_ChartData === '3Y' ? 'active' : '')}>3Y</span>{' '}

              </div>
            </div>
          </div>
          <div className="col-lg-4 col-12 padding5">
            <div className="card stockInfoExtent" style={{ marginBottom: '5px' }}>

              <div className="card-body widget-body" style={{ padding: 0, height: 280, position: 'relative', overflow: 'hidden' }}>
                <ChartIntraday
                  t={t}
                  style={this.state.style}
                  themePage={this.state.themePage}
                  component={this.component}
                  get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                  itemName={StockInfoExten.itemName}
                  req_component={this.req_component}
                  t260={StockInfoExten.t260}
                  t333={StockInfoExten.t333}
                  t332={StockInfoExten.t332}
                  width={440}
                  height={280}
                />
              </div>

            </div>
          </div>
          <div className="col-lg-4 col-12 padding5">
            <div className="card stockInfoExtent" style={{ marginBottom: '5px' }}>
              <div className="card-body widget-body" style={{ height: 280, padding: 0 }}>
                {this.state.isShowChartPieChart && <div style={{ position: 'relative', width: '100%' }} >
                  <Chart
                    height="280px"
                    chartType="PieChart"
                    data={this.state.dataPieChart}
                    options={{
                      titleTextStyle: {
                        color: this.state.style[this.state.themePage].chartPieStkInfo.fontColor
                      },
                      legend: {
                        textStyle: {
                          color: this.state.style[this.state.themePage].chartPieStkInfo.fontColor,
                          fontSize: 14
                        }
                      },
                      tooltip: {
                        showColorCode: true
                      },
                      backgroundColor: this.state.style[this.state.themePage].chartPieStkInfo.backgroundColor,
                      title: t('chart_rate_match_today'),
                      colors: [this.getColorPieChart(1, this.state.dataPieChart), this.getColorPieChart(2, this.state.dataPieChart),
                      this.getColorPieChart(3, this.state.dataPieChart), this.getColorPieChart(4, this.state.dataPieChart),
                      this.getColorPieChart(5, this.state.dataPieChart), this.getColorPieChart(6, this.state.dataPieChart),
                      this.getColorPieChart(7, this.state.dataPieChart), this.getColorPieChart(8, this.state.dataPieChart),
                      this.getColorPieChart(9, this.state.dataPieChart), this.getColorPieChart(10, this.state.dataPieChart)]
                    }}
                    graph_id="PieChart"
                    legend_toggle
                  />
                </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
      //         </div>
      //     </div>
      // </div>

    )
  }
}

export default translate('translations')(StockInfoLayout);