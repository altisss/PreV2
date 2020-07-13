import React from 'react';
import { translate } from 'react-i18next';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import commuChanel from '../../constants/commChanel';
import { ReactComponent as IconSigma } from '../../conponents/translate/icon/functions-glyph-24_rounded.svg';
import { showLogin } from '../../utils/show_login';
import { inform_broadcast } from '../../utils/broadcast_service';

class BidAskTable extends React.PureComponent {
    constructor(props) {
      super(props);
      this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
      this.component = this.props.component
      this.state = {
        StockInfoExten: this.props.StockInfoExten,
      };
  
      
      //-------- get Deep News -------
    }

    changeColorPrice = (value) => {
      let color = '';
      if (value > 0 && value > this.state.StockInfoExten.t333 && value < this.state.StockInfoExten.t260) color = 'price_basic_less';
      if (value > 0 && value < this.state.StockInfoExten.t332 && value > this.state.StockInfoExten.t260) color = 'price_basic_over';
      if (value === 0 || value === this.state.StockInfoExten.t260) color = 'price_basic_color';
      if (value > 0 && value === this.state.StockInfoExten.t332) color = 'price_ceil_color';
      if (value > 0 && value === this.state.StockInfoExten.t333) color = 'price_floor_color';
      return color;
    }

    getPriceOrder = (sbTp, price, stk_cd) => {
      const sq= this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: 'authFlag', sq:sq})
      window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
        if (!agrs) {
          // glb_sv.showLogin();
          showLogin()
          return;
        }
      })
     
      const message = {};
      if (sbTp === 'priceboard_sell') sbTp = '2';
      else if (sbTp === 'priceboard_buy') sbTp = '1';
      if (Number(price) <= this.state.StockInfoExten.t333) price = this.state.StockInfoExten.t333;
      else if (Number(price) >= this.state.StockInfoExten.t332) price = this.state.StockInfoExten.t332;
  
      message['type'] = commuChanel.ORDER;
      message['data'] = sbTp + '|' + price + '|' + stk_cd;
      message['component'] = this.component
      // glb_sv.commonEvent.next(message);
      inform_broadcast(commuChanel.ORDER, message)
    }

    render() {
      const { t } = this.props;
      const color_t631 = this.changeColorPrice(this.props.StockInfoExten.t631);
      const color_t137 = this.changeColorPrice(this.props.StockInfoExten.t137);
      const color_t139 = this.changeColorPrice(this.props.StockInfoExten.t139);
      const color_t266 = this.changeColorPrice(this.props.StockInfoExten.t266);
      const color_t2661 = this.changeColorPrice(this.props.StockInfoExten.t2661);
      const color_t132_1 = this.changeColorPrice(this.props.StockInfoExten.t132_1);
      const color_t133_1 = this.changeColorPrice(this.props.StockInfoExten.t133_1);
      const { StockInfoExten } = this.props;
        return (
            //<div className="card stockInfoExtent" style={{ marginBottom: 0 }}>
              //<div className="card-body widget-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table id={this.component + "table_orderTableExtend"} className="tableStockInfo table_sticky table_priceboard_small table-bordered table_stk_info table-striped table-fix-width" style={{ height: 288 }}>
                    <thead className='header'>
                      <tr>
                        <th className="text-center" width='30%'>{t('priceboard_over_buy_quantity')}</th>
                        <th className='text-center'>{t('buy_price')}</th>
                        <th className="text-center">{t('sell_price')}</th>
                        <th className="text-center" width='30%'>{t('priceboard_over_sell_quantity')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {/* KL Dư mua + Giá dư mua */}
                        <td className={"text-right " + this.state.StockInfoExten.t132_1_color} id={StockInfoExten.itemName + 'extRrgt' + 't1321_1'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_1, StockInfoExten.t55)}>
                            {(StockInfoExten.t1321_1 === 0 || StockInfoExten.t1321_1 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t1321_1, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + this.state.StockInfoExten.t132_1_color} id={StockInfoExten.itemName + 'extRrgt' + 't132_1'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_1, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t132_1 == 777777710000 ? 'ATO' : (StockInfoExten.t132_1 == 777777720000 ?
                              'ATC' : ((StockInfoExten.t132_1
                                === 0 || StockInfoExten.t132_1 === 0.00) ? null : FormatNumber(StockInfoExten.t132_1, 0, 1))))}</span>
                        </td>

                        {/* Giá Dư bán + KL bán */}
                        <td className={"text-center " + StockInfoExten.t133_1_color} id={StockInfoExten.itemName + 'extRrgt' + 't133_3'} style={{ verticalAlign: 'middle' }}>
                          <span className="cursor_ponter" onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_1, StockInfoExten.t55)}>
                            {(StockInfoExten.t133_1 == 777777710000 ? 'ATO' : (StockInfoExten.t133_1 == 777777720000 ?
                              'ATC' : ((StockInfoExten.t133_1
                                === 0 || StockInfoExten.t133_1 === 0.00) ? null : FormatNumber(StockInfoExten.t133_1, 0, 1))))}
                          </span>
                        </td>
                        <td className={"text-left " + StockInfoExten.t133_1_color} id={StockInfoExten.itemName + 'extRrgt' + 't1331_3'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_1, StockInfoExten.t55)}>
                            {FormatNumber(StockInfoExten.t1331_1, 0, 1)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className={"text-right " + this.state.StockInfoExten.t132_2_color} id={StockInfoExten.itemName + 'extRrgt' + 't1321_2'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_2, StockInfoExten.t55)}>
                            {(StockInfoExten.t1321_2 === 0 || StockInfoExten.t1321_2 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t1321_2, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + this.state.StockInfoExten.t132_2_color} id={StockInfoExten.itemName + 'extRrgt' + 't132_2'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_2, StockInfoExten.t55)} className="cursor_ponter" >
                            {(StockInfoExten.t132_2 === 0 || StockInfoExten.t132_2 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t132_2, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + StockInfoExten.t133_2_color} id={StockInfoExten.itemName + 'extRrgt' + 't133_2'} style={{ verticalAlign: 'middle' }}>
                          <span className="cursor_ponter" onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_2, StockInfoExten.t55)}>
                            {FormatNumber(StockInfoExten.t133_2, 0, 1)}</span>
                        </td>
                        <td className={"text-left " + StockInfoExten.t133_2_color} id={StockInfoExten.itemName + 'extRrgt' + 't1331_2'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_2, StockInfoExten.t55)}>
                            {FormatNumber(StockInfoExten.t1331_2, 0, 1)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className={"text-right " + this.state.StockInfoExten.t132_3_color} id={StockInfoExten.itemName + 'extRrgt' + 't1321_3'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_3, StockInfoExten.t55)}>
                            {(StockInfoExten.t1321_3 === 0 || StockInfoExten.t1321_3 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t1321_3, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + this.state.StockInfoExten.t132_3_color} id={StockInfoExten.itemName + 'extRrgt' + 't132_3'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_3, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t132_3 === 0 || StockInfoExten.t132_3 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t132_3, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + StockInfoExten.t133_3_color} id={StockInfoExten.itemName + 'extRrgt' + 't133_3'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_3, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t133_3 == 777777710000 ? 'ATO' : (StockInfoExten.t133_3 == 777777720000 ?
                              'ATC' : ((StockInfoExten.t133_3
                                === 0 || StockInfoExten.t133_3 === 0.00) ? null : FormatNumber(StockInfoExten.t133_3, 0, 1))))}
                          </span>
                        </td>
                        <td className={"text-left " + StockInfoExten.t133_3_color} id={StockInfoExten.itemName + 'extRrgt' + 't1331_3'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_3, StockInfoExten.t55)}>
                            {FormatNumber(StockInfoExten.t1331_3, 0, 1)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className={"text-right " + this.state.StockInfoExten.t132_4_color} id={StockInfoExten.itemName + 'extRrgt' + 't1321_4'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_4, StockInfoExten.t55)}>
                            {(StockInfoExten.t1321_4 === 0 || StockInfoExten.t1321_4 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t1321_4, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + this.state.StockInfoExten.t132_4_color} id={StockInfoExten.itemName + 'extRrgt' + 't132_4'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_4, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t132_4 === 0 || StockInfoExten.t132_4 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t132_4, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + StockInfoExten.t133_4_color} id={StockInfoExten.itemName + 'extRrgt' + 't133_4'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_4, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t133_4 == 777777710000 ? 'ATO' : (StockInfoExten.t133_4 == 777777720000 ?
                              'ATC' : ((StockInfoExten.t133_4
                                === 0 || StockInfoExten.t133_4 === 0.00) ? null : FormatNumber(StockInfoExten.t133_4, 0, 1))))}
                          </span>
                        </td>
                        <td className={"text-left " + StockInfoExten.t133_4_color} id={StockInfoExten.itemName + 'extRrgt' + 't1331_4'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_4, StockInfoExten.t55)}>
                            {FormatNumber(StockInfoExten.t1331_4, 0, 1)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className={"text-right " + this.state.StockInfoExten.t132_5_color} id={StockInfoExten.itemName + 'extRrgt' + 't1321_5'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_5, StockInfoExten.t55)}>
                            {(StockInfoExten.t1321_5 === 0 || StockInfoExten.t1321_5 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t1321_5, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + this.state.StockInfoExten.t132_5_color} id={StockInfoExten.itemName + 'extRrgt' + 't132_5'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_5, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t132_5 === 0 || StockInfoExten.t132_5 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t132_5, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + StockInfoExten.t133_5_color} id={StockInfoExten.itemName + 'extRrgt' + 't133_5'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_5, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t133_5 == 777777710000 ? 'ATO' : (StockInfoExten.t133_5 == 777777720000 ?
                              'ATC' : ((StockInfoExten.t133_5
                                === 0 || StockInfoExten.t133_5 === 0.00) ? null : FormatNumber(StockInfoExten.t133_5, 0, 1))))}
                          </span>
                        </td>
                        <td className={"text-left " + StockInfoExten.t133_5_color} id={StockInfoExten.itemName + 'extRrgt' + 't1331_5'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_5, StockInfoExten.t55)}>
                            {FormatNumber(StockInfoExten.t1331_5, 0, 1)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className={"text-right " + this.state.StockInfoExten.t132_6_color} id={StockInfoExten.itemName + 'extRrgt' + 't1321_6'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_6, StockInfoExten.t55)}>
                            {(StockInfoExten.t1321_6 === 0 || StockInfoExten.t1321_6 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t1321_6, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + this.state.StockInfoExten.t132_6_color} id={StockInfoExten.itemName + 'extRrgt' + 't132_6'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_6, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t132_6 === 0 || StockInfoExten.t132_6 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t132_6, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + StockInfoExten.t133_6_color} id={StockInfoExten.itemName + 'extRrgt' + 't133_6'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_6, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t133_6 == 777777710000 ? 'ATO' : (StockInfoExten.t133_6 == 777777720000 ?
                              'ATC' : ((StockInfoExten.t133_6
                                === 0 || StockInfoExten.t133_6 === 0.00) ? null : FormatNumber(StockInfoExten.t133_6, 0, 1))))}
                          </span>
                        </td>
                        <td className={"text-left " + StockInfoExten.t133_6_color} id={StockInfoExten.itemName + 'extRrgt' + 't1331_6'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_6, StockInfoExten.t55)}>
                            {FormatNumber(StockInfoExten.t1331_6, 0, 1)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className={"text-right " + this.state.StockInfoExten.t132_7_color} id={StockInfoExten.itemName + 'extRrgt' + 't1321_7'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_7, StockInfoExten.t55)}>
                            {(StockInfoExten.t1321_7 === 0 || StockInfoExten.t1321_7 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t1321_7, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + this.state.StockInfoExten.t132_7_color} id={StockInfoExten.itemName + 'extRrgt' + 't132_7'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_7, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t132_7 === 0 || StockInfoExten.t132_7 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t132_7, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + StockInfoExten.t133_7_color} id={StockInfoExten.itemName + 'extRrgt' + 't133_7'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_7, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t133_7 == 777777710000 ? 'ATO' : (StockInfoExten.t133_7 == 777777720000 ?
                              'ATC' : ((StockInfoExten.t133_7
                                === 0 || StockInfoExten.t133_7 === 0.00) ? null : FormatNumber(StockInfoExten.t133_7, 0, 1))))}
                          </span>
                        </td>
                        <td className={"text-left " + StockInfoExten.t133_7_color} id={StockInfoExten.itemName + 'extRrgt' + 't1331_7'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_7, StockInfoExten.t55)}>
                            {FormatNumber(StockInfoExten.t1331_7, 0, 1)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className={"text-right " + this.state.StockInfoExten.t132_8_color} id={StockInfoExten.itemName + 'extRrgt' + 't1321_8'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_8, StockInfoExten.t55)}>
                            {(StockInfoExten.t1321_8 === 0 || StockInfoExten.t1321_8 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t1321_8, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + this.state.StockInfoExten.t132_8_color} id={StockInfoExten.itemName + 'extRrgt' + 't132_8'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_8, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t132_8 === 0 || StockInfoExten.t132_8 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t132_8, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + StockInfoExten.t133_8_color} id={StockInfoExten.itemName + 'extRrgt' + 't133_8'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_8, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t133_8 == 777777710000 ? 'ATO' : (StockInfoExten.t133_8 == 777777720000 ?
                              'ATC' : ((StockInfoExten.t133_8
                                === 0 || StockInfoExten.t133_8 === 0.00) ? null : FormatNumber(StockInfoExten.t133_8, 0, 1))))}
                          </span>
                        </td>
                        <td className={"text-left " + StockInfoExten.t133_8_color} id={StockInfoExten.itemName + 'extRrgt' + 't1331_8'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_8, StockInfoExten.t55)}>
                            {FormatNumber(StockInfoExten.t1331_8, 0, 1)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className={"text-right " + this.state.StockInfoExten.t132_9_color} id={StockInfoExten.itemName + 'extRrgt' + 't1321_9'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_9, StockInfoExten.t55)}>
                            {(StockInfoExten.t1321_9 === 0 || StockInfoExten.t1321_9 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t1321_9, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + this.state.StockInfoExten.t132_9_color} id={StockInfoExten.itemName + 'extRrgt' + 't132_9'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_9, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t132_9 === 0 || StockInfoExten.t132_9 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t132_9, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + StockInfoExten.t133_9_color} id={StockInfoExten.itemName + 'extRrgt' + 't133_9'} style={{ verticalAlign: 'middle' }} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_9, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t133_9 == 777777710000 ? 'ATO' : (StockInfoExten.t133_9 == 777777720000 ?
                              'ATC' : ((StockInfoExten.t133_9
                                === 0 || StockInfoExten.t133_9 === 0.00) ? null : FormatNumber(StockInfoExten.t133_9, 0, 1))))}
                          </span>
                        </td>
                        <td className={"text-left " + StockInfoExten.t133_9_color} id={StockInfoExten.itemName + 'extRrgt' + 't1331_9'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_9, StockInfoExten.t55)}>
                            {FormatNumber(StockInfoExten.t1331_9, 0, 1)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className={"text-right " + this.state.StockInfoExten.t132_10_color} id={StockInfoExten.itemName + 'extRrgt' + 't1321_10'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_10, StockInfoExten.t55)}>
                            {(StockInfoExten.t1321_10 === 0 || StockInfoExten.t1321_10 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t1321_10, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + this.state.StockInfoExten.t132_10_color} id={StockInfoExten.itemName + 'extRrgt' + 't132_10'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_10, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t132_10 === 0 || StockInfoExten.t132_10 === 0.00) ? null :
                              FormatNumber(StockInfoExten.t132_10, 0, 1)}
                          </span>
                        </td>
                        <td className={"text-center " + StockInfoExten.t133_10_color} id={StockInfoExten.itemName + 'extRrgt' + 't133_10'} style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_10, StockInfoExten.t55)} className="cursor_ponter">
                            {(StockInfoExten.t133_10 == 777777710000 ? 'ATO' : (StockInfoExten.t133_10 == 777777720000 ?
                              'ATC' : ((StockInfoExten.t133_10
                                === 0 || StockInfoExten.t133_10 === 0.00) ? null : FormatNumber(StockInfoExten.t133_10, 0, 1))))}
                          </span>
                        </td>
                        <td className={"text-left " + StockInfoExten.t133_10_color} id={StockInfoExten.itemName + 'extRrgt' + 't1331_10'} style={{ verticalAlign: 'middle' }}>
                          <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_10, StockInfoExten.t55)}>
                            {FormatNumber(StockInfoExten.t1331_10, 0, 1)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className='buyColor text-right' style={{ verticalAlign: 'middle' }}>
                          <IconSigma />{t('priceboard_over_buy_quantity')}{': '}
                          {FormatNumber(Number(StockInfoExten.t1321_3) + Number(StockInfoExten.t1321_2) +
                            Number(StockInfoExten.t1321_1) + Number(StockInfoExten.t1321_4) + Number(StockInfoExten.t1321_5) +
                            Number(StockInfoExten.t1321_6) + Number(StockInfoExten.t1321_7) + Number(StockInfoExten.t1321_8) +
                            Number(StockInfoExten.t1321_9) + Number(StockInfoExten.t1321_10))}
                        </td>
                        <td className='text-center' colSpan='2' style={{ verticalAlign: 'middle' }}>
                          <span onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t31, StockInfoExten.t55)} className={'cursor_ponter ' + StockInfoExten.t31_color}>
                            {t('match_price_short')} {FormatNumber(Number(StockInfoExten.t31), 0, 1)}
                            {' '}{((StockInfoExten.t260 == null || StockInfoExten.t260 == undefined || StockInfoExten.t31 == null || StockInfoExten.t31 == 0 || StockInfoExten.t31 == undefined || (StockInfoExten.t31 - StockInfoExten.t260 == 0)) ? null : (<>
                              ({FormatNumber(((StockInfoExten.t31 - StockInfoExten.t260) * 100) / StockInfoExten.t260, 2, 1)}  %)</>))}
                          </span></td>
                        <td className='sellColor text-right' style={{ verticalAlign: 'middle' }}>
                          <IconSigma />{t('priceboard_over_sell_quantity')}{': '}
                          {FormatNumber(Number(StockInfoExten.t1331_3) + Number(StockInfoExten.t1331_2) +
                            Number(StockInfoExten.t1331_1) + Number(StockInfoExten.t1331_4) + Number(StockInfoExten.t1331_5) +
                            Number(StockInfoExten.t1331_6) + Number(StockInfoExten.t1331_7) + Number(StockInfoExten.t1331_8) + 
                            Number(StockInfoExten.t1331_9) + Number(StockInfoExten.t1331_10)
                          )}
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              //</div>
            //</div>
        )
    }

}
export default translate('translations')(BidAskTable);
