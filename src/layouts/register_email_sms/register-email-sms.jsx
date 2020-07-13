import React, { PureComponent } from 'react'
import { translate } from 'react-i18next'
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';

import functionList from '../../constants/functionList';
import commuChanel from '../../constants/commChanel'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';

const remote = require('electron').remote;

class RegisterEmailSms extends PureComponent {
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
        })
    }
    this.state = {
      data: [],
      updateDisable: true,
      regDataListFlag: false,
      resetDataFlag: false,

      name: this.props.name,
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style,
    };
  }

  regDataListTemple = [];
  changeArr = [];
  getRegDataListFlag = false;
  getRegDataList_FunctNm = 'REGEMAILSMSSCR_001';
  getRegDataList_ReqTimeOut = {};
  regDataListFlag = false;
  regDataList_FunctNm = 'REGEMAILSMSSCR_002';
  regDataList_ReqTimeOut = {};
  resetDataFlag = false;
  resetData_FunctNm = 'REGEMAILSMSSCR_003';
  resetData_ReqTimeOut = {};

  popin_window() {
    const current_window = remote.getCurrentWindow();
    // const state = {parent_id: this.state.parent_id, config: this.state.config, name: this.state.name, component: this.state.component}
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }

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
        this.getRegDataList();
        
    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
        // update state after popin window
        this.setState(agrs.state)

    })
  }

  componentDidMount() {
    if (this.props.node) this.getRegDataList();

    window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
      if (this.state.cfm_portfolio_detail) this.setState({ cfm_portfolio_detail: false });
      else {
          const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
          // glb_sv.commonEvent.next(msg);
          inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
      }
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
        this.getRegDataList();
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

  }

  componentWillUnmount() {
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    if (this.getrightListFunct_ReqTimeOut) { clearTimeout(this.getrightListFunct_ReqTimeOut); }
    if (this.getrighttypeListFunct_ReqTimeOut) { clearTimeout(this.getrighttypeListFunct_ReqTimeOut); }
    
  }

  solvingregDataer_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    if (reqIfMap.reqFunct === this.getRegDataList_FunctNm) {
      this.getRegDataListFlag = false;
    } else if (reqIfMap.reqFunct === this.regDataList_FunctNm) {
      this.regDataListFlag = false;
      this.setState({regDataListFlag: false});
    } else if (reqIfMap.reqFunct === this.resetData_FunctNm) {
      this.resetDataFlag = false;
      this.setState({resetDataFlag: false});
    }
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', '');
  }

  hanlde_getRegDataList = (reqInfoMap, message) => {
    clearTimeout(this.getRegDataList_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getRegDataListFlag = false;
      reqInfoMap.resSucc = false;
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
      } catch (err) {
        jsondata = [];
      }
      this.regDataListTemple = this.regDataListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getRegDataListFlag = false;
        this.setState({ data: this.regDataListTemple });
      }
    }
  }

  // --- get orderlist function
  getRegDataList = () => {
    if (this.getRegDataListFlag) { return; }
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'activeAcnt', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, activeAcnt) => {
      const acntStr = activeAcnt;

      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
  
      this.getRegDataListFlag = true;
      // -- call service for place order
      const request_seq_comp = this.get_rq_seq_comp()
      // -- push request to request hashmap hanlde_getRegDataList
      const reqInfo = new requestInfo();
      reqInfo.reqFunct = this.getRegDataList_FunctNm;
      reqInfo.component = this.component;
      reqInfo.receiveFunct = this.hanlde_getRegDataList
      // -- service info
      let svInputPrm = new serviceInputPrm();
      svInputPrm.WorkerName = 'ALTqOtherEmailSMS';
      svInputPrm.ServiceName = 'ALTqOtherEmailSMS_0880_3';
      svInputPrm.ClientSentTime = '0';
      svInputPrm.Operation = 'Q';
      svInputPrm.InVal = [this.actn_curr];
      svInputPrm.TotInVal = svInputPrm.InVal.length;
      this.getRegDataList_ReqTimeOut = setTimeout(this.solvingregDataer_TimeOut,
        functionList.reqTimeout, request_seq_comp);
      reqInfo.inputParam = svInputPrm.InVal;
      this.regDataListTemple = [];
      this.changeArr = [];
      this.setState({data: []});
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

  handleChangeCheck = (actTp, item) => {
    let data = this.state.data;
    const findIndex = data.findIndex(x => x.c0 === item.c0);
    if (findIndex >= 0) {
      const findChange = this.changeArr.indexOf(item.c0 + '' + actTp);
      if (findChange >= 0) {
        this.changeArr.splice(findChange, 1);
      } else {
        this.changeArr.push(item.c0 + '' + actTp);
      }
      data[findIndex][actTp === 1 ? 'c2' : 'c3'] = (item[actTp == 1 ? 'c2' : 'c3'] === 'Y' ? 'N' : 'Y');
      this.setState({data, updateDisable: this.changeArr.length === 0});
    }
  }

  handle_updateRegister = (reqInfoMap, message) => {
    clearTimeout(this.regDataList_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    this.regDataListFlag = false;
    const errmsg = message['Message'];
    this.setState({ regDataListFlag: false });
    reqInfoMap.procStat = 2;
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', 'chgLoginPass_oldCode', false, message['Code']); }
    } else {
      this.changeArr = [];
      this.setState({updateDisable: true});
      glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'success');
    }
  }

  updateRegister = () => {
    if (this.regDataListFlag || this.changeArr.length === 0 || this.state.data.length === 0) { return; }
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'activeAcnt', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, activeAcnt) => {
      const acntStr = activeAcnt;
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
  
      //14014~N~Y;14015~Y~N;14000~N~N;
      let i = 0, strInput = '';
      for (i = 0; i < this.state.data.length; i++) {
        strInput += this.state.data[i]['c0'] + '~' + this.state.data[i]['c2'] + '~' + this.state.data[i]['c3'] + ';';
      }
      this.regDataListFlag = true;
      this.setState({regDataListFlag: true});
      // -- call service for place order
      const request_seq_comp = this.get_rq_seq_comp()
      // -- push request to request hashmap handle_updateRegister
      const reqInfo = new requestInfo();
      reqInfo.reqFunct = this.regDataList_FunctNm;
      reqInfo.component = this.component;
      reqInfo.receiveFunct = this.handle_updateRegister
      // -- service info
      let svInputPrm = new serviceInputPrm();
      svInputPrm.WorkerName = 'ALTxOtherEmailSMS';
      svInputPrm.ServiceName = 'ALTxOtherEmailSMS_0880_3';
      svInputPrm.ClientSentTime = '0';
      svInputPrm.Operation = 'U';
      svInputPrm.InVal = [this.actn_curr, strInput];
      svInputPrm.TotInVal = svInputPrm.InVal.length;
      this.regDataList_ReqTimeOut = setTimeout(this.solvingregDataer_TimeOut,
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

  handle_resetRegister = (reqInfoMap, message) => {
    clearTimeout(this.resetData_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    this.resetDataFlag = false;
    const errmsg = message['Message'];
    this.setState({ resetDataFlag: false });
    reqInfoMap.procStat = 2;
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', 'chgLoginPass_oldCode', false, message['Code']); }
    } else {
      this.getRegDataList();
      glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'success');
    }
  }

  resetRegister = () => {
    if (this.resetDataFlag) { return; }
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'activeAcnt', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, activeAcnt) => {
      const acntStr = activeAcnt;

      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.resetDataFlag = true;
      this.setState({resetDataFlag: true});
      // -- call service for place order
      const request_seq_comp = this.get_rq_seq_comp()
      // -- push request to request hashmap handle_resetRegister
      const reqInfo = new requestInfo();
      reqInfo.reqFunct = this.resetData_FunctNm;
      reqInfo.component = this.component;
        reqInfo.receiveFunct = this.handle_resetRegister
      // -- service info
      let svInputPrm = new serviceInputPrm();
      svInputPrm.WorkerName = 'ALTxOtherEmailSMS';
      svInputPrm.ServiceName = 'ALTxOtherEmailSMS_0880_3';
      svInputPrm.ClientSentTime = '0';
      svInputPrm.Operation = 'D';
      svInputPrm.InVal = [this.actn_curr];
      svInputPrm.TotInVal = svInputPrm.InVal.length;
      this.resetData_ReqTimeOut = setTimeout(this.solvingregDataer_TimeOut,
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

  render() {
    const { t } = this.props;

    return (
      <div className='RegisterEmailSms__layout'>
        <div className="card">
          <div className="card-body widget-body">
            <div className="table-responsive" style={{maxHeight:'calc(100vh - 270px)', overflowY: 'auto'}}>
                <table className="tableNormal table tablenowrap table-bordered table-striped table_sticky">
                    <thead className="header">
                      <tr>
                        <th style={{ verticalAlign: 'middle', zIndex: 9 }} className="text-center">
                          {t('Loại giao dịch')}
                        </th>
                        <th style={{ verticalAlign: 'middle', zIndex: 9 }} className="text-center">
                          {t('Đăng ký nhận email')}
                        </th>
                        <th style={{ verticalAlign: 'middle', zIndex: 9 }} className="text-center">
                          {t('Đăng ký nhận sms')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.data.map(item =>
                        <tr key={item.c0}>
                          <td className="text-left" style={{ verticalAlign: 'middle' }}>
                            {item.c1}
                          </td>
                          <td className="text-center" style={{ verticalAlign: 'middle' }}>
                            <div className="form-group" style={{margin: '5px 0 2px 0'}}>
                              <div className="col-sm-12 text-center">
                                <input 
                                  id={item.c0 + 'c2'}
                                  style={{position: 'unset'}}
                                  className="styled-checkbox"
                                  type="checkbox" 
                                  disabled={item.c2 == '0'}
                                  defaultChecked={(item.c2 === 'Y' || item.c2 === '0') ? true : false}
                                  onClick={() => this.handleChangeCheck(1, item)}
                                />
                                <label htmlFor={item.c0 + 'c2'}>{''}</label>
                              </div>
                            </div>
                          </td>
                          <td className="text-center" style={{ verticalAlign: 'middle' }}>
                            <div className="form-group" style={{margin: '5px 0 2px 0'}}>
                              <div className="col-sm-12 text-center">
                                <input 
                                  id={item.c0 + 'c3'}
                                  style={{position: 'unset'}}
                                  className="styled-checkbox"
                                  type="checkbox" 
                                  disabled={item.c3 == '0'}
                                  defaultChecked={(item.c3 === 'Y' || item.c3 === '0') ? true : false}
                                  onClick={() => this.handleChangeCheck(2, item)}
                                />
                                <label htmlFor={item.c0 + 'c3'}>{''}</label>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                </table>
            </div>
          </div>

          <div className="card-footer">
            <div className="form-group row">
                <div className='col-sm-6'>
                  <button id='btnPrevious' className="btn btn-pill btn-cancel previous col" onClick={this.resetRegister} >
                  {!this.state.resetDataFlag ? <span>{t('default_config')} &nbsp;<i className="fa fa-dot-circle-o" /></span> : <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span>}
                  </button>
                </div>
                <div className='col-sm-6'>
                  <button id='buttonRgtBuy' className="btn btn-pill btn-wizard col" 
                    disabled={this.state.updateDisable}
                    onClick={this.updateRegister}>
                    {!this.state.regDataListFlag ? <span>{t('common_update')} &nbsp;<i className="fa fa-check" /></span> : <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span>}
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div>
    )
  }
}

export default translate('translations')(RegisterEmailSms);