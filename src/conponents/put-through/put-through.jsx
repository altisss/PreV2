import React, { PureComponent } from "react";
import { translate } from "react-i18next";
import glb_sv from "../../utils/globalSv/service/global_service";
import socket_sv from "../../utils/globalSv/service/socket_service";
import { requestInfo } from "../../utils/globalSv/models/requestInfo";
import { serviceInputPrm } from "../../utils/globalSv/models/serviceInputPrm";

import TableSellBuy from "./table-sellbuy";
import TableMatchPt from "./table-match-order";
import PerfectScrollbar from "react-perfect-scrollbar";
import functionList from "../../constants/functionList";
import commuChanel from '../../constants/commChanel'
import {on_subcribeIndexAll, on_unSubStkList} from '../../utils/subcrible_functions'

class PutThroughView extends PureComponent {
  constructor(props) {
    super(props);
    this.component = this.props.component
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.req_component = this.props.req_component
    this.get_rq_seq_comp = this.props.get_rq_seq_comp
    this.state = {
      matchPt: [],
      askData: [],
      bidDate: []
    };
  }
  // -- get adverticall
  subcr_commonEvent;
  subcr_ClientReqMrkRcv;
  notifySysInfo;
  subcr_ClientReqRcv;
  firtPutThResult = false;
  advertDataTemp = [];
  getAdvertOrderFlag = false;
  getAdvertOrder_FunctNm = "PUT_THROUGH_001";
  getAdvertOrder_ReqTimeout = {};
  putThrough = [];

  getAdvertData = () => {
    if (this.getAdvertOrderFlag) {
      return;
    }
    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
    //   const ermsg = "Can_not_connected_to_server_plz_check_your_network";
    //   glb_sv.openAlertModal("", "common_InfoMessage", ermsg, "", "warning");
    //   return;
    // }

    this.getAdvertOrderFlag = true;
    // -- call service for place order
    
    // -- push request to request hashmap handle_getAdvertData
    const reqInfo = new requestInfo();
    const request_seq_comp = this.get_rq_seq_comp()
    reqInfo.component = this.component;
    reqInfo.reqFunct = this.getAdvertOrder_FunctNm;
    reqInfo.receiveFunct = this.handle_getAdvertData;
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = "ALTqOrderCommon";
    svInputPrm.ServiceName = "ALTqOrderCommon_0508_1";
    svInputPrm.ClientSentTime = "0";
    svInputPrm.Operation = "Q";
    svInputPrm.InVal = ["TODAY"];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.getAdvertOrder_ReqTimeout = setTimeout(
      this.solvingadvtOrder_TimeOut,
      functionList.reqTimeout,
      request_seq_comp
    );
    reqInfo.inputParam = svInputPrm.InVal;
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    this.advertDataTemp = [];
    this.req_component.set(request_seq_comp, reqInfo)
    window.ipcRenderer.send(commuChanel.send_req, {
        req_component:{
          component: reqInfo.component, 
          request_seq_comp: request_seq_comp,
          channel: socket_sv.key_ClientReq
        }, 
        svInputPrm:svInputPrm
    })
    // this.setState({ bidDate: [], askData: [] });
  };

  handle_getAdvertData = (reqInfoMap, message) => {
    console.log('handle_getAdvertData',message, reqInfoMap, JSON.stringify(message))
    console.log(message, reqInfoMap)
    // if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
    //   return;
    // }
    // -- process after get result --
    if (Number(message["Result"]) === 0) {
      reqInfoMap.procStat = 2;
      this.getAdvertOrderFlag = false;
      reqInfoMap.resSucc = false;
      // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message["Data"]);
      } catch (err) {
        jsondata = [];
      }
      console.log('handle_getAdvertData', Number(message["Packet"]))
      // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      this.advertDataTemp = this.advertDataTemp.concat(jsondata);
      if (Number(message["Packet"]) <= 0) {
        console.log('handle_getAdvertData', this.advertDataTemp)
        reqInfoMap.procStat = 2;
        this.getAdvertOrderFlag = false;
        // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
        if (
          this.advertDataTemp !== [] &&
          this.advertDataTemp.length > 0
        ) {
          let sanGd = "";
          if (this.props.keyIndex == "pt_hsx") sanGd = "HSX";
          if (this.props.keyIndex == "pt_hnx") sanGd = "HNX";
          if (this.props.keyIndex == "pt_upc") sanGd = "UPC";
          const bidData = this.advertDataTemp.filter(
            item => item.c3 === "1" && item.c15 === sanGd
          );
          const askData = this.advertDataTemp.filter(
            item => item.c3 === "2" && item.c15 === sanGd
          );
          this.setState({ bidDate: bidData, askData: askData });
        }
      }
    }
  }

  solvingadvtOrder_TimeOut = cltSeq => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) {
      return;
    }
    // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
    const reqIfMap = this.req_component.get(cltSeq);
    if (
      reqIfMap === null ||
      reqIfMap === undefined ||
      reqIfMap.procStat !== 0
    ) {
      return;
    }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    if (reqIfMap.reqFunct === this.getAdvertOrder_FunctNm) {
      this.getAdvertOrderFlag = false;
    }
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', '', '', false, '', this.component)
  };

  componentDidMount() {
    this.getAdvertData();
    let sanGd = ""
    
    if (this.props.keyIndex == "pt_hsx") sanGd = "HSXINDEX";
    if (this.props.keyIndex == "pt_hnx") sanGd = "HNXINDEX";
    if (this.props.keyIndex == "pt_upc") sanGd = "UPCINDEX";
    this.subcribePutThrough(sanGd);

    window.ipcRenderer.on(`${commuChanel.misTypeReconect}_${this.component}`, (event, msg) => {
      let sanGd = "";
      if (this.props.keyIndex == "pt_hsx") sanGd = "HSXINDEX";
      if (this.props.keyIndex == "pt_hnx") sanGd = "HNXINDEX";
      if (this.props.keyIndex == "pt_upc") sanGd = "UPCINDEX";
      this.subcribePutThrough(sanGd);
    })

    window.ipcRenderer.on(`${commuChanel.event_ClientReqMRKRcv}_${this.component}`, (event, message) => {
      console.log(message)
        // -- validate info result --
        let sanGd = "";
        if (this.props.keyIndex == "pt_hsx") sanGd = "01";
        if (this.props.keyIndex == "pt_hnx") sanGd = "03";
        if (this.props.keyIndex == "pt_upc") sanGd = "05";
        const MsgKey = sanGd + "|PT_BOARD";
        if (message.MsgKey !== MsgKey) return;
        let data = [];
        try {
          if (message.Message == "DONE") {
            this.firtPutThResult = true;
            this.putThrough.sort((a, b) =>
              a.MT < b.MT ? 1 : b.MT < a.MT ? -1 : 0
            );
            if (this.props.keyIndex == 'pt_hnx') {
              this.putThrough = this.putThrough.filter(x => x.ExCode === '03')
            } else if (this.props.keyIndex == 'pt_upc') {
                this.putThrough = this.putThrough.filter(x => x.ExCode === '05')
            }
            this.setState({ matchPt: this.putThrough });
            return;
          }
          data = JSON.parse(message.Data);
          // console.log("receive puthourgh data");
          // console.log(JSON.stringify(data));
          if (data && data.length > 0) {
            if (!this.firtPutThResult) {
              this.putThrough = this.putThrough.concat(data);
            } else {
              let ptData = [],
                index = 0;
              const newMsg = data[0];
              Object.assign(ptData, this.state.matchPt);
              index = ptData.findIndex(x => x.MsgKey == newMsg.MsgKey);
              if (index >= 0) {
                const oldMsg = ptData[index];
                this.changeBackground(
                  oldMsg["StkCd"] + "TableMatchPt" + "_CR",
                  oldMsg["CR"],
                  newMsg["CR"]
                );
                this.changeBackground(
                  oldMsg["StkCd"] + "TableMatchPt" + "_CA",
                  oldMsg["CA"],
                  newMsg["CA"]
                );
                ptData[index] = newMsg;
                this.setState({ matchPt: ptData });
              } else {
                ptData.push(newMsg);
                ptData.sort((a, b) =>
                  a.MT < b.MT ? 1 : b.MT < a.MT ? -1 : 0
                );
                this.setState({ matchPt: ptData });
                setTimeout(() => {
                  this.changeBackground(
                    newMsg["StkCd"] + "TableMatchPt" + "_CR",
                    0,
                    newMsg["CR"]
                  );
                  this.changeBackground(
                    newMsg["StkCd"] + "TableMatchPt" + "_CA",
                    0,
                    newMsg["CA"]
                  );
                }, 300);
              }
            }
          }
        } catch (err) {
          console.error("put-through parse message", err);
        }
    })

    window.ipcRenderer.on(`${commuChanel.event_ToastCommonInfo}_${this.component}`, (event, message) => {
      if (message['key'] === 'ADVERT_ORDER') {
        setTimeout(() => {
          this.getAdvertData();
        }, 5000);
      }
    })

    const elm = document.getElementById('priceboard-div');
    if (elm) elm.style.overflowY = 'hidden';
  }

  changeBackground = (id, oldValue, newValue) => {
    const elemm = document.getElementById(id);
    if (elemm === null || elemm === undefined) {
      return;
    }
    if (newValue < oldValue) {
      if (elemm.classList.contains("bk_blue")) {
        elemm.classList.remove("bk_blue");
      }
      if (!elemm.classList.contains("bk_red")) {
        elemm.classList.add("bk_red");
      }
      // if (this.timeOut[id]) { window.clearTimeout(this.timeOut[id]); }
      setTimeout(() => {
        if (elemm.classList.contains("bk_red")) {
          elemm.classList.remove("bk_red");
        }
      }, 500);
      return;
    } else if (newValue > oldValue) {
      if (elemm.classList.contains("bk_red")) {
        elemm.classList.remove("bk_red");
      }
      if (!elemm.classList.contains("bk_blue")) {
        elemm.classList.add("bk_blue");
      }
      // if (this.timeOut[id]) { window.clearTimeout(this.timeOut[id]); }
      setTimeout(() => {
        if (elemm.classList.contains("bk_blue")) {
          elemm.classList.remove("bk_blue");
        }
      }, 500);
      return;
    }
  };

  componentWillReceiveProps(newProps) {
    if (newProps.keyIndex !== this.props.keyIndex) {
      this.firtPutThResult = false;
      this.setState({ bidDate: [], askData: [], matchPt: [] });
      this.getAdvertData();
      // sanGd in (01: HOSE, 03: HNX, 05: UPC);
      let sanGd = "";
      if (this.props.keyIndex == "pt_hsx") sanGd = "HSXINDEX";
      if (this.props.keyIndex == "pt_hnx") sanGd = "HNXINDEX";
      if (this.props.keyIndex == "pt_upc") sanGd = "UPCINDEX";
      this.unsubcribePutThrough(sanGd);
      if (newProps.keyIndex == "pt_hsx") sanGd = "HSXINDEX";
      if (newProps.keyIndex == "pt_hnx") sanGd = "HNXINDEX";
      if (newProps.keyIndex == "pt_upc") sanGd = "UPCINDEX";
      this.subcribePutThrough(sanGd);
    }
  }

  subcribePutThrough = sanGd => {
    // sanGd in (01: HOSE, 03: HNX, 05: UPC);
    let index = '01';
    if (sanGd === 'HNXINDEX') index = '03'
    if (sanGd === 'UPCINDEX') index = '05'
    this.putThrough = [];
    const reqFunct = "SUBSCRIBE-PUT-THROUGH-" + sanGd + `__${this.component}`;
    const msgObj2 = {
      Command: "SUB",
      F1: index,
      F2: ["PT_BOARD", index]
    };
    on_subcribeIndexAll(sanGd, this.component, reqFunct, msgObj2)
  };

  unsubcribePutThrough = key => {
    
    const msgObj2 = {
      Command: "UNSUB",
      F1: key,
      F2: ["PT_BOARD", key]
    };
    on_unSubStkList(this.component, msgObj2)
  };

  componentWillUnmount() {
    let sanGd = "";
    if (this.props.keyIndex == "pt_hsx") sanGd = "HSXINDEX";
    if (this.props.keyIndex == "pt_hnx") sanGd = "HNXINDEX";
    if (this.props.keyIndex == "pt_upc") sanGd = "UPCINDEX";
    this.unsubcribePutThrough(sanGd);
    const elm = document.getElementById('priceboard-div');
    if (elm) elm.style.overflowY = '';
  }

  render() {
    const { t, keyIndex } = this.props;
    const title =
      keyIndex === "pt_hsx"
        ? "hose_put_through_priceboard"
        : keyIndex === "pt_hnx"
        ? "hnx_put_through_priceboard"
        : "upc_put_through_priceboard";
    return (
      <div
        className="card over-market"
        style={{ boxShadow: "unset", minWidth: 1000, height: 'inherit' }}
      >
        <div className="row no-margin">
          <div className="col text-center">
            <h5>{t(title)}</h5>
          </div>
        </div>

        <div
          className="card-body row div_right_l_elm"
          style={{ margin: 0, padding: "5px 0", overflowY: 'hidden' }}
        >
          <div className="col-md-3" style={{ paddingLeft: 5, height: 'calc(100% - 5px)' }}>
            <div className="table-overview-market" style={{ height: 'inherit'}}>
              <div className="card overflowAuto" style={{ height: 'inherit'}}>
                <PerfectScrollbar>
                  <div className="card-body" style={{ padding: 0, height: 'inherit' }}>
                    <div className="divPriceBoard">
                      <TableSellBuy
                        t={t}
                        data={this.state.bidDate}
                        isBuy={true}
                        component={this.component} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                      />
                    </div>
                  </div>
                </PerfectScrollbar>
              </div>
            </div>
          </div>
          <div className="col-md-6" style={{ height: 'calc(100% - 5px)'}}>
            <div className="table-overview-market" style={{ height: 'inherit'}}>
              <div className="card" style={{ height: 'inherit'}}>
                <PerfectScrollbar>
                  <div className="card-body" style={{ padding: 0, height: 'inherit' }}>
                    <div className="divPriceBoard">
                      <TableMatchPt t={t} data={this.state.matchPt} component={this.component} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}/>
                    </div>
                  </div>
                </PerfectScrollbar>
              </div>
            </div>
          </div>
          <div className="col-md-3" style={{ paddingRight: 5, height: 'calc(100% - 5px)' }}>
            <div className="table-overview-market" style={{ height: 'inherit'}}>
              <div className="card" style={{ height: 'inherit'}}>
                <PerfectScrollbar>
                  <div className="card-body" style={{ padding: 0, height: 'inherit' }}>
                    <div className="divPriceBoard">
                      <TableSellBuy
                        t={t}
                        data={this.state.askData}
                        isBuy={false}
                        component={this.component} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                      />
                    </div>
                  </div>
                </PerfectScrollbar>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default translate("translations")(PutThroughView);
