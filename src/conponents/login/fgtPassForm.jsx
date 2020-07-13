import React, { Component } from 'react'

/* Import Components */
import Input from '../basic/input/Input'
import glb_sv from "../../utils/globalSv/service/global_service";
import socket_sv from "../../utils/globalSv/service/socket_service";
import { toast } from "react-toastify";
import {requestInfo} from '../../utils/globalSv/models/requestInfo'
import {serviceInputPrm} from '../../utils/globalSv/models/serviceInputPrm'
import { Subject } from 'rxjs'
import { translate } from 'react-i18next'
import { ReactComponent as UserIcon } from '../translate/icon/single-01-glyph-24.svg'
import { ReactComponent as IconMail } from '../translate/icon/letter-glyph-24.svg'
import { ReactComponent as IconPhone } from '../translate/icon/phone-glyph-24.svg'
import functionList from '../../constants/functionList';
import commuChanel  from '../../constants/commChanel'

class FgtPassForm extends Component {
    constructor(props) {
        super(props)

        this.component = this.props.component
        this.req_component = this.props.req_component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        this.get_rq_seq_comp = this.props.get_rq_seq_comp

        this.state = {
            accntInfo: {
                user_id_fgt: '',
                email: '',
                phone: '',
            },
            isSubmitting: false,
        }
        this.accntInfo = this.state.accntInfo
    }

    /*--- declare variable for fgtPass function --------------------*/
    subcr_ClientReqRcv = new Subject()
    fgtPass_SendReqFlag = false
    fgtPass_Timeout = {}
    fgtPass_FcntNm = 'fgtPass-01'


    componentWillUnmount = () => {
        
        clearTimeout(this.fgtPass_Timeout)
    }

    /*--- excuse logic function --------------------*/
    sendRequest2InitPass = values => {
        if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
            const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
            glb_sv.openAlertModal("", "common_InfoMessage", ermsg, "", "warning", "", '', '', this.component)
            return
        }

        if (values && values['user_id_fgt'].trim() === '') {
            glb_sv.focusELM('user_id_fgt')
            glb_sv.checkToast(toast, 'warn', this.props.t('common_user_id_is_require'), 'fgt_user_id')
            return
        }
        if (values && values['email'].trim() === '' && values['phone'].trim() === '') {
            glb_sv.focusELM('email')
            glb_sv.checkToast(
                toast,
                'warn',
                this.props.t('login_plz_input_email_or_phone_number_registed'),
                'fgt_email'
            )
            return
        }

        if (this.fgtPass_SendReqFlag) {
            return
        }
        this.fgtPass_SendReqFlag = true
        if (glb_sv.activeCode === null || glb_sv.activeCode === undefined) {
            this.fgtPass_SendReqFlag = false
            return
        }

        const request_seq_comp = this.get_rq_seq_comp()
        // -- push request to request hashmap handle_sendRequest2InitPass
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.fgtPass_FcntNm
        reqInfo.component = this.component
        reqInfo.receiveFunct = this.handle_sendRequest2InitPass
        // -- service info
        let svInputPrm = new serviceInputPrm()
        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
        svInputPrm.WorkerName = 'ALTxCommon'
        svInputPrm.ServiceName = 'ALTxCommon_ChangeInfo'

        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'U'
        svInputPrm.InVal = ['resetpswd', values['user_id_fgt'], values['email'], values['phone']]
        svInputPrm.TotInVal = svInputPrm.InVal.length
        svInputPrm.AppLoginID = '';
        this.fgtPass_Timeout = setTimeout(this.solvingTimeout, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal;
        this.setState({ isSubmitting: true })
        this.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component:{
              component: reqInfo.component, 
              request_seq_comp: request_seq_comp,
              channel: socket_sv.key_ClientReq
            }, 
            svInputPrm:svInputPrm
          })
    }

    handle_sendRequest2InitPass = (reqInfoMap, message) => {
        clearTimeout(this.fgtPass_Timeout)
        this.setState({ isSubmitting: false })
        this.fgtPass_SendReqFlag = false
        let timeResult = new Date()
        reqInfoMap.resTime = timeResult
        reqInfoMap.procStat = 2

        if (Number(message['Result']) === 0) {
            reqInfoMap.resSucc = false
            const errmsg = message['Message']
            glb_sv.openAlertModal("", "common_InfoMessage", errmsg, "", "danger", "user_id_fgt", '', '', this.component)
        } else {
            glb_sv.openAlertModal("", "common_InfoMessage", message['Message'], "", "success", "", '', '', this.component)
        }
    }

    solvingTimeout = cltSeq => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) return
        // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq)
        const reqIfMap = this.req_component.get(cltSeq)
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) return
        if (reqIfMap.reqFunct === this.fgtPass_FcntNm) {
            this.fgtPass_SendReqFlag = false
            this.setState({ isSubmitting: false })
        } else if (reqIfMap.reqFunct === this.fgtPass_FcntNm) {
        }
    }

    handleInput = e => {
        const value = e.target.value
        const name = e.target.name
        this.setState(prevState => ({
            accntInfo: {
                ...prevState.accntInfo,
                [name]: value,
            },
        }))
        this.accntInfo[name] = value
    }

    handleCheckBox = e => {
        const newSelection = e.target.value
        let newSelectionArray

        if (this.state.accntInfo.rememOptions.indexOf(newSelection) > -1) {
            newSelectionArray = this.state.accntInfo.rememOptions.filter(s => s !== newSelection)
        } else {
            newSelectionArray = [...this.state.accntInfo.rememOptions, newSelection]
        }

        this.setState(prevState => ({
            accntInfo: { ...prevState.accntInfo, rememOptions: newSelectionArray },
        }))
    }

    handleFormSubmit = e => {
        e.preventDefault()
        this.sendRequest2InitPass(this.accntInfo)
    }

    render() {
        return (
            <form onSubmit={this.handleFormSubmit}>
                <div className="form-group">
                    <div className="input-group input-group-login">
                        <div className="input-group-prepend">
                            <span style={{border: 0}} className="input-group-text input-group-text-custom loginPrepend">
                                <UserIcon />
                            </span>
                        </div>
                        <Input
                            inputtype={'text'}
                            name={'user_id_fgt'}
                            value={this.state.accntInfo.user_id_fgt}
                            placeholder={this.props.t('login_user_id')}
                            onChange={this.handleInput}
                            classextend={'form-control-sm text-left input-login'}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <div className="input-group input-group-login">
                        <div className="input-group-prepend">
                            <span style={{border: 0}} className="input-group-text input-group-text-custom loginPrepend">
                                <IconMail />
                            </span>
                        </div>
                        <Input
                            inputtype={'text'}
                            name={'email'}
                            value={this.state.accntInfo.email}
                            placeholder={this.props.t('login_email')}
                            onChange={this.handleInput}
                            classextend={'form-control-sm text-left input-login'}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <div className="input-group input-group-login">
                        <div className="input-group-prepend">
                            <span style={{border: 0}} className="input-group-text input-group-text-custom loginPrepend">
                                <IconPhone />
                            </span>
                        </div>
                        <Input
                            inputtype={'text'}
                            name={'phone'}
                            value={this.state.accntInfo.phone}
                            placeholder={this.props.t('login_mobile_regist')}
                            onChange={this.handleInput}
                            classextend={'form-control-sm text-left input-login'}
                        />
                    </div>
                </div>

                <div className="container">
                    <div className="row">
                        <button className="btn btn-wizard btn-block">
                            {this.state.isSubmitting ? (
                                <span>
                                    <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>
                                    {this.props.t('processing')}....
                                </span>
                            ) : (
                                <span>{this.props.t('login_reset_password')}</span>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        )
    }
}

export default translate('translations')(FgtPassForm)
