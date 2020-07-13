import React from 'react';
import uniqueId from "lodash/uniqueId";
import { translate } from 'react-i18next';
import FormatNumber from '../formatNumber/FormatNumber'
import commuChanel from '../../constants/commChanel'
import { ReactComponent as IconSigma } from '../../conponents/translate/icon/functions-glyph-24_rounded.svg';
import { showLogin } from '../../utils/show_login';
import { inform_broadcast } from '../../utils/broadcast_service';

class MarketInformationTable extends React.PureComponent {
    constructor(props) {
      super(props);
      this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
      this.component = this.props.component
      this.state = {
        StockInfoExten: this.props.StockInfoExten,
        dataInfoDetail: this.props.dataInfoDetail,
        show_tablePriceInfo_or_infoDetails: true
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

    transDate = (value) => {
      if (value === '' || value == null) return value;
      const day = value.substr(0, 2);
      const month = value.substr(2, 2);
      const year = value.substr(4, 4);
      return (day + '/' + month + '/' + year);
    }

    show_tablePriceInfo_or_infoDetails = (b) => {
        console.log(b)
        this.setState({show_tablePriceInfo_or_infoDetails: b})
      
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
      const {StockInfoExten} = this.props;
        return (
            <div className="card stockInfoExtent">
              {/* <div className="clearfix">
                <ul className="nav nav-tabs top pull-left w-100p">
                  <li className="nav-item">
                    <a className="nav-link active" data-toggle="tab" onClick={this.show_tablePriceInfo_or_infoDetails.bind(this, false)} aria-expanded="true">{t('general_info')}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" data-toggle="tab" onClick={this.show_tablePriceInfo_or_infoDetails.bind(this, true)} aria-expanded="false">{t('common_Detail')}</a>
                  </li>
                </ul>
              </div> */}
              <div className="clearfix">
                <ul className="nav nav-tabs top pull-left w-100p" 
                style={{ background: 'var(--main__table__background)',
                         borderBottom: 'none',
                         boxShadow: '0 6px 4px rgba(0,0,0,.24), 0 6px 28px var(--main__table__background)'
                      }}>
                  <li className="nav-item">
                    <a className="nav-link active" data-toggle="tab" href="#tablePriceInfo" aria-expanded="true">{t('general_info')}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" data-toggle="tab" href="#infoDetails" aria-expanded="false">{t('common_Detail')}</a>
                  </li>
                </ul>
              </div>
              <div className="tab-content top" style={{ padding: 0 }}>
                <div className="tab-pane active" id="tablePriceInfo" aria-expanded="true" style={{ padding: '0' }}>
                  <div className="card-body widget-body" style={{ padding: '0' }}>
                    <div className="table-responsive">
                      {StockInfoExten.t167 !== 'CW' && <table className="tableStockInfo table-nowrap table_sticky table_priceboard_small table_stk_info table-striped" style={{ height: 253, marginBottom: 5 }}>
                        <tbody>
                          <tr>
                            <td style={{ textAlign: 'left', width: '50%', verticalAlign: 'middle' }}>{t('priceboard_ceil_floor_price')}</td>
                            <td className="text-right price_ceil_color" style={{ width: '25%', verticalAlign: 'middle' }} id={StockInfoExten.itemName + 'ext' + 't332'}>
                              <span className="cursor_ponter" onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t332, StockInfoExten.t55)}>
                                {(StockInfoExten.t332 == 0 || StockInfoExten.t332 == 0.0 || StockInfoExten.t332 == null) ? null : FormatNumber(StockInfoExten.t332, 0, 1)}</span>
                            </td>
                            <td className="text-right price_floor_color" style={{ width: '25%', verticalAlign: 'middle' }} id={StockInfoExten.itemName + 'ext' + 't333'}>
                              <span className="cursor_ponter" onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t333, StockInfoExten.t55)}>
                                {(StockInfoExten.t333 == 0 || StockInfoExten.t333 == 0.0 || StockInfoExten.t333 == null) ? null : FormatNumber(StockInfoExten.t333, 0, 1)}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('priceboard_avg_refer_price')}</td>
                            <td className={"text-right " + color_t631} id={StockInfoExten.itemName + 'ext' + 't631'} style={{ verticalAlign: 'middle' }}>
                              <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t631, StockInfoExten.t55)}>{(StockInfoExten.t631 == 0 || StockInfoExten.t631 == 0.0 || StockInfoExten.t631 ==
                                null) ? null : FormatNumber(StockInfoExten.t631, 0, 1)}</span>
                            </td>
                            <td className="text-right price_basic_color" id={StockInfoExten.itemName + 'ext' + 't260'} style={{ verticalAlign: 'middle' }}>
                              <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t260, StockInfoExten.t55)}>{(StockInfoExten.t260 == 0 || StockInfoExten.t260 == 0.0 || StockInfoExten.t260 ==
                                null) ? null : FormatNumber(StockInfoExten.t260, 0, 1)}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('priceboard_open_close_price')}</td>
                            <td className={"text-right " + color_t137} id={StockInfoExten.itemName + 'ext' + 't137'} style={{ verticalAlign: 'middle' }}>
                              <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t137, StockInfoExten.t55)}>{(StockInfoExten.t137 == 0 || StockInfoExten.t137 == 0.0 || StockInfoExten.t137 == null)
                                ? (StockInfoExten.U17 > 0 ? ('E' + FormatNumber(StockInfoExten.t137, 0, 1)) :
                                  ((StockInfoExten.t137 == 0 || StockInfoExten.t137 == 0.0 || StockInfoExten.t137 == null) ? null :
                                    FormatNumber(StockInfoExten.t137, 0, 1))) : ((StockInfoExten.t137 == 0 ||
                                      StockInfoExten.t137
                                      == 0.0 || StockInfoExten.t137 == null) ? null : FormatNumber(StockInfoExten.t137, 0, 1))}
                              </span>
                            </td>
                            <td className={"text-right " + color_t139} id={StockInfoExten.itemName + 'ext' + 't139'} style={{ verticalAlign: 'middle' }}>
                              <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t139, StockInfoExten.t55)}>{(StockInfoExten.t139 == 0 || StockInfoExten.t139 == 0.0 || StockInfoExten.t139 == null)
                                ? (StockInfoExten.U18 > 0 ? ('E' + FormatNumber(StockInfoExten.t139)) : ((StockInfoExten.t139 == 0 || StockInfoExten.t139 ==
                                  0.0 || StockInfoExten.t139
                                  == null) ? null : FormatNumber(StockInfoExten.t139, 0, 1))) : ((StockInfoExten.t139 == 0 ||
                                    StockInfoExten.t139
                                    == 0.0 || StockInfoExten.t139 == null) ? null : FormatNumber(StockInfoExten.t139, 0, 1))}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('priceboard_hight_low_price')}</td>
                            <td className={"text-right " + color_t266} id={StockInfoExten.itemName + 'ext' + 't266'} style={{ verticalAlign: 'middle' }}>
                              <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t266, StockInfoExten.t55)}>{(StockInfoExten.t266 == 0 || StockInfoExten.t266 == 0.0 || StockInfoExten.t266 == null)
                                ? null : FormatNumber(StockInfoExten.t266, 0, 1)}</span>
                            </td>
                            <td className={"text-right " + color_t2661} id={StockInfoExten.itemName + 'ext' + 't2661'} style={{ verticalAlign: 'middle' }}>
                              <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t2661, StockInfoExten.t55)}>{(StockInfoExten.t2661 == 0 || StockInfoExten.t2661 == 0.0 || StockInfoExten.t2661 ==
                                null) ? null : FormatNumber(StockInfoExten.t2661, 0, 1)}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}><IconSigma />{t('priceboard_total_volume_foreign_buy_sell')}</td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t397 == 0 || StockInfoExten.t397 == 0.0 || StockInfoExten.t397 == null) ?
                                null : FormatNumber(StockInfoExten.t397, 0, 1)}
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t398 == 0 || StockInfoExten.t398 == 0.0 || StockInfoExten.t398 == null) ?
                                null : FormatNumber(StockInfoExten.t398, 0, 1)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}><IconSigma />{t('priceboard_total_value_foreign_buy_sell')}</td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t3971 == 0 || StockInfoExten.t3971 == 0.0 ||
                                StockInfoExten.t3971 == null) ? null : FormatNumber(StockInfoExten.t3971, 0, 1)}
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t3981 == 0 || StockInfoExten.t3981 == 0.0 ||
                                StockInfoExten.t3981 == null) ? null : FormatNumber(StockInfoExten.t3981, 0, 1)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('priceboard_foreign_room')}</td>
                            <td className="text-right" colSpan={2} style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t3301 == 0 || StockInfoExten.t3301 ==
                                0.0 || StockInfoExten.t3301 == null) ? null : FormatNumber(StockInfoExten.t3301, 0, 1)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}><IconSigma />{t('priceboard_total_qty_value_trading')}</td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t387 == 0 || StockInfoExten.t387 == 0.0 ||
                                StockInfoExten.t387 == null) ? null : FormatNumber(StockInfoExten.t387)}
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t3871 == 0 || StockInfoExten.t3871 == 0.0 ||
                                StockInfoExten.t3871 == null) ? null : FormatNumber(StockInfoExten.t3871, 0, 1)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('priceboard_price_over_buy_sell')}</td>
                            <td className={"text-right " + color_t132_1} id={StockInfoExten.itemName + 'ext' + 't132_1'} style={{ verticalAlign: 'middle' }}>
                              <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_1, StockInfoExten.t55)}>{(StockInfoExten.t132_1 == 777777710000 ? 'ATO' : (StockInfoExten.t132_1 == 777777720000
                                ? 'ATC' : ((StockInfoExten.t132_1
                                  == 0 || StockInfoExten.t132_1 == 0.0 || StockInfoExten.t132_1 == null) ? null :
                                  FormatNumber(StockInfoExten.t132_1, 0, 1))))}</span>
                            </td>
                            <td className={"text-right " + color_t133_1} id={StockInfoExten.itemName + 'ext' + 't133_1'} style={{ verticalAlign: 'middle' }}>
                              <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_1, StockInfoExten.t55)}>{(StockInfoExten.t133_1 == 777777710000 ? 'ATO' : (StockInfoExten.t133_1 ==
                                777777720000 ? 'ATC' : ((StockInfoExten.t133_1
                                  == 0 || StockInfoExten.t133_1 == 0.0 || StockInfoExten.t133_1 == null) ? null :
                                  FormatNumber(StockInfoExten.t133_1, 0, 1))))}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      }
                      {StockInfoExten.t167 === 'CW' && <table className="tableStockInfo table-nowrap table_sticky tpadingleft table_priceboard_small table_stk_info table-striped" style={{ height: 253, marginBottom: 5 }}>
                        <tbody>
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('priceboard_ceil_floor_price')}</td>
                            <td className="text-right price_ceil_color" id={StockInfoExten.itemName + 'ext' + 't332'} style={{ verticalAlign: 'middle' }}>
                              <span className="cursor_ponter" onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t332, StockInfoExten.t55)}>
                                {(StockInfoExten.t332 == 0 || StockInfoExten.t332 == 0.0 || StockInfoExten.t332 == null) ? null : FormatNumber(StockInfoExten.t332)}
                              </span>
                            </td>
                            <td className="text-right price_floor_color" id={StockInfoExten.itemName + 'ext' + 't333'} style={{ verticalAlign: 'middle' }}>
                              <span className="cursor_ponter" onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t333, StockInfoExten.t55)}>
                                {(StockInfoExten.t333 == 0 || StockInfoExten.t333 == 0.0 || StockInfoExten.t333 == null) ? null : FormatNumber(StockInfoExten.t333)}
                              </span>
                            </td>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('priceboard_avg_refer_price')}</td>
                            <td className={"text-right " + color_t631} id={StockInfoExten.itemName + 'ext' + 't631'} style={{ verticalAlign: 'middle' }}>
                              <span className="cursor_ponter" onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t631, StockInfoExten.t55)}>
                                {(StockInfoExten.t631 == 0 || StockInfoExten.t631 == 0.0 || StockInfoExten.t631 == null) ? null : FormatNumber(StockInfoExten.t631)}
                              </span>
                            </td>
                            <td className="text-right price_basic_color" id={StockInfoExten.itemName + 'ext' + 't260'} style={{ verticalAlign: 'middle' }}>
                              <span className="cursor_ponter" onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t260, StockInfoExten.t55)}>
                                {(StockInfoExten.t260 == 0 || StockInfoExten.t260 == 0.0 || StockInfoExten.t260 == null) ? null : FormatNumber(StockInfoExten.t260)}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('priceboard_open_close_price')}</td>
                            <td className={"text-right " + color_t137} id={StockInfoExten.itemName + 'ext' + 't137'} style={{ verticalAlign: 'middle' }}>
                              <span className="cursor_ponter" onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t137, StockInfoExten.t55)} style={{ verticalAlign: 'middle' }}>
                                {(StockInfoExten.t137 == 0 || StockInfoExten.t137 == 0.0 || StockInfoExten.t137 == null) ? (StockInfoExten.U17 > 0 ? ('E'
                                  + (StockInfoExten.U17)) : ((StockInfoExten.t137 == 0 || StockInfoExten.t137 == 0.0 || StockInfoExten.t137
                                    == null) ? null : (StockInfoExten.t137))) : ((StockInfoExten.t137 == 0 || StockInfoExten.t137
                                      == 0.0 || StockInfoExten.t137 == null) ? null : FormatNumber(StockInfoExten.t137))}
                              </span>
                            </td>
                            <td className={"text-right " + color_t139} id={StockInfoExten.itemName + 'ext' + 't139'} style={{ verticalAlign: 'middle' }}>
                              <span className="cursor_ponter" onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t139, StockInfoExten.t55)}>
                                {(StockInfoExten.t139 == 0 || StockInfoExten.t139 == 0.0 || StockInfoExten.t139 == null) ? (StockInfoExten.U18 > 0 ? ('E'
                                  + (StockInfoExten.U18)) : ((StockInfoExten.t139 == 0 || StockInfoExten.t139 == 0.0 || StockInfoExten.t139
                                    == null) ? null : (StockInfoExten.t139))) : ((StockInfoExten.t139 == 0 || StockInfoExten.t139
                                      == 0.0 || StockInfoExten.t139 == null) ? null : FormatNumber(StockInfoExten.t139))}
                              </span>
                            </td>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('priceboard_hight_low_price')}</td>
                            <td className={"text-right " + color_t266} id={StockInfoExten.itemName + 'ext' + 't266'} style={{ verticalAlign: 'middle' }}>
                              <span className="cursor_ponter" onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t266, StockInfoExten.t55)}>
                                {(StockInfoExten.t266 == 0 || StockInfoExten.t266 == 0.0 || StockInfoExten.t266 == null) ? null : FormatNumber(StockInfoExten.t266)}
                              </span>
                            </td>
                            <td className={"text-right " + color_t2661} id={StockInfoExten.itemName + 'ext' + 't2661'} style={{ verticalAlign: 'middle' }}>
                              <span className="cursor_ponter" onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t2661, StockInfoExten.t55)}>
                                {(StockInfoExten.t2661 == 0 || StockInfoExten.t2661 == 0.0 || StockInfoExten.t2661 == null) ? null : FormatNumber(StockInfoExten.t2661)}
                              </span>
                            </td>
                          </tr>
                          {/* Tổng khối lượng NG mua/bán + tổng giá trị NG mua/bán */}
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}><IconSigma />{t('priceboard_total_volume_foreign_buy_sell')}</td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}> 
                              {(StockInfoExten.t397 == 0 || StockInfoExten.t397 == 0.0 || StockInfoExten.t397 == null) ? null : FormatNumber(StockInfoExten.t397)}
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t398 == 0 || StockInfoExten.t398 == 0.0 || StockInfoExten.t398 == null) ? null : FormatNumber(StockInfoExten.t398)}
                            </td>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}><IconSigma />{t('priceboard_total_value_foreign_buy_sell')}</td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t3971 == 0 || StockInfoExten.t3971 == 0.0 || StockInfoExten.t3971 == null) ? null : FormatNumber(StockInfoExten.t3971)}
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t3981 == 0 || StockInfoExten.t3981 == 0.0 || StockInfoExten.t3981 == null) ? null : FormatNumber(StockInfoExten.t3981)}
                            </td>
                          </tr>
                          {/* Room nhà đầu tư NG + giá dư mua/bán tốt nhất */}
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('priceboard_foreign_room')}</td>
                            <td className="text-right" colSpan={2} style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t3301 == 0 || StockInfoExten.t3301 == 0.0 || StockInfoExten.t3301 == null) ? null : FormatNumber(StockInfoExten.t3301)}
                            </td>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('priceboard_price_over_buy_sell')}</td>
                            <td className={"text-right " + color_t132_1} id={StockInfoExten.itemName + 'ext' + 't132_1'} style={{ verticalAlign: 'middle' }}>
                              <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('2', StockInfoExten.t132_1, StockInfoExten.t55)}>{StockInfoExten.t132_1 == 777777710000 ? 'ATO' : (StockInfoExten.t132_1 == 777777720000 ? 'ATC' : ((StockInfoExten.t132_1
                                == 0 || StockInfoExten.t132_1 == 0.0 || StockInfoExten.t132_1 == null) ? null : FormatNumber(StockInfoExten.t132_1
                                )))}</span>
                            </td>
                            <td className={"text-right " + color_t133_1} id={StockInfoExten.itemName + 'ext' + 't133_1'} style={{ verticalAlign: 'middle' }}>
                              <span className='cursor_ponter' onDoubleClick={() => this.getPriceOrder('1', StockInfoExten.t133_1, StockInfoExten.t55)}>{StockInfoExten.t133_1 == 777777710000 ? 'ATO' : (StockInfoExten.t133_1 == 777777720000 ? 'ATC' : ((StockInfoExten.t133_1
                                == 0 || StockInfoExten.t133_1 == 0.0 || StockInfoExten.t133_1 == null) ? null : FormatNumber(StockInfoExten.t133_1
                                )))}</span>
                            </td>
                          </tr>
                          {/* Tổng khối lượng gd + tổng giá trị gd */}
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}><IconSigma />{t('trade_volume_change')}</td>
                            <td colSpan={2} className="text-right" style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t387 == 0 || StockInfoExten.t387 == 0.0 || StockInfoExten.t387 == null) ? null : FormatNumber(StockInfoExten.t387)}
                            </td>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}><IconSigma />{t('trade_value_change')}</td>
                            <td colSpan={2} className="text-right" style={{ verticalAlign: 'middle' }}>
                              {(StockInfoExten.t3871 == 0 || StockInfoExten.t3871 == 0.0 || StockInfoExten.t3871 == null) ? null : FormatNumber(StockInfoExten.t3871
                              )}</td>
                          </tr>
                          {/* CK cơ sở + loại CQ */}
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('basic_stock')}</td>
                            <td colSpan={2} className="text-right cursor_ponter" style={{ verticalAlign: 'middle' }}>{StockInfoExten.U24}</td>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('covert_warrant')}</td>
                            <td colSpan={2} className={"text-right " + (StockInfoExten.U19 == 'C' ? 'skyColor' : 'price_basic_less')} style={{ verticalAlign: 'middle' }}>{StockInfoExten.U19 == 'C' ? t('buy_covered_warrant') : t('sell_covered_warrant')}</td>
                          </tr>
                          {/* Giá thực hiện + KL niêm yết */}
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('process_price')}</td>
                            <td colSpan={2} className="text-right" style={{ verticalAlign: 'middle' }}>{FormatNumber(StockInfoExten.U22 * 1000)}</td>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('listed_qty')}</td>
                            <td colSpan={2} className="text-right" style={{ verticalAlign: 'middle' }}>{FormatNumber(StockInfoExten.t109)}</td>
                          </tr>
                          {/* Tỷ lệ chuyển đổi */}
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('transfer_ratio')}</td>
                            <td colSpan={2} className="text-right" style={{ verticalAlign: 'middle' }}>{StockInfoExten.U23}</td>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }} />
                            <td className="text-right" />
                            <td className="text-right" />
                          </tr>
                          {/* Đáo hạn + GD gần nhất */}
                          <tr>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('expired')}</td>
                            <td colSpan={2} className="text-right" style={{ verticalAlign: 'middle' }}>{this.transDate(StockInfoExten.U20)}</td>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{t('last_trading_day')}</td>
                            <td colSpan={2} className="text-right" style={{ verticalAlign: 'middle' }}>{this.transDate(StockInfoExten.U21)}</td>
                          </tr>
                        </tbody>
                      </table>}
                    </div>
                  </div>
                </div>
                
                <div className="tab-pane" id="infoDetails" aria-expanded="false" style={{ padding: '0' }}>
                  <div className="card-body widget-body" style={{ padding: '0', position: 'relative', overflow: 'hidden' }}>
                    <table className="tableNormal table_sticky table table-sm tablenowrap table-bordered table-striped " style={{ height: 245 }}>
                      <thead className="header">
                        <tr>
                          <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('time')}
                          </th>
                          <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('common_bottom')}
                          </th>
                          <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('common_top')}
                          </th>
                          <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('common_change')}
                          </th>
                          <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('priceboard_total_qtty_trading')}
                          </th>
                          <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('priceboard_total_value_trading')} {' '}{'(' + t('billion') + ')'}
                          </th>
                          <th style={{ verticalAlign: 'middle' }} className="text-center">
                            {t('common_average_tradVol')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.dataInfoDetail.map(item =>
                          <tr key={uniqueId('dataInfoDetail')}>
                            <td className="text-center" style={{ verticalAlign: 'middle' }}>
                              {item.c1}
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {FormatNumber(item.c2, 0, 0)}
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {FormatNumber(item.c4, 0, 0)}
                            </td>
                            <td className={"text-right " + (Number(item.c9) > 0 ? 'price_basic_over' : (Number(item.c9) < 0 ? 'price_basic_less' : ''))} style={{ verticalAlign: 'middle' }}>
                              {FormatNumber(Math.round(Number(item.c9) * 100) / 100, 2, 0)}%
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {FormatNumber(item.c6, 0, 0)}
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {FormatNumber(Math.round(Number(item.c7) * 10) / 10, 1, 0)}
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                              {FormatNumber(item.c8, 0, 0)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
              </div>
            </div>
        )
    }

}
export default translate('translations')(MarketInformationTable);
