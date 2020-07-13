import React from 'react'

import { reply_send_req } from '../../../utils/send_req'
import commuChanel from '../../../constants/commChanel'
import components from '../../../constants/components'
import socket_sv from '../../../utils/globalSv/service/socket_service'
import { requestInfo } from '../../../utils/globalSv/models/requestInfo'
import { serviceInputPrm } from '../../../utils/globalSv/models/serviceInputPrm'

import logoImg from '.././alt_login_logo.png';
import viFlag from '../../../conponents/translate/flag/vietnam.png'
import enFlag from '../../../conponents/translate/flag/english.png'
import cnFlag from '../../../conponents/translate/flag/china.png'
import { translate } from 'react-i18next';

import LoginModal from '../../../conponents/login/login'
import RegisterModal from '../../../conponents/login/register'
import ChangeOrder from '../../../layouts/account-info-layout/change-order'
import ChangePass from '../../../layouts/account-info-layout/change-password'

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledTooltip } from 'reactstrap';

import glb_sv from '../../../utils/globalSv/service/global_service'
import { Subject } from 'rxjs';
import { inform_broadcast } from '../../../utils/broadcast_service'
import { showLogin } from '../../../utils/show_login'
import Store from 'electron-store';
import moment from 'moment';

const StoreElectron = new Store();

class MenubarChildUp extends React.PureComponent {
  constructor(props) {
    super(props);
    this.component = components.MenubarChildUp
    this.req_component = new Map();

    this.request_seq_comp = 0;
    this.get_rq_seq_comp = () => {
      return ++this.request_seq_comp
    };

    this.firtLoad = true;
    this.subcr_ClientReqRcv = new Subject();
    // -- get server time
    this.getSvTimeFlag = false;
    this.getSvTime_FntNm = 'GETSERVER-TIME';
    this.getSvTime_ReqTimeOut = {};
    // -- get number notify
    this.getNumberNotifyNotReadFlag = false;
    this.getNumberNotifyNotReadFunct_ReqTimeOut = {};
    this.getNumberNotifyNotRead_fuctnm = 'NOTIFYSCR-001';



    // this.props.i18n.changeLanguage(language.toLowerCase());
    this.state = {
      language: 'VI',
      flagLang: viFlag,
      svTime: null,
      acntList: [],
      sub_acntList: [],
      currentAcnt: '',
      count: 0,
      cfm_logout: false,
      login: false,
      loginContent: null,
      logoImg: logoImg,
      authFlag: false,
      activeCode: glb_sv.activeCode,
      resetTimer: true,
      socket_warning: 0, //-- có 3 trạng thái kết nối, 0 - tốt, 1 - Mạng ko ổn định, 2 - rớt kết nối
      acountStatus: '0', //-- 0 & 2 là trạng thái tài khoản "Bình thường"
      acountStatusNm: '', //-- Tên trạng thái tài khoản

      register: false,
      registerContent: null,
      isBroker: false,
      ChangeOrder: false,
      ChangePass: false
    };
    // -- update notify
    this.updateNotify_fuctnm = 'NOTIFYSSCR-002';
    this.socket_public = true;
    this.socket_market = true;
    this.socket_trading = true;
  }
  getStockList_ByFile = lang => {
    // -- file STOCK_INFO.OTS.01.json
    this.newStkList = [];
    fetch(socket_sv.domain + '/assets/STOCK_INFO.OTS.01' + (lang === 'VI' ? '' : '.' + lang) + '.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(r => r.json())
      .then(resp => {
        if (resp != null && resp !== undefined) {
          this.file1_stat = true
          this.stkList_f1 = resp;
          this.newStkList = this.newStkList.concat(resp);
          StoreElectron.set('newStkList', JSON.stringify(this.newStkList))
        }
      })
    // -- file STOCK_INFO.OTS.03.json
    fetch(socket_sv.domain + '/assets/STOCK_INFO.OTS.01' + (lang === 'VI' ? '' : '.' + lang) + '.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(r => r.json())
      .then(resp => {
        if (resp != null && resp !== undefined) {
          this.file3_stat = true
          this.stkList_f3 = resp;
          this.newStkList = this.newStkList.concat(resp);
          StoreElectron.set('newStkList', JSON.stringify(this.newStkList))
        }
      })
    // -- file STOCK_INFO.OTS.05.json
    fetch(socket_sv.domain + '/assets/STOCK_INFO.OTS.01' + (lang === 'VI' ? '' : '.' + lang) + '.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(r => r.json())
      .then(resp => {
        if (resp != null && resp !== undefined) {
          this.file5_stat = true
          this.stkList_f5 = resp;
          this.newStkList = this.newStkList.concat(resp);
          StoreElectron.set('newStkList', JSON.stringify(this.newStkList))
        }
      })
  }

  open_modal_register = () => {
    this.setState({
      login: false, register: true, registerContent: <RegisterModal
        get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq}
        handleChangeLanguage={this.handleChangeLanguage}
        flagLang={this.state.flagLang}
        language={this.state.language}
        open_modal_register={this.open_modal_register}
        close_modal_register={this.close_modal_register}
      />
    })
  }

  close_modal_register = () => {
    this.setState({ register: false })
  }

  waitGetConfig = () => {
    if (socket_sv.domain) {
      const lastTimeClient = StoreElectron.get('lastTimeClient');
      const nowDtClient = moment().format('YYYYMMDD');
      if (lastTimeClient !== nowDtClient) {
        StoreElectron.set('lastTimeClient', nowDtClient);
        // lấy file mã chứng khoán
        let lng = localStorage.getItem('lngUser')
        const lang = sessionStorage.getItem('lang')
        if (lang) {
          this.getStockList_ByFile(lang)
        } else if (lng) {
          if (lng.length > 2) {
            this.newLang = JSON.parse(lng)
          } else {
            this.newLang = lng
          }
          if (this.newLang && this.newLang.length === 2) {
            this.getStockList_ByFile(this.newLang)
          } else {
            this.getStockList_ByFile('VI')
          }
        } else {
          this.getStockList_ByFile('VI')
        }
      } else {
        this.newStkList = StoreElectron.get('newStkList');
        this.file1_stat = true;
        this.file2_stat = true;
        this.file3_stat = true;
      }
    } else {
      setTimeout(() => {
        this.waitGetConfig();
      }, 100);
    }
  }

  componentDidMount() {

    let language = 'VI', flagLang = viFlag;
    if (typeof (Storage) !== 'undefined') {
      const actTemp = localStorage.getItem('actTempLast');
      if (actTemp && JSON.parse(actTemp)) {
        this.actLast = JSON.parse(actTemp);
      } else this.actLast = null;
      const languageTemp = localStorage.getItem('lngUser');
      if (languageTemp) language = languageTemp;
      if (language === 'EN') {
        flagLang = enFlag;
      } else if (language === 'CN') {
        flagLang = cnFlag;
      }
      glb_sv.language = language;
    }
    this.handleChangeLanguage(null,language);

    this.waitGetConfig();

    // lấy danh sách mã chứng từng search
    const tempList = localStorage.getItem('recentStkList')
    if (tempList) {
      glb_sv.recentStkList = JSON.parse(tempList)
    }
    window.ipcRenderer.on(commuChanel.done_read_config, (event, args) => {
      this.setState({ activeCode: glb_sv.activeCode })
    })

    window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
      reply_send_req(agrs, this.req_component)
    })

    let loginLogo = glb_sv.configInfo['loginLogo'];
    if (loginLogo) {
      const obJB = document.getElementById('navbarLogoPriceBoard');
      if (obJB) {
        obJB.setAttribute('src', loginLogo);
      }
    }

    window.ipcRenderer.on(`${commuChanel.OPEN_MODAL_LOGIN}_${this.component}`, (event, args) => {
      if (args.type === components.change_order) {
        this.setState({
          ChangeOrder: true
        })
      } else if (args.type === components.change_login) {
        this.setState({
          ChangePass: true
        })
      }
      else {
        this.setState({
          login: true
        })
      }

    })

    this.commonEvent = glb_sv.commonEvent.subscribe(msg => {
      if (msg.type === glb_sv.HIDE_MODAL_LOGIN) {
        this.setState({ login: false, register: false, ChangeOrder: false, ChangePass: false })
      }
    })



    window.ipcRenderer.on(`${commuChanel.NOTIFY}_${this.component}`, (event, args) => {
      if (this.timeoutGetNotify) clearTimeout(this.timeoutGetNotify);
      this.timeoutGetNotify = setTimeout(() => this.getNumberNotifyNotRead(), 100);
    })

    window.ipcRenderer.on(`${commuChanel.CLOSE_MODAL_MESSAGE}_${this.component}`, (event, args) => {
      this.setState({ cfm_logout: false })
    })

    window.ipcRenderer.on(`${commuChanel.LOGIN_SUCCESS}_${this.component}`, (event, args) => {
      this.setState({ login: false });
      this.reloadUserInfo();
    })

    window.ipcRenderer.on(`${commuChanel.LOGOUT}_${this.component}`, (event, args) => {
      this.setState({ cfm_logout: true });
    })

    window.ipcRenderer.on(commuChanel.EXPIRE_SESSION, (event, args) => {
      const clientSeq = socket_sv.getRqSeq();
      // -- push request to request hashmap
      const reqInfo = new requestInfo();
      // -- service info
      let svInputPrm = new serviceInputPrm();
      svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
      svInputPrm.ClientSeq = clientSeq;
      svInputPrm.WorkerName = 'ALTxCommon';
      svInputPrm.ServiceName = 'ALTxCommon_Logout';
      svInputPrm.ClientSentTime = '0';
      svInputPrm.Operation = 'U';
      svInputPrm.InVal = ['logout', glb_sv.objShareGlb['sessionInfo']['userID']];
      svInputPrm.TotInVal = svInputPrm.InVal.length;
      socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
      glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
      glb_sv.authFlag = false;
      socket_sv.disConnect(false);
      glb_sv.openAlertModal('', 'common_InfoMessage', 'Your_session_time_out_System_will_disconnected_this_session_now', '', '', '', '', 'EXPIRE', this.component)
    })

    window.ipcRenderer.on(`${commuChanel.TRY_CONNECT}_${this.component}`, (event, msg) => {
      if (msg.data === 'waiting') {
        if (msg.socket_nm === 'socket_public') {
          this.socket_public = false;
        }
        if (msg.socket_nm === 'socket_market') {
          this.socket_market = false;
        }
        if (msg.socket_nm === 'socket_trading') {
          this.socket_trading = false;
        }
        this.checkingSocket();
      }
      if (msg.data === 'auth-true') {
        if (msg.socket_nm === 'socket_public') {
          this.socket_public = true;
        }
        if (msg.socket_nm === 'socket_market') {
          this.socket_market = true;
        }
        if (msg.socket_nm === 'socket_trading') {
          this.socket_trading = true;
        }
      }
    })

    window.ipcRenderer.on(`${commuChanel.misTypeReconect}_${this.component}`, (event, msg) => {
      if (msg.socket_nm === 'socket_public') {
        this.socket_public = true;
      }
      if (msg.socket_nm === 'socket_market') {
        this.socket_market = true;
      }
      if (msg.socket_nm === 'socket_trading') {
        this.socket_trading = true;
      }
      this.checkingSocket();
      this.getSvTime();
    })

    window.ipcRenderer.on(`${commuChanel.CONNECT_SV_SUCCESS}_${this.component}`, (event, msg) => {
      this.sendStkGlb();
      if (msg.socket_nm === 'socket_public') {
        this.socket_public = true;
      }
      if (msg.socket_nm === 'socket_market') {
        this.socket_market = true;
      }
      if (msg.socket_nm === 'socket_trading') {
        this.socket_trading = true;
      }
      this.checkingSocket();
      this.getSvTime();
    })

    window.ipcRenderer.on(`${commuChanel.connectStatus}_${this.component}`, (event, msg) => {
      this.setState({ socket_warning: Number(msg.data) });
    })

    glb_sv.event_ServerPushIndexChart.subscribe(message => {
      if (message === 'VNI') {
        const randomNum = Math.floor(Math.random() * Math.floor(10));
        setTimeout(() => {
          const tradStatus = glb_sv.VN_INDEX.tradStatus;
          if (tradStatus === 'priceboard_ATO_session') {
            // console.log('vào phiên ATO -> call get time server again');
            this.getSvTime();
          }
        }, randomNum * 1000);
      }
    });
    this.currentAcnt = this.state.currentAcnt;
  }

  componentWillUnmount() {
    if (this.timeout) clearInterval(this.timeout);
    if (this.commonEvent) this.commonEvent.unsubscribe();
  }

  sendStkGlb() {
    if (this.file1_stat && this.file3_stat && this.file5_stat) {
      glb_sv.newStoreStockList(this.newStkList);
      const newStkList = StoreElectron.get('newStkList');
    } else {
      setTimeout(() => {
        this.sendStkGlb();
      }, 100);
    }
  }

  reloadUserInfo() {
    if (glb_sv.objShareGlb['isBroker']) this.setState({ isBroker: true });
    if (this.actLast) {
      const currentAcnt = glb_sv.objShareGlb['sub_acntNoList'].find(item => item.id === this.actLast);
      if (currentAcnt) glb_sv.activeAcnt = this.actLast;
      else {
        glb_sv.activeAcnt = glb_sv.objShareGlb['AcntMain'] + '.00';
        localStorage.removeItem('actTempLast');
      }
    } else glb_sv.activeAcnt = glb_sv.objShareGlb['AcntMain'] + '.00';
    this.currentAcnt = glb_sv.activeAcnt;
    this.setState({ authFlag: true, currentAcnt: glb_sv.activeAcnt, acntList: glb_sv.objShareGlb['acntNoList'], sub_acntList: glb_sv.objShareGlb['sub_acntNoList'] });
    this.getNumberNotifyNotRead();
  }

  updateNotifyResultProc = (reqInfoMap, message) => {
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      reqInfoMap.resSucc = false;
      return;
    } else {
      reqInfoMap.procStat = 1;

      this.setState({ count: this.state.count - 1 });
      if (glb_sv.countNotify === 0) this.setState({ count: 0 });
      if (this.state.count <= 0) {
        this.setState({ count: 0 })
      }
    }
  }

  getSvTime = () => {
    // this.setState({modalShow: true});
    if (this.getSvTimeFlag) { return };
    this.getSvTimeFlag = true;
    // const clientSeq = socket_sv.getRqSeq();
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    const request_seq_comp = this.get_rq_seq_comp()
    reqInfo.reqFunct = this.getSvTime_FntNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getSvTimeResultProc;
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    // svInputPrm.ClientSeq = clientSeq;
    svInputPrm.WorkerName = 'ALTqCommon02';
    svInputPrm.ServiceName = 'ALTqCommon02_Get_Time';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['STIME'];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

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

  getSvTimeResultProc = (reqInfoMap, message) => {
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    const cltSeqResult = Number(message['ClientSeq']);
    // -- process after get result --
    this.getSvTimeFlag = false;
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      reqInfoMap.resSucc = false;
      const errmsg = message['Message'];
      // console.log('get servertime error', errmsg);
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
        const timeDta = jsondata[0]['c0'] + '';
        if (timeDta) {
          const svTime = timeDta.substr(0, 4) + '-' + timeDta.substr(4, 2) + '-' +
            timeDta.substr(6, 2) + ' ' + timeDta.substr(8, 2) + ':' + timeDta.substr(10, 2) + ':' + timeDta.substr(12, 2);
          glb_sv.svTime = new Date(svTime);
          const nowTm = new Date();
          //-- tính độ chênh lệch (second) giữa time client và time server
          glb_sv.gapSvTime = (nowTm.getTime() - glb_sv.svTime.getTime()) / 1000;
          //-- tính gap time khoản thời gian gửi -> nhận time server trả về 
          const sendSc = reqInfoMap.reqTime.getSeconds();
          const receiveSc = nowTm.getSeconds();
          const gapTimeRq = receiveSc >= sendSc ? receiveSc - sendSc : (receiveSc + 60 - sendSc);
          glb_sv.gapSvTime += gapTimeRq;
          this.setStateTimeSv();
          setInterval(() => {
            this.setStateTimeSv();
          }, 1000);
        }
      } catch (err) {
        jsondata = [];
        this.setState({ resetTimer: true })
      }
    }
    glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
  }

  setStateTimeSv = () => {
    const nowDt = new Date();
    nowDt.setSeconds(nowDt.getSeconds() + glb_sv.gapSvTime);
    const h = glb_sv.addZero(nowDt.getHours(), 2) + '';
    const m = glb_sv.addZero(nowDt.getMinutes(), 2) + '';
    const s = glb_sv.addZero(nowDt.getSeconds(), 2) + '';
    const svTime = h + ':' + m + ':' + s;
    this.setState({ svTime: svTime });
  }

  getNumberNotifyResultProc = (reqInfoMap, message) => {
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      reqInfoMap.resSucc = false;
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      jsondata = JSON.parse(message['Data']);
      this.setState({ count: (jsondata && jsondata[0]) ? Number(jsondata[0].c0) : 0 });
    }
  }

  solvingTimeout = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) return;
    const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) return;
    if (reqIfMap.reqFunct === this.getAssetInfo_FntNm) {
      this.getAssetInfoFlag = false;
      this.setState({ resetTimer: true });
    }
    if (reqIfMap.reqFunct === this.getSvTime_FntNm) {
      this.getSvTimeFlag = false;
      this.getSvTime();
      return;
    }
    const errmsg = "common_cant_connect_server";
    glb_sv.openAlertModal('sm', 'common_notify', errmsg, 'OK', 'warning', '', '', '', this.component)
  }

  fn_logout = () => {
    this.setState({ cfm_logout: true });
  }

  handleSendNotify = () => {
    const msg = { type: commuChanel.ACTION_SUCCESS, data: 'notify', key: 'click', component: this.component };
    inform_broadcast(commuChanel.ACTION_SUCCESS, msg)
    // glb_sv.commonEvent.next(msg);

  }

  modalAfterOpened = () => {
    glb_sv.focusELM('buttonCfmLogoutOk');
  }

  confirmLogout = (key) => {
    if (key === 'N') {
      this.setState({ cfm_logout: false });
      return;
    }
    // glb_sv.authFlag = false;
    const clientSeq = socket_sv.getRqSeq();
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.ClientSeq = clientSeq;
    svInputPrm.WorkerName = 'ALTxCommon';
    svInputPrm.ServiceName = 'ALTxCommon_Logout';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'U';
    svInputPrm.InVal = ['logout', glb_sv.objShareGlb['sessionInfo']['userID']];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    reqInfo.inputParam = svInputPrm.InVal;
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    window.location.reload();
  }

  fn_login() {
    showLogin(this.component);
  }

  handleChangeLanguage = (e,value) => {
    const language = e ? e.target.value : value;
    this.setState({ language });
    glb_sv.language = language;

    if (language === 'VI') {
      this.setState({ flagLang: viFlag });
    } else if (language === 'EN') {
      this.setState({ flagLang: enFlag });
    } else if (language === 'CN') {
      this.setState({ flagLang: cnFlag });
    }
    this.props.i18n.changeLanguage(language.toLowerCase());
    if (typeof (Storage) !== 'undefined') {
      localStorage.setItem('lngUser', language);
    }
    inform_broadcast(commuChanel.CHANGE_LANG, language)

    glb_sv.isChangeLang = true;
    if (!glb_sv.stkListJson[language] ||
      !glb_sv.stkListJson[language].stkList_f1 ||
      !glb_sv.stkListJson[language].stkList_f3 ||
      !glb_sv.stkListJson[language].stkList_f5) {
      this.getStockListOther_ByFile(language);
    } else {
      const newStkList = glb_sv.stkListJson[language].stkList_f1.concat(glb_sv.stkListJson[language].stkList_f3.concat(glb_sv.stkListJson[language].stkList_f5));
      glb_sv.newStoreStockList(newStkList);
    }

    // const msg = { type: commuChanel.CHANGE_LANG };
    // glb_sv.commonEvent.next(msg);
    // inform_broadcast(commuChanel.CHANGE_LANG, msg)
  }

  getStockListOther_ByFile = async (language) => {
    // -- file STOCK_INFO.OTS.01.json
    // const url = ['/assets/STOCK_INFO.OTS.01' + (language === 'VI' ? '' :  '.' + language) + '.json',
    // '/assets/STOCK_INFO.OTS.03' + (language === 'VI' ? '' :  '.' + language) + '.json',
    // '/assets/STOCK_INFO.OTS.05' + (language === 'VI' ? '' : '.' + language) + '.json'];
    // const promises = url.map(async pageNo => {
    //   const req = await fetch(pageNo, {
    //     mode: 'cors',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Accept': 'application/json'
    //     }
    //   });
    //   return req.json();
    // });
    // const data = await Promise.all(promises).catch(function (err) {
    //   glb_sv.logMessage(err);
    //   this.getStockListOther_ByFile(language);
    // });
    // if (data && data.length === 3) {
    //   const newStkList = data[0].concat(data[1].concat(data[2]));
    //   glb_sv.newStoreStockList(newStkList);
    // }
  }

  getNumberNotifyNotRead = () => {
    if (!glb_sv.authFlag) return;
    if (this.getNumberNotifyNotReadFlag) { return };
    this.getNumberNotifyNotReadFlag = true;
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap getNumberNotifyResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getNumberNotifyNotRead_fuctnm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getNumberNotifyResultProc;
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqCommon01';
    svInputPrm.ServiceName = 'ALTqCommon01_NotifyMgt';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['1'];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
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
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
  }

  checkingSocket = () => {
    let checkNum = 0;
    if (!socket_sv.getSocketStat(socket_sv.key_ClientReq))++checkNum;
    if (!socket_sv.getSocketStat(socket_sv.key_ClientReqMRK))++checkNum;
    this.setState({ socket_warning: checkNum });
  }

  handleModalClose = () => {
    this.setState({ modalShow: false })
    // if (!glb_sv.authFlag) window.location.reload(true);
    if (this.code) this.closedModalMsgSys(this.code)
  }
  afterModalOpen = () => {
    const elme = document.getElementById('alertBtnId')
    if (elme) {
      setTimeout(() => {
        elme.focus()
      }, 100)
    }
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
    if (this.code) this.closedModalMsgSys(this.code)
    this.setState({ login: false })
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
      window.location.reload(true)
    }
  }

  close_modal_change_order = () => {
    this.setState({ ChangeOrder: false })
  }

  close_modal_change_pass = () => {
    this.setState({ ChangePass: false })
  }

  render() {
    const { t } = this.props;

    return (
      <div className="header__ribbon card-body">
        <div className="form-inline col-sm-12">
          {this.props.children}
          <div className="form-group header__acount_info__element notify-top">
            {this.state.svTime &&
              <div className="input-group" style={{ marginRight: 10 }} id='' data-tut='reactour__server_time'>
                <span className={'serverTime'}>{this.state.svTime}</span>
              </div>}

            <div className="input-group" style={{ marginRight: 10 }} id='Tooltip_wifi' data-tut='reactour__connection_status'>
              {this.state.socket_warning === 0 && <i className="fa fa-signal" style={{ fontSize: 15, color: '#61d800' }}></i>}
              {this.state.socket_warning === 1 && <i className="fa fa-signal wifiWarning" style={{ fontSize: 15 }}></i>}
              {this.state.socket_warning === 2 &&
                <div className='load-wrapp'>
                  <div className="load-animation">
                    <div className="letter-holder" style={{ color: 'red' }}>
                      <div className="l-1 letter">C</div>
                      <div className="l-2 letter">o</div>
                      <div className="l-3 letter">n</div>
                      <div className="l-4 letter">n</div>
                      <div className="l-5 letter">e</div>
                      <div className="l-6 letter">t</div>
                      <div className="l-7 letter">i</div>
                      <div className="l-8 letter">n</div>
                      <div className="l-9 letter">g</div>
                      <div className="l-10 letter">.</div>
                      <div className="l-11 letter">.</div>
                      <div className="l-12 letter">.</div>
                    </div>
                  </div>
                </div>
              }
            </div>
            <UncontrolledTooltip delay={100} placement="top" target="Tooltip_wifi" className='tooltip-custom'>
              {this.state.socket_warning === 0 ? t('status_networking_good') : (this.state.socket_warning === 1 ? t('status_networking_bad') : t('try_to_connect_server'))}
            </UncontrolledTooltip>

            <div className="input-group" style={{ marginLeft: 5 }} data-tut='reactour__language_choose'>
              <div className="input-group-prepend">
                <img src={this.state.flagLang} alt="" style={{ width: 20, height: 20 }} />
              </div>
              <select value={this.state.language} onChange={this.handleChangeLanguage} className="form-control cursor_ponter form-control-sm acntTopDiv disabled">
                <option value="VI">Tiếng Việt</option>
                <option value="EN">English</option>
                {(this.state.activeCode === '888' || this.state.activeCode === '102' || this.state.activeCode === '061') && <option value="CN">中文</option>}
              </select>
            </div>

            <span data-tut='reactour__notifycation_alarm' onClick={this.handleSendNotify} className={"control-span " + (this.state.count > 0 ? '' : 'color_not_notify')} style={{ cursor: 'pointer', marginLeft: 5 }}><i className="fa fa-bell-o"></i> {t('common_InfoMessage')}
              {this.state.count !== 0 ? (this.state.count < 100 ? ' (' + this.state.count + ')' : ' (99+)') : ''}
            </span>

            {this.state.authFlag && <span style={{ cursor: 'pointer', marginLeft: 5 }} onClick={this.fn_logout.bind(this)} className="control-span"><i className="fa fa-sign-out"></i> {t('login_Logout')}</span>}
            {!this.state.authFlag && <span data-tut='reactour__login' style={{ cursor: 'pointer', marginLeft: 5 }} onClick={this.fn_login.bind(this)} className="control-span login-logout-top"><i className="fa fa-sign-in"></i> {t('login_SIGN_IN')}</span>}

          </div>

          {this.state.login && <LoginModal
            get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq}
            handleChangeLanguage={this.handleChangeLanguage}
            flagLang={this.state.flagLang}
            language={this.state.language}
            open_modal_register={this.open_modal_register}
          />}

          {this.state.ChangeOrder && <ChangeOrder
            get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq}
            close_modal_change_order={this.close_modal_change_order}
          />}

          {this.state.ChangePass && <ChangePass
            get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq}
            close_modal_change_pass={this.close_modal_change_pass}
          />}

          {this.state.register && this.state.registerContent}
          <Modal
            isOpen={this.state.cfm_logout}
            size={"sm modal-notify"}
            id='modalSystem'
            onOpened={this.modalAfterOpened}>
            <ModalHeader>
              {t('common_confirm_logout')}
            </ModalHeader>
            <ModalBody>
              <div className="form-group row">
                <div className="col-sm-12">
                  <span>{t('common_confirm_logout_content')}</span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="container">
                <div className="row">
                  <div className="col">
                    <Button size="sm" block
                      id="buttonCfmLogoutOk"
                      autoFocus
                      color="wizard"
                      onClick={(e) => this.confirmLogout('Y')}>
                      <span>{t('common_Ok')}</span>
                    </Button>
                  </div>
                  <div className="col">
                    <Button size="sm" block
                      color="cancel"
                      onClick={(e) => this.confirmLogout('N')}>
                      <span>{t('common_Cancel')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </ModalFooter>
          </Modal>

        </div>
      </div>
    );
  }
}
export default translate('translations')(MenubarChildUp);    
