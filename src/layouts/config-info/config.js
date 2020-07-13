import React, { PureComponent } from 'react'
import { translate } from 'react-i18next'
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import Input from '../../conponents/basic/input/Input'

import functionList from '../../constants/functionList';
import commuChanel from '../../constants/commChanel'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';

const remote = require('electron').remote;

class ConfigInfo extends React.Component {
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
            checked: false,
            notifyList: [],
            chgRegisterNotifyFlag: false,
            expireTime: '30',
            shortkeyorder: 'O',
            shortkeyorderbook: 'B',
            singleSession: 'N',
            singleSessionNm: ' ',

            name: this.props.name,
            language: this.props.language,
            themePage: this.props.themePage,
            style: this.props.style,
        }
    }

    // -- get notify list --
    getNotifyListFlag = false
    getNotifyList_FunctNm = 'REGISTER_NOTIFY_001'
    getNotifyList_ReqTimeOut = {}
    registerNotifyListTemple = []
    // -- change register notify --
    chgRegisterNotifyFlag = false
    chgRegisterNotify_FunctNm = 'REGISTER_NOTIFY_002'
    chgRegisterNotify_ReqTimeOut = {}

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
            this.loadData()
        })
    
        window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
            // update state after popin window
            this.setState(agrs.state)
    
        })
      }

    componentDidMount() {
        if(this.props.node) {
            this.loadData()
            //-- set config info
            this.setState({
                expireTime: glb_sv.expTimeout || '30',
                shortkeyorder: glb_sv.shortKeyOrder || 'O',
                shortkeyorderbook: glb_sv.shortKeyOrderBook || 'B',
            })
        }

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
            this.loadData()
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
        if (this.getNotifyList_ReqTimeOut) {
            clearTimeout(this.getNotifyList_ReqTimeOut)
        }
        if (this.chgRegisterNotify_ReqTimeOut) {
            clearTimeout(this.chgRegisterNotify_ReqTimeOut)
        }
        
    }

    handle_loadData = (reqInfoMap, message) => {
        clearTimeout(this.getNotifyList_ReqTimeOut)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            this.getNotifyListFlag = false
            reqInfoMap.resSucc = false
            return
        } else {
            reqInfoMap.procStat = 1
            let jsondata
            try {
                jsondata = JSON.parse(message['Data'])
            } catch (err) {
                jsondata = []
            }
            this.registerNotifyListTemple = this.registerNotifyListTemple.concat(jsondata)
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2
                this.getNotifyListFlag = false
                glb_sv.toastYN = this.registerNotifyListTemple
                this.setState({ notifyList: this.registerNotifyListTemple })
                if (this.registerNotifyListTemple.length > 0) {
                    let obj = this.registerNotifyListTemple.find(obj => obj.c1.toUpperCase() === 'SSS')
                    if (obj) {
                        this.setState({ singleSession: obj.c3, singleSessionNm: obj.c2 })
                    }
                }
            }
        }
    }

    loadData() {
        if (this.getNotifyListFlag) {
            return
        }
        
        this.getNotifyListFlag = true
        // -- call service for place order
        const request_seq_comp = this.get_rq_seq_comp()
        // -- push request to request hashmap handle_loadData
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.getNotifyList_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.handle_loadData
        // -- service info
        let svInputPrm = new serviceInputPrm()
        svInputPrm.WorkerName = 'ALTqCommon01'
        svInputPrm.ServiceName = 'ALTqCommon01_NotifyMgt'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['3']
        svInputPrm.TotInVal = svInputPrm.InVal.length
        this.getNotifyList_ReqTimeOut = setTimeout(this.solvingRequestInfo_TimeOut, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal
        this.registerNotifyListTemple = []
        this.setState({ singleSession: 'N', singleSessionNm: ' ' })
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


    solvingRequestInfo_TimeOut = cltSeq => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) {
            return
        }
        const reqIfMap = this.req_component.get(cltSeq)
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
            return
        }
        const timeResult = new Date()
        reqIfMap.resTime = timeResult
        reqIfMap.procStat = 4
        this.req_component.set(cltSeq, reqIfMap)
        if (reqIfMap.reqFunct === this.chgRegisterNotify_FunctNm) {
            this.chgRegisterNotifyFlag = false
            this.setState({ chgRegisterNotifyFlag: false })
        } else if (reqIfMap.reqFunct === this.getNotifyList_FunctNm) {
            this.getNotifyListFlag = false
        }
        glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', '')
    }

    handle_updateRegisterNotify = (reqInfoMap, message) => {
        clearTimeout(this.chgRegisterNotify_ReqTimeOut)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        // -- process after get result --
        this.chgRegisterNotifyFlag = false
        this.setState({ chgRegisterNotifyFlag: false })
        reqInfoMap.procStat = 2
        if (Number(message['Result']) === 0) {
            reqInfoMap.resSucc = false
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal(
                    '',
                    'common_InfoMessage',
                    message['Message'],
                    '',
                    'danger',
                    'chgLoginPass_oldCode',
                    false,
                    message['Code']
                )
            }
        } else {
            glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success')
            localStorage.setItem('expTimeoutLocal', this.state.expireTime)
            localStorage.setItem('shortKeyOrder', this.state.shortkeyorder)
            localStorage.setItem('shortKeyOrderBook', this.state.shortkeyorderbook)
            glb_sv.expTimeout = this.state.expireTime
            glb_sv.shortKeyOrder = this.state.shortkeyorder
            glb_sv.shortKeyOrderBook = this.state.shortkeyorderbook
            //-- xét lại cấu hình nhận notify -----
            glb_sv.toastYN = this.state.notifyList
            const changConfig = { type: glb_sv.CHANGE_CONFIG_INFO }
            glb_sv.commonEvent.next(changConfig)
        }
    }

    updateRegisterNotify = () => {
        if (this.chgRegisterNotifyFlag) {
            return
        }
        //-- checking expire time, short key are validate or not
        if (isNaN(this.state.expireTime) || Number(this.state.expireTime) <= 0 || Number(this.state.expireTime) > 99) {
            const ermsg = 'expiry_time_must_be_between_1_and_99_minutes'
            glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning')
            const elm = document.getElementById('expireTime')
            if (elm) elm.focus()
            return
        }
        if (!this.state.shortkeyorder || this.state.shortkeyorder.trim() == '') {
            const ermsg = 'choose_a_character_to_set_a_quick_order_shortcut'
            glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning')
            const elm = document.getElementById('shortkeyorder')
            if (elm) elm.focus()
            return
        }
        if (!this.state.shortkeyorderbook || this.state.shortkeyorderbook.trim() == '') {
            const ermsg = 'choose_a_character_to_set_the_shortcut_to_open_a_quick_command_book'
            glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning')
            const elm = document.getElementById('shortkeyorderbook')
            if (elm) elm.focus()
            return
        }

        //-- get value to update --
        this.chgRegisterNotifyFlag = true
        this.setState({ chgRegisterNotifyFlag: true })
        // -- call service for place order
        const request_seq_comp = this.get_rq_seq_comp()
        // -- push request to request hashmap handle_updateRegisterNotify
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.chgRegisterNotify_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.handle_updateRegisterNotify
        // -- service info
        let findIndex = this.state.notifyList.findIndex(x => x.c1 === 'ORD')
        let ordFlag = 'Y'
        if (findIndex >= 0) {
            ordFlag = this.state.notifyList[findIndex]['c3']
        }
        findIndex = this.state.notifyList.findIndex(x => x.c1 === 'STK')
        let stkFlag = 'Y'
        if (findIndex >= 0) {
            stkFlag = this.state.notifyList[findIndex]['c3']
        }
        findIndex = this.state.notifyList.findIndex(x => x.c1 === 'CAS')
        let cashFlag = 'Y'
        if (findIndex >= 0) {
            cashFlag = this.state.notifyList[findIndex]['c3']
        }
        findIndex = this.state.notifyList.findIndex(x => x.c1 === 'FAV')
        let favFlag = 'Y'
        if (findIndex >= 0) {
            favFlag = this.state.notifyList[findIndex]['c3']
        }
        findIndex = this.state.notifyList.findIndex(x => x.c1 === 'MSS')
        let mssFlag = 'Y'
        if (findIndex >= 0) {
            mssFlag = this.state.notifyList[findIndex]['c3']
        }
        findIndex = this.state.notifyList.findIndex(x => x.c1 === 'OTH')
        let othFlag = 'Y'
        if (findIndex >= 0) {
            othFlag = this.state.notifyList[findIndex]['c3']
        }
        findIndex = this.state.notifyList.findIndex(x => x.c1 === 'SSS')
        let singleSssFlag = 'N'
        if (findIndex >= 0) {
            singleSssFlag = this.state.singleSession
        }
        let svInputPrm = new serviceInputPrm()
        svInputPrm.WorkerName = 'ALTxCommon01'
        svInputPrm.ServiceName = 'ALTxCommon01_NotifyMgt'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'U'
        svInputPrm.InVal = ['2', ordFlag, stkFlag, cashFlag, favFlag, mssFlag, othFlag, singleSssFlag]
        svInputPrm.TotInVal = svInputPrm.InVal.length
        this.getNotifyList_ReqTimeOut = setTimeout(this.chgRegisterNotify_ReqTimeOut, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal
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

    handleChangeCheck = item => {
        const notifyList = this.state.notifyList
        const findIndex = notifyList.findIndex(x => x.c1 === item.c1)
        if (findIndex >= 0) {
            notifyList[findIndex]['c3'] = item.c3 === 'Y' ? 'N' : 'Y'
        }
        this.setState({ notifyList: notifyList }, this.forceUpdate())
    }

    handleChangeExpireTime = e => {
        let value = glb_sv.filterNumber(e.target.value)
        if (e.target.value === '') value = ''
        this.setState({ expireTime: value + '' })
    }

    handleChangeShortkeyOrder = e => {
        let value = e.target.value
        if (!value) {
            value = ''
        } else {
            value = value.trim()
        }
        this.setState({ shortkeyorder: value.toUpperCase() })
    }

    handleChangeShortkeyOrderBook = e => {
        let value = e.target.value
        if (!value) {
            value = ''
        } else {
            value = value.trim()
        }
        this.setState({ shortkeyorderbook: value.toUpperCase() })
    }

    handleChangeSss = () => {
        this.setState({ singleSession: this.state.singleSession === 'Y' ? 'N' : 'Y' })
    }

    render() {
        const { t } = this.props
        return (
            <div className="ConfigInfo__layout">
                <div className="card" id="change_register_notify">
                    <div className="card-body">
                        <div className="form-group col-sm-12 form-title">
                            {t('rigister_to_receive_system_notifications')}
                        </div>
                        {this.state.notifyList.map(
                            item =>
                                item.c1 != 'SSS' && (
                                    <div className="form-group row" key={item.c1}>
                                        <div className="col-sm-12">
                                            <input
                                                className="styled-checkbox"
                                                id={item.c1 + '_ckbox'}
                                                type="checkbox"
                                                checked={item.c3 === 'Y' ? true : false}
                                                onChange={() => this.handleChangeCheck(item)}
                                            />
                                            <label htmlFor={item.c1 + '_ckbox'}>{item.c2}</label>
                                        </div>
                                    </div>
                                )
                        )}
                        <div className="form-group col-sm-12 form-title">{t('config_others_information')}</div>
                        <div className="form-group row">
                            <div className="col-sm-12">
                                <input
                                    className="styled-checkbox"
                                    id="single_ssesion_ckbox"
                                    type="checkbox"
                                    checked={this.state.singleSession === 'Y' ? true : false}
                                    onChange={() => this.handleChangeSss()}
                                />
                                <label htmlFor="single_ssesion_ckbox" style={{ fontSize: '14px' }}>
                                    {this.state.singleSessionNm}
                                </label>
                            </div>
                        </div>
                        <div className="form-group row">
                            <div className="col-sm-10">{t('time_to_expire_minutes')}</div>
                            <div className="col-sm-2">
                                <Input
                                    inputtype={'text'}
                                    name={'expireTime'}
                                    value={this.state.expireTime}
                                    onChange={this.handleChangeExpireTime}
                                    classextend={'form-control-sm text-right'}
                                    autoComplete="off"
                                    maxLength={2}
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <div className="col-sm-8">{t('shortcut_to_open_palce_order_quickly')}</div>
                            <label
                                className="col-sm-2 control-label no-padding-right text-right"
                                htmlFor="shortkeyorder"
                            >
                                Shift +
                            </label>
                            <div className="col-sm-2">
                                <Input
                                    inputtype={'text'}
                                    name={'shortkeyorder'}
                                    value={this.state.shortkeyorder}
                                    onChange={this.handleChangeShortkeyOrder}
                                    classextend={'form-control-sm text-center'}
                                    autoComplete="off"
                                    maxLength={1}
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <div className="col-sm-8">{t('shortcut_to_open_order_book_quickly')}</div>
                            <label
                                className="col-sm-2 control-label no-padding-right text-right"
                                htmlFor="shortkeyorderbook"
                            >
                                Shift +
                            </label>
                            <div className="col-sm-2">
                                <Input
                                    inputtype={'text'}
                                    name={'shortkeyorderbook'}
                                    value={this.state.shortkeyorderbook}
                                    onChange={this.handleChangeShortkeyOrderBook}
                                    classextend={'form-control-sm text-center'}
                                    autoComplete="off"
                                    maxLength={1}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12" style={{ paddingBottom: 15 }}>
                        <button
                            className="btn btn-pill btn-wizard col"
                            onClick={() => this.updateRegisterNotify()}
                            style={{ marginLeft: 0 }}
                        >
                            {!this.state.chgRegisterNotifyFlag ? (
                                <span>
                                    {t('common_update')} &nbsp;
                                    <i className="fa fa-check" />
                                </span>
                            ) : (
                                <span>
                                    {t('common_processing')}
                                    <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default translate('translations')(ConfigInfo)
