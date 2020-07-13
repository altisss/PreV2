import React, { PureComponent } from 'react'
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Input from "../../conponents/basic/input/Input";
import commuChanel from '../../constants/commChanel'
import {updateFvlGroup} from '../../utils/update_fvl_group'
import { inform_broadcast } from '../../utils/broadcast_service';
import functionList from '../../constants/functionList';

class AddModFav extends PureComponent {
    constructor(props) {
        super(props)
        this.component = this.props.component
        this.req_component = this.props.req_component
        this.get_rq_seq_comp = this.props.get_rq_seq_comp
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        this.state = {
            fvl_nm: '',
            objShareInfoFVL: [],
            addnewFvlFlag: false,
            modal_confirmDelFvl: false,
            confirmDelItem_GRP_NM: '',
            confirmDelItem_GRP_ID: '',
            modal_modifyFvl: false,
            modifyFvlFlag: false,
            fvl_nm_modify: '',
            deleteFvlFlag: false,
            // page: 0,
            modal_addnewfvl: false,
        }
        if (this.props.node) {
            this.props.node.setEventListener("close", (p) => {
                window.ipcRenderer.removeAllListeners(`${commuChanel.ESC_KEY}_${this.component}`)
        })}
    }

    // -- function add new fvl --
    addnewFvl_functNm = 'ADDNEW_FVL';
    // -- function delete a fvl
    deleteFvl_functNm = 'DELETE_FVL';
    // -- function modify name a fvl
    fvl_nm_modify = '';
    modifyFvl_functNm = 'MODIFY_FVL';
    // -- for get info that share over project
    objShareInfoFVL = [];
    varObjct = {};

    componentDidMount() {
        
        window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
            if (!this.state.deleteFvlFlag && !this.state.modifyFvlFlag && !this.state.addnewFvlFlag) {
                if (this.state.modal_addnewfvl || this.state.modal_confirmDelFvl || this.state.modal_modifyFvl) {
                    // this.props.history.push('/main-app');
                    this.close_modal_addfav()
                }
                this.closeAddFvlModal();
                this.closeConfirmDelFvlModal();
                this.closeModifyFvlModal();
            }
        })

       
        const paths = this.props.path
        const id = this.props.node_key

        if (paths === 'edit-fav') {
            this.modifyFlv(id);
        } else if (paths === 'delete-fav') {
            this.deleteFlv(id);
        } else if (paths === 'add-fav') {
            this.setState({ modal_addnewfvl: true })
        }

    }
    close_modal_addfav = () => {
        this.setState({modal_confirmDelFvl: false, modal_modifyFvl: false, modal_addnewfvl: false}, () => {
            setTimeout(() => {
                this.props.close_modal_addfav(false)
            }, 500)
        })
    }

    componentWillUnmount() {
        if (this.addNewFvl_ReqTimeOut) { clearTimeout(this.addNewFvl_ReqTimeOut); }
        if (this.deleteFvl_ReqTimeOut) { clearTimeout(this.deleteFvl_ReqTimeOut); }
    }

    addnewFvl_functNmResultProc = (reqInfoMap, message) => {
        clearTimeout(this.addNewFvl_ReqTimeOut);
        this.addnewFvlFlag = false;
        this.setState({ addnewFvlFlag: false });
        if (reqInfoMap.procStat !== 0) { return; }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2;
            reqInfoMap.resSucc = false;
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
            }
            return;
        } else {
            reqInfoMap.procStat = 2;
            const dataObj = JSON.parse(message['Data']);
            // -- update to favorite list --
            if (!isNaN(Number(dataObj[0]['c0']))) {
                updateFvlGroup(0, Number(dataObj[0]['c0']), reqInfoMap.inputParam[1], this.get_value_from_glb_sv_seq, this.component );
            }
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
            const fvlNew = this.state.fvl_nm + '';
            const msg = { type: commuChanel.ACTION_SUCCUSS, key: 'update-fav', fvlNew: fvlNew, component:this.component };
            inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
            // glb_sv.commonEvent.next(msg);
            // this.setState({fvl_nm: ''});
        }
        this.close_modal_addfav()
    }
    
    deleteFvl_functNmResultProc = (reqInfoMap, message) => {
        this.deleteFvlFlag = false;
        clearTimeout(this.deleteFvl_ReqTimeOut);

        this.setState({ deleteFvlFlag: false });
        if (reqInfoMap.procStat !== 0) { return; }
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2;
            reqInfoMap.resSucc = false;
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
            }
            return;
        } else {
            reqInfoMap.procStat = 2;

            if (this.current_FvlId === Number(reqInfoMap.inputParam[1])) {
                this.fvlIndexActive = null;
                this.current_FvlId = -1;
                this.flvPriceBoDataTable = [];
            }
            updateFvlGroup(1, Number(reqInfoMap.inputParam[1]), '', this.get_value_from_glb_sv_seq, this.component );
            const fvl_delete = this.state.confirmDelItem_GRP_NM + '';
            this.setState({ modal_confirmDelFvl: false, confirmDelItem_GRP_ID: '', confirmDelItem_GRP_NM: '' });
            const msg = { type: commuChanel.ACTION_SUCCUSS, key: 'update-fav', fvl_delete: fvl_delete  , component:this.component};
            inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
        }
        this.close_modal_addfav()
    }

    modifyFvl_functNmResultProc = (reqInfoMap, message) => {
        this.modifyFvlFlag = false;
        clearTimeout(this.modifyFvl_ReqTimeOut);

        this.setState({ modifyFvlFlag: false });
        if (reqInfoMap.procStat !== 0) { return; }
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2;
            reqInfoMap.resSucc = false;
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
            }
            return;
        } else {
            reqInfoMap.procStat = 2;
            // -- update to favorite list --
            updateFvlGroup(2, Number(reqInfoMap.inputParam[1]), reqInfoMap.inputParam[2], this.get_value_from_glb_sv_seq, this.component);
            this.setState({ modal_modifyFvl: false, confirmDelItem_GRP_ID: '', confirmDelItem_GRP_NM: '' });
            const msg = { type: commuChanel.ACTION_SUCCUSS, key: 'update-fav', component: this.component };
            // glb_sv.commonEvent.next(msg);
            inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
        }
        this.close_modal_addfav()

    }


    addNewFvl = () => {
        const fvl_nm = this.state.fvl_nm;
        if (this.addnewFvlFlag) { return; }
        if (fvl_nm) {
            this.addnewFvlFlag = true;
            this.setState({ addnewFvlFlag: true });
            const request_seq_comp = this.get_rq_seq_comp()
            // -- push request to request hashmap addnewFvl_functNmResultProc
            const reqInfo = new requestInfo();
            reqInfo.reqFunct = this.addnewFvl_functNm;
            reqInfo.component = this.component
            reqInfo.receiveFunct = this.addnewFvl_functNmResultProc;
            // -- service info
            let svInputPrm = new serviceInputPrm();
            svInputPrm.WorkerName = 'ALTxCommon01';
            svInputPrm.ServiceName = 'ALTxCommon01_0820';
            svInputPrm.ClientSentTime = '0';
            svInputPrm.Operation = 'I';
            svInputPrm.InVal = ['FAV_ADD', fvl_nm];
            svInputPrm.TotInVal = svInputPrm.InVal.length;

            this.addNewFvl_ReqTimeOut = setTimeout(
                this.solvingFvl_TimeOut,
                functionList.reqTimeout,
                request_seq_comp
            );
            reqInfo.inputParam = svInputPrm.InVal;
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
    };

    // -- Xóa fvl --
    closeDeleteFvl = () => {
        if (this.state.deleteFvlFlag) { return; }
        const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
        inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
        this.close_modal_addfav()
    };

    closeConfirmDelFvlModal = () => {
        if (this.state.deleteFvlFlag) { return; }
        this.setState({ confirmDelItem_GRP_ID: '', confirmDelItem_GRP_NM: '', modal_confirmDelFvl: false });
        this.close_modal_addfav();
    };

    closeModifyFvlModal = () => {
        console.log(this.state.modifyFvlFlag)
        if (this.state.modifyFvlFlag) { return; }
        this.setState({ confirmDelItem_GRP_ID: '', confirmDelItem_GRP_NM: '', modal_modifyFvl: false }, () => {
            this.close_modal_addfav();
        });
        
    };

    deleteFlv = (id) => {
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: 'FVL_STK_LIST', sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, FVL_STK_LIST) => {
            const item = FVL_STK_LIST.find(item => item.GRP_ID === id);
            if (item === undefined) return;
            this.setState({ confirmDelItem_GRP_ID: item.GRP_ID, confirmDelItem_GRP_NM: item.GRP_NM, modal_confirmDelFvl: true });
        })
        
    };

    modifyFlv = (id) => {
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: 'FVL_STK_LIST', sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, FVL_STK_LIST) => {
            const item = FVL_STK_LIST.find(item => item.GRP_ID === id);
            console.log('OPEN_MODAL_AddModFav',item , FVL_STK_LIST, id)
            if (item === undefined) return;
            this.setState({ confirmDelItem_GRP_ID: item.GRP_ID, confirmDelItem_GRP_NM: item.GRP_NM, modal_modifyFvl: true, fvl_nm_modify: '' });
        })
        
    };

    confirmDeleteFlv() {
        if (this.state.confirmDelItem_GRP_ID != null && this.state.confirmDelItem_GRP_ID !== undefined) {
            if (this.deleteFvlFlag) { return; }
            this.deleteFvlFlag = true;
            this.setState({ deleteFvlFlag: true });
            // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
            //     const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
            //     glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning');
            //     this.setState({ deleteFvlFlag: false });
            //     return;
            // }
            const request_seq_comp = this.get_rq_seq_comp()
            // -- push request to request hashmap deleteFvl_functNmResultProc
            const reqInfo = new requestInfo();
            reqInfo.reqFunct = this.deleteFvl_functNm;
            reqInfo.component = this.component
            reqInfo.receiveFunct = this.deleteFvl_functNmResultProc;
            // -- service info
            let svInputPrm = new serviceInputPrm();
            // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
            svInputPrm.WorkerName = 'ALTxCommon01';
            svInputPrm.ServiceName = 'ALTxCommon01_0820';
            svInputPrm.ClientSentTime = '0';
            svInputPrm.Operation = 'D';
            svInputPrm.InVal = ['FAV_REMOVE', this.state.confirmDelItem_GRP_ID + ''];
            svInputPrm.TotInVal = svInputPrm.InVal.length;

            this.deleteFvl_ReqTimeOut = setTimeout(
                this.solvingFvl_TimeOut,
                functionList.reqTimeout,
                request_seq_comp
            );
            reqInfo.inputParam = svInputPrm.InVal;
            // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
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
    }

    confirmModifyFlv = () => {
        const fvl_nm_modify = this.state.fvl_nm_modify;
        this.setState({modal_modifyFvl: false})
        if (
            fvl_nm_modify != null &&
            fvl_nm_modify.trim().length > 0
        ) {
            if (this.modifyFvlFlag) { return; }
            this.modifyFvlFlag = true;
            this.setState({ modifyFvlFlag: true });
            // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
            //     const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
            //     glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning');
            //     this.setState({ modifyFvlFlag: false });
            //     return;
            // }
            const request_seq_comp = this.get_rq_seq_comp()
            // -- push request to request hashmap modifyFvl_functNmResultProc
            const reqInfo = new requestInfo();
            reqInfo.reqFunct = this.modifyFvl_functNm;
            reqInfo.component = this.component;
            reqInfo.receiveFunct = this.modifyFvl_functNmResultProc;
            // -- service info
            let svInputPrm = new serviceInputPrm();
            // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
            svInputPrm.WorkerName = 'ALTxCommon01';
            svInputPrm.ServiceName = 'ALTxCommon01_0820';
            svInputPrm.ClientSentTime = '0';
            svInputPrm.Operation = 'U';
            svInputPrm.InVal = [
                'FAV_MOD',
                this.state.confirmDelItem_GRP_ID + '',
                fvl_nm_modify.trim()
            ];
            svInputPrm.TotInVal = svInputPrm.InVal.length;

            this.deleteFvl_ReqTimeOut = setTimeout(
                this.solvingFvl_TimeOut,
                functionList.reqTimeout,
                request_seq_comp
            );
            reqInfo.inputParam = svInputPrm.InVal;
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
    };

    solvingFvl_TimeOut = (cltSeq) => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
        // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
        const reqIfMap = this.req_component.get(cltSeq);
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
            return;
        }
        const timeResult = new Date();
        reqIfMap.resTime = timeResult;
        reqIfMap.procStat = 4;
        // glb_sv.setReqInfoMapValue(cltSeq, reqIfMap);
        this.req_component.set(cltSeq, reqIfMap);
        if (reqIfMap.reqFunct === this.addnewFvl_functNm) {
            this.setState({ addnewFvlFlag: false });
            this.addnewFvlFlag = false;
        } else if (reqIfMap.reqFunct === this.deleteFvl_functNm) {
            this.setState({ deleteFvlFlag: false });
            this.deleteFvlFlag = false; 
        } else if (reqIfMap.reqFunct === this.modifyFvl_functNm) {
            this.setState({ modifyFvlFlag: false });
            this.modifyFvlFlag = false;
            
        }
        // glb_sv.openAlertModal(
        //     '',
        //     'common_InfoMessage',
        //     'common_cant_connect_server',
        //     '',
        //     'warning'
        // );
        glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning', '', '', '', this.component)
    };

    /////////////////////////////////////

    modalAfterOpened = (key) => {
        if (key === 1) {
            const elm = document.getElementById('buttonCfm_deleteFvl');
            if (elm) elm.focus();
        } else if (key === 2) {
            const elm = document.getElementById('input_modifyFvl');
            if (elm) elm.focus();
        } else if (key === 3) {
            const elm = document.getElementById('addnew_fvl_nm');
            if (elm) elm.focus();
        }
    }
    
    handleChange = (e) => {
        const value = e.target.value;
        this.setState({ fvl_nm: value });
    }
    handleChangeMod = (e) => {
        const value = e.target.value;
        this.setState({ fvl_nm_modify: value });
    }
    handleKeyPress = (e) => {
        const code = (e.keyCode ? e.keyCode : e.which);
        const name = e.target.name;
        if (name === 'Cfm_deleteFvl') {
            // if(code === 13) {
            //     this.confirmModifyFlv();
            // }
            // if (code === 27) {
            //     this.closeConfirmDelFvlModal();
            // }
        }
        if (name === 'fvl_nm_modify') {
            if (code === 13) {
                this.confirmModifyFlv();
            }
            // if (code === 27) {
            //     this.closeModifyFvlModal();
            // }
        }
        if (name === 'addnew_fvl_nm') {
            if (code === 13) {
                this.addNewFvl();
            }
            // if (code === 27) {
            //     this.closeAddNewModal();
            // }
        }
    }

    closeAddFvlModal = () => {
        if (this.state.addnewFvlFlag) return;
        this.setState({ modal_addnewfvl: false });
        // this.props.history.push('/main-app');
        this.close_modal_addfav()
    }

    render() {
        const { t } = this.props;
        // console.log(this.props)
        return (
            <div className='fav'>

                {/* modal confirm delete fvl */}
                <Modal
                    isOpen={this.state.modal_confirmDelFvl}
                    size={"sm modal-notify"}
                    onOpened={() => this.modalAfterOpened(1)}>
                    <ModalHeader>
                        {t('common_InfoMessage')}
                    </ModalHeader>
                    <ModalBody>
                        <span>{t('cfm_menu_rmv_content')} : {this.state.confirmDelItem_GRP_NM}?</span>
                    </ModalBody>
                    <ModalFooter>
                        <div className="container">
                            <div className="row">
                                <div className="col">
                                    <Button size="sm" block
                                        id="buttonCfm_deleteFvl"
                                        autoFocus
                                        color="wizard"
                                        name='Cfm_deleteFvl'
                                        onKeyDown={this.handleKeyPress}
                                        onClick={(e) => this.confirmDeleteFlv()}>
                                        {this.state.deleteFvlFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                                    </Button>
                                </div>
                                <div className="col">
                                    <Button size="sm" block
                                        color="cancel"
                                        onClick={(e) => this.closeConfirmDelFvlModal()}>
                                        <span>{t('common_No')}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>

                {/* modal modify name of fvl */}
                <Modal
                    isOpen={this.state.modal_modifyFvl}
                    size={"sm modal-notify"}
                    onOpened={() => this.modalAfterOpened(2)}>
                    <ModalHeader>
                        {t('common_InfoMessage')}
                    </ModalHeader>
                    <ModalBody>
                        <div className="form-group">
                            <label htmlFor="span_current_nm">{t('current_nm')}</label>
                            <span className="form-control form-control-sm" id="span_current_nm">{this.state.confirmDelItem_GRP_NM}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="input_modifyFvl">{t('modify_nm')}</label>
                            <input id="input_modifyFvl" className="form-control form-control-sm" value={this.state.fvl_nm_modify} onChange={this.handleChangeMod} onKeyDown={this.handleKeyPress} name="fvl_nm_modify" type="text"></input>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="container">
                            <div className="row">
                                <div className="col">
                                    <Button size="sm" block
                                        id="buttonCfm_modifyFvl"
                                        autoFocus
                                        color="wizard"
                                        onClick={(e) => this.confirmModifyFlv()}>
                                        {this.state.modifyFvlFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_confirm')}</span>}
                                    </Button>
                                </div>
                                <div className="col">
                                    <Button size="sm" block
                                        color="cancel"
                                        onClick={(e) => this.closeModifyFvlModal()}>
                                        <span>{t('common_No')}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>

                {/* modal add newfvl */}
                <Modal
                    isOpen={this.state.modal_addnewfvl}
                    size={"sm modal-notify"}
                    onOpened={() => this.modalAfterOpened(3)}>
                    <ModalHeader>
                        {t('add_new_favorites')}
                    </ModalHeader>
                    <ModalBody>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <Input
                                inputtype={"text"}
                                id='addnew_fvl_nm'
                                name={"addnew_fvl_nm"}
                                value={this.state.fvl_nm}
                                onChange={this.handleChange}
                                placeholder={t('cfm_menu_plz_input_fav_nm')}
                                classextend={'form-control-sm text-left'}
                                onKeyDown={this.handleKeyPress}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="container">
                            <div className="row">
                                <div className="col">
                                    <Button size="sm" block
                                        color="wizard"
                                        disabled={this.state.addnewFvlFlag}
                                        onClick={this.addNewFvl}>
                                        {this.state.addnewFvlFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_confirm')}</span>}
                                    </Button>
                                </div>
                                <div className="col">
                                    <Button size="sm" block
                                        color="cancel"
                                        onClick={this.closeAddFvlModal}>
                                        <span>{t('common_No')}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>
            </div >
        )
    }
}

export default translate('translations')(AddModFav);