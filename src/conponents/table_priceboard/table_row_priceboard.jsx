import React from 'react';
import glb_sv from '../../utils/globalSv/service/global_service';
import NumberFormat from 'react-number-format';
import FormatNumber from '../formatNumber/FormatNumber';
import {inform_stkTradEvent_broadcast, inform_broadcast} from '../../utils/broadcast_service'
import commuChanel from '../../constants/commChanel'
import {update_value_for_glb_sv} from '../../utils/update_value_for_glb_sv'
import { showLogin } from '../../utils/show_login';

let countReceive = 0;
class TableRowPriceboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemName: this.props.row.itemName,
      t55: this.props.row.t55,
      t260: this.props.row.t260,
      t333: this.props.row.t333,
      t332: this.props.row.t332,
      t132_3: this.props.row.t132_3,
      t132_3_color: this.props.row.t132_3_color,
      t1321_3: this.props.row.t1321_3,
      t132_2: this.props.row.t132_2,
      t132_2_color: this.props.row.t132_2_color,
      t1321_2: this.props.row.t1321_2,
      t132_1: this.props.row.t132_1,
      t132_1_color: this.props.row.t132_1_color,
      t1321_1: this.props.row.t1321_1,
      t31_color: this.props.row.t31_color,
      t31: this.props.row.t31,
      t32: this.props.row.t32,
      t133_1: this.props.row.t133_1,
      t133_1_color: this.props.row.t133_1_color,
      t1331_1: this.props.row.t1331_1,
      t133_2: this.props.row.t133_2,
      t133_2_color: this.props.row.t133_2_color,
      t1331_2: this.props.row.t1331_2,
      t133_3: this.props.row.t133_3,
      t133_3_color: this.props.row.t133_3_color,
      t1331_3: this.props.row.t1331_3,
      t137: this.props.row.t137,
      t137_color: this.props.row.t137_color,
      t631: this.props.row.t631,
      t631_color: this.props.row.t631_color,
      t2661: this.props.row.t2661,
      t2661_color: this.props.row.t2661_color,
      t266: this.props.row.t266,
      t266_color: this.props.row.t266_color,
      t3301: this.props.row.t3301,
      U9: this.props.row.U9,
      U8: this.props.row.U8,
      t387: this.props.row.t387,
      t397: this.props.row.t397,
      type: this.props.type,
      changRoom: true,
      selected: this.props.selected,
      showRatio: this.props.showRatio,
      title_priceboard: this.props.title_priceboard,
      sellbuy_tp: this.props.row.Type,
      Price: this.props.row.Price,
      orderBol: this.props.row.orderBol || false
    };
    this.firtLoad = true;

    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.req_component = this.props.req_component
    this.get_rq_seq_comp = this.props.get_rq_seq_comp;
    this.mounted = true;
    // console.log(this.props.component)
  }

  componentDidMount() {
    window.ipcRenderer.on(`${commuChanel.mrkInfoEvent}_${this.props.component}`, (event, msgObject) => {
      if (msgObject.data.t55 === this.state.t55) {
        // console.log(this.state.t55)
        countReceive++;
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.props.component, value: 'firsTimeLoad', sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
          if (
            this.state.itemName === undefined ||
            this.state.t260 === undefined ||
            this.state.t333 === undefined ||
            this.state.t332 === undefined
  
          ) {
            if (this.mounted) this.setState({
              itemName: msgObject.data.itemName,
              t260: msgObject.data.t260,
              t333: msgObject.data.t333,
              t332: msgObject.data.t332,
              t132_3: msgObject.data.t132_3,
              t132_3_color: msgObject.data.t132_3_color,
              t132_2: msgObject.data.t132_2,
              t132_2_color: msgObject.data.t132_2_color,
              t1321_2: msgObject.data.t1321_2,
              t1321_3: msgObject.data.t1321_3,
              t132_1: msgObject.data.t132_1,
              t132_1_color: msgObject.data.t132_1_color,
              t1321_1: msgObject.data.t1321_1,
              t31_color: msgObject.data.t31_color,
              t31: msgObject.data.t31,
              t32: msgObject.data.t32,
              t133_1: msgObject.data.t133_1,
              t133_1_color: msgObject.data.t133_1_color,
              t1331_1: msgObject.data.t1331_1,
              t133_2: msgObject.data.t133_2,
              t133_2_color: msgObject.data.t133_2_color,
              t1331_2: msgObject.data.t1331_2,
              t133_3: msgObject.data.t133_3,
              t133_3_color: msgObject.data.t133_3_color,
              t1331_3: msgObject.data.t1331_3,
              t137: msgObject.data.t137,
              t137_color: msgObject.data.t137_color,
              t631: msgObject.data.t631,
              t631_color: msgObject.data.t631_color,
              t2661: msgObject.data.t2661,
              t2661_color: msgObject.data.t2661_color,
              t266: msgObject.data.t266,
              t266_color: msgObject.data.t266_color,
              t3301: msgObject.data.t3301,
              U9: msgObject.data.U9,
              t387: msgObject.data.t387,
              t397: msgObject.data.t397
            });
          } else {
              if (agrs || countReceive > 0) this.procFlash(msgObject.change, this.state.itemName);
              if (this.mounted) this.setState({
                itemName: msgObject.data.itemName,
                t260: msgObject.data.t260,
                t333: msgObject.data.t333,
                t332: msgObject.data.t332,
                t132_3: msgObject.data.t132_3,
                t132_3_color: msgObject.data.t132_3_color,
                t132_2: msgObject.data.t132_2,
                t132_2_color: msgObject.data.t132_2_color,
                t1321_2: msgObject.data.t1321_2,
                t1321_3: msgObject.data.t1321_3,
                t132_1: msgObject.data.t132_1,
                t132_1_color: msgObject.data.t132_1_color,
                t1321_1: msgObject.data.t1321_1,
                t31_color: msgObject.data.t31_color,
                t31: msgObject.data.t31,
                t32: msgObject.data.t32,
                t133_1: msgObject.data.t133_1,
                t133_1_color: msgObject.data.t133_1_color,
                t1331_1: msgObject.data.t1331_1,
                t133_2: msgObject.data.t133_2,
                t133_2_color: msgObject.data.t133_2_color,
                t1331_2: msgObject.data.t1331_2,
                t133_3: msgObject.data.t133_3,
                t133_3_color: msgObject.data.t133_3_color,
                t1331_3: msgObject.data.t1331_3,
                t137: msgObject.data.t137,
                t137_color: msgObject.data.t137_color,
                t631: msgObject.data.t631,
                t631_color: msgObject.data.t631_color,
                t2661: msgObject.data.t2661,
                t2661_color: msgObject.data.t2661_color,
                t266: msgObject.data.t266,
                t266_color: msgObject.data.t266_color,
                t3301: msgObject.data.t3301,
                U9: msgObject.data.U9,
                t387: msgObject.data.t387,
                t397: msgObject.data.t397,
              });
            // },0)
          }
        })
      }
    })
  }

  componentWillReceiveProps(props) {
    if (this.state.t55 === props.row.t55) { 
      if (this.mounted) this.setState({
        itemName: props.row.itemName,
        t260: props.row.t260,
        t333: props.row.t333,
        t332: props.row.t332,
        t132_3: props.row.t132_3,
        t132_3_color: props.row.t132_3_color,
        t132_2: props.row.t132_2,
        t132_2_color: props.row.t132_2_color,
        t1321_2: props.row.t1321_2,
        t1321_3: props.row.t1321_3,
        t132_1: props.row.t132_1,
        t132_1_color: props.row.t132_1_color,
        t1321_1: props.row.t1321_1,
        t31_color: props.row.t31_color,
        t31: props.row.t31,
        t32: props.row.t32,
        t133_1: props.row.t133_1,
        t133_1_color: props.row.t133_1_color,
        t1331_1: props.row.t1331_1,
        t133_2: props.row.t133_2,
        t133_2_color: props.row.t133_2_color,
        t1331_2: props.row.t1331_2,
        t133_3: props.row.t133_3,
        t133_3_color: props.row.t133_3_color,
        t1331_3: props.row.t1331_3,
        t137: props.row.t137,
        t137_color: props.row.t137_color,
        t631: props.row.t631,
        t631_color: props.row.t631_color,
        t2661: props.row.t2661,
        t2661_color: props.row.t2661_color,
        t266: props.row.t266,
        t266_color: props.row.t266_color,
        t3301: props.row.t3301,
        U9: props.row.U9,
        U8: props.row.U8,
        t387: props.row.t387,
        t397: props.row.t397,
        t398: props.row.t398,
        type: props.type,
        changRoom: props.changRoom,
        selected: props.selected,
        showRatio: props.showRatio,
        title_priceboard: props.title_priceboard,
        sellbuy_tp: props.row.Type,
        Price: props.row.Price,
        orderBol: props.row.orderBol || false
      });
      this.firtLoad = false;
    }
  }
  
  componentWillUnmount() {
    this.mounted = false;
    window.ipcRenderer.removeListener(`${commuChanel.mrkInfoEvent}_${this.props.component}`, () => null);
  }

  procFlash = (message, key) => {
    const itemArr = message.split('|');
    let lengArr = itemArr.length;
    for (let i = 0; i < lengArr; i++) {
      const node = itemArr[i];
      const nodeArr = node.split(':');
      const id = key + nodeArr[0];
      // console.log(this.state[nodeArr[0]])
      if (Number(nodeArr[1]) == null || this.state[nodeArr[0]] == null || this.state[nodeArr[0]] === 0) return;
      this.changeBackground(id, Number(nodeArr[1]), Number(nodeArr[2]));
    }
  }

  changeBackground = (id, oldValue, newValue) => {
    // const elemms[i] = document.getElementById(id);
    const elemms = document.querySelectorAll(`[id=${id}]`);
    // console.log(elemms, this.props.component)
    for(let i = 0; i< elemms.length ; i++ ){
      if (elemms[i] == null || elemms[i] == undefined) { return; }
      // console.log(elemms[i].classList, this.props.component)

      if (newValue < oldValue) {
        if (elemms[i].classList.contains('bk_blue')) elemms[i].classList.remove('bk_blue')
        if (!elemms[i].classList.contains('bk_red')) elemms[i].classList.add('bk_red')
        // if (this.timeOut[id]) { window.clearTimeout(this.timeOut[id]); }
        setTimeout(() => {
          if (elemms[i].classList.contains('bk_red')) {
            elemms[i].classList.remove('bk_red');
          }
        }, 500);
        return;
      } else if (newValue > oldValue) {
        if (elemms[i].classList.contains('bk_red')) { elemms[i].classList.remove('bk_red'); }
        if (!elemms[i].classList.contains('bk_blue')) { elemms[i].classList.add('bk_blue'); }
        // if (this.timeOut[id]) { window.clearTimeout(this.timeOut[id]); }
        setTimeout(() => {
          if (elemms[i].classList.contains('bk_blue')) {
            elemms[i].classList.remove('bk_blue');
          }
        }, 500);
        return;
      }
    }
    
  }

  getPriceOrder = (sbTp, price_tp, stk_cd) => {
    const sq= this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component:this.props.component, value: ['authFlag', 'ORDER'], sq:sq})
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
      const authFlag = agrs.get('authFlag')
      const ORDER = agrs.get('ORDER')
      console.log('getPriceOrder')
      if (!authFlag) {
        // glb_sv.showLogin();
        showLogin(this.props.component)
      } else {
        // let sellbuy_tp = sbTp;
        let price = price_tp;
        const message = {};
        if (Number(price) <= this.state.t333) price = this.state.t333;
        else if (Number(price) >= this.state.t332) price = this.state.t332;
        message['type'] = ORDER;
        message['data'] = sbTp + '|' + price + '|' + stk_cd;
        message['component'] = this.props.component
        // glb_sv.commonEvent.next(message);
        inform_broadcast(ORDER, message)
      }
    })
    
  }

  sendStkTradView(stk) {
    // this.setRow2TheFirst();
    const sq= this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.props.component, value: 'timeSendTrdView', sq:sq})
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.props.component}_${sq}`, (event, agrs) => {
      if (agrs) clearTimeout(agrs);
      if (stk !== null && stk !== undefined) {
        const data = this.state;
        const msg = { type: commuChanel.misTypeTradvStock, data: data , component: this.props.component};
        agrs = setTimeout(() => {
          this.props.handleChangeFocusRow(stk);
          if (agrs) inform_stkTradEvent_broadcast(commuChanel.misTypeTradvStock, JSON.stringify(msg))
        }, 450)
        update_value_for_glb_sv( {component: this.props.component, key: 'timeSendTrdView', value: agrs})
  
      }
    })
  }

  showNews(link) {
    const msg = { type: commuChanel.OPEN_MODAL_NEWS, link, title: this.state.t55 + ' - ', component: this.props.component };
    // glb_sv.commonEvent.next(msg);
    inform_broadcast(commuChanel.OPEN_MODAL_NEWS, msg)
  }
  
  sortOrderFLV = (stk) => {
    let msg = { type: commuChanel.MOVE_STK2FIRST_PRTABLE, value: stk, component: this.props.component };
    // glb_sv.commonEvent.next(msg);
    inform_broadcast(commuChanel.MOVE_STK2FIRST_PRTABLE, msg)
    if (this.mounted) this.setState({orderBol: !this.state.orderBol});
  }

  openStockInfo = () => {
    this.sendStkTradView(this.state.t55);
    const data = this.state;
    let msg = { type: commuChanel.STOCK_INFO_TAB, data , component: this.props.component};
    // glb_sv.commonEvent.next(msg);
    inform_broadcast(commuChanel.STOCK_INFO_TAB, msg)
    // this.props.onAddLayout('stock_info_layout_' + this.state.t55, this.state.t55, {data})
    window.ipcRenderer.send(commuChanel.open_layout_from_component, {component: 'stock_info_layout_' + this.state.t55, name: this.state.t55, config : {data}})
    msg = { type: commuChanel.misTypeChgStock, data , component: this.props.component};
    setTimeout(() => inform_broadcast(commuChanel.misTypeChgStock, msg), 500);
  }

  getColorPriceWL(value) {
    if (value > 0 && value > this.state.t333 && value < this.state.t260) return 'price_basic_less';
    else if (value > 0 && value < this.state.t332 && value > this.state.t260) return 'price_basic_over';
    else if (value == 0 || value == 0.0 || value == this.state.t260) return 'price_basic_color';
    else if (value > 0 && value >= this.state.t332) return 'price_ceil_color';
    else if (value > 0 && value <= this.state.t333) return 'price_floor_color';
  }

  // {"U8":"HSX|SI|NVL","U10":"01","t55":"NVL","U9":"Cổ phiếu Công ty cổ phần Tập đoàn Đầu tư Địa ốc No Va","seq":0,"subseq":0,"t332":67300,"t333":58500,"t260":62900}
  render() {
    return (
      <tr className={'rowTable ' + (this.state.t55 === this.state.selected ? 'active' : '')} style={{ height: '26px' }}>
        <th className={`c0pb stkNmFvl cursor_ponter ${this.state.t31_color} `} id={this.state.itemName + "t55"}>
          <span title={this.state.U9} onClick={this.openStockInfo} style={{ fontSize: this.state.t55.length > 6 ? 10 : '' }}>{this.state.t55}</span>
          {this.state.type === 'WL' && <div className="info" style={{ display: 'inline' }}>
            <button title={this.props.t('see_info_invest_recommendation')} style={{ float: 'right', padding: '2px 2px 0 0', color: 'var(--icon)', margin: 0, fontSize: 10 }} onClick={() => this.showNews(this.props.row.Link)} className="btn btn-sm btn-link cursor_ponter">
              <i className="fa fa-info"></i>
            </button>
          </div>}
          {/* {(this.state.type === 'WL' || this.state.type === 'FVL') && <div className="info" style={{ display: 'inline' }}>
            <button title={this.props.t('move_to_first_row')} style={{ float: 'right', padding: '2px 6px 0 0', color: 'white', margin: 0, fontSize: 10 }} onClick={() => this.sortOrderFLV(this.state.t55)} className="btn btn-sm btn-link cursor_ponter">
              <i style={{color: (this.state.orderBol ? '#9a6512' : 'inherit')}} className="fa fa-arrow-up"></i>
            </button>
          </div>} */}
          <div className="info" style={{ display: 'inline' }}>
            <button title={this.state.orderBol ? this.props.t('remove_to_first_row') : this.props.t('move_to_first_row')} style={{ float: 'right', padding: '2px 6px 0 0', color: 'var(--icon)', margin: 0, fontSize: 10 }} onClick={() => this.sortOrderFLV(this.state.t55)} className="btn btn-sm btn-link cursor_ponter">
              <i style={{color: (this.state.orderBol ? '#9a6512' : 'inherit')}} className="fa fa-arrow-up"></i>
            </button>
          </div>
          {this.state.type === 'FVL' && <div className="removeStk">
            <button style={{ float: 'right', padding: '2px 8px 0 0', color: 'var(--icon)', margin: 0 }} onClick={() => this.props.removeStkFromFvl(this.state.t55)} className="btn btn-sm btn-link cursor_ponter">
              <i className="fa fa-remove"></i>
            </button>
          </div>}
        </th>
        {this.state.type === 'WL' && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'td_price_wl text-right td_price ' + this.getColorPriceWL(this.state.Price) + ' ' + this.state.itemName + "Price"} id={this.state.itemName + "Price"}>
          <a onDoubleClick={() => this.getPriceOrder(this.state.sellbuy_tp === 'priceboard_sell' ? '2' : '1', this.state.Price, this.state.t55)}>
            {this.state.Price === undefined || this.state.Price === 0 || this.state.Price == 0.00 ? null : (
              <NumberFormat value={this.state.Price} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
            )}
          </a>
        </td>}
        {this.state.type === 'WL' && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'td_type_wl text-center td_price ' + (this.state.sellbuy_tp === 'priceboard_sell' ? 'sellBackGround' : 'buyBackGround')} id={this.state.itemName + "Type"}>
          <a onDoubleClick={() => this.getPriceOrder(this.state.sellbuy_tp === 'priceboard_sell' ? '2' : '1', this.state.Price, this.state.t55)}>
            {this.props.t(this.state.sellbuy_tp)}
          </a>
        </td>}

        {/* Thông tin Sàn TC Trần */}
        {this.state.title_priceboard[22].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={"c2pb text-right cell-highlight td_price price_floor_color " + this.state.itemName + "t333"} id={this.state.itemName + "t333"}>
          <a id={this.state.itemName + "t333t"} onDoubleClick={() => this.getPriceOrder('3', this.state.t333, this.state.t55)}>
            <NumberFormat value={this.state.t333} className="cursor_ponter price_floor_color" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
          </a>
        </td>}
        {this.state.title_priceboard[21].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={"c1pb text-right cell-highlight td_price price_basic_color " + this.state.itemName + "t260"} id={this.state.itemName + "t260"}>
          <a id={this.state.itemName + "t260t"} onDoubleClick={() => this.getPriceOrder('3', this.state.t260, this.state.t55)}>
            <NumberFormat value={this.state.t260} className="cursor_ponter price_basic_color" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
          </a>
        </td>}
        {this.state.title_priceboard[23].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={"c3pb text-right cell-highlight td_price price_ceil_color " + this.state.itemName + "t332"}  id={this.state.itemName + "t332"}>
          <a id={this.state.itemName + "t332t"} onDoubleClick={() => this.getPriceOrder('3', this.state.t332, this.state.t55)}>
            <NumberFormat value={(this.state.t332)} className="cursor_ponter price_ceil_color" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
          </a>
        </td>}

        {/* Thông tin dư mua 3KLx3Gia */}
        {this.state.title_priceboard[1].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c4pb text-right td_price ' + this.state.t132_3_color + ' ' + this.state.itemName + "t132_3"} id={this.state.itemName + "t132_3"}>
          <a onDoubleClick={() => this.getPriceOrder('2', this.state.t132_3, this.state.t55)}>
            {this.state.t132_3 === undefined || this.state.t132_3 === 0 || this.state.t132_3 == 0.00 ? null : (
              <NumberFormat value={this.state.t132_3} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
            )}
          </a>
        </td>}
        {this.state.title_priceboard[2].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c5pb text-right td_volumn ' + this.state.t132_3_color + ' ' + this.state.itemName + "t1321_3"} id={this.state.itemName + "t1321_3"} onDoubleClick={() => this.getPriceOrder('2', this.state.t132_3, this.state.t55)}>
          <span className='cursor_ponter'>{FormatNumber(this.state.t1321_3, 0, 1)}</span>
        </td>}
        {this.state.title_priceboard[3].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c6pb text-right td_price ' + this.state.t132_2_color + ' ' + this.state.itemName + "t132_2"} id={this.state.itemName + "t132_2"}>
          <a id={this.state.itemName + "t132_2t"} onDoubleClick={() => this.getPriceOrder('2', this.state.t132_2, this.state.t55)}>
            {this.state.t132_2 === undefined || this.state.t132_2 === 0 || this.state.t132_2 == 0.00 ? null : (
              <NumberFormat value={this.state.t132_2} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
            )}
          </a>
        </td>}
        {this.state.title_priceboard[4].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c7pb text-right td_volumn ' + this.state.t132_2_color + ' ' + this.state.itemName + "t1321_2"} id={this.state.itemName + "t1321_2"} onDoubleClick={() => this.getPriceOrder('2', this.state.t132_2, this.state.t55)}>
          <span className='cursor_ponter'>{FormatNumber(this.state.t1321_2, 0, 1)}</span>
        </td>}
        {this.state.title_priceboard[5].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c8pb text-right td_price ' + this.state.t132_1_color + ' ' + this.state.itemName + "t132_1"} id={this.state.itemName + "t132_1"}>
          <a id={this.state.itemName + "t132_1t"} onDoubleClick={() => this.getPriceOrder('2', this.state.t132_1, this.state.t55)}>
            {this.state.t132_1 == 777777710000 ? 'ATO' : (this.state.t132_1 == 777777720000 ? 'ATC' : (this.state.t132_1 == undefined || this.state.t132_1 == 0 || this.state.t132_1 == 0.00 ? null : (
              <NumberFormat value={this.state.t132_1} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
            )))}
          </a>
        </td>}
        {this.state.title_priceboard[6].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c9pb text-right td_volumn ' + this.state.t132_1_color + ' ' + this.state.itemName + "t1321_1"} id={this.state.itemName + "t1321_1"} onDoubleClick={() => this.getPriceOrder('2', this.state.t132_1, this.state.t55)}>
          <span className='cursor_ponter'>{FormatNumber(this.state.t1321_1, 0, 1)}</span>
        </td>}

        {/* Thông tin khớp lệnh */}
        <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c10pb chngTG text-right td_price cell-highlight ' + this.state.t31_color + ' ' + this.state.itemName + "t_TG_nmPr"} id={this.state.itemName + "t_TG_nmPr"} onDoubleClick={() => this.getPriceOrder('3', this.state.t31, this.state.t55)}>
          {!this.state.showRatio && ((this.state.t260 == null || this.state.t260 == undefined || this.state.t31 == null || this.state.t31 == 0 || this.state.t31 == undefined || this.state.t31 - this.state.t260 == 0) ? null :
            <NumberFormat value={(this.state.t31 - this.state.t260) / 1000} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={2} fixedDecimalScale={true} prefix={''} />)}
          {this.state.showRatio && ((this.state.t260 == null || this.state.t260 == undefined || this.state.t31 == null || this.state.t31 == 0 || this.state.t31 == undefined || (this.state.t31 - this.state.t260 == 0)) ? null :
            <NumberFormat value={((this.state.t31 - this.state.t260) * 100) / this.state.t260} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={1} fixedDecimalScale={true} prefix={''} suffix={'%'} />)}
        </td>
        <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c11pb text-right td_price cell-highlight ' + this.state.t31_color + ' ' + this.state.itemName + "t31"} id={this.state.itemName + "t31"}>
          <a className="cursor_ponter" id={this.state.itemName + "t31t"} onDoubleClick={() => this.getPriceOrder('3', this.state.t31, this.state.t55)}>
            {this.state.t31 == 777777710000 ? 'ATO' : (this.state.t31 == 777777720000 ? 'ATC' : (this.state.t31 == undefined || this.state.t31 == 0 || this.state.t31 == 0.00 ? null : (
              <NumberFormat value={this.state.t31} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
            )))}
          </a>
        </td>
        <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c12pb text-right td_volumn cell-highlight ' + this.state.t31_color + ' ' + this.state.itemName + "t32"} id={this.state.itemName + "t32"} onDoubleClick={() => this.getPriceOrder('3', this.state.t31, this.state.t55)}>
          <span className='cursor_ponter'>{FormatNumber(this.state.t32, 0, 1)}</span>
        </td>

        {/* Thông tin dư bán 3KLx3Gia */}
        {this.state.title_priceboard[10].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c13pb text-right td_price ' + this.state.t133_1_color + ' ' + this.state.itemName + "t133_1"} id={this.state.itemName + "t133_1"}>
          <a id={this.state.itemName + "t133_1t"} onDoubleClick={() => this.getPriceOrder('1', this.state.t133_1, this.state.t55)}>
            {this.state.t133_1 == 777777710000 ? 'ATO' : (this.state.t133_1 == 777777720000 ? 'ATC' : (this.state.t133_1 == undefined || this.state.t133_1 == 0 || this.state.t133_1 == 0.00 ? null : (
              <NumberFormat value={this.state.t133_1} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
            )))}
          </a>
        </td>}
        {this.state.title_priceboard[11].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c14pb text-right td_volumn ' + this.state.t133_1_color + ' ' + this.state.itemName + "t1331_1"} id={this.state.itemName + "t1331_1"} onDoubleClick={() => this.getPriceOrder('1', this.state.t133_1, this.state.t55)}>
          <span className='cursor_ponter'>
            {FormatNumber(this.state.t1331_1, 0, 1)}
          </span>
        </td>}
        {this.state.title_priceboard[12].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c15pb text-right td_price ' + this.state.t133_2_color + ' ' + this.state.itemName + "t133_2"} id={this.state.itemName + "t133_2"}>
          <a id={this.state.itemName + "t133_2t"} onDoubleClick={() => this.getPriceOrder('1', this.state.t133_2, this.state.t55)}>
            {this.state.t133_2 == 777777710000 ? '' : (this.state.t133_2 == 777777720000 ? '' : (this.state.t133_2 == undefined || this.state.t133_2 == 0 || this.state.t133_2 == 0.00 ? null : (
              <NumberFormat value={this.state.t133_2} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
            )))}
          </a>
        </td>}
        {this.state.title_priceboard[13].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c16pb text-right td_price ' + this.state.t133_2_color + ' '+ this.state.itemName + "t1331_2"} id={this.state.itemName + "t1331_2"} onDoubleClick={() => this.getPriceOrder('1', this.state.t133_2, this.state.t55)}>
          <span className='cursor_ponter'>{FormatNumber(this.state.t1331_2, 0, 1)}</span>
        </td>}
        {this.state.title_priceboard[14].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c17pb text-right td_price ' + this.state.t133_3_color + ' ' + this.state.itemName + "t133_3"} id={this.state.itemName + "t133_3"}>
          <a id={this.state.itemName + "t133_3t"} onDoubleClick={() => this.getPriceOrder('1', this.state.t133_3, this.state.t55)}>
            {this.state.t133_3 == 777777710000 ? '' : (this.state.t133_3 == 777777720000 ? '' : (this.state.t133_3 == undefined || this.state.t133_3 == 0 || this.state.t133_3 == 0.00 ? null : (
              <NumberFormat value={this.state.t133_3} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
            )))}
          </a>
        </td>}
        {this.state.title_priceboard[15].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={'c18pb text-right td_volumn ' + this.state.t133_3_color + ' ' + this.state.itemName + "t1331_3"} id={this.state.itemName + "t1331_3"} onDoubleClick={() => this.getPriceOrder('1', this.state.t133_3, this.state.t55)}>
          <span className='cursor_ponter'>{FormatNumber(this.state.t1331_3, 0, 1)}</span>
        </td>}

        {/* Thông tin tổng KLGD */}
        {this.state.title_priceboard[16].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={`c26pb text-right td_volumn cell-highlight ${this.state.itemName + "t387"}`} id={this.state.itemName + "t387"} onDoubleClick={() => this.getPriceOrder('3', 0, this.state.t55)}>
          {this.state.t387 == undefined || this.state.t387 == 0 || this.state.t387 == 0.00 ? null : (
            <span className='cursor_ponter'>{FormatNumber(this.state.t387, 0, 1)}</span>
          )}
        </td>}

        {/* Thông tin giá Mcửa + Cao + TB + thấp */}
        {this.state.title_priceboard[17].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={`c19pb text-right cell-highlight td_price ` + this.state.t137_color + ' ' + this.state.itemName + "t137"} id={this.state.itemName + "t137"}>
          <a id={this.state.itemName + "t137t"} onDoubleClick={() => this.getPriceOrder('3', this.state.t137, this.state.t55)}>
            {this.state.t137 == undefined || this.state.t137 == 0 || this.state.t137 == 0.00 ? null : (
              <NumberFormat value={this.state.t137} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
            )}
          </a>
        </td>}
        {this.state.title_priceboard[18].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={`c20pb text-right cell-highlight td_price ` + this.state.t631_color + ' ' + this.state.itemName + "t631"} id={this.state.itemName + "t631"}>
          <a id={this.state.itemName + "t631t"} onDoubleClick={() => this.getPriceOrder('3', this.state.t631, this.state.t55)}>
            {this.state.t631 == undefined || this.state.t631 == 0 || this.state.t631 == 0.00 ? null : (
              <NumberFormat value={this.state.t631} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
            )}
          </a>
        </td>}
        {this.state.title_priceboard[19].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={`c21pb text-right cell-highlight td_price ` + this.state.t2661_color + ' ' + this.state.itemName + "t2661"} id={this.state.itemName + "t2661"}>
          <a id={this.state.itemName + "t2661t"} onDoubleClick={() => this.getPriceOrder('3', this.state.t2661, this.state.t55)}>
            {this.state.t2661 == undefined || this.state.t2661 == 0 || this.state.t2661 == 0.00 ? null : (
              <NumberFormat value={this.state.t2661} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
            )}
          </a>
        </td>}
        {this.state.title_priceboard[20].value && <td onClick={() => this.sendStkTradView(this.state.t55)} className={`c22pb text-right cell-highlight td_price ` + this.state.t266_color + ' '+ this.state.itemName + "t266"} id={this.state.itemName + "t266"}>
          <a id={this.state.itemName + "t266t"} onDoubleClick={() => this.getPriceOrder('3', this.state.t266, this.state.t55)}>
            {this.state.t266 == undefined || this.state.t266 == 0 || this.state.t266 == 0.00 ? null : (
              <NumberFormat value={this.state.t266} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={true} prefix={''} />
            )}
          </a>
        </td>}

        {/* Thông tin nhà đầu tư nước ngoài */}
        {this.state.title_priceboard[24].value && !this.state.changRoom && <td colSpan="2" className={"c23pb ndtnRoom text-right " + this.state.itemName + "t3301"} id={this.state.itemName + "t3301"} onDoubleClick={() => this.getPriceOrder('3', 0, this.state.t55)}>
          <span className='cursor_ponter'>{this.state.t3301 === undefined ? '' : FormatNumber(this.state.t3301, 0, 1)}</span>
        </td>}
        {this.state.title_priceboard[24].value && this.state.changRoom && <td className={"c23pb ndtnBuy text-right td_volumn " + this.state.itemName + "t397"} id={this.state.itemName + "t397"} onDoubleClick={() => this.getPriceOrder('3', 0, this.state.t55)}>
          {this.state.t397 == undefined || this.state.t397 == 0 || this.state.t397 == 0.00 ? null : <span className='cursor_ponter'>{FormatNumber(this.state.t397, 0, 1)}</span>}</td>}
        {this.state.title_priceboard[24].value && this.state.changRoom && <td className={"c23pb ndtnBuy text-right td_volumn " + this.state.itemName + "t398"} id={this.state.itemName + "t398"} onDoubleClick={() => this.getPriceOrder('3', 0, this.state.t55)}>
          {this.state.t398 == undefined || this.state.t398 == 0 || this.state.t398 == 0.00 ? null : <span className='cursor_ponter'>{FormatNumber(this.state.t398, 0, 1)}</span>}</td>}
      </tr>
    )
  }
}
export default TableRowPriceboard;