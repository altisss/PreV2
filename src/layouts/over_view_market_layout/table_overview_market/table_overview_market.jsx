import React, { PureComponent } from "react";
import FormatNumber from '../../../conponents/formatNumber/FormatNumber';
import NumberFormat from 'react-number-format';
import glb_sv from "../../../utils/globalSv/service/global_service";
import {getMsgObjectByMsgKey} from '../../../utils/get_msg_obj_by_msg_key'
import commuChanel from '../../../constants/commChanel'
import { inform_broadcast } from "../../../utils/broadcast_service";
// import PerfectScrollbar from 'react-perfect-scrollbar';
export default class TableIndex extends PureComponent {
    constructor(props) {
        super(props);
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
      }
    send2stkinfo(stk) {
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.props.component, value: ['HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
            const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
            const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
            const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')

            let data,stkCd = 'HNX_' + stk;
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
            
            let msg = { type: commuChanel.STOCK_INFO_TAB, value: data, component: this.props.component};
            // glb_sv.commonEvent.next(msg);
            inform_broadcast(commuChanel.STOCK_INFO_TAB, msg)
            msg = { type: commuChanel.misTypeChgStock, value: data, component: this.props.component};
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

    render() {
        const { t } = this.props;
        return (
            <table className="tableNormal table_sticky table table-sm tablenowrap table-bordered table-striped">
                <thead className="header">
                    <tr>
                        <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('common_index')}
                        </th>
                        <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('stock_symbol_short')}
                        </th>
                        <th style={{ verticalAlign: 'middle' }} className="text-center">
                            + / -
                        </th>
                        <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('open')}
                        </th>
                        <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('current')}
                        </th>
                        <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t(this.props.name_col_last)}{' '}{this.props.name_col_last === 'priceboard_total_value_trading' ? '(' + t('billion') + ')' : ''}
                        </th>

                    </tr>
                </thead>
                <tbody>
                    {JSON.parse(this.props.data).map((item, index) =>

                        <tr key={item.StkCd} className="cursor_ponter" onClick={() => this.send2stkinfo(item.StkCd)}>
                            <td className="text-center" style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                {index + 1}
                            </td>
                            <td className="text-center fix" style={{ verticalAlign: 'middle' }}>
                                <span className={'cursor_ponter ' + this.getColor(item.CurrPri, item)}>{item['StkCd']}</span>
                            </td>
                            <td className="text-right fix" style={{ verticalAlign: 'middle' }}>
                                <span className={'cursor_ponter '+this.getColor(item.CurrPri, item)}>
                                    {(item.REF == null || item.CurrPri === 0 || item.CurrPri == undefined || (item.CurrPri - item.REF == 0)) ? null : (<>
                                        {/* <NumberFormat value={((item.CurrPri - item.REF) * 100) / item.REF} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={2} fixedDecimalScale={false} prefix={''} />  */}
                                        {FormatNumber(((item.CurrPri - item.REF) * 100) / item.REF, 2, 0)}
                                        <>%</> </>)
                                    }
                                </span>
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                                <span className={this.getColor(item.OpenPri, item)}>
                                    {item.OpenPri == undefined || item.OpenPri == 0 ? null : (
                                        <NumberFormat value={item.OpenPri} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={2} fixedDecimalScale={false} prefix={''} />
                                    )}
                                </span>
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                                <span className={this.getColor(item.CurrPri, item)}>
                                    {item.CurrPri === 777777710000 ? 'ATO' : (item.CurrPri === 777777720000 ? 'ATC' : (item.CurrPri == undefined || item.CurrPri === 0 ? null : (
                                        <NumberFormat value={item.CurrPri} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={2} fixedDecimalScale={false} prefix={''} />
                                    )))}
                                </span>
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                                <span className='cursor_ponter'>{this.props.name_col_last === 'priceboard_total_qtty_trading' ? FormatNumber(item['TradVol'])
                                    : FormatNumber(item['TradVal'], 2, 0)}
                                </span>
                            </td>
                        </tr>
                    )}

                </tbody>

            </table>
        )
    }
}