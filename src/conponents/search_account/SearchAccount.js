import React from 'react'
import { translate } from 'react-i18next';
import Select from 'react-select';
import commuChanel from '../../constants/commChanel'
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import socket_sv from '../../utils/globalSv/service/socket_service';
import glb_sv from '../../utils/globalSv/service/global_service';
import functionList from '../../constants/functionList';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';
import { inform_broadcast } from '../../utils/broadcast_service';
import SelectBasic from "../basic/selectBasic/SelectBasic";

class SearchAccount extends React.PureComponent {
  constructor(props) {
    super(props);
    this.component = this.props.component;
    this.get_rq_seq_comp = this.props.get_rq_seq_comp;
    this.req_component = this.props.req_component;
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq;
    this.state = {
      listAccountBroker: [],
      isBroker: false,
      acnt: {},
      acntFull: [],
      isSynce: false,
      accountBroker: {},
      acntItems: [],
      acntNo: ''
    };
    if (this.props.node) {
      this.props.node.setEventListener("close", (p) => {
        window.ipcRenderer.removeAllListeners(`${commuChanel.FLAG_SYNCE_ACCOUNT}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_ACT}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.SYNCE_ACCOUNT_BROKER}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.AFTER_OTP}_${this.component}`)
      })
    };
    this.firstTime = true;
  }

  componentDidMount() {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
      this.objShareGlb = args.get('objShareGlb');
      this.activeAcnt = args.get('activeAcnt');
      if (this.props.isShowDetail) {
        this.acntItems = this.objShareGlb['acntNoList'];
        this.setState({ acntItems: this.acntItems });

        let acntNo = '';
        if (this.activeAcnt && this.activeAcnt !== '' && this.activeAcnt.substr(11) !== '%') {
          acntNo = this.activeAcnt;
        } else {
          acntNo = this.acntItems[0]['id'];
        }
        this.setState({ acntNo });
      }
      this.isSynceAccount = args.get('isSynceAccount');
      this.listAccountBroker = args.get('listAccountBroker');
      if (this.objShareGlb.isBroker) {
        if (this.isSynceAccount) {
          const accountBroker = this.listAccountBroker.find(e => e.value === this.activeAcnt) || {};
          this.setState({ listAccountBroker: this.listAccountBroker, accountBroker });
          if (this.activeAcnt) this.props.handleChangeAccount(accountBroker);
        }
      } else this.loadData();
      this.setState({ isBroker: this.objShareGlb.isBroker, isSynce: this.isSynceAccount });
    });
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['objShareGlb', 'activeAcnt', 'isSynceAccount', 'listAccountBroker'], sq: sq });

    window.ipcRenderer.on(`${commuChanel.FLAG_SYNCE_ACCOUNT}_${this.component}`, (event, args) => {
      this.isSynceAccount = args.isSynceAccount;
      this.activeAcnt = args.activeAcnt;
      this.objShareGlb = args.objShareGlb;
      this.setState({ isSynce: this.isSynceAccount });
      this.loadData();
    });
    window.ipcRenderer.on(`${commuChanel.CHANGE_ACT}_${this.component}`, (event, msg) => {
      const _sq = this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['activeAcnt', 'objShareGlb'], sq: _sq })
      window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${_sq}`, (event, agrs) => {
        if (this.isSynceAccount) {
          this.activeAcnt = agrs.get('activeAcnt');
          this.objShareGlb = agrs.get('objShareGlb');
          this.loadData();
        }
      })
    });
    window.ipcRenderer.on(`${commuChanel.SYNCE_ACCOUNT_BROKER}_${this.component}`, (event, args) => {
      if (this.isSynceAccount) {
        this.activeAcnt = args.activeAcnt;
        this.listAccountBroker = args.listAccountBroker;
        const accountBroker = this.listAccountBroker.find(e => e.value === this.activeAcnt) || {};
        this.setState({ listAccountBroker: this.listAccountBroker, accountBroker });
      }
    });
    window.ipcRenderer.on(`${commuChanel.AFTER_OTP}_${this.component}`, (event, agrs) => {
      this.objShareGlb = agrs.objShareGlb;
    })
  }

  handleChangeAccount = (accountBroker) => {
    this.props.handleChangeAccount(accountBroker);
    this.setState({ accountBroker });
    this.activeAcnt = accountBroker.value;
    this.listAccountBroker = this.state.listAccountBroker;
    update_value_for_glb_sv({ component: this.component, key: 'activeAcnt', value: this.activeAcnt });
    update_value_for_glb_sv({ component: this.component, key: 'listAccountBroker', value: this.listAccountBroker });
    inform_broadcast(commuChanel.SYNCE_ACCOUNT_BROKER, { activeAcnt: this.activeAcnt, listAccountBroker: this.listAccountBroker });
  }

  searchAccount = (search = '') => {
    if (!search || !search.trim().length || search.length < 10) {
      return;
    }
    const request_seq_comp = this.get_rq_seq_comp()
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = 'searchAccount_FunctNm';
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_searchAccount
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqAccount01';
    svInputPrm.ServiceName = 'ALTqAccount01_OnlineLogin_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = [this.objShareGlb['userInfo'].c0, search.toUpperCase().trim()];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.searchAccount_ReqTimeOut = setTimeout(this.solvingPiaFunct_TimeOut,
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

  handle_searchAccount = (reqInfoMap, message) => {
    clearTimeout(this.searchAccount_ReqTimeOut);
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
      }
      return;
    } else {
      let dataArr = [];
      try {
        let strdata = message['Data'];
        dataArr = strdata === '' ? [] : JSON.parse(strdata);
      } catch (error) {
        return;
      }
      const listAccountBroker = dataArr.map(e => {
        return {
          ...e,
          value: e.c0 + '.' + e.c1,
          label: e.c0 + '.' + e.c1 + ' - ' + e.c2
        }
      });
      this.setState({ listAccountBroker, isLoading: false });
    }
  }

  solvingPiaFunct_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    this.setState({ refreshFlag: '' });
    if (reqIfMap.reqFunct === this.searchAccount_FunctNm)
      glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', '', '', false, '', this.component);
  }

  transMarLeft(length) {
    let left = 9
    if (length === 1) left = 12
    else if (length === 2) left = 19
    return left
  }

  transCol(length) {
    let _class = 'col-8'
    if (length === 1) _class = 'col-10'
    else if (length === 2) _class = 'col-9'
    // else if (length === 3) _class = 'col-sm-5'
    return _class
  }

  loadData = () => {
    this.acntItems = this.objShareGlb['acntNoList']
    this.acntItemsNosTemp = this.objShareGlb['acntNoInfo'].map(item => {
      const AcntNo = item.AcntNo
      const AcntNm = item.AcntNm
      const subNo = []
      return { AcntNo, AcntNm, subNo }
    })
    this.objShareGlb['acntNoInfo'].forEach(item => {
      for (let tem of this.acntItemsNosTemp) {
        if (tem.AcntNo === item.AcntNo) {
          tem.subNo.push(item.SubNo)
        }
      }
      return { item }
    })
    this.acntItemsNos = this.acntItemsNosTemp.reduce((unique, o) => {
      if (!unique.some(obj => obj.AcntNo === o.AcntNo)) {
        unique.push(o)
      }
      return unique
    }, [])

    const acntStr = this.objShareGlb['AcntMain'] + '.00'
    const mainAct = this.acntItems.filter(item => {
      return item['id'] === acntStr
    })
    this.acntNo = this.activeAcnt || mainAct[0]['id'];
    const acnt = this.acntItemsNos.find(item => item.AcntNo === this.objShareGlb['AcntMain']);
    this.acnt = acnt
    this.setState({
      acntNo: this.acntNo,
      acnt: acnt ? acnt : {},
    }, () => {
      const allAct = document.getElementsByClassName(this.component + 'ord_subno')
      for (let i = 0; i < allAct.length; i++) {
        if (allAct[i].classList.contains('active')) allAct[i].classList.remove('active')
      }
      if (this.activeAcnt) {
        this.props.handleChangeAccount({ value: this.activeAcnt, label: this.activeAcnt + ' - ' + acnt.AcntNm });
        const subNos = this.activeAcnt.split('.');
        const subno = subNos[1]
        const el = document.getElementById(this.component + 'ord_subno_' + subno);
        if (el) el.classList.add('active');
      } else {
        const el = document.getElementById(this.component + 'ord_subno_00')
        if (el) el.classList.add('active')
      }
    })
    this.setState({ acntItems: this.objShareGlb['acntNoList'], acntFull: this.acntItemsNos })
  }

  handleChangeAcnt = e => {
    const el = document.getElementById(this.component + 'ord_subno_00');
    const allAct = document.getElementsByClassName(this.component + 'ord_subno')
    for (let i = 0; i < allAct.length; i++) {
      if (allAct[i] && allAct[i].classList.contains('active')) allAct[i].classList.remove('active')
    }
    const acnt = JSON.parse(e.target.value)
    this.acnt = acnt
    this.setState({ acnt },
      () => {
        if (el) el.classList.add('active')
        this.acntNo = this.state.acnt.AcntNo + '.00';
        this.activeAcnt = this.state.acnt.AcntNo + '.00';
        this.objShareGlb['AcntMain'] = this.state.acnt.AcntNo;

        this.setState({ acntNo: this.acntNo });
        update_value_for_glb_sv({ component: this.component, key: 'activeAcnt', value: this.activeAcnt });
        update_value_for_glb_sv({ component: this.component, key: 'objShareGlb', value: this.objShareGlb });
        inform_broadcast(commuChanel.CHANGE_ACT, this.activeAcnt);
        this.props.handleChangeAccount({ value: this.activeAcnt, label: this.activeAcnt + ' - ' + acnt.AcntNm });
      });
  }

  onChangeBtAcnt = e => {
    e.persist()
    const el = e.target;
    if (el) {
      const value = e.target.name
      if (this.activeAcnt === this.state.acnt.AcntNo + '.' + value) return;
      const allAct = document.getElementsByClassName(this.component + "ord_subno")
      for (let i = 0; i < allAct.length; i++) {
        if (allAct[i].classList.contains('active')) allAct[i].classList.remove('active')
      }
      el.classList.add('active')

      this.acntNo = this.state.acnt.AcntNo + '.' + value
      this.activeAcnt = this.state.acnt.AcntNo + '.' + value;
      this.setState({ acntNo: this.acntNo })
      update_value_for_glb_sv({ component: this.component, key: 'activeAcnt', value: this.activeAcnt });
      inform_broadcast(commuChanel.CHANGE_ACT, this.activeAcnt);
      this.props.handleChangeAccount({ value: this.activeAcnt, label: this.activeAcnt + ' - ' + this.state.acnt.AcntNm });
    }
  }

  changAcntNo = (e) => {
    const acntNo = e.target.value;
    this.setState({ acntNo });
    this.activeAcnt = acntNo;
    update_value_for_glb_sv({ component: this.component, key: 'activeAcnt', value: this.activeAcnt });
    inform_broadcast(commuChanel.CHANGE_ACT, this.activeAcnt);
    const label = this.state.acntItems.find(e => e.id === acntNo);
    this.props.handleChangeAccount({ value: this.activeAcnt, label });
  }

  handleSyncAccount = () => {
    if (this.isSynceAccount) {
      this.isSynceAccount = false;
      this.setState({ isSynce: false });
    } else {
      this.isSynceAccount = true;
      this.setState({ isSynce: true });
    }
    update_value_for_glb_sv({ component: this.component, key: 'isSynceAccount', value: this.isSynceAccount });
    inform_broadcast(commuChanel.FLAG_SYNCE_ACCOUNT, { isSynceAccount: this.isSynceAccount, activeAcnt: this.activeAcnt, objShareGlb: this.objShareGlb });
  }

  render() {
    const { t } = this.props;
    const SubNo = this.state.acnt && this.state.acnt.subNo ? this.state.acnt.subNo : [];
    if (this.props.isShowDetail) {
      return (<div className="flex flex-1">
        <SelectBasic
          value={this.state.acntNo}
          options={this.state.acntItems}
          onChange={this.changAcntNo}
          classextend={'form-control-sm'}
          disabled={this.props.disabledAct}
        />
        {/* <div title={t('synce_act_all_screen')} className="no-padding cursor_ponter" style={{ marginLeft: 10, marginTop: 7, width: 22 }} onClick={this.handleSyncAccount}>
          <i className={!this.state.isSynce ? "fa fa-unlink" : "fa fa-link"} aria-hidden="true" style={{ fontSize: '1.5rem', color: this.state.isSynce ? '#17a290' : '#ff9800' }}></i>
        </div> */}
      </div>)
    }
    return (
      <>
        {this.state.isBroker ? <>
          <div className='col-sm no-padding-left no-padding-right' style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
            <Select
              options={this.state.listAccountBroker}
              onInputChange={this.searchAccount}
              value={this.state.accountBroker}
              onChange={(option) => this.handleChangeAccount(option)}
              styles={{
                option: base => ({
                  ...base,
                  height: 30,
                  padding: '5px 12px'
                }),
                control: base => ({
                  ...base,
                  height: 30,
                  minHeight: 30,
                  border: '0px solid',
                  backgroundColor: this.props.style[this.props.themePage].placeOrder.background_search,
                }),
                menuList: base => ({
                  ...base,
                  maxHeight: 300,
                  whiteSpace: 'nowrap',
                  overflowX: 'hidden',
                  zIndex: 3,
                  backgroundColor: this.props.style[this.props.themePage].sideBar.background_menuList,
                  color: this.props.style[this.props.themePage].sideBar.colorSearch,
                  fontFamily: 'monospace'
                }),
                menu: base => ({
                  ...base,
                }),
                indicatorSeparator: base => ({
                  ...base,
                  height: 15,
                  marginTop: 6,
                  display: 'none'
                }),
                dropdownIndicator: base => ({
                  ...base,
                  padding: 4,
                  marginTop: -3,
                  display: 'none'
                }),
                container: base => ({
                  ...base,
                  zIndex: 99,
                  width: 'calc(100% - 30px)'
                }),
                placeholder: base => ({
                  ...base,
                  whiteSpace: 'nowrap',
                  top: '65%',
                  color: this.props.style[this.props.themePage].sideBar.color_placehoder_search
                }),
                singleValue: base => ({
                  ...base,
                  marginLeft: 0,
                  color: this.props.style[this.props.themePage].sideBar.colorSearch,
                  top: '60%'
                }),
                valueContainer: base => ({
                  ...base,
                  color: this.props.style[this.props.themePage].sideBar.colorSearch,
                  padding: '0px 6px'
                }),
                input: base => ({
                  ...base,
                  color: this.props.style[this.props.themePage].sideBar.colorSearch,
                  paddingTop: 4
                })
              }}
              placeholder={t('Chọn tài khoản')}
              theme={(theme) => ({
                ...theme,
                color: '',
                colors: {
                  ...theme.colors,
                  text: '',
                  primary25: this.props.style[this.props.themePage].sideBar.background_hover_search,
                  neutral0: this.props.style[this.props.themePage].sideBar.background_search,
                }
              })} />
          </div>
        </> : <div className="flex" style={{ flex: 1 }}>
            <div 
              style={{ marginRight: this.props.isShowSubno ? 5 : 0}}
              className={'fix-width no-padding-right no-padding-left ' + (this.props.isShowSubno ? this.transCol(SubNo.length) : ' col')}>
              <select
                value={JSON.stringify(this.state.acnt)}
                onChange={this.handleChangeAcnt}
                className="form-control form-control-sm"
              >
                {this.state.acntFull.map((item, index) => (
                  <option key={index + 'acnt'} value={JSON.stringify(item)}>
                    {item.AcntNo + ' - ' + item.AcntNm}
                  </option>
                ))}
              </select>
            </div>
            {this.props.isShowSubno && <div className="col no-padding flex no-margin-right no-margin-left">
              <div
                className="btn-group minscroll-place-order"
                role="group"
                style={{ overflow: 'auto', maxWidth: '130px' }}
              >
                {SubNo.map((item, index) => (
                  <button
                    key={index + 'ord_subno'}
                    type="button"
                    className={"btn btn-size btn-secondary form-control-sm " + this.component + "ord_subno"}
                    name={item}
                    id={this.component + 'ord_subno_' + item}
                    onClick={this.onChangeBtAcnt}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>}
          </div>}
      </>
    )
  }
}

export default translate('translations')(SearchAccount);