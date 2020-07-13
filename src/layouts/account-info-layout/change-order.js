import React, { PureComponent } from 'react'
import { translate } from 'react-i18next'
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import Input from "../../conponents/basic/input/Input";
import { toast } from 'react-toastify'
import ReactIsCapsLockActive from '@matsun/reactiscapslockactive'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import commuChanel from '../../constants/commChanel'
import {checkToast} from '../../utils/check_toast'
import {focusELM} from '../../utils/focus_elm'
import functionList from '../../constants/functionList';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip } from 'reactstrap';
import components from '../../constants/components'

const remote = require('electron').remote;

class ChangeOrder extends PureComponent {
    constructor(props) {
        super(props)
        this.request_seq_comp = 0
        this.component = components.change_order
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
        })}
        this.state = {
            chgOrdPass: {
                acntNo: '',
                oldCode: '',
                oldCode_require: false,
                newCode: '',
                newCode_require: false,
                newCodeCfm: '',
                newCodeCfm_require: false,
                change_order: this.props.open
            },
            chgOrdPassFlag: false,

            name: this.props.name,
            language: this.props.language,
            themePage: this.props.themePage,
            style: this.props.style
        }
    }

    popin_window() {
        const current_window = remote.getCurrentWindow();
        window.ipcRenderer.send(commuChanel.popin_window, {state: this.state, component: this.component})
        current_window.close();
    }
    
    // -- change order password
    chgOrdPassFlag = false
    chgOrdPass_FunctNm = 'ACCOUNTINFOSCR_003'
    

    componentWillMount() {
        setTimeout(() => {
            const elm = document.getElementById('chgOrdPass_oldCode')
            if (elm) elm.focus()
        }, 200)

        window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
            // update state after popout window
            this.setState(agrs.state)
            this.setState({
                parent_id: agrs.parent_id,
                config: agrs.config,
               
            })
            change_theme(agrs.state.themePage)
            change_language(agrs.state.language, this.props)
            
        })
        
        window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
            // update state after popin window
            this.setState(agrs.state)
    
        })
    }

    componentDidMount() {
        this.chgOrdPass = this.state.chgOrdPass

        this.loadData()

        
        window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
            const msg = { type: commuChanel.ACTION_SUCCUSS , component:this.component}
            inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
        })

        window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
            change_theme(agrs);
            this.setState({themePage: agrs})
        })
    
        window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
        change_language(agrs, this.props);
        this.setState({language: agrs})
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
        reply_send_req(agrs, this.req_component)
        })
    }

    componentWillUnmount() {
        // this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
        this.request_seq_comp = 0
        if (this.chgOrdPassFunct_ReqTimeOut) {
            clearTimeout(this.chgOrdPassFunct_ReqTimeOut)
        }
    }

    loadData() {
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: 'objShareGlb', sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, objShareGlb) => {
            // update session for popout windows
            glb_sv.objShareGlb = objShareGlb
            
            this.chgOrdPass['acntNo'] = objShareGlb['AcntMain']

            this.setState(prevState => ({
                
                chgOrdPass: {
                    ...prevState.chgOrdPass,
                    acntNo: this.chgOrdPass.acntNo,
                },
            }))
        })
        
    }

    

    solvingaccountInfo_TimeOut = cltSeq => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) {
            return
        }
        // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq)
        const reqIfMap = this.req_component.get(cltSeq)
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
            return
        }
        const timeResult = new Date()
        reqIfMap.resTime = timeResult
        reqIfMap.procStat = 4
        // glb_sv.setReqInfoMapValue(cltSeq, reqIfMap)
        this.req_component.set(cltSeq, reqIfMap)
        if (reqIfMap.reqFunct === this.chgOrdPass_FunctNm) {
            this.chgOrdPassFlag = false
            this.setState({ chgOrdPassFlag: false })
        }
        glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', '', '', false, '', this.component)
    }

    handle_changeOrderPass = (reqInfoMap, message) => {
        console.log(reqInfoMap, message)
        clearTimeout(this.chgOrdPassFunct_ReqTimeOut)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        // -- process after get result --
        this.chgOrdPassFlag = false
        this.setState({ chgOrdPassFlag: false })
        reqInfoMap.procStat = 2
        if (Number(message['Result']) === 0) {
            reqInfoMap.resSucc = false
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', 'chgOrdPass_oldCode', false, message['Code'], this.component)
            }
        } else {
            glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', '', '', message['Code'], this.component)
            const obj = {
                type: commuChanel.ACTION_SUCCUSS,
                component: this.component
            }
            inform_broadcast(commuChanel.ACTION_SUCCUSS, obj)
            this.props.close_modal_change_order()
        }
        
    }

    
    changeOrderPass = () => {
        if (this.chgOrdPassFlag) {
            return
        }
        
        let curr_pass, new_pass, new_pass_cfm
        curr_pass = this.chgOrdPass['oldCode']
        new_pass = this.chgOrdPass['newCode']
        new_pass_cfm = this.chgOrdPass['newCodeCfm']
        console.log('chgOrdPass_oldCode', curr_pass, new_pass, new_pass_cfm)
        if (curr_pass === null || curr_pass === undefined || curr_pass.length < 4) {
            focusELM('chgOrdPass_oldCode')
            glb_sv.checkToast(toast, 'warn', this.props.t('ord_pass_length'), 'orderpass_curpass')
            return
        }
        if (new_pass === null || new_pass === undefined || new_pass.length < 4) {
            focusELM('chgOrdPass_newCode')
            glb_sv.checkToast(toast, 'warn', this.props.t('ord_pass_length'), 'orderpass_newpass')
            return
        }
        if (new_pass_cfm === null || new_pass_cfm === undefined || new_pass_cfm.length < 4) {
            focusELM('chgOrdPass_newCodeCfm')
            glb_sv.checkToast(toast, 'warn', this.props.t('ord_pass_length'), 'orderpass_cfmnewpass')
            return
        }
        if (new_pass_cfm !== new_pass) {
            console.log(new_pass_cfm, new_pass)
            focusELM('chgOrdPass_newCodeCfm')
            glb_sv.checkToast(toast, 'warn', this.props.t('ord_pass_length'), 'pass_confirm_not_correct')
            return
        }

        this.chgOrdPassFlag = true
        this.setState({ chgOrdPassFlag: true })
        // -- call service for place order
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.chgOrdPass_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.handle_changeOrderPass
        // -- service info
        let svInputPrm = new serviceInputPrm()
        svInputPrm.WorkerName = 'ALTxAccount'
        svInputPrm.ServiceName = 'ALTxAccount_0102_1'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'U'
        svInputPrm.InVal = [this.chgOrdPass['acntNo'], curr_pass.trim(), new_pass.trim()]
        svInputPrm.InCrpt = [1, 2]
        svInputPrm.TotInVal = svInputPrm.InVal.length
        this.chgOrdPassFunct_ReqTimeOut = setTimeout(this.solvingaccountInfo_TimeOut, functionList.reqTimeout, request_seq_comp)
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

    handleChangeInput = e => {
        const name = e.target.name
        const value = e.target.value
        
        if (name === 'chgOrdPass_oldCode') {
            // change state order pass
            this.chgOrdPass.oldCode = value
            this.setState(prevState => ({
                chgOrdPass: {
                    ...prevState.chgOrdPass,
                    oldCode: value,
                },
            }))
        } else if (name === 'chgOrdPass_newCode') {
            this.chgOrdPass.newCode = value
            this.setState(prevState => ({
                chgOrdPass: {
                    ...prevState.chgOrdPass,
                    newCode: value,
                },
            }))
        } else if (name === 'chgOrdPass_newCodeCfm') {
            this.chgOrdPass.newCodeCfm = value
            this.setState(prevState => ({
                chgOrdPass: {
                    ...prevState.chgOrdPass,
                    newCodeCfm: value,
                },
            }))
        }
    }

    handleKeyPress = (e) => {
        const code = (e.keyCode ? e.keyCode : e.which);
        const name = e.target.name;
        if (name === 'chgOrdPass_oldCode') {
            if(code === 13) {
                glb_sv.focusELM('chgOrdPass_newCode')
            }
        }
        if (name === 'chgOrdPass_newCode') {
            if (code === 13) {
               glb_sv.focusELM('chgOrdPass_newCodeCfm')
            }
            // if (code === 27) {
            //     this.closeModifyFvlModal();
            // }
        }
        if (name === 'chgOrdPass_newCodeCfm') {
            if (code === 13) {
                this.changeOrderPass()
            }
            // if (code === 27) {
            //     this.closeAddNewModal();
            // }
        }
    }

    toggleModal = () => {
        console.log('this.login_SendReqFlag', this.login_SendReqFlag)
        if (this.chgOrdPassFlag) return;
        glb_sv.commonEvent.next({ type: glb_sv.HIDE_MODAL_LOGIN })
    }

    render() {
        const { t } = this.props
        console.log('change-password', this.props.open)
        return (
            <Modal isOpen={true} size={'sm change_order'} toggle={this.toggleModal}>
                <ModalHeader>{t('common_change_order_pass')}</ModalHeader>
            <ModalBody>
            <div className="change-password">
                {/* Đổi mật khẩu đặt lệnh */}
                    <React.Fragment>
                        <div className="card" id="modal_change_order_pass">
                            <div className="card-body">
                                <div className="form-group row">
                                    <label className="col-sm-5 control-label no-padding-right text-left">
                                        {t('account_number')}
                                    </label>
                                    <div className="col-sm-7">
                                        <span className="form-control form-control-sm">
                                            {this.state.chgOrdPass['acntNo']}
                                        </span>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-sm-5 col-sm control-label no-padding-right text-left">
                                        {t('login_pass_curr')} <span className="mustInput">*</span>
                                    </label>
                                    <div className="col-sm-7 input-group input-group-sm">
                                        <Input
                                            inputtype={'password'}
                                            name={'chgOrdPass_oldCode'}
                                            value={this.state.chgOrdPass['oldCode']}
                                            onChange={this.handleChangeInput}
                                            // onBlur={this.validateInput}
                                            classextend={'form-control-sm text-left passwordField'}
                                            maxLength={30}
                                            onKeyDown={this.handleKeyPress}
                                        />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-sm-5 control-label no-padding-right text-left">
                                        {t('login_pass_new')} <span className="mustInput">*</span>
                                    </label>
                                    <div className="col-sm-7 input-group input-group-sm">
                                        <Input
                                            inputtype={'password'}
                                            name={'chgOrdPass_newCode'}
                                            value={this.state.chgOrdPass['newCode']}
                                            onChange={this.handleChangeInput}
                                            // onBlur={this.validateInput}
                                            classextend={'form-control-sm text-left passwordField'}
                                            maxLength={30}
                                            onKeyDown={this.handleKeyPress}
                                        />
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label className="col-sm-5 control-label no-padding-right text-left">
                                        {t('login_pass_new_cfm')} <span className="mustInput">*</span>
                                    </label>
                                    <div className="col-sm-7 input-group input-group-sm">
                                        <Input
                                            inputtype={'password'}
                                            name={'chgOrdPass_newCodeCfm'}
                                            value={this.state.chgOrdPass.newCodeCfm}
                                            onChange={this.handleChangeInput}
                                            // onBlur={this.validateInput}
                                            classextend={'form-control-sm text-left passwordField'}
                                            maxLength={30}
                                            onKeyDown={this.handleKeyPress}
                                        />
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <div className="col-12 text-button" style={{ fontSize: 12 }}>
                                        {t('password_rule')}
                                    </div>
                                    <ReactIsCapsLockActive>
                                        {active =>
                                            active && (
                                                <div
                                                    id="password-caps-warning-ord"
                                                    className="col-12 text-button"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    {t('caps_lock_enabled')}
                                                </div>
                                            )
                                        }
                                    </ReactIsCapsLockActive>
                                </div>
                            </div>
                        </div>
                        <div style={{ paddingBottom: 15 }}>
                            <div className="col-sm-12">
                                <button
                                    className="btn btn-pill btn-wizard col"
                                    onClick={() => this.changeOrderPass()}
                                    style={{ marginLeft: 0 }}
                                >
                                    {!this.state.chgOrdPassFlag ? (
                                        <span>{t('common_button_change_pass')}</span>
                                    ) : (
                                        <span>
                                            {t('common_processing')}
                                            <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </React.Fragment>
            
            </div>
            </ModalBody>
            </Modal>
        )
    }
}

export default translate('translations')(ChangeOrder)
