import * as io from "socket.io-client";
import * as io_2 from "socket.io-client";
import * as io_3 from "socket.io-client";
import { requestInfo } from "../models/requestInfo";
import glb_sv from "./global_service";
import { Subject } from "rxjs";
const isDev = require('electron-is-dev');

class socketService {
  constructor() {
    // -- event to receive respone after client request a service --
    this.event_ClientReqRcv = new Subject();
    this.RequestSeq = 0;
    this.clientSeq = 1;
    this.key_SysMsg = "SYS_MSG";
    this.key_ChatMsg = "CHAT_MSG";
    this.key_ClientReqMRK = "MKT_INFO_REQ";
    this.key_ClientReqMRKRcv = "MKT_INFO_RES";
    this.key_ServerPushMRKInfoRcv = "MKT_INFO";
    this.key_ServerPushMRKTopRcv = "MKT_TOP";
    this.key_ServerPushMRKPTBoardRcv = "PT_BOARD";
    this.key_ServerPushMRKEffRcv = "EFF_TOP";
    this.key_ServerPushMRKForRcv = "FRG_TOP";
    this.key_ServerPushMRKFRG_MKT_SHARERcv = "FRG_MKT_SHARE";
    this.key_NotifyRcv = "NTF_MSG";
    this.key_ClientReq = "REQ_MSG";
    this.key_ClientReqRcv = "RES_MSG";
    this.key_MapReq = new Map();
    this.url_trading = [];
    this.url_trading_index = 0;
    this.url_mkt = [];
    this.url_mkt_index = 0;
    this.url_mkt_public = [];
    this.url_mkt_public_index = 0;
    this.domain = "";
    this.domain_public = "";
    this.socket = {}; //-- Socket service interface giao tiếp với component khác
    this.socket_public = {}; //-- public
    this.socket_public_flag = true; //-- public
    this.socket_trading = {}; //-- service
    this.socket_trading_flag = false; //-- service
    this.socket_market = {}; //-- market
    this.socket_market_flag = false; //-- market
    this.authen_conect_first = false;
    this.manual_disc_flag = false;

    // this.latencyTime = glb_sv.latencyTime;

    /* giải pháp phân tách kết nối socket với 2 option, authenticate và non authenticate 
    - Khởi tạo socket (public) kết nối tới domain public public.altisss.vn
    - Khi user click đăng nhập -> Khởi tạo connect:
      + socket_trading -> tới domain  service.altisss.vn  
      + socket_market -> tới domain  market.altisss.vn 
    - Thực hiện đăng nhập -> Đăng nhập thành công -> disconect socket (public) -> call event reconect to get new suprible
    - Huỷ, không thực hiện đăng nhập -> disconect 2 socket service + market
    */

    this.event_ClientReqMRKRcv = new Subject();
    // this.clientReqMRKRcv$ = this.event_ClientReqMRKRcv.asObservable();

    // -- event to receive market info realtime --
    this.event_ServerPushMRKRcv = new Subject();
    // this.serverPushMRKRcv$ = this.event_ServerPushMRKRcv.asObservable();

    // -- event to receive notify realtime --
    this.event_NotifyRcv = new Subject();
    // this.notifyRcv$ = this.event_NotifyRcv.asObservable();

    // -- event to receive respone after client request a service --
    this.event_ClientReqRcv = new Subject();
    // this.clientReqRcv$ = this.event_ClientReqRcv.asObservable();

    // -- event to receive system message --
    this.event_SysMsg = new Subject();
    // this.sysMsg$ = this.event_SysMsg.asObservable();

    // -- event to receive system message --
    this.event_ChatMsg = new Subject();
    // this.chatMsg$ = this.event_ChatMsg.asObservable();

    this.reConnectFlagPublic = true;
    this.reConnectFlagMarket = true;
    this.reConnectFlagTrading = true;

    this.reConnectAuto = true;
    // -- for get info that share over project
    this.objShareGlb = {};
    this.indexWebWorker = undefined;
    this.epmsgWebWorker = undefined;
    this.indexHistData = [];
    this.epmsgHistData = [];

    // khi finishgetIndexHist bang 2 thi gui message vao worker
    this.finishgetIndexHist = 0;
    this.indexHistDataOrther = [];
    this.indexHistDataOrtherMiss = []

    // -- Khởi tạo dữ liệu indexWebWorker -----------------------------
    const { remote } = window.require('electron')
    const path = require('path')
    this.indexWebWorker = isDev ? new Worker('../assets/WorkerReqMsgI.js') :  new Worker(`${path.join(remote.app.getAppPath(), 'build/assets/WorkerReqMsgI.js')}`);
    this.epmsgWebWorker = isDev ? new Worker('../assets/WorkerReqMsgEp.js') : new Worker(`${path.join(remote.app.getAppPath(), 'build/assets/WorkerReqMsgEp.js')}`);
    this.indexWebWorker.onmessage = event => {
      const obj = event.data;
      if (obj) {
        obj["2"].forEach((value, key) => {
          glb_sv.stkInfoTradviewMap.set(key, value);
        });
        if (obj["8"]["ref"]) {
          glb_sv.VN_INDEX["indexArr"].shift();
          glb_sv.VN_INDEX["ref"] = obj["8"]["ref"];
          glb_sv.VN_INDEX["indexArr"] = obj["8"]["indexArr"].concat(
            glb_sv.VN_INDEX["indexArr"]
          );
        }
        if (obj["10"]["ref"]) {
          glb_sv.HNX_INDEX["indexArr"].shift();
          glb_sv.HNX_INDEX["ref"] = obj["10"]["ref"];
          glb_sv.HNX_INDEX["indexArr"] = obj["10"]["indexArr"].concat(
            glb_sv.HNX_INDEX["indexArr"]
          );
        }
        if (obj["12"]["ref"]) {
          glb_sv.UPCOM_INDEX["indexArr"].shift();
          glb_sv.UPCOM_INDEX["ref"] = obj["12"]["ref"];
          glb_sv.UPCOM_INDEX["indexArr"] = obj["12"]["indexArr"].concat(
            glb_sv.UPCOM_INDEX["indexArr"]
          );
        }
      }
      this.indexWebWorker.terminate();
      glb_sv.finishGetImsg = true;
      glb_sv.logMessage('end this.indexWebWorker');
      const msg = { type: glb_sv.finishGetIndex };
      setTimeout(() => glb_sv.commonEvent.next(msg), 0);
    };

    this.epmsgWebWorker.onmessage = event => {
      const obj = JSON.parse(event.data);
      if (obj["1"] && obj["2"] && obj["3"]) {
        const old_data = glb_sv.autionMatch_timePriceSumVol_Map.get(obj["3"]);
        const new_data = obj["1"];
        if (old_data) {
          new_data.splice(0, 0, old_data[old_data.length - 1]);
        }
        const old_data_chart = glb_sv.autionMatch_timePriceSumVol_chart_Map.get(
          obj["3"]
        );
        const new_data2 = obj["2"];
        if (old_data_chart) {
          new_data2.push(old_data_chart[old_data_chart.length - 1]);
        }
        glb_sv.autionMatch_timePriceSumVol_Map.set(obj["3"], new_data);
        glb_sv.autionMatch_timePriceSumVol_chart_Map.set(obj["3"], new_data2);
        glb_sv.event_ServerPushMRKRcvChangeEpMsg.next(obj["3"]);
      }
    };

    this.getLastImessage = () => {
      const clientSeq = this.getRqSeq();
      const reqInfo = new requestInfo();
      reqInfo.reqFunct = glb_sv.getLast_Imsg;
      reqInfo.procStat = 0;
      reqInfo.reqTime = new Date();
      glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
      const msgObj2 = { ClientSeq: clientSeq, Command: "LAST_MSG", F1: "I" };
      this.send2Sv(this.key_ClientReqMRK, JSON.stringify(msgObj2));
    };

    this.subCribeActiveStk = stkCd => {
      if (stkCd === null || stkCd === undefined || stkCd === "") {
        return;
      }
      setTimeout(() => (glb_sv.actStockCode = stkCd), 1000);
      const clientSeq = this.getRqSeq();
      const reqInfo = new requestInfo();
      reqInfo.reqFunct = glb_sv.subactive_stk;
      reqInfo.procStat = 0;
      glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
      const arrOne = [];
      arrOne.push(stkCd);
      const msgObj2 = {
        ClientSeq: clientSeq,
        Command: "SUB",
        F1: "*",
        F2: arrOne
      };
      glb_sv.logMessage('subCribeActiveStk');
      glb_sv.logMessage(JSON.stringify(msgObj2));
      this.send2Sv(this.key_ClientReqMRK, JSON.stringify(msgObj2));
      // {"ClientSeq":31,"Command":"SUB","F1":"*","F2":["ACB"]}
      // {"ClientSeq":29,"Command":"SUB","F1":"*","F2":["ACB"]}
    };

    this.updatNewSession = () => {
      if (glb_sv.objShareGlb["sessionInfo"]) {
        const msgUpd = {
          ClientSeq: this.getRqSeq(),
          TransId: glb_sv.objShareGlb["sessionInfo"]["sessionId"],
          MdmTp: "01",
          AppLoginID: glb_sv.objShareGlb["sessionInfo"]["userID"].toLowerCase()
        };
        this.send2Sv("AUTH_REQ_MSG", JSON.stringify(msgUpd));
      }
    };

    /* Trình tự xử lý
    (1) khởi tạo connect public socket
    (2) mở form login -> start socket service, cancel login -> disconect socket service
    (3) login sucess -> start socket market + close socket public
    */
    this.send2Sv = (key, message) => {
      console.log("socketService -> this.send2Sv -> key, message", key, message)
      //-- check request with key is market or service
      if (!this.socket_trading_flag) {
        this.socket_public.emit(key, message);
      } else {
        //-- Nếu đã authen -> có 2 loại request là thị trường và service
        if (key === this.key_ClientReqMRK) {
          if (this.url_mkt[this.url_mkt_index] === this.url_mkt_public[this.url_mkt_public_index]) {
            this.socket_public.emit(key, message);
          } else if (this.url_mkt[this.url_mkt_index] === this.url_trading[this.url_trading_index]) {
            this.socket_trading.emit(key, message);
          } else {
            this.socket_market.emit(key, message);
          }
        } else if (key === this.key_ClientReq) {
          if (this.url_trading[this.url_trading_index] === this.url_mkt_public[this.url_mkt_public_index]) {
            this.socket_public.emit(key, message);
          } else {
            this.socket_trading.emit(key, message);
          }
        }
      }
    };

    this.getRqSeq = () => {
      return ++this.RequestSeq;
    };

    this.getSocketStat = (key) => {
      // return this.socket.connected;
      // return true;
      if (!this.socket_trading_flag) {
        return this.socket_public.connected;
      } else {
        if (key === this.key_ClientReqMRK) {
          if (this.url_mkt[this.url_mkt_index] === this.url_mkt_public[this.url_mkt_public_index]) {
            return this.socket_public.connected;
          } else if (this.url_mkt[this.url_mkt_index] === this.url_trading[this.url_trading_index]) {
            return this.socket_trading.connected;
          } else {
            return this.socket_market.connected;
          }
        } else if (key === this.key_ClientReq) {
          if (this.url_trading[this.url_trading_index] === this.url_mkt_public[this.url_mkt_public_index]) {
            return this.socket_public.connected;
          } else {
            return this.socket_trading.connected;
          }
        }
      }
    };

    this.setNewConnectionPublic = (index = 0) => {
      if (window.location.href.includes('___')) return;
      let httpType = "http";
      this.url_mkt_public_index = index;
      httpType = this.url_mkt_public[index].substr(0, 5);
      this.socket_public =
        httpType === "https"
          ? io(this.url_mkt_public[index], {
            secure: true,
            transports: ['polling', "websocket"]
          })
          : io(this.url_mkt_public[index], { transports: ['polling', "websocket"]});
      this.socket_public_flag = true;
      this.socket_StartListener(this.socket_public, "socket_public");
    };

    this.setNewConnectionSrv = (index = 0) => {
      if (window.location.href.includes('___')) return;
      this.url_trading_index = index;
      //-- kiểm tra nếu trùng với domain public thì chỉ cần xét cờ trạng thái socket service;
      if (this.url_trading[index] !== this.url_mkt_public[this.url_mkt_public_index]) {
        let httpType = "http";
        httpType = this.url_trading[index].substr(0, 5);
        this.socket_trading =
          httpType === "https"
            ? io_2(this.url_trading[index], {
              secure: true,
              transports: ['polling', "websocket"]
            })
            : io_2(this.url_trading[index], { transports: ['polling', "websocket"] });
        this.socket_StartListener(this.socket_trading, "socket_trading");
      }
      this.socket_trading_flag = true;
    };

    this.setNewConnectionMrk = (index = 0) => {
      if (window.location.href.includes('___')) return;
      this.url_mkt_index = index;
      //-- kiểm tra nếu trùng với domain public or domain service đã khởi tạo trước đó không;
      if ((this.url_mkt[index] !== this.url_mkt_public[this.url_mkt_public_index]) &&
        (this.url_mkt[index] !== this.url_trading[this.url_trading_index])) {
        let httpType = "http";
        httpType = this.url_mkt[index].substr(0, 5);
        this.socket_market =
          httpType === "https"
            ? io_3(this.url_mkt[index], {
              secure: true,
              transports: ['polling', "websocket"]
            })
            : io_3(this.url_mkt[index], { transports: ['polling', "websocket"]});
        this.socket_StartListener(this.socket_market, "socket_market");
      }
      this.socket_market_flag = true;
    };

    this.socket_StartListener = (socket, socket_nm) => {
      socket.on("connect", data => {
        socket.sendBuffer = [];
        if (socket_nm === 'socket_public') this.reConnectFlagPublic = true;
        else if (socket_nm === 'socket_market') this.reConnectFlagMarket = true;
        else if (socket_nm === 'socket_trading') this.reConnectFlagTrading = true;
        //-- thong tin thi truong thi ko ban lai event khi thay doi socket
        glb_sv.logMessage('socket_public connect success');
        if (!this.authen_conect_first) {
          glb_sv.commonEvent.next({ type: glb_sv.CONNECT_SV_SUCCESS });
          this.authen_conect_first = true;
        }
        if (this.authen_conect_first) {
          glb_sv.logMessage(glb_sv.misTypeReconect);
          const message = {};
          message['type'] = glb_sv.misTypeReconect;
          message['data'] = null;
          message.socket_nm = socket_nm;
          glb_sv.commonEvent.next(message);
        }
      });
      socket.on('pong', data => {
        const now = new Date();
        // console.log(`pong ${data}`,glb_sv.latencyTime);
        if (data > glb_sv.latencyTime) {
          const message = {};
          message['type'] = glb_sv.connectStatus;
          message['data'] = 1;
          glb_sv.commonEvent.next(message);
        } else {
          const message = {};
          message['type'] = glb_sv.connectStatus;
          message['data'] = 0;
          message.socket_nm = socket_nm;
          glb_sv.commonEvent.next(message);
        }
      });
      socket.on('connect_timeout', (data) => {
        socket.sendBuffer = [];
        glb_sv.logMessage(socket_nm + 'connect_timeout');
          setTimeout(() => this.switch_SocketConnection(socket_nm), 1000);
      });
      socket.on("connect_error", data => {
        socket.sendBuffer = [];
        glb_sv.logMessage(socket_nm + ": connect_error");
          setTimeout(() => this.switch_SocketConnection(socket_nm), 1000);
        
      });

      socket.on("disconnect", data => {
        if (!window.location.href.includes('___')) return;
        if (data === 'io server disconnect') {
          return;
        }
        socket.sendBuffer = [];
        glb_sv.logMessage(socket_nm + ": Disconect socket");
        glb_sv.disconTime = new Date();
        //-- closed switch_SocketConnection by NTTam
        if (this.url_mkt_public[this.url_mkt_public_index] === this.url_mkt[this.url_mkt_index]) {
          if (glb_sv.authFlag) {
            if (this.reConnectFlagPublic && socket_nm === 'socket_public') {
              this.reConnectFlagPublic = false;
              setTimeout(() => this.switch_SocketConnection(socket_nm), 200);
            } else if (this.reConnectFlagMarket && socket_nm === 'socket_market') {
              this.reConnectFlagMarket = false;
              setTimeout(() => this.switch_SocketConnection(socket_nm), 200);
            } else if (this.reConnectFlagTrading && socket_nm === 'socket_trading') {
              this.reConnectFlagTrading = false;
              setTimeout(() => this.switch_SocketConnection(socket_nm), 200);
            }
            const msg = { type: glb_sv.TRY_CONNECT, data: "waiting", socket_nm };
            glb_sv.commonEvent.next(msg);
          } else {
            if (this.reConnectFlagPublic && socket_nm === 'socket_public') {
              this.reConnectFlagPublic = false;
              setTimeout(() => this.switch_SocketConnection(socket_nm), 200);
              const msg = { type: glb_sv.TRY_CONNECT, data: "waiting", socket_nm };
              glb_sv.commonEvent.next(msg);
            } else if (socket_nm === 'socket_trading') {
              return;
            }
          }

        } else {
          if (glb_sv.authFlag) {
              if (this.reConnectFlagMarket && socket_nm === 'socket_market') {
                this.reConnectFlagMarket = false;
                setTimeout(() => this.switch_SocketConnection(socket_nm), 200);
                const msg = { type: glb_sv.TRY_CONNECT, data: "waiting", socket_nm };
                glb_sv.commonEvent.next(msg);
              } else if (this.reConnectFlagTrading && socket_nm === 'socket_trading') {
                this.reConnectFlagTrading = false;
                setTimeout(() => this.switch_SocketConnection(socket_nm), 200);
                const msg = { type: glb_sv.TRY_CONNECT, data: "waiting", socket_nm };
                glb_sv.commonEvent.next(msg);
              } else if (socket_nm === 'socket_public') return;
          } else {
            if (this.reConnectFlagPublic && socket_nm === 'socket_public') {
              this.reConnectFlagPublic = false;
              setTimeout(() => this.switch_SocketConnection(socket_nm), 200);
              const msg = { type: glb_sv.TRY_CONNECT, data: "waiting", socket_nm };
              glb_sv.commonEvent.next(msg);
            } else if (socket_nm === 'socket_market' || socket_nm === 'socket_trading') {
              return;
            }
          }
        }

      });

      socket.on("AUTH_RES_MSG", data => {
        let mssg;
        if (typeof data === "string") {
          mssg = JSON.parse(data);
        } else {
          mssg = data;
        }
        if (glb_sv.authFlag) {
          /* eslint-disable */
          if (mssg["Result"] == 1) {
            glb_sv.disconTime = null;
            const msg = { type: glb_sv.TRY_CONNECT, data: "auth-true", socket_nm };
            glb_sv.commonEvent.next(msg);
            glb_sv.objShareGlb["sessionInfo"]["sessionId"] = mssg["TransId"];
            const message = {};
            message["type"] = glb_sv.misTypeReconect;
            message["data"] = null;
            glb_sv.commonEvent.next(message);
          } else {
            this.event_SysMsg.next(mssg);
          }
        }
      });

      socket.on(this.key_SysMsg, data => {
        let mssg;
        if (typeof data === "string") {
          mssg = JSON.parse(data);
        } else {
          mssg = data;
        }
        this.event_SysMsg.next(mssg);
      });

      //-- Nhận phản hồi của server cho một request thông tin thị trường
      socket.on(this.key_ClientReqMRKRcv, data => {
        // if (glb_sv.authFlag || glb_sv.publicFlag) {
        let mssg;
        if (typeof data === "string") {
          mssg = JSON.parse(data);
        } else {
          mssg = data;
        }
        const clientSeq = Number(mssg["ClientSeq"]);
        let reqInfoMap = new requestInfo();
        reqInfoMap = glb_sv.getReqInfoMapValue(clientSeq);
        if (
          reqInfoMap &&
          reqInfoMap.reqFunct.substr(0, 20) === "SUBSCRIBE-OVER-INDEX"
        ) {
          return;
        }

        if (
          reqInfoMap &&
          reqInfoMap.reqFunct === "SUBSCRIBE-MARKET-INDEX"
        ) {

          if (mssg["Message"] === "DONE") {
            const msg = { type: glb_sv.finishGetIndexOrther };
            glb_sv.commonEvent.next(msg);
            return;
          } else {
            const strdata = mssg["Data"];
            const MsgKey = mssg.MsgKey;
            const index = MsgKey ? MsgKey.split('|')[2] : '';
            try {
              const jsonArr = JSON.parse(strdata);
              glb_sv[index + '_INDEX'].messageI = glb_sv[index + '_INDEX'].messageI.concat(jsonArr)
            } catch (error) {
              console.log(error);
            }
            return;
          }
        }

        if (
          reqInfoMap &&
          reqInfoMap.reqFunct === "SUBSCRIBE-MARKET-INDEX-MISS"
        ) {

          if (mssg["Message"] === "DONE") {
            const msg = { type: glb_sv.finishGetIndexOrtherMiss };
            glb_sv.commonEvent.next(msg);
            return;
          } else {
            const strdata = mssg["Data"];
            try {
              const jsonArr = JSON.parse(strdata);
              this.indexHistDataOrtherMiss = this.indexHistDataOrtherMiss.concat(jsonArr);
            } catch (error) {
              console.log(error);
            }
            return;
          }
        }

        if (
          reqInfoMap &&
          reqInfoMap.reqFunct.indexOf(glb_sv.getIndexHist) !== -1
        ) {
          // if (mssg['Message'] === 'DONE') {
          if (
            mssg["Message"] === "DONE" && this.finishgetIndexHist === 2
          ) {
            if (this.indexHistData.length === 0) {
              glb_sv.finishGetImsg = true;
              const msg = { type: glb_sv.finishGetIndex };
              setTimeout(() => glb_sv.commonEvent.next(msg), 0);
              // this.getLastImessage();
              return;
            }
            
            glb_sv.logMessage('start this.indexWebWorker');
            this.indexWebWorker.postMessage(JSON.stringify(this.indexHistData));
            this.indexHistData = [];
          } else {
            if (mssg["Message"] === "DONE") {
              this.finishgetIndexHist += 1;
              return;
            }
            const strdata = mssg["Data"];
            try {
              const jsonArr = JSON.parse(strdata);
              this.indexHistData = this.indexHistData.concat(jsonArr);
            } catch (error) {
              console.log(error);
            }
          }
        } else {
          // console.log(mssg);
          glb_sv.proc_ClientReqMRKRcv(mssg);
        }
      });

      //-- Nhận phản hồi của server cho một request thông thường
      socket.on(this.key_ClientReqRcv, data => {
        let mssg;
        if (typeof data === "string") {
          mssg = JSON.parse(data);
        } else {
          mssg = data;
        }
        // console.log(data);
        this.event_ClientReqRcv.next(mssg);
      });

      //-- Nhận dữ liệu thị trường realtime
      socket.on(this.key_ServerPushMRKInfoRcv, data => {
        let mssg;
        if (typeof data === "string") {
          mssg = JSON.parse(data);
        } else {
          mssg = data;
        }
        glb_sv.proc_ServerPushMRKRcv(mssg);
      });

      //-- Nhận dữ liệu thị trường realtime mkt top
      socket.on(this.key_ServerPushMRKTopRcv, data => {
        // if (glb_sv.authFlag || glb_sv.publicFlag) {
        let mssg;
        if (typeof data === "string") {
          mssg = JSON.parse(data);
        } else {
          mssg = data;
        }
        this.event_ClientReqMRKRcv.next(mssg);
      });

      //-- Nhận dữ liệu thị trường realtime eff top
      socket.on(this.key_ServerPushMRKEffRcv, data => {
        let mssg;
        if (typeof data === "string") {
          mssg = JSON.parse(data);
        } else {
          mssg = data;
        }
        this.event_ClientReqMRKRcv.next(mssg);
      });

      //-- Nhận dữ liệu thị trường realtime foreigner top
      socket.on(this.key_ServerPushMRKForRcv, data => {
        let mssg;
        if (typeof data === "string") {
          mssg = JSON.parse(data);
        } else {
          mssg = data;
        }
        this.event_ClientReqMRKRcv.next(mssg);
      });

      //-- Nhận dữ liệu thị trường realtime frg mkt share
      socket.on(this.key_ServerPushMRKFRG_MKT_SHARERcv, data => {
        let mssg;
        if (typeof data === "string") {
          mssg = JSON.parse(data);
        } else {
          mssg = data;
        }
        this.event_ClientReqMRKRcv.next(mssg);
      });

      socket.on(this.key_ServerPushMRKPTBoardRcv, data => {
        let mssg;
        if (typeof data === "string") {
          mssg = JSON.parse(data);
        } else {
          mssg = data;
        }
        this.event_ClientReqMRKRcv.next(mssg);
      });     

      socket.on(this.key_NotifyRcv, data => {
        let mssg;
        if (typeof data === "string") {
          mssg = JSON.parse(data);
        } else {
          mssg = data;
        }
        this.event_NotifyRcv.next(mssg);
      });
    };

    this.getSendReqKeyMsg = msgTp => {
      return this.key_MapReq.get(msgTp);
    };

    this.switch_SocketConnection = (socket_nm) => {
      let index = socket_nm === 'socket_public' ?
        this.url_mkt_public_index : (socket_nm === 'socket_trading' ? this.url_trading_index : this.url_mkt_index);

      const url = socket_nm === 'socket_public' ?
        this.url_mkt_public : (socket_nm === 'socket_trading' ? this.url_trading : this.url_mkt);

      if (index < url.length - 1) {
        index++;
      } else {
        index = 0;
      }
      if (socket_nm === 'socket_public') {
        if (this.socket_public) {
          this.socket_public.destroy();
          delete this.socket_public;
          this.socket_public = null;
        }
        this.setNewConnectionPublic(index);
      }
      else if (socket_nm === 'socket_trading') {
        if (this.socket_trading) {
          this.socket_trading.destroy();
          delete this.socket_trading;
          this.socket_trading = null;
        }
        this.setNewConnectionSrv(index);
      }
      else if (socket_nm === 'socket_market') {
        if (this.socket_market) {
          this.socket_market.destroy();
          delete this.socket_market;
          this.socket_market = null;
        }
        this.setNewConnectionMrk(index);
      }
    }

    this.disConnect = (publicFlag = true) => {
      /**
       * publicFlag = true => disconect socket_public
       * else => disconect socket_trading + socket_market
       */
      this.manual_disc_flag = true;
      if (publicFlag) {
        if (this.url_mkt_public[this.url_mkt_public_index] !== this.url_mkt[this.url_mkt_index] &&
          this.url_mkt_public[this.url_mkt_public_index] !== this.url_trading[this.url_trading_index]
        ) {
          this.socket_public.disconnect();
          this.socket_public_flag = false;
        }
      } else {
        if (this.url_mkt[this.url_mkt_index] !== this.url_mkt_public[this.url_mkt_public_index]) {
          if (this.socket_market && this.socket_market.connected) this.socket_market.disconnect();
          this.socket_market_flag = false;
        }
        if (this.url_trading[this.url_trading_index] !== this.url_mkt_public[this.url_mkt_public_index]) {
          if (this.socket_trading && this.socket_trading.connected) this.socket_trading.disconnect();
          this.socket_trading_flag = false;
        }
      }
    };

    this.disConnectPublic = () => {
      this.socket_public.disconnect();
    }
  }
}

const theInstance = new socketService();
export default theInstance;
