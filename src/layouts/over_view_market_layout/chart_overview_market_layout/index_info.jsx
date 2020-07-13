import React from 'react';

import glb_sv from "../../../utils/globalSv/service/global_service";
import FormatNumber from '../../../conponents/formatNumber/FormatNumber';
import commuChanel from '../../../constants/commChanel'

class IndexInfo extends React.PureComponent {
    constructor(props) {
        super(props);
        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq

        this.state = {
            objShareInfoIndex: {
                indexValue: 0,
                indexValueChang: 0,
                indexPercChang: 0,
                indexTotalQty: 0,
                indexTotalValue: 0,
                increase: 0,
                decrease: 0,
                tradStatus: 'priceboard_Release',
                noChange: 0
            },
            key: this.props.keyIndex
        }
        
        
        
    }

    objShareInfoIndex = [];

    componentDidMount() {
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: ['VN_INDEX', 'HNX_INDEX', 'UPCOM_INDEX'], sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const VN_INDEX = agrs.get('VN_INDEX')
            const HNX_INDEX = agrs.get('HNX_INDEX')
            const UPCOM_INDEX = agrs.get('UPCOM_INDEX')

            const key = this.props.keyIndex;
            if (key === 'VN_INDEX') {
                this.objShareInfoIndex = VN_INDEX;
            }
            else if (key === 'HNX_INDEX') {
                this.objShareInfoIndex = HNX_INDEX;
    
            } else if (key === 'UPCOM_INDEX') {
                this.objShareInfoIndex = UPCOM_INDEX;
            } 
        })
        // console.log(this.component)
        window.ipcRenderer.on(`${commuChanel.event_ServerPushIndexChart}_${this.component}`, (event, message) => {
            // console.log(message, this.component)
            if (message.includes('INDEX') && this.props.keyIndex === message)
            {
                this.updateValueChart(message);
            }
            else if(this.props.keyIndex === message) {
                this.updateValueChart(message);
            }
            // if (message === 'VN_INDEX' && this.props.keyIndex === 'VN_INDEX') {
            //     this.updateValueChart(message);

            // } else
            // if (message === 'HNX_INDEX' && this.props.keyIndex === 'HNX_INDEX') {
            //         this.updateValueChart('HNX_INDEX');
            // }else
            // if (message === 'UPCOM_INDEX' && this.props.keyIndex === 'UPCOM_INDEX') {
            //         this.updateValueChart('UPCOM_INDEX');
            // }else
            // if (message === 'VN30' && this.props.keyIndex === 'VN30') {
            //     this.updateValueChart('VN30');
            // }else
            // if (message === 'VN100' && this.props.keyIndex === 'VN100') {
            //     this.updateValueChart('VN100');
            // }
        })

        setTimeout(()=> {
            const obj = {
                indexValue: this.objShareInfoIndex.indexValue,
                indexValueChang: this.objShareInfoIndex.indexValueChang,
                indexPercChang: this.objShareInfoIndex.indexPercChang,
                indexTotalQty: this.objShareInfoIndex.indexTotalQty,
                indexTotalValue: this.objShareInfoIndex.indexTotalValue,
                increase: this.objShareInfoIndex.increase,
                decrease: this.objShareInfoIndex.decrease,
                tradStatus: this.objShareInfoIndex.tradStatus,
                noChange: this.objShareInfoIndex.noChange
            }
            this.setState({ objShareInfoIndex: obj });
        },3000);


    }

    componentWillUnmount() {
        // if (this.subcr_changeValuePrcBoard) this.subcr_changeValuePrcBoard.unsubscribe();
    }

    procFlash = (message) => {
        const itemArr = message.split('|');
        const id = '#' + itemArr[0];
        this.changeBackground(id, Number(itemArr[1]), Number(itemArr[2]));

    }

    changeBackground = (id, oldValue, newValue) => {
        const elemm = document.querySelector(id);
        if (elemm === null || elemm === undefined) { return; }
        if (newValue < oldValue) {
            if (elemm.classList.contains('bk_blue')) { elemm.classList.remove('bk_blue'); }
            if (!elemm.classList.contains('bk_red')) { elemm.classList.add('bk_red'); }
            setTimeout(() => {
                if (elemm.classList.contains('bk_red')) {
                    elemm.classList.remove('bk_red');
                }
            }, 500);
            return;
        } else if (newValue > oldValue) {
            if (elemm.classList.contains('bk_red')) { elemm.classList.remove('bk_red'); }
            if (!elemm.classList.contains('bk_blue')) { elemm.classList.add('bk_blue'); }
            setTimeout(() => {
                if (elemm.classList.contains('bk_blue')) {
                    elemm.classList.remove('bk_blue');
                }
            }, 500);
            return;
        }
    }

    updateValueChart(index) {
        if (!(index.includes('_INDEX'))){
            index = index + '_INDEX'
        }
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: index, sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            this.objShareInfoIndex = agrs
            // console.log(index, agrs)
            for (let key in this.state.objShareInfoIndex) {
                if (key !== 'indexArr' && this.state.objShareInfoIndex[key] !== this.objShareInfoIndex[key]) {
                    const msg = key+this.props.keyIndex + '|' + String(this.state.objShareInfoIndex[key]) + '|' + String(this.objShareInfoIndex[key]);
                    this.procFlash(msg);
                    this.setState(prevState => ({
                        objShareInfoIndex: {
                            ...prevState.objShareInfoIndex,
                            [key]: this.objShareInfoIndex[key]
                        }
                    }));
                }
            }
        })
        
    }

    classIndexNm() {
        if (this.state.objShareInfoIndex['indexValueChang'] > 0) {
            return 'price_basic_over';
        } else if (this.state.objShareInfoIndex['indexValueChang'] < 0) {
            return 'price_basic_less';
        } else return 'price_basic_color';
    }

    render() {
        // console.log('info');
        const { t } = this.props;
        const { objShareInfoIndex } = this.state;
        const activeCode = glb_sv.activeCode;
        const colorIndexNm = this.classIndexNm();
        const index = this.props.keyIndex === 'VN_INDEX' ? 'VNI' : (this.props.keyIndex === 'HNX_INDEX' ? 'HNX' : this.props.keyIndex === 'UPCOM_INDEX' ? 'UPCOM' : this.props.keyIndex)
        return (
            <>
                
                    
                {(this.props.keyIndex !== 'HNX30' || activeCode !== '075') && 
                <div className="indexInfo" style={this.props.full ? {} : {display: 'inline-block'}}>
                    <div className="clearfix indexNm" >
                        <div className="text-center indexInfoCell">
                            <span className="indexCode indextext_color">{index}{' '}</span>
                            <span className={colorIndexNm} style={{textShadow: '0.1px 0.1px 0.1px red'}}>
                                <span className="indexValue" id={'indexValue' + this.props.keyIndex}>{FormatNumber(objShareInfoIndex['indexValue'], 2, 0)+' '}</span>
                                {objShareInfoIndex['indexValueChang'] > 0 && <i className="fa fa-arrow-up" />}
                                {objShareInfoIndex['indexValueChang'] < 0 && <i className="fa fa fa-arrow-down" />}{' '}
                                <span className="indexTg" id={'indexValueChang' + this.props.keyIndex}>{FormatNumber(Math.round(objShareInfoIndex['indexValueChang']*100)/100, 2, 0)}{' '}
                                    <span style={{ color: 'white' }}>(</span>{FormatNumber(Math.round(objShareInfoIndex['indexPercChang']*100)/100, 2, 0)}
                                    <span style={{ fontSize: '8px' }}>%</span>
                                    <span style={{ color: 'white' }}>) </span>
                                </span>
                            </span>
                        </div>
                    </div>
                    <div className="clearfix indexCP">
                        <div className="text-center indexInfoCell">
                            <span className="indexTotalQty" id={'indexTotalQty' + this.props.keyIndex}>{FormatNumber(objShareInfoIndex['indexTotalQty'], 0, 0)}{' '}</span>
                            <span className="indextext_color">{t('shares')}</span>&nbsp;
                            <span className="indexTotalValue" id={'indexTotalValue' + this.props.keyIndex}>{FormatNumber(objShareInfoIndex['indexTotalValue'], 3, 0)}{' '}</span>
                            <span className="indextext_color">{t('billion')}</span>
                        </div>
                    </div>
                    {/* {(!this.props.full ? ' ' : <>
                    <div className="clearfix">
                        <div className="text-center indexInfoCell">
                            <span className="price_basic_over" id={'increase' + this.props.keyIndex}><i className="fa fa-arrow-up" />{' '+objShareInfoIndex['increase']}</span>&nbsp;
                            <span className="price_basic_color" id={'noChange' + this.props.keyIndex}> <i style={{ fontSize: '9px' }} className="fa fa-square" />{' '+objShareInfoIndex['noChange']}</span>&nbsp;
                            <span className="price_basic_less" style={{textShadow: '0.1px 0.1px 0.1px red'}} id={'decrease' + this.props.keyIndex}> <i className="fa fa-arrow-down" />{' '+objShareInfoIndex['decrease']}</span>&nbsp;
                            <span id={'tradStatus' + this.props.keyIndex}>{t(objShareInfoIndex['tradStatus'])}</span>
                        </div>
                    </div></>)} */}
                </div>} 

                
                
                {this.props.keyIndex === 'HNX30' && activeCode === '075' && <div className="indexInfo">
                    <div className="clearfix indexNm">
                        <div className="text-center indexInfoCell">
                            <span className="indexCode indextext_color">Vững Tin Đầu Tư</span>
                        </div></div><div className="clearfix indexCP">
                        <div className="text-center indexInfoCell">
                            <span className="indexTotalQtty">Quyết định thông minh</span>&nbsp;
                        </div>
                    </div>
                    <div className="clearfix">
                        <div className="text-center indexInfoCell">
                            <span className="price_basic_over">Kết quả hoàn hảo</span>
                        </div>
                    </div>
                </div>}
            </>
        );
    }
}
export default IndexInfo;
