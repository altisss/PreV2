/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import { NodeIndexWL, NodeIndexFVL, NodeIndexOther } from './row-index';
import { Subject } from 'rxjs';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { isEqual} from "lodash";
import { toast } from "react-toastify";
import { Button, Modal, Label, Input, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { Collapse } from 'reactstrap';
import { inform_broadcast } from '../../utils/broadcast_service';
import commuChannel from '../../constants/commChanel'
import components from '../../constants/components'
import {getIndexChartSidebar} from '../../utils/get_index_chart_sidebar'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';
import { showLogin } from '../../utils/show_login';
import { checkToast } from '../../utils/check_toast';
import { focusELM } from '../../utils/focus_elm';
import { filter_str_bf_parse } from '../../utils/filter_str_before_parse';
import functionList from '../../constants/functionList';
import {on_subcribeIndex, on_unsubcribeIndex} from '../../utils/subcrible_functions'
import uniqueId from "lodash/uniqueId";
import './style.scss'
import { getUniqueListBy } from '../../utils/utils_func';


class TableIndexList extends React.Component {
  constructor(props) {
    super(props);
    this.clientSeq = 0;
    this.handleClick = this.handleClick.bind(this);
    this.fvl_delete = '';
    this.fvlNew = '';

    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.req_component = this.props.req_component
    this.get_rq_seq_comp = this.props.get_rq_seq_comp
    
    let objVN_INDEX = {};
    let objHNX_INDEX = {};
    let objUPCOM_INDEX = {};
    let tradStatus_VNI = {};
    let tradStatus_HNX = {};
    let tradStatus_UPC = {};
    const sq= this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChannel.get_value_from_glb_sv, {component: this.props.component, value: ['VN_INDEX', 'HNX_INDEX', 'UPCOM_INDEX'], sq:sq})
    window.ipcRenderer.once(`${commuChannel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
        
        console.log(agrs, 'VN_INDEX')
        const VN_INDEX = agrs.get('VN_INDEX')
        const HNX_INDEX = agrs.get('HNX_INDEX')
        const UPCOM_INDEX = agrs.get('UPCOM_INDEX')

        objVN_INDEX.indexValue = VN_INDEX.indexValue;
        objVN_INDEX.referLine = VN_INDEX.ref;
        objVN_INDEX.indexValueChang = VN_INDEX.indexValueChang;
        objVN_INDEX.indexPercChang = VN_INDEX.indexPercChang;
        tradStatus_VNI = VN_INDEX.tradStatus;

        
        objHNX_INDEX.indexValue = HNX_INDEX.indexValue;
        objHNX_INDEX.referLine = HNX_INDEX.ref;
        objHNX_INDEX.indexValueChang = HNX_INDEX.indexValueChang;
        objHNX_INDEX.indexPercChang = HNX_INDEX.indexPercChang;
        tradStatus_HNX = HNX_INDEX.tradStatus;

        
        objUPCOM_INDEX.indexValue = UPCOM_INDEX.indexValue;
        objUPCOM_INDEX.referLine = UPCOM_INDEX.ref;
        objUPCOM_INDEX.indexValueChang = UPCOM_INDEX.indexValueChang;
        objUPCOM_INDEX.indexPercChang = UPCOM_INDEX.indexPercChang;
        tradStatus_UPC = UPCOM_INDEX.tradStatus;

    })
    
    this.renderFlag = true;

    this.nodeWL = [
      { type: 'folder', isOpen: true, value: 'fav_recommendations', key: 'WL', rateNum: 0, userNum: 0 }
    ];
    this.addNode('dataWatchList', 'nodeWL', 'WL', true);
    this.nodeFVL = [
      { type: 'folder', isOpen: true, value: 'favorites', key: 'FVL', rateNum: 0, userNum: 0 }
    ];
    this.addNode('dataFvr', 'nodeFVL', 'FVL', true);
    this.nodeHSX = [
      { type: 'folder', isOpen: false, value: 'HOSE', data: objVN_INDEX, key: 'HSXINDEX', typeIndex: 'HSX', rateNum: 0, userNum: 0 }
    ];

    this.addNode('dataHose', 'nodeHSX', 'HSX', true);
    this.nodeHNX = [
      { type: 'folder', isOpen: false, value: 'HNX', data: objHNX_INDEX, key: 'HNXINDEX', typeIndex: 'HNX', rateNum: 0, userNum: 0 }
    ];
    this.addNode('dataHnx', 'nodeHNX', 'HNX', true);
    this.nodeUPC = [
      { type: 'folder', isOpen: false, value: 'UPCOM', data: objUPCOM_INDEX, key: 'UPCINDEX', typeIndex: 'UPC', rateNum: 0, userNum: 0 }
    ];
    this.addNode('dataUpc', 'nodeUPC', 'UPC', true);
    this.state = {
      nodeWL: this.nodeWL,
      nodeFVL: this.nodeFVL,
      nodeHSX: this.nodeHSX,
      nodeHNX: this.nodeHNX,
      nodeUPC: this.nodeUPC,
      isOpenWL: true,
      isOpenFVL: true,
      isOpenHNX: true,
      isOpenHSX: true,
      isOpenUPC: true,
      //-- vote component 
      voteShow: false,
      star_1: 'fa fa-star-o',
      star_2: 'fa fa-star-o',
      star_3: 'fa fa-star-o',
      star_4: 'fa fa-star-o',
      star_5: 'fa fa-star-o',
      voteNumber: 0,
      voteComment: '',
      sendingVoting: false,
      //-- vote comment list
      voteCommentList: [],
      openComment: true,
      tradStatus_VNI,
      tradStatus_HNX,
      tradStatus_UPC
    };
    update_value_for_glb_sv( {component: this.props.component, key: 'isOpenHSX', value: false})
    update_value_for_glb_sv( {component: this.props.component, key: 'isOpenHNX', value: false})
    // glb_sv.isOpenHSX = false;
    // glb_sv.isOpenHNX = false;
  }

  subcr_ClientReqRcv = new Subject();
  sendVote_FcntNm = 'SENDVOTE-01';
  sendVoteFlag = false;
  curent_key = 0;
  curent_rate = 0;

  getVoteComment_FcntNm = 'SENDVOTE-02';
  getVoteCommentFlag = false;

  componentDidMount() {
    
    const uni = getUniqueListBy(this.state.nodeFVL, 'key')
    this.setState({nodeFVL: uni})

    // setTimeout(() => {
    //   const elmHotNews = document.getElementsByClassName('height-list');
    //   const heightWeb = window.innerHeight;
    //   const indexList = document.getElementById('id-index-list');
    //   if (indexList) {
    //     const heightIndexList = indexList.offsetHeight;
    //     for (let i = 0; i < elmHotNews.length; i++) {
    //       elmHotNews[i].style.height = (heightWeb - (134 + heightIndexList)) + 'px';
    //     }
    //   }

    // }, 0);
    
    this.old_dataFvr = []
  }

  componentWillReceiveProps(props) {

    const new_dataFvr = JSON.stringify(getUniqueListBy(props.dataFvr, 'key'));

    this.nodeWL = [
      { type: 'folder', isOpen: true, value: 'fav_recommendations', key: 'WL', rateNum: 0, userNum: 0 }
    ];

    this.updateNode(props.dataWatchList, 'nodeWL', 'WL', true);
    this.setState({ nodeWL: this.nodeWL });

    if (new_dataFvr && this.old_dataFvr !== new_dataFvr) {
      this.old_dataFvr = new_dataFvr;
      this.nodeFVL = [
        { type: 'folder', isOpen: true, value: 'favorites', key: 'FVL' }
      ];
      this.updateNode(props.dataFvr, 'nodeFVL', 'FVL', true);
      this.setState({ nodeFVL: getUniqueListBy(this.nodeFVL, 'key') }, () => {
        
        if (this.nodeFVL.length > 1) {
          const data = this.nodeFVL[1];
          this.focusRowFunct(data.key + data.typeIndex, data);
          this.sendIndex(data);
        } else if (this.nodeWL.length > 1) {
          const data = this.nodeWL[1];
          this.focusRowFunct(data.key + data.typeIndex, data);
          this.sendIndex(data);
        } else if (this.nodeHSX.length > 1) {
          const data = this.nodeHSX[3];
          this.focusRowFunct(data.key + data.typeIndex, data);
          this.sendIndex(data);
        }
      })
    }
    // else{
    //   this.onNodeSelect({type: "file",
    //   value: "VN30",
    //   key: "VN30",
    //   typeIndex: "HSX",}, null)
    // }
  }

  componentWillUnmount() {
    window.ipcRenderer.removeAllListeners(`${commuChannel.event_ServerPushIndexChart}_${this.props.component}`)
    window.ipcRenderer.removeAllListeners(`${commuChannel.event_FinishGetMrkInfo}_${this.props.component}`)
  }

  focusRowFunct(key, data) {
    console.log(key, data)
    const allRow = document.getElementsByClassName('index-sidebar');
    // console.log(allRow)
    for (let i = 0; i < allRow.length; i++) {
      if (allRow[i]) {
        // allRow[i].style.background = '';
        if (allRow[i].classList.contains('active')) allRow[i].classList.remove('active');
      }
    }
    const focusRow = document.getElementById(key);
    if (focusRow) {
      // focusRow.style.background = glb_sv.style[glb_sv.themePage].sideBar.background_focusrow;
      if (!focusRow.classList.contains('active')) focusRow.classList.add('active');
      this.isSelect = data;
    }
  }

  sendIndex(node, msgstr) {
    if(!node) return
    console.log(node, msgstr)
    const type = (node.typeIndex === 'HSX' || node.typeIndex === 'HNX' || node.typeIndex === 'UPC') ? 'IND' : node.typeIndex;
    const msg = {
      type: commuChannel.CHANG_INDEX,
      value: { type, key: node.key, value: node.value },
      change: msgstr,
      component: this.props.component
    };
    inform_broadcast(commuChannel.CHANG_INDEX, msg)

    // glb_sv.commonEvent.next(msg);
  }

  createObjectTree(dataprops, datatree, keytree, type) {
    if (this.props[dataprops] !== []) {
      const children = [];
      this.props[dataprops].forEach((item, index) => {
        if (index === 0 && dataprops === 'dataFvr') {
          this.focusFistFVL = keytree + '/' + item.value;
          // this.isSelect = keytree + '/' + item.value;
        }
        if (index === 0 && dataprops === 'dataHose') {
          this.focusFistHSX = keytree + '/' + item.value;
          // this.isSelect = keytree + '/' + item.value;
        }
        children.push(keytree + '/' + item.value);
        this[datatree][keytree + '/' + item.value] = {
          path: keytree + '/' + item.value,
          type: 'file',
          key: item.key,
          value: item.value,
          typeIndex: type
        }
      });
      this[datatree][keytree].children = children;
    }
  }

  updateObjectTree(props, dataprops, datatree, keytree, type) {
    if (props[dataprops] !== []) {
      const children = [];
      props[dataprops].forEach(item => {
        children.push(keytree + '/' + item.value);
        this[datatree][keytree + '/' + item.value] = {
          path: keytree + '/' + item.value,
          type: 'file',
          key: item.key,
          value: item.value,
          typeIndex: type
        }
      });
      this[datatree][keytree].children = children;
    }
  }

  calHeightDiv(id) {
    const elm = document.getElementById(id);
    if (elm) return elm.offsetHeight;
    else return 0;
  }

  calHeightPanelBody() {
    const elm = document.getElementById('fixScrollTable');
    const div_sidebar = document.getElementById('left-side-bar');
    if (elm && div_sidebar) {
      const height = this.calHeightDiv('dmkn') + this.calHeightDiv('favourite') + 26 * 2 + 30;
      elm.style.height = div_sidebar.offsetHeight - height - 13 + 'px';
    }
  }

  handleClick = (key) => {
    if (key === 'dmkn') {
      const messObj = {
        type: commuChannel.CHANG_INDEX,
        value: { type: 'DMKN', key: '0000', value: this.props.t('stock_recommandation'),
        component: this.props.component }
      };
      // glb_sv.commonEvent.next(messObj);
      inform_broadcast(commuChannel.CHANG_INDEX, messObj)
    }
    if (key === 'cw') {
      const messObj = {
        type: commuChannel.CHANG_INDEX,
        // value: { type: 'CW', key: '8888', value: this.props.t('covered_warrant') }
        value: { type: 'IND', key: 'CW', value: this.props.t('covered_warrant'), component: this.props.component }
      };
      // glb_sv.commonEvent.next(messObj);
      inform_broadcast(commuChannel.CHANG_INDEX, messObj)
    }
    // this.focusRowSidebarfunc('dmkn');
  }

  focusRowSidebarfunc = (id) => {
    const elms = document.getElementsByClassName('rowSidebar');
    for (let elm of elms) {
      if (elm.classList.contains('active')) elm.classList.remove('active');
      elm.style.color = '';
      elm.style.backgroundColor = '';
    }
    const idRowActive = document.getElementById(id);
    if (idRowActive && !idRowActive.classList.contains('active')) idRowActive.classList.add('active');
    if (idRowActive) {
      const sq = this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChannel.get_value_from_glb_sv, {component: this.props.component, value: 'configInfo', sq:sq})
      window.ipcRenderer.once(`${commuChannel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
        idRowActive.style.backgroundColor = agrs.style.sideBar.backgroundColor_focus;
      })
    }
  }

  updateButton(elm) {
    if (elm) {
      elm.style.width = '165px';
      elm.style.marginTop = '10px';
      elm.style.height = '28px';
    }
  }

  onNodeSelect = (node, key) => {
    console.log('onNodeSelect', node, key)
    window.ipcRenderer.send(commuChannel.SubMarketInfor, {node, key, component: this.props.component})
  }

  addNode = (dataProps, dataThis, typeIndex, isOpen) => {
    if (this.props[dataProps] !== []) {
      this.props[dataProps].forEach((item, index) => {
        const children = {};
        if (index === 0 && dataProps === 'dataFvr') {
          this.focusFistFVL = item.value;
          // this.isSelect = keytree + '/' + item.value;
        }
        if (index === 0 && dataProps === 'dataHose') {
          this.focusFistHSX = item.value;
          // this.isSelect = keytree + '/' + item.value;
        }
        children.type = 'file';
        children.value = item.value;
        children.key = item.key;
        children.userNum = item.userNum;
        children.rateNum = item.rateNum;
        children.userVoted = item.userVoted;
        children.typeIndex = typeIndex;
        // const data = glb_sv.getIndexChartSidebar(item.key);
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChannel.get_value_from_glb_sv, {component: this.props.component, value: item.key, sq:sq})
        window.ipcRenderer.once(`${commuChannel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
          const data = getIndexChartSidebar(agrs);
          children.data = data
          this[dataThis].push(children);
        })
        // const data = getIndexChartSidebar(item.key, this.props.component, this.get_value_from_glb_sv_seq);
        // children.data = data

        // this[dataThis].push(children);
      });
    }
  }
  updateNode = (data, dataThis, typeIndex, isOpen) => {
    if (data !== []) {
      data.forEach((item, index) => {
        const children = {};
        children.type = 'file';
        children.value = item.value;
        children.key = item.key;
        children.typeIndex = typeIndex;
        children.userNum = item.userNum;
        children.rateNum = item.rateNum;
        children.userVoted = item.userVoted;
        this[dataThis].push(children);
      });
    }
  }
  getIndex(key) {
      const sq = this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChannel.get_value_from_glb_sv, {component: this.props.component, value: 'getIndexHist', sq:sq})
      window.ipcRenderer.once(`${commuChannel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
        const reqInfo = new requestInfo();
        const request_seq_comp = this.props.get_rq_seq_comp()
        reqInfo.reqFunct = agrs + key;
        reqInfo.procStat = 0;
        reqInfo.reqTime = new Date();
        reqInfo.component = this.props.component;
        reqInfo.receiveFunct = ''
        // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
        this.props.req_component.set(request_seq_comp, reqInfo)
        const msgObj = { 'Command': 'INDEX_MSG', 'F1': 'HSX|I|HSXIndex' };
        // socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj2));
        window.ipcRenderer.send(commuChannel.send_req, {
          req_component:{
            component: reqInfo.component,
            request_seq_comp: request_seq_comp,
            channel: socket_sv.key_ClientReqMRK,
            reqFunct: reqInfo.reqFunct,
            msgObj: msgObj
          }, 
          svInputPrm:{}
        })
      })
    // socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj));
  }

  /*--- Start code for voting function ---*/
  openVoteModal = (node) => {
    const sq = this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChannel.get_value_from_glb_sv, {component: this.props.component, value: 'authFlag', sq:sq})
      window.ipcRenderer.once(`${commuChannel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
        if (!agrs) {
          // glb_sv.showLogin();
          showLogin(this.props.component)
          return;
        }
        this.curent_key = node.key;
        this.lastRowNumber = 11;
        this.setState({ voteComment: '', voteCommentList: [] });
        // this.resetVote();
    
        this.setState({ voteShow: true }, () => {
          this.calcVoteSend(node.userVoted);
        });
        this.setState({ voteNumber: 0 });
        this.currentSeq = 999999;
        this.getVoteComment(this.currentSeq);
      })
    
  }

  toggle = () => {
    this.setState({ voteShow: !this.state.voteShow });
  }

  handleCommentInput = (e) => {
    e.preventDefault();
    let value = e.target.value;
    this.setState({ voteComment: value });
  }

  sendVoting = (e, actTp) => {
    e.preventDefault();
    if (this.sendVoteFlag) return;
    if (actTp === 'N') {
      this.setState({ voteShow: false });
      return;
    }
    // -- request to get favorite list
    if (this.state.voteNumber === 0) {
      checkToast(toast, 'warn', this.props.t('vote_require_recommand'), 'vote_required_star')
      // glb_sv.checkToast(toast, 'warn', this.props.t('vote_require_recommand'), 'vote_required_star');
      return;
    }
    if (this.state.voteNumber <= 3) {
      if (!this.state.voteComment || this.state.voteComment.trim().length === 0) {
        checkToast(toast, 'warn', this.props.t('vote_comment_require'), 'vote_required_comment')
        // glb_sv.checkToast(toast, 'warn', this.props.t('vote_comment_require'), 'vote_required_comment');
        const commentVoted = document.getElementById('commentVoted');
        commentVoted.value = '';
        focusELM('commentVoted')
        // glb_sv.focusELM('commentVoted');
        return;
      }
    }
    this.sendVoteFlag = false;
    const reqInfo = new requestInfo();
    const request_seq_comp = this.props.get_rq_seq_comp()
    reqInfo.reqFunct = this.sendVote_FcntNm;
    reqInfo.procStat = 0;
    reqInfo.component = this.props.component;
    reqInfo.receiveFunct = this.sendVotingResultProc;
    reqInfo.reqTime = new Date();
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTxNews';
    svInputPrm.ServiceName = 'ALTxNews_SuggestGrp_Rate';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'U';
    svInputPrm.InVal = ['RATE', this.curent_key + '', this.state.voteNumber + '', filter_str_bf_parse(this.state.voteComment)];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.sendVote_FcntNm_TimeOut = setTimeout(this.solvingTimeout, functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    this.props.req_component.set(request_seq_comp, reqInfo)
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    this.setState({ sendingVoting: true });
    window.ipcRenderer.send(commuChannel.send_req, {
      req_component:{
        component: reqInfo.component, 
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      }, 
      svInputPrm:svInputPrm
  })
  }

  sendVotingResultProc = (reqInfoMap, message) => {
    let timeResult = new Date();
    reqInfoMap.resTime = timeResult;
    reqInfoMap.procStat = 2;
    const cltSeqResult = Number(message['ClientSeq']);
    this.sendVoteFlag = false;
    this.setState({ voteShow: false });
    const errmsg = message['Message'];
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;;
      // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      toast.warn(errmsg.trim());
    } else {

      toast.info(errmsg.trim());
      const sq= this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChannel.get_value_from_glb_sv, {component: this.props.component, value: 'REGET_RECOMMAND', sq:sq})
      window.ipcRenderer.once(`${commuChannel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
        const obj = {
          type: agrs,
          component: this.props.component
        }
        // glb_sv.commonEvent.next(obj);
        inform_broadcast(agrs, obj)
      })
      // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
    }
  }

  solvingTimeout = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) return;
    const reqIfMap = this.props.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) return;
    reqIfMap.procStat = 4;
    this.props.req_component.set(cltSeq, reqIfMap);
    if (reqIfMap.reqFunct === this.sendVote_FcntNm) {
      this.sendVoteFlag = false;
      this.setState({ voteShow: false });
    }
    const errmsg = "common_cant_connect_server";
    toast.warn(errmsg.trim());
  }

  calcVoteSend = (rateNumber) => {
    this.resetVote();
    if (!rateNumber || rateNumber <= 0) return;
    this.setState({ voteNumber: rateNumber });
    // glb_sv.focusELM('commentVoted');
    focusELM('commentVoted')
    if ((0 < rateNumber) && (rateNumber < 1)) {
      this.setState({ star_1: 'fa fa-star-half-o' });
      return;
    }
    this.setState({ star_1: 'fa fa-star' });
    // glb_sv.focusELM('commentVoted');
    focusELM('commentVoted')

    if (rateNumber <= 1) return;
    if ((1 < rateNumber) && (rateNumber < 2)) {
      this.setState({ star_2: 'fa fa-star-half-o' });
      return;
    }
    this.setState({ star_2: 'fa fa-star' });
    // glb_sv.focusELM('commentVoted');
    focusELM('commentVoted')
    if (rateNumber <= 2) return;
    if ((2 < rateNumber) && (rateNumber < 3)) {
      this.setState({ star_3: 'fa fa-star-half-o' });
      return;
    }
    this.setState({ star_3: 'fa fa-star' });
    // glb_sv.focusELM('commentVoted');
    focusELM('commentVoted')
    if (rateNumber <= 3) return;
    if ((3 < rateNumber) && (rateNumber < 4)) {
      this.setState({ star_4: 'fa fa-star-half-o' });
      return;
    }
    this.setState({ star_4: 'fa fa-star' });
    // glb_sv.focusELM('commentVoted');
    focusELM('commentVoted')
    if (rateNumber <= 4) return;
    if ((4 < rateNumber) && (rateNumber < 5)) {
      this.setState({ star_5: 'fa fa-star-half-o' });
      return;
    }
    this.setState({ star_5: 'fa fa-star' });
    // glb_sv.focusELM('commentVoted');
    focusELM('commentVoted')
  };

  resetVote = () => {
    this.setState({ star_1: 'fa fa-star-o' });
    this.setState({ star_2: 'fa fa-star-o' });
    this.setState({ star_3: 'fa fa-star-o' });
    this.setState({ star_4: 'fa fa-star-o' });
    this.setState({ star_5: 'fa fa-star-o' });
  }

  getVoteComment = (seq) => {
    if (this.getVoteCommentFlag || this.lastRowNumber === 0) return;

    // -- request to get comment list
    this.getVoteCommentFlag = false;

    const reqInfo = new requestInfo();
    const request_seq_comp = this.get_rq_seq_comp()
    reqInfo.component = this.props.component;
    reqInfo.receiveFunct = this.getVoteCommentResultProc;
    reqInfo.reqFunct = this.getVoteComment_FcntNm;
    reqInfo.procStat = 0;
    reqInfo.reqTime = new Date();
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqNews';
    svInputPrm.ServiceName = 'ALTqNews_Suggest';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['03', this.curent_key + '', seq + ''];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.getVoteComment_TimeOut = setTimeout(this.solvingTimeout, functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    this.req_component.set(request_seq_comp, reqInfo)
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    window.ipcRenderer.send(commuChannel.send_req, {
        req_component:{
          component: reqInfo.component, 
          request_seq_comp: request_seq_comp,
          channel: socket_sv.key_ClientReq
        }, 
        svInputPrm:svInputPrm
      })
  }

  getVoteCommentResultProc = (reqInfoMap, message) => {
    let timeResult = new Date();
    reqInfoMap.resTime = timeResult;
    const errmsg = message['Message'];
    if (Number(message['Result']) === 0) {
      this.getVoteCommentFlag = false;
      reqInfoMap.resSucc = false;
      reqInfoMap.procStat = 2;
      toast.warn(errmsg.trim());
    } else {
      let jsondata;
      try {
        jsondata = JSON.parse(filter_str_bf_parse(message['Data']));
      } catch (err) {
        jsondata = [];
      }
      if (Number(message['Packet']) <= 0) {
        if (jsondata.length > 0) this.currentSeq = jsondata[jsondata.length - 1]['c0'];

        reqInfoMap.procStat = 2;
        this.getVoteCommentFlag = false;
        this.lastRowNumber = jsondata.length;
        this.setState({ lastRowNumber: this.lastRowNumber < 10 ? 0 : this.lastRowNumber });
        if (jsondata.length > 0) {
          if (jsondata.length > 0) this.currentSeq = jsondata[jsondata.length - 1]['c0'];
          this.setState({ voteCommentList: this.state.voteCommentList.concat(jsondata) });
        }
      }
    }
  }

  toggleComment = () => {
    this.setState({ openComment: !this.state.openComment });
  }

  getMoreComent = () => {
    this.getVoteComment(this.currentSeq);
  }

  open_model_addModFav = (node_key, path, component) => {
    // console.log(node_key, path)
    inform_broadcast(commuChannel.OPEN_MODAL_AddModFav, {node_key, path, component})
  }

  openAddNewFavarites = () => {
    const sq= this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChannel.get_value_from_glb_sv, {component: this.props.component, value: 'authFlag', sq:sq})
    window.ipcRenderer.once(`${commuChannel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
      if (!agrs) {
        // glb_sv.showLogin();
        showLogin(this.props.component)
      } else {
        this.open_model_addModFav(null, 'add-fav', this.props.component)
      }
    })
    
  };

  render() {
    const { t } = this.props;
    const nodeWLPrimary = this.state.nodeWL.find(node => node.type === 'folder')
    const nodeFVLPrimary = this.state.nodeFVL.find(node => node.type === 'folder')
    const nodeHSXPrimary = this.state.nodeHSX.find(node => node.type === 'folder')
    const nodeHNXPrimary = this.state.nodeHNX.find(node => node.type === 'folder')
    const nodeUPCPrimary = this.state.nodeUPC.find(node => node.type === 'folder')
    
    console.log('nodeHSXPrimary',this.state.nodeWL)

    // console.log(this.state.nodeFVL.length)
    return (
      <>
        <ul id="market__list-index" className="navbar-nav">
          {this.state.nodeWL.length > 1 && <li className="dropdown" >
            {
              <a 
                  style={{color: '#FFA500'}}
                  className="dropdown-toggle" 
                  data-tut="reactour__sidebar_watchlist"
              >
                  <i className="">&nbsp;</i>{t(nodeWLPrimary.value)}
              </a>
            }
            <ul className="dropdown-menu" style={{ transform: 'translateY(-10px)' }}>
                {this.state.nodeWL.map(node =>
                      <NodeIndexWL
                        component={this.props.component}
                        node={node}
                        key={uniqueId('watchlist' + node.key)}
                        onNodeSelect={this.onNodeSelect}
                        openVoteModal={this.openVoteModal}
                        openPopover={false}
                        isOpen={this.state.isOpenWL}
                        t={t}
                        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                      />
                )}
            </ul>
          </li>}
          {this.props.authFlag && <li className="dropdown">
              {
                <a 
                  style={{color: '#FFA500'}}
                  className="dropdown-toggle" 
                  data-tut='reactour__sidebar_fvl'
                  >
                  {t(nodeFVLPrimary.value)} &nbsp;
                  <i title={t('add_new_favorites')} className="fa fa-plus-circle" />
                  
                </a>
                
              }
            <ul className="dropdown-menu" style={{ transform: 'translateY(-10px)' }}>
            {this.state.nodeFVL.map(node =>
              <NodeIndexFVL
                component={this.props.component}
                node={node}
                key={uniqueId('fvl' + node.key)}
                onNodeSelect={this.onNodeSelect}
                isOpen={this.state.isOpenFVL}
                t={t}
                get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
              />
            )}
            </ul>
          </li>}
          <li className="mb-0">
            <div data-tut='reactour__sidebar_index'>
              <ul className="navbar-nav">
                <li className="dropdown">
                  {
                    <a 
                      style={{color: '#FFA500'}}
                      className="dropdown-toggle"
                      >
                      <i className="">&nbsp;</i>{t(nodeHSXPrimary.value)}
                    </a>
                  }
                  <ul className="dropdown-menu" style={{ transform: 'translateY(-10px)' }}>
                  {this.state.nodeHSX.map(node =>
                    <NodeIndexOther
                      component={this.props.component}
                      node={node}
                      key={uniqueId('index-hsx' + node.key)}
                      onNodeSelect={this.onNodeSelect}
                      isOpen={this.state.isOpenHSX}
                      t={t}
                      tradStatus_VNI={this.state.tradStatus_VNI}
                      get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                    />
                  )}
                  </ul>
                </li>
                <li className="dropdown">
                  {
                    <a 
                      style={{color: '#FFA500'}}
                      className="dropdown-toggle" 
                      >
                      <i className="">&nbsp;</i>{t(nodeHNXPrimary.value)}
                    </a>
                  }
                  <ul className="dropdown-menu" style={{ transform: 'translateY(-10px)' }}>
                  {this.state.nodeHNX.map(node =>
                    <NodeIndexOther
                      component={this.props.component}
                      node={node}
                      key={uniqueId('index-hnx' + node.key)}
                      onNodeSelect={this.onNodeSelect}
                      isOpen={this.state.isOpenHNX}
                      t={t}
                      tradStatus_HNX={this.state.tradStatus_HNX}
                      get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                    />
                  )}
                  </ul>
                </li>
                <li className="dropdown">
                  {
                    <a 
                      style={{color: '#FFA500'}}
                      className="dropdown-toggle"
                      >
                      <i className="">&nbsp;</i>{t(nodeUPCPrimary.value)}
                    </a>
                  }
                  <ul className="dropdown-menu" style={{ transform: 'translateY(-10px)' }}>
                  {this.state.nodeUPC.map(node =>
                    <NodeIndexOther
                      component={this.props.component}
                      node={node}
                      key={'index-upc' + node.key}
                      onNodeSelect={this.onNodeSelect}
                      isOpen={this.state.isOpenUPC}
                      t={t}
                      tradStatus_UPC={this.state.tradStatus_UPC}
                      get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                    />
                  )}
                  </ul>
                </li>
              </ul>
            </div>
          </li>
        {/* modal đánh giá DMKN */}
        </ul>
        <Modal isOpen={this.state.voteShow}
          toggle={this.toggle}
          className="modal-notify vote-modal">
          <div className="modal-content">
            <ModalHeader>
              {t('ealuate_ecommended_information')}
            </ModalHeader>
            <ModalBody>
              <div className="form-group row">
                <div className="col-sm-12 text-center">
                  <span className="starts-vote">
                    <i className={this.state.star_1} onClick={(e) => this.calcVoteSend(1)}></i>&nbsp;<i className={this.state.star_2} onClick={(e) => this.calcVoteSend(2)}></i>&nbsp;
                            <i className={this.state.star_3} onClick={(e) => this.calcVoteSend(3)}></i>&nbsp;<i className={this.state.star_4} onClick={(e) => this.calcVoteSend(4)}></i>&nbsp;
                            <i className={this.state.star_5} onClick={(e) => this.calcVoteSend(5)}></i>
                  </span>
                </div>
              </div>
              <div className="form-group row">
                <div className="col-sm-12">
                  <Label for="commentVoted">{t('your_suggest')}</Label>
                  <Input type="textarea" rows="2" style={{ minHeight: '50px' }} maxLength="80" name="text" id="commentVoted"
                    value={this.state.voteComment}
                    onChange={this.handleCommentInput} />
                </div>
              </div>
              {this.state.voteCommentList.length > 0 &&
                <>
                  <div className="form-group row">
                    <div className="col-sm-12">
                      <span className="label-comment-list" onClick={this.toggleComment}>{t('feedback')}</span>
                    </div>
                  </div>
                  <Collapse isOpen={this.state.openComment}>
                    <div className="div-over-table">
                      <table className="table-commentList">
                        <tbody>
                          {this.state.voteCommentList.map((item, index) =>
                            <tr key={item.c0 + index}>
                              <td>
                                <div className="row">
                                  <div className="col-sm-6 user-name">{item['c2']}</div>
                                  <div className="col-sm-6 vote-time">
                                    {item['c3'].substr(6, 2) + '/' + item['c3'].substr(4, 2) + '/' + item['c3'].substr(0, 4) + ' ' +
                                      item['c3'].substr(8, 2) + ':' + item['c3'].substr(10, 2) + ':' + item['c3'].substr(12, 2)}</div>
                                  <div className="col-sm-12 content-comment">{item['c1']}</div>
                                </div>
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td>
                              <div className="form-group row" style={{ display: this.state.lastRowNumber === 0 ? 'none' : '' }}>
                                <div className="col-sm-12 show-more">
                                  <a onClick={this.getMoreComent}><i className="fa fa-angle-double-right"></i> {t('show_more')}</a>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Collapse>
                </>
              }
            </ModalBody>
            <ModalFooter>
              <div className="container">
                <div className="row">
                  <div className="col">
                    <Button size="sm" block
                      color="wizard"
                      onClick={(e) => this.sendVoting(e, 'Y')}>
                      {this.state.sendingVoting ? <span><i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>....</span> : <span>{this.props.t('common_confirm')}</span>}
                    </Button>
                  </div>
                  <div className="col">
                    <Button size="sm" block
                      color="cancel"
                      className='fixButton'
                      onClick={(e) => this.sendVoting(e, 'N')}>
                      <span>{this.props.t('common_button_not_confirm')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </ModalFooter>
          </div>
        </Modal>
        
      </>
    )
  }
}

export default translate('translations')(TableIndexList);