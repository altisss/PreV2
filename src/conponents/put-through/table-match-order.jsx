import React, { PureComponent } from "react";
import NumberFormat from 'react-number-format';
import glb_sv from "../../utils/globalSv/service/global_service";
import {getMsgObjectByMsgKey} from '../../utils/get_msg_obj_by_msg_key'
import { inform_broadcast } from "../../utils/broadcast_service";
import commuChanel from '../../constants/commChanel'
const id_nm = 'TableMatchPt';
export default class TableMatchPt extends PureComponent {
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

    getColor(value, item) {
        if (value > 0 && value > item.FL && value < item.REF) return 'price_basic_less';
        else if (value > 0 && value < item.CE && value > item.REF) return 'price_basic_over';
        else if (value === 0 || value === item.REF) return 'price_basic_color';
        else if (value > 0 && value === item.CE) return 'price_ceil_color';
        else if (value > 0 && value === item.FL) return 'price_floor_color';
    }

    // transTime = (value) => {
    //     if (value.length < 5) return value;
    //     else return value.substr(0, 2) + ':' + value.substr(2, 2) + ':' + value.substr(4, 2);
    // }

    /**
     * var MsgKey;	//U8
        var ExCode;	//Exchange code: 01, 03, 05
        var StkCd;	//t55
        var CE;		//Ceiling
        var FL;		//Floor
        var REF;	//Ref price
        var	CR;		//Current price
        var CA;		//Current matched amount
        var	TA;		//Total PT trading amount
        var MT;		//Last matched time (edited)
    */

    render() {
        const { t } = this.props;
        return (
            <table className="tableNormal table_priceboardTH table table-sm tablenowrap table-bordered table-striped">
                <thead className="header">
                    <tr>
                        <th colSpan={6} className="text-center" style={{verticalAlign: 'middle', borderBottom: '1px solid #302a4a'}}>
                            {t('priceboard_matching')}
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
                            {t('common_values')}
                        </th>
                        <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('cumulative_value')}
                        </th>
                        <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('time')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.data.map((item, index) =>
                        <tr key={item.MsgKey} onClick={() => this.send2stkinfo(item.StkCd)} className="cursor_ponter" >
                            <td className={this.getColor(item.CR, item) + ' ' + "text-center"} style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                {item.StkCd}
                            </td>
                            <td id={item.StkCd + id_nm + '_CR'} className={this.getColor(item.CR, item) + ' ' + "text-right"} style={{ verticalAlign: 'middle' }}>
                                <NumberFormat value={item.CR} displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={false} prefix={''} />
                            </td>
                            <td id={item.StkCd + id_nm + '_CA'} className={this.getColor(item.CR, item) + ' ' + "text-right"} style={{ verticalAlign: 'middle' }}>
                                <NumberFormat value={item.CA} displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={false} prefix={''} />
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                                <NumberFormat value={item.CA*item.CR} displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={false} prefix={''} />
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                                <NumberFormat value={item.TA} displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={false} prefix={''} />
                            </td>
                            <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                {item.MT? item.MT.substr(9) : ''}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )
    }
}