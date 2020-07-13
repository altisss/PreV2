import React from "react";
import glb_sv from "../../../utils/globalSv/service/global_service";
import OptionTable from "../../optionTable/OptionTable";
import ReactTable from "react-table";
import { CSVLink } from "react-csv";
import socket_sv from "../../../utils/globalSv/service/socket_service";
import { requestInfo } from "../../../utils/globalSv/models/requestInfo";
import { serviceInputPrm } from "../../../utils/globalSv/models/serviceInputPrm";
import FormatNumber from "../../formatNumber/FormatNumber";
import { UncontrolledTooltip } from "reactstrap";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Popover from "react-tiny-popover";
import TimeSelect from "../time-select";
import TypeSelect from "../type-select";
import DatePicker from 'react-datepicker';
import { ReactComponent as Reload } from "../../../conponents/translate/icon/reload-glyph-24.svg";
import { ReactComponent as IconExcel } from "../../../conponents/translate/icon/excel.svg";
import { ReactComponent as IconBullet } from "../../../conponents/translate/icon/bullet-list-70-glyph-24.svg";
import { ReactComponent as IconZoom } from "../../../conponents/translate/icon/magnifier-zoom-in-glyph-24.svg";
import commuChanel from '../../../constants/commChanel'
import { update_value_for_glb_sv } from "../../../utils/update_value_for_glb_sv";
import functionList from "../../../constants/functionList";

class HistoryList extends React.Component {
  constructor(props) {
    super(props);
    this.component = this.props.component
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.req_component = this.props.req_component
    this.get_rq_seq_comp = this.props.get_rq_seq_comp
    this.state = {
      data: [],
      columns: this.columnsH,
      columnInfo: this.columnInfo,
      titleTable: "",
      heightScroll: 145,
      styleBot: "15px",
      transaction: {
        start_dt: null,
        end_dt: null,
        acntNo: "",
        transTp: "%"
      },
      gettransactionlistFlag: false,
      acntItems: [],
      arrayExcel: [],
      count: 0,
      isPopoverOpenSelect: false,
      isPopoverOpenMenu: false,
      refreshFlag: "",
      //-- for cancel transaction
      cancelTransNm: "",
      cancelTransWorkNm: "",
      cancelTransWorkTm: "",
      cancelTransactionFlag: false,
      cfm_cancel_trans_modal: false,
      timeManual: true,
      nsi_start_dt: new Date(),
      nsi_end_dt: new Date(),
    };
    this.handleColumnChange = this.handleColumnChange.bind(this);
    this.timeQuery = "0D";
  }

  columnsH = [
    {
      Header: "#",
      accessor: "c00",
      width: 63,
      show: true,
      headerClassName: "text-center",
      className: "text-center",
      Cell: props => (
        <button
          type="button"
          disabled={props.original.c14 != "N"}
          onClick={() => this.cancelTransaction(props.original)}
          style={{ padding: "0 2px" }}
          className="btn btn-sm btn-link"
        >
          {this.props.t("common_Cancel")}
        </button>
      )
    },
    {
      Header: this.props.t("time"),
      accessor: "c0",
      show: true,
      headerClassName: "text-center",
      className: "text-center nowrap",
      width: 105,
      Cell: cellInfo => <span>{this.transDate(cellInfo.original.c0)}</span>
    },
    {
      Header: this.props.t("acnt_no"),
      accessor: "c3",
      show: true,
      width: 105,
      headerClassName: "text-center",
      className: "text-center"
    },
    {
      Header: this.props.t("sub_account"),
      accessor: "c4",
      show: true,
      width: 95,
      headerClassName: "text-center",
      className: "text-center"
    },

    {
      Header: this.props.t("transaction_type"),
      accessor: "c2",
      show: true,
      width: 415,
      headerClassName: "text-"
    },
    {
      Header: this.props.t("short_symbol"),
      accessor: "c5",
      show: true,
      width: 70,
      headerClassName: "text-center",
      className: "text-center",
      Cell: cellInfo => (
        <span>
          {!cellInfo.original.c5 ? <span>&nbsp;</span> : cellInfo.original.c5}
        </span>
      )
    },
    {
      Header: this.props.t("qty"),
      accessor: "c6",
      show: true,
      width: 110,
      headerClassName: "text-center",
      className: "text-right",
      Cell: cellInfo => (
        <span>
          {cellInfo.original.c6 == 0 || !cellInfo.original.c6 ? (
            <span>&nbsp;</span>
          ) : (
            FormatNumber(cellInfo.original.c6, 0, 0)
          )}
        </span>
      )
    },
    {
      Header: this.props.t("common_values"),
      accessor: "c7",
      show: true,
      width: 100,
      headerClassName: "text-center",
      className: "text-right",
      Cell: cellInfo => (
        <span>
          {cellInfo.original.c7 == 0 || !cellInfo.original.c7 ? (
            <span>&nbsp;</span>
          ) : (
            FormatNumber(cellInfo.original.c7, 0, 0)
          )}
        </span>
      )
    },
    {
      Header: this.props.t("common_note"),
      accessor: "c8",
      show: true,
      width: 510,
      headerClassName: "text-center",
      className: "text-",
      Cell: cellInfo => (
        <>
          {cellInfo.original.c8 === "" || cellInfo.original.c8 === " " ? (
            <span>&nbsp;</span>
          ) : (
            <span>{cellInfo.original.c8}</span>
          )}
        </>
      )
    },
    {
      Header: this.props.t("common_chanel"),
      accessor: "c9",
      show: true,
      width: 200,
      headerClassName: "text-center",
      className: "text-"
    },
    {
      Header: this.props.t("common_work_user"),
      accessor: "c10",
      show: true,
      width: 131,
      headerClassName: "text-center",
      className: "text-left"
    },
    {
      Header: this.props.t("common_work_time"),
      accessor: "c11",
      show: true,
      width: 165,
      headerClassName: "text-center",
      className: "text-center",
      Cell: cellInfo => (
        <span>
          {this.transDate(cellInfo.original.c11) +
            " " +
            this.transTime(cellInfo.original.c11)}
        </span>
      )
    },
    {
      Header: this.props.t("approve_status"),
      accessor: "c15",
      show: true,
      width: 100,
      headerClassName: "text-center",
      className: "text-center"
    },
    {
      Header: this.props.t("approve_time"),
      accessor: "c16",
      show: true,
      width: 165,
      headerClassName: "text-center",
      className: "text-center",
      Cell: cellInfo => (
        <span>
          {this.transDate(cellInfo.original.c16) +
            " " +
            this.transTime(cellInfo.original.c16)}
        </span>
      )
    }
  ];

  columnInfo = [
    { key: "c0_hist", value: true, disable: false, name: "transaction_date" },
    { key: "c3_hist", value: false, disable: false, name: "acnt_no" },
    { key: "c4_hist", value: true, disable: false, name: "sub_account" },
    { key: "c2_hist", value: true, disable: false, name: "transaction_type" },
    { key: "c5_hist", value: true, disable: false, name: "short_symbol" },
    { key: "c6_hist", value: true, disable: false, name: "qty" },
    { key: "c7_hist", value: true, disable: false, name: "common_values" },
    { key: "c8_hist", value: true, disable: false, name: "common_note" },
    { key: "c9_hist", value: false, disable: false, name: "common_chanel" },
    { key: "c10_hist", value: false, disable: false, name: "common_work_user" },
    { key: "c11_hist", value: true, disable: false, name: "common_work_time" },
    { key: "c15_hist", value: true, disable: false, name: "approve_status" },
    { key: "c16_hist", value: true, disable: false, name: "approve_time" }
  ];
  // -- get order list on day
  transListTemple = [];
  gettransList_FunctNm = "TRANSACSCR_001";
  gettransListFunct_ReqTimeOut;
  nsi_start_dt = new Date();
  nsi_end_dt = new Date();
  // -- cancel transaction
  canclTrans = {};
  canclTransFlag = false;
  canclTrans_FunctNm = "TRANSACSCR_002";
  canclTrans_Funct_ReqTimeOut;

  componentDidMount() {
    this.transaction = this.state.transaction;
    // const height = document.querySelector(".div_bottom_elm").clientHeight;
    // this.setState({ heightScroll: height - 52 });
    const sq= this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: ['objShareGlb', 'localData'], sq:sq})
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
      const objShareGlb = agrs.get('objShareGlb')
      // glb_sv.objShareGlb = objShareGlb
      const localData = agrs.get('localData')
      
      if (localData.columnsHis) {
        this.columnInfo = localData.columnsHis;
        this.setState({ columnInfo: this.columnInfo });
        this.columnInfo.map(item => {
          if (item.value === false) {
            const key = item.key.split("_")[0];
            const updateColumn = this.columnsH.find(o => o.accessor === key);
            updateColumn.show = false;
          }
        });
      } else if (this.state.columnInfo) {
        this.state.columnInfo.map(item => {
          if (item.value === false) {
            const key = item.key.split("_")[0];
            const updateColumn = this.columnsH.find(o => o.accessor === key);
            updateColumn.show = false;
          }
        });
      }
      this.setState({ columns: [...this.columnsH] })

      const workDt = objShareGlb['workDate']
      let todayDt = new Date()
      if (workDt)  todayDt = new Date(Number(workDt.substr(0, 4)), Number(workDt.substr(4, 2)) - 1, Number(workDt.substr(6, 2)))
      this.setState({ nsi_start_dt: todayDt, nsi_end_dt: todayDt });
      this.nsi_start_dt = todayDt;
      this.nsi_end_dt = todayDt;
      this.loadData();
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, msg) => {
      const columns = [
          {
            Header: "#",
            accessor: "c00",
            width: 63,
            show: true,
            headerClassName: "text-center",
            className: "text-center",
            Cell: props => (
              <button
                type="button"
                disabled={props.original.c14 != "N"}
                onClick={() => this.cancelTransaction(props.original)}
                style={{ padding: "0 2px" }}
                className="btn btn-sm btn-link"
              >
                {this.props.t("common_Cancel")}
              </button>
            )
          },
          {
            Header: this.props.t("time"),
            accessor: "c0",
            show: true,
            headerClassName: "text-center",
            className: "text-center nowrap",
            width: 105,
            Cell: cellInfo => (
              <span>{this.transDate(cellInfo.original.c0)}</span>
            )
          },
          {
            Header: this.props.t("acnt_no"),
            accessor: "c3",
            show: true,
            width: 105,
            headerClassName: "text-center",
            className: "text-center"
          },
          {
            Header: this.props.t("sub_account"),
            accessor: "c4",
            show: true,
            width: 95,
            headerClassName: "text-center",
            className: "text-center"
          },

          {
            Header: this.props.t("transaction_type"),
            accessor: "c2",
            show: true,
            width: 415,
            headerClassName: "text-"
          },
          {
            Header: this.props.t("short_symbol"),
            accessor: "c5",
            show: true,
            width: 70,
            headerClassName: "text-center",
            className: "text-center",
            Cell: cellInfo => (
              <>
                {cellInfo.original.c4 === "" || cellInfo.original.c4 === " " ? (
                  <span>&nbsp;</span>
                ) : (
                  <span>{cellInfo.original.c4}</span>
                )}
              </>
            )
          },
          {
            Header: this.props.t("qty"),
            accessor: "c6",
            show: true,
            width: 110,
            headerClassName: "text-center",
            className: "text-right",
            Cell: cellInfo => (
              <span>{FormatNumber(cellInfo.original.c6, 0, 0)}</span>
            )
          },
          {
            Header: this.props.t("common_values"),
            accessor: "c7",
            show: true,
            width: 100,
            headerClassName: "text-center",
            className: "text-right",
            Cell: cellInfo => (
              <span>{FormatNumber(cellInfo.original.c7, 0, 0)}</span>
            )
          },
          {
            Header: this.props.t("common_note"),
            accessor: "c8",
            show: true,
            width: 510,
            headerClassName: "text-center",
            className: "text-",
            Cell: cellInfo => (
              <>
                {cellInfo.original.c8 === "" || cellInfo.original.c8 === " " ? (
                  <span>&nbsp;</span>
                ) : (
                  <span>{cellInfo.original.c8}</span>
                )}
              </>
            )
          },
          {
            Header: this.props.t("common_chanel"),
            accessor: "c9",
            show: true,
            width: 200,
            headerClassName: "text-center",
            className: "text-"
          },
          {
            Header: this.props.t("common_work_user"),
            accessor: "c10",
            show: true,
            width: 131,
            headerClassName: "text-center",
            className: "text-left"
          },
          {
            Header: this.props.t("common_work_time"),
            accessor: "c11",
            show: true,
            width: 165,
            headerClassName: "text-center",
            className: "text-center",
            Cell: cellInfo => (
              <span>
                {this.transDate(cellInfo.original.c11) +
                  " " +
                  this.transTime(cellInfo.original.c11)}
              </span>
            )
          },
          {
            Header: this.props.t("approve_status"),
            accessor: "c15",
            show: true,
            width: 141,
            headerClassName: "text-center",
            className: "text-center"
          },
          {
            Header: this.props.t("approve_time"),
            accessor: "c16",
            show: true,
            width: 165,
            headerClassName: "text-center",
            className: "text-center",
            Cell: cellInfo => (
              <span>
                {this.transDate(cellInfo.original.c16) +
                  " " +
                  this.transTime(cellInfo.original.c16)}
              </span>
            )
          }
      ];

      columns.forEach(item => {
        this.columnsH.forEach(temp => {
          if (item.accessor && item.accessor === temp.accessor)
            item.show = temp.show;
        });
      });
      this.columnsH = columns;
      this.setState({ columns });
    })

    window.ipcRenderer.on(`${commuChanel.ACTION_SUCCUSS}_${this.component}`, (event, msg) => {
      if (msg.data === "history-list") {
        setTimeout(() => this.gettransList(), 1000);
      }
    })
    this.changeLeftIcon();
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.activeAcnt !== this.props.activeAcnt) {
      const pieacnt = newProps.activeAcnt.split('.')
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1];
      this.gettransList();
    }
  }


  componentWillUnmount() {
    if (this.gettransListFunct_ReqTimeOut) {
      clearTimeout(this.gettransListFunct_ReqTimeOut);
    }
    if (this.gettranstypeListFunct_ReqTimeOut) {
      clearTimeout(this.gettranstypeListFunct_ReqTimeOut);
    }
  }

  loadData() {

    const sq= this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: ['objShareGlb', 'activeAcnt'], sq:sq})
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
      const objShareGlb = agrs.get('objShareGlb')
      const activeAcnt = agrs.get('activeAcnt')

      const workDt = objShareGlb["workDate"];
      if (workDt != null && workDt.length === 8) {
        this.workDateObj = new Date(
          Number(workDt.substr(0, 4)),
          Number(workDt.substr(4, 2)) - 1,
          Number(workDt.substr(6, 2))
        );
      } else this.workDateObj = new Date();
      this.acntItems = objShareGlb["acntNoListAll"];
      this.setState({
        acntItems: this.acntItems
      });
      let acntStr = "";
      if (activeAcnt && activeAcnt !== "") {
        acntStr = activeAcnt;
      } else {
        acntStr = this.acntItems[0]["id"];
      }
      this.transaction["acntNo"] = acntStr;
      this.transaction["transTp"] = "%";
      this.setState(prevState => ({
        transaction: {
          ...prevState.transaction,
          transTp: this.transaction["transTp"],
          acntNo: this.transaction["acntNo"]
        }
      }));
      const pieacnt = acntStr.split(".");
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1];

      this.gettransList();
    })

    
  }

  changAcntNo = e => {
    const acntNo = e.target.value;
    this.transaction["acntNo"] = acntNo;
    // glb_sv.activeAcnt = acntNo;
    update_value_for_glb_sv({component: this.component, key: 'activeAcnt', value: acntNo})
    const pieces = acntNo.split(".");
    this.actn_curr = pieces[0];
    this.sub_curr = pieces[1];
    this.setState(prevState => ({
      transaction: {
        ...prevState.transaction,
        acntNo: this.transaction["acntNo"]
      }
    }));
  };

  changTransTp = e => {
    const value = e.target.value;
    this.transaction["transTp"] = value;
    this.setState(prevState => ({
      transaction: {
        ...prevState.transaction,
        transTp: this.transaction["transTp"]
      }
    }));
  };

  solvingtransaction_TimeOut = cltSeq => {
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
    console.log('solvingtransaction_TimeOut',reqIfMap.reqFunct)
    this.req_component.set(cltSeq, reqIfMap);
    if (reqIfMap.reqFunct === this.gettransList_FunctNm) {
      this.setState({ gettransactionlistFlag: false, refreshFlag: "" });
    } else if (reqIfMap.reqFunct === this.canclTrans_FunctNm) {
      this.canclTransFlag = false;
      this.setState({ cancelTransactionFlag: false });
    }

    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning', '', '', '', this.component)
    
  };

  handle_gettransList = (reqInfoMap, message) => {
    clearTimeout(this.gettransListFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
      return;
    }

    // -- process after get result --
    if (Number(message["Result"]) === 0) {
      reqInfoMap.procStat = 2;
      this.setState({ gettransactionlistFlag: false });
      reqInfoMap.resSucc = false;
      if (message["Code"] !== "080128") {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
      }
      // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      this.setState({ refreshFlag: "" });
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message["Data"]);
      } catch (err) {
        // glb_sv.logMessage(err);
        jsondata = [];
      }
      this.setState({ gettransactionlistFlag: false, refreshFlag: "" });
      // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      this.transListTemple = this.transListTemple.concat(jsondata);
      // console.log('Ket qua: ' + JSON.stringify(this.transListTemple));
      if (Number(message["Packet"]) <= 0) {
        reqInfoMap.procStat = 2;
        // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
        this.arrayExcel = JSON.parse(
          JSON.stringify(this.transListTemple)
        );
        this.arrayExcel.map(item => {
          item.c3 = "'" + item.c3;
          item.c0 = this.transDate(item.c0);
          item.c11 =
            this.transDate(item.c11) + " " + this.transTime(item.c11);
        });
        if (this.transListTemple !== []) {
          this.transListTemple = this.transListTemple.map(item => {
            item.c6 = Number(item.c6);
            item.c7 = Number(item.c7);
            return item;
          });
        }
        
        this.setState({
          data: [...this.transListTemple],
          arrayExcel: this.arrayExcel
        });
      }
    }
  }

  gettransList = () => {
    // if (glb_sv.localData.bottom_tab !== "history-list") return;

    const sq= this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: 'authFlag', sq:sq})
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, authFlag) => {
      if (!authFlag) return;
      if (this.state.gettransactionlistFlag) {
        return;
      }
      
      if (
        this.actn_curr === null ||
        this.actn_curr === undefined ||
        this.actn_curr.length === 0
      ) {
        return;
      }
      // console.log('before call trans history: ' + this.timeQuery, this.workDateObj);
      if(!this.workDateObj) return;
      let from_date = new Date(this.workDateObj.getTime());
      from_date.setDate(from_date.getDate() - parseInt(this.timeQuery));
      //-- xét lại 
      this.transaction["start_dt"] = {
        year: from_date.getFullYear(),
        month: from_date.getMonth() + 1,
        day: from_date.getDate()
      };    //-- end xét lại
  
      if (this.state.timeManual) {
          from_date = this.nsi_start_dt;
          this.workDateObj = this.nsi_end_dt;
      }
      const start_dt = glb_sv.convDate2StrDt(from_date);
      const end_dt = glb_sv.convDate2StrDt(this.workDateObj);
      //-- xét lại 
      this.transaction["end_dt"] = {
        year: this.workDateObj.getFullYear(),
        month: this.workDateObj.getMonth() + 1,
        day: this.workDateObj.getDate()
      }; //-- end xét lại
  
      let transTp = this.transaction["transTp"];
      if (transTp == null || transTp === "") {
        transTp = "%";
      }
      this.setState({ gettransactionlistFlag: true });
      // -- call service for place order
      const request_seq_comp = this.get_rq_seq_comp()
      // -- push request to request hashmap handle_gettransList
      const reqInfo = new requestInfo();
      reqInfo.reqFunct = this.gettransList_FunctNm;
      reqInfo.component = this.component;
      reqInfo.receiveFunct = this.handle_gettransList
      // -- service info
      let svInputPrm = new serviceInputPrm();
      // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
      svInputPrm.WorkerName = "ALTqTransaction";
      svInputPrm.ServiceName = "ALTqTransaction_OnlineTrans_2";
      svInputPrm.ClientSentTime = "0";
      svInputPrm.Operation = "Q";
      svInputPrm.InVal = [
        start_dt,
        end_dt,
        this.actn_curr,
        this.sub_curr,
        transTp
      ];
      svInputPrm.TotInVal = svInputPrm.InVal.length;
      // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
      this.gettransListFunct_ReqTimeOut = setTimeout(
        this.solvingtransaction_TimeOut,
        functionList.reqTimeout,
        request_seq_comp
      );
      reqInfo.inputParam = svInputPrm.InVal;
      // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
      this.transListTemple = [];
      this.setState({ data: [], refreshFlag: "fa-spin" });

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
   
    
  };

  updateTable = () => {
    const timeout = setInterval(() => {
      if (this.state.columnInfo) {
        this.state.columnInfo.map(item => {
          if (item.value === false) {
            const updateColumn = this.columnsH.find(
              o => o.accessor === item.name
            );
            if (updateColumn) updateColumn.show = false;
          }
        });
        clearInterval(timeout);
        this.setState({ columns: this.columnsH });
      }
    }, 100);
  };

  handleColumnChange(name, key, value) {
    const sq= this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: 'localData', sq:sq})
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, localData) => {
      const id = key.split("_")[0];
      const updateColumn = this.columnsH.find(o => o.accessor === id);
      if (updateColumn) updateColumn.show = value;
      this.setState({
        columns: [...this.columnsH]
      });
  
      const updateColumnInfo = this.columnInfo.find(o => o.key === key);
      if (updateColumnInfo) updateColumnInfo.value = value;
      localData.columnsHis = this.columnInfo;
      if (typeof Storage !== "undefined") {
        localStorage.setItem("stateMainPage", JSON.stringify(localData));
      }
    })
    
  }

  refeshData = () => {
    this.gettransList();
  };

  changeLeftIcon = () => {
    const elm = document.getElementsByClassName("rt-table");
    if(elm[2]) elm[2].addEventListener(
      "scroll",
      function(e) {
        const elm = document.getElementsByClassName("rt-table")[2];
        let left = elm.scrollLeft;
        const icon_elm = document.getElementById("icon_historylist");
        icon_elm.style.marginLeft = "-" + left + "px";
      },
      true
    );
  };


  transDate = value => {
    if (value === "" || value == null) return value;
    const day = value.substr(0, 2);
    const month = value.substr(2, 2);
    const year = value.substr(4, 4);
    return day + "/" + month + "/" + year;
  };

  transTime = value => {
    if (value === "" || value == null) return value;
    const day = value.substr(8, 2);
    const month = value.substr(10, 2);
    const year = value.substr(12, 2);
    return day + ":" + month + ":" + year;
  };

  transTitle(item) {
    return {
      Header: this.props.t(item.Header),
      accessor: item.accessor,
      show: item.show,
      headerClassName: item.headerClassName,
      className: item.className,
      Cell: item.Cell,
      width: item.width
    };
  }

  headersCSV = [
    { label: this.props.t("acnt_no"), key: "c3" },
    { label: this.props.t("sub_account"), key: "c4" },
    { label: this.props.t("transaction_date"), key: "c0" },
    { label: this.props.t("transaction_type"), key: "c2" },
    { label: this.props.t("symbol"), key: "c5" },
    { label: this.props.t("qty"), key: "c6" },
    { label: this.props.t("common_values"), key: "c7" },
    { label: this.props.t("common_note"), key: "c8" },
    { label: this.props.t("common_chanel"), key: "c9" },
    { label: this.props.t("common_work_user"), key: "c10" },
    { label: this.props.t("common_work_time"), key: "c11" },
    { label: this.props.t("approve_status"), key: "c15" },
    { label: this.props.t("approve_time"), key: "c16" }
  ];


  afterPopOverRender() {
    if (this.state.timeManual) {
      this.openFilterNew();
    } else {
      this.openFilterOld();
    }
  }

  openFilterOld() {
    const timeQuery = this.timeQuery;
    const typeQuery = this.transaction["transTp"];
    setTimeout(() => {
      const elmInputTime = document.getElementById(
        timeQuery + "-option-time-historylist"
      );
      const elmInputType = document.getElementById(
        typeQuery + "-option-type-historylist"
      );
      if (elmInputTime && elmInputType) {
        elmInputTime.checked = true;
        elmInputType.checked = true;
      } else this.afterPopOverRender();
    }, 100);
  }

  openFilterNew() {
    const typeQuery = this.transaction["transTp"];
    setTimeout(() => {
      const elmInputType = document.getElementById(
        typeQuery + "-option-type-historylist"
      );
      if (elmInputType) {
        elmInputType.checked = true;
      } else this.afterPopOverRender();
    }, 100);
  }

  handleSelectTime = timeQuery => {
    if (timeQuery !== this.timeQuery) {
    const sq= this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: 'localData', sq:sq})
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, localData) => {
      this.timeQuery = timeQuery;
      glb_sv.localData = localData;
      glb_sv.localData.bottom_tab = "history-list";
      update_value_for_glb_sv({component: this.component, key: 'localData', value: glb_sv.localData})
      this.gettransList();
    })
      
    }
  };

  handleSelectType = type => {
    if (type !== this.transaction["transTp"]) {
      const sq= this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: 'localData', sq:sq})
      window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, localData) => {
        glb_sv.localData = localData;
        glb_sv.localData.bottom_tab = "history-list";
        update_value_for_glb_sv({component: this.component, key: 'localData', value: glb_sv.localData})
        this.transaction["transTp"] = type;
        this.setState(prevState => ({
          transaction: {
            ...prevState.transaction,
            transTp: this.transaction["transTp"]
          }
        }));
        this.gettransList();
      })
    }
  };

  //-- Add new date for inputting manual
  handleDateChange = (actTp, value) => {
    if (actTp === 1) {
    this.nsi_start_dt = value;
    this.setState({nsi_start_dt: value}, this.gettransList());
    } else {
    this.nsi_end_dt = value;
    this.setState({nsi_end_dt: value}, this.gettransList());
    }
}
  // -- Hủy transaction
  cancelTransaction = item => {
    if (item && item["c14"] && item["c14"] != "N") return;
    this.canclTrans = item;
    this.setState({
      cancelTransNm: item["c2"],
      cancelTransWorkNm: item["c10"],
      cancelTransWorkTm: item["c11"],
      cfm_cancel_trans_modal: true
    });
  };
  // -- Xác nhận Hủy transaction
  cancelTransactionCfm = cfmTp => {
    if (this.canclTransFlag) {
      return;
    }
    if (cfmTp === "N") {
      this.canclTrans = {};
      this.setState({ cfm_cancel_trans_modal: false });
      return;
    }
    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
    //   const ermsg = "Can_not_connected_to_server_plz_check_your_network";
    //   glb_sv.openAlertModal("", "common_InfoMessage", ermsg, "", "");
    //   return;
    // }
    this.canclTransFlag = true;
    this.setState({ cancelTransactionFlag: true });

    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap handle_cancelTransactionCfm
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.canclTrans_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.cancelTrans_ResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = this.canclTrans["c17"];
    svInputPrm.ServiceName = this.canclTrans["c18"];
    svInputPrm.ClientSentTime = "0";
    svInputPrm.Operation = "D";
    svInputPrm.AprStat = "D";
    svInputPrm.AprSeq = this.canclTrans["c13"];
    if (this.canclTrans["c12"] && this.canclTrans["c12"].length >= 8)
      svInputPrm.MakerDt =
        this.canclTrans["c12"].substr(4, 4) +
        this.canclTrans["c12"].substr(2, 2) +
        this.canclTrans["c12"].substr(0, 2); //ddmmyyyy
    svInputPrm.InVal = this.canclTrans["c19"].trim().split("|");
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.canclTrans_Funct_ReqTimeOut = setTimeout(
      this.solvingtransaction_TimeOut,
      functionList.reqTimeout,
      request_seq_comp
    );
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

  };


  cancelTrans_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.canclTrans_Funct_ReqTimeOut);
    this.canclTransFlag = false;
    this.setState({ cancelTransactionFlag: false });
    if (reqInfoMap.procStat !== 0) {
      return;
    }
    reqInfoMap.procStat = 2;
    if (Number(message["Result"]) === 0) {
      reqInfoMap.resSucc = false;
      if (message["Code"] !== "080128") {
        
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
      }
    } else {
      this.setState({ cfm_cancel_trans_modal: false });
      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', '', '', '', this.component)
    }
    setTimeout(() => {
      this.gettransList()
    }, 300);
    // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
  }

  modalAfterOpenedCancelTrans = () => {
    const elmm = document.getElementById("bt_msgBoxCanclCfmOk");
    if (elmm) elmm.focus();
  };

  fileter = () => {
    
    console.log(this.transListTemple)
  }

  render() {
    const { t } = this.props;
    return (
      <div className="history" style={{margin: '0 auto'}}>
        <div
          className="content-bot tableOrd"
          style={{ marginTop: this.state.styleBot }}
        >
          <div id="icon_historylist" className="icon-advance">
            <Popover
              isOpen={this.state.isPopoverOpenMenu}
              position={"top"}
              onClickOutside={() => this.setState({ isPopoverOpenMenu: false })}
              content={({ position, targetRect, popoverRect }) => (
                <div className="popover-search">
                  <OptionTable
                    t={t}
                    columnInfo={this.state.columnInfo}
                    onColumnChange={this.handleColumnChange}
                  />
                </div>
              )}
            >
              <span
                id="Tooltip_hislist_option"
                className="left5"
                onClick={() =>
                  this.setState(
                    { isPopoverOpenMenu: !this.state.isPopoverOpenMenu },
                    () => this.afterPopOverRender()
                  )
                }
              >
                <span className="colorOption">
                  <IconBullet />
                </span>
              </span>
            </Popover>
            <UncontrolledTooltip
              placement="top"
              target="Tooltip_hislist_option"
              className="tooltip-custom"
            >
              {t("common_option_hide_column")}
            </UncontrolledTooltip>

            <CSVLink
              filename={t("transaction_list") + ".csv"}
              data={this.state.arrayExcel}
              headers={this.headersCSV}
              target="_blank"
              style={{ color: "inherit" }}
            >
              <span
                id="Tooltip_history_csv"
                className="left5"
                placement="top"
                style={{ padding: 0, marginTop: 3 }}
              >
                <IconExcel />
              </span>
            </CSVLink>
            <UncontrolledTooltip
              placement="top"
              target="Tooltip_history_csv"
              className="tooltip-custom"
            >
              {t("common_ExportExcel")}
            </UncontrolledTooltip>

            <Popover
              isOpen={this.state.isPopoverOpenSelect}
              position={"top"}
              onClickOutside={() =>
                this.setState({ isPopoverOpenSelect: false })
              }
              content={({ position, targetRect, popoverRect }) => (
                <div className="popover-search">

                  {this.state.timeManual && <>
                      <span className="m-b-20">{t('time')}</span>
                      <div className='row padding-top-5'>
                          <div className='col'>
                          <div className="no-padding input-group input-group-sm nsi_filter_dt">
                              <DatePicker id='orderBook_start_dt' popperPlacement='bottom' scrollableYearDropdown selected={this.state.nsi_start_dt} dateFormat="dd/MM/yyyy"
                              peekNextMonth showMonthDropdown showYearDropdown className="form-control form-control-sm text-center"
                              onChange={value => this.handleDateChange(1, value)} />
                          </div>
                          </div>
                      </div>
                      <div className='row padding-top-5 m-b-10'>
                          <div className='col'>
                          <div className="no-padding input-group input-group-sm nsi_filter_dt">
                              <DatePicker id='orderBook_end_dt' popperPlacement='bottom' scrollableYearDropdown selected={this.state.nsi_end_dt} dateFormat="dd/MM/yyyy"
                              peekNextMonth showMonthDropdown showYearDropdown className="form-control form-control-sm text-center"
                              onChange={value => this.handleDateChange(2, value)} />
                          </div>
                          </div>
                      </div></>}

                    {!this.state.timeManual && <div className="row padding-bottom-15">
                    <div className="col popover-pagin">
                      <TimeSelect handleSelectTime={this.handleSelectTime} t={t} nameInput="time-historylist" />
                    </div>
                  </div>}
                  <div className="hr"></div>
                  <div className="row padding-top-15">
                    <div className="col">
                      <TypeSelect
                        name="history-list"
                        handleSelectType={this.handleSelectType}
                        t={t}
                        nameInput="type-historylist"
                        check_name={this.props.name}
                        fileter={this.fileter}
                      />
                    </div>
                  </div>
                </div>
              )}
            >
              <span
                id="Tooltip_hislist_time"
                data-tut="reactour__bottom_transactionlist_search"
                className="left5"
                onClick={() =>
                  this.setState(
                    { isPopoverOpenSelect: !this.state.isPopoverOpenSelect },
                    () => this.afterPopOverRender()
                  )
                }
              >
                <IconZoom />
              </span>
            </Popover>
            <UncontrolledTooltip
              placement="top"
              target="Tooltip_hislist_time"
              className="tooltip-custom"
            >
              {t("common_button_sumbit_select")}
            </UncontrolledTooltip>

            <span
              id="Tooltip_hislist_Refresh"
              onClick={() => this.refeshData()}
              style={{ padding: 0, marginLeft: 5, color: "inherit" }}
              className={
                "btn btn-link undecoration cursor_ponter " +
                this.state.refreshFlag
              }
            >
              <Reload />
            </span>
            <UncontrolledTooltip
              placement="top"
              target="Tooltip_hislist_Refresh"
              className="tooltip-custom"
            >
              {t("Refresh")}
            </UncontrolledTooltip>
          </div>
          <ReactTable
            data={this.state.data}
            columns={this.state.columns}
            pageSize={this.state.data.length ? this.state.data.length : 1}
            showPagination={false}
            NoDataComponent={() => {
              return (
                <div className="rt-noData hideClass">
                  {this.props.t("common_NoDataFound")}
                </div>
              );
            }}
            className="-striped -highlight"
          />
          <br />
        </div>
        {/* Modal hủy giao dịch chưa duyệt */}
        <Modal
          isOpen={this.state.cfm_cancel_trans_modal}
          size={"sm modal-notify"}
          onClosed={() => {}}
          onOpened={this.modalAfterOpenedCancelTrans}
        >
          <ModalHeader>{t("common_notify")}</ModalHeader>
          <ModalBody>
            {t("confirm_cancel_transaction")}
            <br /> - {this.state.cancelTransNm}
            <br /> - {t("common_work_user")}: {this.state.cancelTransWorkNm}
            <br /> - {t("common_work_time")}:{" "}
            {
              <span>
                {this.transDate(this.state.cancelTransWorkTm) +
                  " " +
                  this.transTime(this.state.cancelTransWorkTm)}
              </span>
            }
            ?
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button
                    size="sm"
                    block
                    id="bt_msgBoxCanclCfmOk"
                    autoFocus
                    color="wizard"
                    onClick={e => this.cancelTransactionCfm("Y")}
                  >
                    {this.state.cancelTransactionFlag ? (
                      <span>
                        {t("common_processing")}
                        <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>
                      </span>
                    ) : (
                      <span>{t("common_Ok")}</span>
                    )}
                  </Button>
                </div>
                <div className="col">
                  <Button
                    size="sm"
                    block
                    color="cancel"
                    onClick={e => this.cancelTransactionCfm("N")}
                  >
                    <span>{t("common_No")}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default HistoryList;
