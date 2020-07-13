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

class ChangePass extends PureComponent {
    constructor(props) {
        super(props)
        this.request_seq_comp = 0
        this.component = components.change_login
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
            chgLoginPass: {
                userId: '',
                oldCode: '',
                oldCode_require: false,
                newCode: '',
                newCode_require: false,
                newCodeCfm: '',
                newCodeCfm_require: false,
            },
            chgLoginPassFlag: false,
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

    // -- change login password
    chgLoginPassFlag = false
    chgLoginPass_FunctNm = 'ACCOUNTINFOSCR_002'
    
    

    componentWillMount() {
        
        setTimeout(() => {
            const elm = document.getElementById('chgLoginPass_oldCode')
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
        this.chgLoginPass = this.state.chgLoginPass

        this.loadData()


        window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
            const msg = { type: commuChanel.ACTION_SUCCUSS , component:this.component}
            // glb_sv.commonEvent.next(msg)
            inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
        })

        window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
            change_theme(agrs)
            // glb_sv.themePage = agrs
            this.setState({themePage: agrs})
        })
    
        window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
        change_language(agrs, this.props)
        // glb_sv.language = agrs
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
        // console.log('this.req_component', agrs, this.req_component);
        reply_send_req(agrs, this.req_component)
        })
    }

    componentWillUnmount() {
        // this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
        this.request_seq_comp = 0
        if (this.chgLoginPassFunct_ReqTimeOut) {
            clearTimeout(this.chgLoginPassFunct_ReqTimeOut)
        }
        
        // const modal = document.querySelector('.wizard-modal')
        // modal.style.width = ''
    }

    loadData() {
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: 'objShareGlb', sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, objShareGlb) => {
            // update session for popout windows
            glb_sv.objShareGlb = objShareGlb

            this.chgLoginPass['userId'] = objShareGlb['sessionInfo']['userID']

            this.setState(prevState => ({
                chgLoginPass: {
                    ...prevState.chgLoginPass,
                    userId: this.chgLoginPass.userId,
                },
                
            }))
        })
        
    }

    solvingaccountInfo_TimeOut = cltSeq => {
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
        if (reqIfMap.reqFunct === this.chgLoginPass_FunctNm) {
            this.chgLoginPassFlag = false
            this.setState({ chgLoginPassFlag: false })
        } 
        glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', '', '', false, '', this.component)
    }

    handle_changeLoginPass = (reqInfoMap, message) => {
        clearTimeout(this.chgLoginPassFunct_ReqTimeOut)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        // -- process after get result --
        this.chgLoginPassFlag = false
        this.setState({ chgLoginPassFlag: false })
        reqInfoMap.procStat = 2
        if (Number(message['Result']) === 0) {
            reqInfoMap.resSucc = false
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', 'chgLoginPass_oldCode', false, message['Code'], this.component)
            }
        } else {
            glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', '', '', message['Code'], this.component)
            setTimeout(() => window.location.reload(), 3000)
            this.props.close_modal_change_pass()

        }
    }

    changeLoginPass = () => {
        if (this.chgLoginPassFlag) {
            return
        }

        let curr_pass, new_pass, new_pass_cfm
        curr_pass = this.chgLoginPass['oldCode']
        new_pass = this.chgLoginPass['newCode']
        new_pass_cfm = this.chgLoginPass['newCodeCfm']
        if (curr_pass === null || curr_pass === undefined || curr_pass.length < 6 || curr_pass.length > 30) {
            focusELM('chgLoginPass_oldCode')
            glb_sv.checkToast(toast, 'warn', this.props.t('login_pass_length'), 'loginpass_curpass')
            return
        }
        if (new_pass === null || new_pass === undefined || new_pass.length < 6 || new_pass.length > 30) {
            focusELM('chgLoginPass_newCode')
            glb_sv.checkToast(toast, 'warn', this.props.t('login_pass_length'), 'loginpass_newpass')
            return
        }
        if (
            new_pass_cfm === null ||
            new_pass_cfm === undefined ||
            new_pass_cfm.length < 6 ||
            new_pass_cfm.length > 30
        ) {
            focusELM('chgLoginPass_newCodeCfm')
            glb_sv.checkToast(toast, 'warn', this.props.t('login_pass_length'), 'loginpass_cfmnewpass')
            return
        }
        if (new_pass_cfm !== new_pass) {
            focusELM('chgLoginPass_newCodeCfm')
            // toast.warn(this.props.t('pass_confirm_notage','pass_confirm_not_correct','','warning','chgLoginPass_newCodeCfm');
            glb_sv.checkToast(toast, 'warn', this.props.t('pass_confirm_not_correct'), 'loginpass_newpass_cfmnewpass')
            return
        }

        this.chgLoginPassFlag = true
        this.setState({ chgLoginPassFlag: true })
        // -- call service for place order
        const request_seq_comp = this.get_rq_seq_comp()
        // -- push request to request hashmap
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.chgLoginPass_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.handle_changeLoginPass
        // -- service info
        let svInputPrm = new serviceInputPrm()
        svInputPrm.WorkerName = 'ALTxCommon'
        svInputPrm.ServiceName = 'ALTxCommon_ChangeInfo'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'U'
        svInputPrm.InVal = ['chgpswd', this.chgLoginPass['userId'], curr_pass.trim(), new_pass.trim()]
        svInputPrm.InCrpt = [2, 3]
        svInputPrm.TotInVal = svInputPrm.InVal.length
        this.chgLoginPassFunct_ReqTimeOut = setTimeout(this.solvingaccountInfo_TimeOut, functionList.reqTimeout, request_seq_comp)
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
        if (name === 'chgLoginPass_oldCode') {
            // change state login pass
            this.chgLoginPass.oldCode = value
            this.setState(prevState => ({
                chgLoginPass: {
                    ...prevState.chgLoginPass,
                    oldCode: value,
                },
            }))
        } else if (name === 'chgLoginPass_newCode') {
            this.chgLoginPass.newCode = value
            this.setState(prevState => ({
                chgLoginPass: {
                    ...prevState.chgLoginPass,
                    newCode: value,
                },
            }))
        } else if (name === 'chgLoginPass_newCodeCfm') {
            this.chgLoginPass.newCodeCfm = value
            this.setState(prevState => ({
                chgLoginPass: {
                    ...prevState.chgLoginPass,
                    newCodeCfm: value,
                },
            }))
        } 
    }

    handleKeyPress = (e) => {
        const code = (e.keyCode ? e.keyCode : e.which);
        const name = e.target.name;
        if (name === 'chgLoginPass_oldCode') {
            if(code === 13) {
                glb_sv.focusELM('chgLoginPass_newCode')
            }
        }
        if (name === 'chgLoginPass_newCode') {
            if (code === 13) {
               glb_sv.focusELM('chgLoginPass_newCodeCfm')
            }
            // if (code === 27) {
            //     this.closeModifyFvlModal();
            // }
        }
        if (name === 'chgLoginPass_newCodeCfm') {
            if (code === 13) {
                this.changeLoginPass()
            }
            // if (code === 27) {
            //     this.closeAddNewModal();
            // }
        }
    }

    toggleModal = () => {
        console.log('this.login_SendReqFlag', this.login_SendReqFlag)
        if (this.chgLoginPassFlag) return;
        glb_sv.commonEvent.next({ type: glb_sv.HIDE_MODAL_LOGIN })
    }

    render() {
        const { t } = this.props
        return (
            <Modal isOpen={true} size={'sm change_order'} toggle={this.toggleModal}>
                 <ModalHeader>{t('common_change_login_pass')}</ModalHeader>
            <ModalBody>
            <div className="change-password">
                {/* Đổi mật khẩu login */}
                    <React.Fragment>
                        <div className="card" id="modal_change_login_pass">
                            <div className="card-body">
                                <div className="form-group row">
                                    <label className="col-sm-5 control-label no-padding-right text-left">
                                        {t('login_user_id')}
                                    </label>
                                    <div className="col-sm-7">
                                        <span className="form-control form-control-sm">
                                            {this.state.chgLoginPass['userId']}
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
                                            name={'chgLoginPass_oldCode'}
                                            value={this.state.chgLoginPass['oldCode']}
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
                                            name={'chgLoginPass_newCode'}
                                            value={this.state.chgLoginPass['newCode']}
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
                                            name={'chgLoginPass_newCodeCfm'}
                                            value={this.state.chgLoginPass.newCodeCfm}
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
                                        <span>{t('password_rule')}</span>
                                    </div>

                                    <ReactIsCapsLockActive>
                                        {active =>
                                            active && (
                                                <div
                                                    id="password-caps-warning-login"
                                                    className="col-12 text-button"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    <span>{t('caps_lock_enabled')}</span>
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
                                    className="btn btn-wizard col"
                                    style={{ marginLeft: 0 }}
                                    onClick={() => this.changeLoginPass()}
                                >
                                    {!this.state.chgLoginPassFlag ? (
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

export default translate('translations')(ChangePass)
