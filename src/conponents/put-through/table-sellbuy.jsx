import React, { PureComponent } from "react";
import NumberFormat from 'react-number-format';
import glb_sv from "../../utils/globalSv/service/global_service";
import {getMsgObjectByMsgKey} from '../../utils/get_msg_obj_by_msg_key'
import { inform_broadcast } from "../../utils/broadcast_service";
import commuChanel from '../../constants/commChanel'

// import PerfectScrollbar from 'react-perfect-scrollbar';
export default class TableSellBuy extends PureComponent {
    get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    send2stkinfo(stk) {
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.props.component, value: ['HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
            const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
            const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
            const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')

            let data,stkCd = 'HNX_' + stk;
            // let mrkObj = glb_sv.getMsgObjectByMsgKey(stkCd);
            let mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
            if (mrkObj != null && mrkObj !== undefined) {
                data = mrkObj;
            }
            stkCd = 'HSX_' + stk;
            mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
            if (mrkObj != null && mrkObj !== undefined) {
                data = mrkObj;
            }
            stkCd = 'UPC_' + stk;
            mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
            if (mrkObj != null && mrkObj !== undefined) {
                data = mrkObj;
            }
            
            let msg = { type: commuChanel.STOCK_INFO_TAB, data, component: this.props.component };
            // glb_sv.commonEvent.next(msg);
            inform_broadcast(commuChanel.STOCK_INFO_TAB, msg)
            msg = { type: commuChanel.misTypeChgStock, data, component: this.props.component };
            setTimeout(() => inform_broadcast(commuChanel.misTypeChgStock, msg), 500);
        })
        
    }

    componentWillReceiveProps(newProps) {
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.props.component, value: ['HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
            glb_sv.HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
            glb_sv.HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
            glb_sv.UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')
        })
      }

    getColor = (value, item) => {
        // const sq= this.get_value_from_glb_sv_seq()
        // window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.props.component, value: ['HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq:sq})
        // window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
        //     const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
        //     const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
        //     const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')

            let data,stkCd = 'HNX_' + item['c2'];
            // let mrkObj = glb_sv.getMsgObjectByMsgKey(stkCd);
            let mrkObj = glb_sv.getMsgObjectByMsgKey(stkCd)
            if (mrkObj != null && mrkObj !== undefined) {
                data = mrkObj;
            }
            stkCd = 'HSX_' + item['c2'];
            mrkObj = glb_sv.getMsgObjectByMsgKey(stkCd)
            if (mrkObj != null && mrkObj !== undefined) {
                data = mrkObj;
            }
            stkCd = 'UPC_' + item['c2'];
            mrkObj = glb_sv.getMsgObjectByMsgKey(stkCd)
            if (mrkObj != null && mrkObj !== undefined) {
                data = mrkObj;
            }
            // console.log('price_basic_over', value, data.t332, data.t260)
            if (data) {
                if (value > 0 && value > data.t333 && value < data.t260) return 'price_basic_less';
                else if (value > 0 && value < data.t332 && value > data.t260) return 'price_basic_over';
                else if (value === 0 || value == data.t260) return 'price_basic_color';
                else if (value > 0 && value == data.t332) return 'price_ceil_color';
                else if (value > 0 && value == data.t333) return 'price_floor_color';
            }
        // })
        
    }

    
  transTime = (value) => {
    if (value.length < 5) return value;
    else return value.substr(0, 2) + ':' + value.substr(2, 2) + ':' + value.substr(4, 2);
  }

    render() {
        const { t } = this.props;
        return (
            <table className="tableNormal table_priceboardTH table table-sm tablenowrap table-bordered table-striped">
                <thead className="header">
                    <tr>
                        <th colSpan={4} className="text-center" style={{verticalAlign: 'middle', borderBottom: '1px solid #302a4a'}}>
                            {this.props.isBuy ? t('puth_pid') : t('puth_ask')}
                        </th>
                    </tr>
                    <tr>
                        <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('stock_symbol_short')}
                        </th>
                        <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('price')}
                        </th>
                        <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('qty')}
                        </th>
                        <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('time')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.data.map((item, index) =>
                        <tr key={item.c2 + item.c10} onClick={() => this.send2stkinfo(item.c2)} className="cursor_ponter">
                            <td className={this.getColor(item.c5, item) + ' ' + "text-center"} style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                {item['c2']}
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                                <span className={this.getColor(item.c5, item)}>
                                    <NumberFormat value={item.c5} displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={false} prefix={''} />
                                </span>
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                                <span className={this.getColor(item.c5, item)}>
                                    <NumberFormat value={item.c4} displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={false} prefix={''} />
                                </span>
                            </td>
                            <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                {this.transTime(item.c0)}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )
    }
}