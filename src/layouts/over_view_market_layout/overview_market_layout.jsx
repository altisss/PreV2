import React, { PureComponent } from 'react'
import { translate } from 'react-i18next';
import socket_sv from '../../utils/globalSv/service/socket_service'
import glb_sv from '../../utils/globalSv/service/global_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import ChartView from './chart_overview_market_layout/chart_overview_market_layout';
import IndexInfo from './chart_overview_market_layout/index_info';
import TableIndex from './table_overview_market/table_overview_market';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { ReactComponent as IconExchange } from '../../conponents/translate/icon/conversion-glyph-24.svg';
import commuChanel from '../../constants/commChanel'
import component from '../../constants/components'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import {bf_popout} from '../../utils/bf_popout'
import {reply_send_req} from '../../utils/send_req'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';

import LayoutHeader from '../../conponents/layout_header'


const remote = require('electron').remote;

class OVERVIEW_MARKET_TAB extends PureComponent {
  constructor(props) {
    super(props)
    if (this.props.table && this.props.node) {
        this.props.node.setEventListener("close", (p) => {
          window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config)
          window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
          window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
          window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
          window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}_${this.component}`)
          window.ipcRenderer.removeAllListeners(`${commuChanel.event_ServerPushIndexChart}_${this.component}`)
          window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeReconect}_${this.component}`)
          window.ipcRenderer.removeAllListeners(`${commuChanel.event_ClientReqMRKRcv}_${this.component}`)

          window.ipcRenderer.removeAllListeners(`${commuChanel.event_ServerPushIndexChart}_${this.component}`)
        })
    }
    this.component = this.props.component
    this.req_component = new Map();
    this.popin_window = this.popin_window.bind(this);

    this.request_seq_comp = 0;
    this.get_rq_seq_comp = () => {
      return ++this.request_seq_comp
    };
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    
    this.state = {
      name: this.props.name,
      dataKLGD_HSX: glb_sv.dataMrktop.dataKLGD_HSX || [],
      dataGTGD_HSX: glb_sv.dataMrktop.dataGTGD_HSX || [],
      dataPRIUP_HSX: glb_sv.dataMrktop.dataPRIUP_HSX || [],
      dataPRIDWN_HSX: glb_sv.dataMrktop.dataPRIDWN_HSX || [],

      dataKLGD_HNX: glb_sv.dataMrktop.dataKLGD_HNX || [],
      dataGTGD_HNX: glb_sv.dataMrktop.dataGTGD_HNX || [],
      dataPRIUP_HNX: glb_sv.dataMrktop.dataPRIUP_HNX || [],
      dataPRIDWN_HNX: glb_sv.dataMrktop.dataPRIDWN_HNX || [],

      dataKLGD_UPC: glb_sv.dataMrktop.dataKLGD_UPC || [],
      dataGTGD_UPC: glb_sv.dataMrktop.dataGTGD_UPC || [],
      dataPRIUP_UPC: glb_sv.dataMrktop.dataPRIUP_UPC || [],
      dataPRIDWN_UPC: glb_sv.dataMrktop.dataPRIDWN_UPC || [],
      isShowHSXShare: true,
      isShowHNXShare: true,
      isShowUPCShare: true,

      themePage: this.props.themePage,
      language: this.props.language,
    }

    
  }

  popin_window() {
    const current_window = remote.getCurrentWindow();
    window.ipcRenderer.send(commuChanel.popin_window, {state: this.state, component: this.component})
    current_window.close();
  }

  componentWillMount() {
    
    console.log('vào componentWillMount');
    if(this.props.table) {
        window.ipcRenderer.once(commuChanel.update_state_af_popout, (event,agrs) => {
          this.setState(agrs.state)
          this.setState({
            parent_id: agrs.parent_id,
            config: agrs.config,
          })

          change_theme(this.state.themePage)
          change_language(this.state.language, this.props)
      })

      window.ipcRenderer.once(`${this.component}`, (event,agrs) => {
        this.setState(agrs.state)
      })
    }

 }



  componentDidMount() {
    if(this.props.table) {
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
        console.log('this.req_component', JSON.stringify(this.req_component));
        reply_send_req(agrs, this.req_component)
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
    }
    this.subcribeMrk('HSX');
    this.subcribeMrk('HNX');
    this.subcribeMrk('UPC');

    

    window.ipcRenderer.on(`${commuChanel.misTypeReconect}_${this.component}`, (event, msg) => {
        this.unsubcribeMrk('HSX');
        this.unsubcribeMrk('HNX');
        this.unsubcribeMrk('UPC');
        this.subcribeMrk('HSX');
        this.subcribeMrk('HNX');
        this.subcribeMrk('UPC');
    })

    window.ipcRenderer.on(`${commuChanel.event_ClientReqMRKRcv}_${this.component}`, (event, msg) => {
      // console.log(msg)
      this.handle_Mrk(msg)
    })
    

  }

  handle_Mrk(message) {
    let data = [];
    try {
      data = JSON.parse(message.Data);
    }
    catch (err) {
      console.error('OverviewMarket parse message', err);
    }
    // console.log('OverviewMarket',message,data);
    // message mrt HOSE
    if (message.MsgKey === "01|TOP_PRI_UP") {
      this.setState({ dataPRIUP_HSX: data });
      // glb_sv.dataMrktop.dataPRIUP_HSX = data;
      update_value_for_glb_sv({component: this.component, key: ['dataMrktop', 'dataPRIUP_HSX'], value: data})
    }
    if (message.MsgKey === "01|TOP_PRI_DWN") {
      this.setState({ dataPRIDWN_HSX: data });
      // glb_sv.dataMrktop.dataPRIDWN_HSX = data;
      update_value_for_glb_sv({component: this.component, key: ['dataMrktop', 'dataPRIDWN_HSX'], value: data})
    }
    if (message.MsgKey === "01|TOP_QTY_UP") {
      this.setState({ dataKLGD_HSX: data });
      // glb_sv.dataMrktop.dataKLGD_HSX = data;
      update_value_for_glb_sv({component: this.component, key: ['dataMrktop', 'dataKLGD_HSX'], value: data})
    }
    if (message.MsgKey === "01|TOP_VAL_UP") {
      this.setState({ dataGTGD_HSX: data });
      // glb_sv.dataMrktop.dataGTGD_HSX = data;
      update_value_for_glb_sv({component: this.component, key: ['dataMrktop', 'dataGTGD_HSX'], value: data})
    }
    // message mrt HNX
    if (message.MsgKey === "03|TOP_PRI_UP") {
      this.setState({ dataPRIUP_HNX: data });
      // glb_sv.dataMrktop.dataPRIUP_HNX = data;
      update_value_for_glb_sv({component: this.component, key: ['dataMrktop', 'dataPRIUP_HNX'], value: data})
    }
    if (message.MsgKey === "03|TOP_PRI_DWN") {
      this.setState({ dataPRIDWN_HNX: data });
      // glb_sv.dataMrktop.dataPRIDWN_HNX = data;
      update_value_for_glb_sv({component: this.component, key: ['dataMrktop', 'dataPRIDWN_HNX'], value: data})
    }
    if (message.MsgKey === "03|TOP_QTY_UP") {
      this.setState({ dataKLGD_HNX: data });
      // glb_sv.dataMrktop.dataKLGD_HNX = data;
      update_value_for_glb_sv({component: this.component, key: ['dataMrktop', 'dataKLGD_HNX'], value: data})
    }
    if (message.MsgKey === "03|TOP_VAL_UP") {
      this.setState({ dataGTGD_HNX: data });
      // glb_sv.dataMrktop.dataGTGD_HNX = data;
      update_value_for_glb_sv({component: this.component, key: ['dataMrktop', 'dataGTGD_HNX'], value: data})
    }
    // message mrt UPC
    if (message.MsgKey === "05|TOP_PRI_UP") {
      this.setState({ dataPRIUP_UPC: data });
      // glb_sv.dataMrktop.dataPRIUP_UPC = data;
      update_value_for_glb_sv({component: this.component, key: ['dataMrktop', 'dataPRIUP_UPC'], value: data})
    }
    if (message.MsgKey === "05|TOP_PRI_DWN") {
      this.setState({ dataPRIDWN_UPC: data });
      // glb_sv.dataMrktop.dataPRIDWN_UPC = data;
      update_value_for_glb_sv({component: this.component, key: ['dataMrktop', 'dataPRIDWN_UPC'], value: data})
    }
    if (message.MsgKey === "05|TOP_QTY_UP") {
      this.setState({ dataKLGD_UPC: data });
      // glb_sv.dataMrktop.dataKLGD_UPC = data;
      update_value_for_glb_sv({component: this.component, key: ['dataMrktop', 'dataKLGD_UPC'], value: data})
    }
    if (message.MsgKey === "05|TOP_VAL_UP") {
      this.setState({ dataGTGD_UPC: data });
      // glb_sv.dataMrktop.dataGTGD_UPC = data;
      update_value_for_glb_sv({component: this.component, key: ['dataMrktop', 'dataGTGD_UPC'], value: data})
    }
  }

  subcribeMrk = (key) => {
    console.log(key);
    const reqInfo = new requestInfo();
    const request_seq_comp = this.get_rq_seq_comp()

    reqInfo.reqFunct = 'SUBSCRIBE-OVER-INDEX-' + key + `__${component}`;
    reqInfo.procStat = 0;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = ''

    this.req_component.set(request_seq_comp, reqInfo)
    // const msgObj2 = { 'ClientSeq': clientSeq, 'Command': 'SUB', 'F1': key, 'F2': ["MKT_TOP", key] };
    const msgObj = { 'Command': 'SUB', 'F1': key, 'F2': ["MKT_TOP", key] };
    window.ipcRenderer.send(commuChanel.send_req, {
        req_component:{
          component: reqInfo.component, 
          request_seq_comp: request_seq_comp,
          channel: socket_sv.key_ClientReqMRK,
          reqFunct: reqInfo.reqFunct,
          msgObj: msgObj
        }, 
        svInputPrm:{}
      })
    // socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj2));
  }
  unsubcribeMrk = (key) => {
    const reqInfo = new requestInfo();
    const request_seq_comp = this.get_rq_seq_comp()

    // console.log(stkList);
    // const clientSeq = socket_sv.getRqSeq();
    // const reqInfo = new requestInfo();
    reqInfo.reqFunct = 'SUBSCRIBE-OVER-INDEX-' + key + `__${this.component}`;
    reqInfo.procStat = 0;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = ''
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    const msgObj2 = {'Command': 'UNSUB', 'F1': key, 'F2': ["MKT_TOP", key] };
    // socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj2));
    this.req_component.set(request_seq_comp, reqInfo)
    // const msgObj2 = { 'ClientSeq': clientSeq, 'Command': 'SUB', 'F1': key, 'F2': ["MKT_TOP", key] };
    window.ipcRenderer.send(commuChanel.send_req, {
        req_component:{
          component: reqInfo.component, 
          request_seq_comp: request_seq_comp,
          channel: socket_sv.key_ClientReqMRK,
          reqFunct: reqInfo.reqFunct,
          msgObj: msgObj2
        }, 
        svInputPrm:{}
      })
  }


  componentWillUnmount() {
    // if (this.subcr_ClientReqMrkRcv) this.subcr_ClientReqMrkRcv.unsubscribe();
    // if (this.subcr_commonEvent) this.subcr_commonEvent.unsubscribe();
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    this.unsubcribeMrk('HSX');
    this.unsubcribeMrk('HNX');
    this.unsubcribeMrk('UPC');
  }

  render() {
    const { t } = this.props;    
    return (
      <div className='card over-market' style={{ boxShadow: 'unset', minWidth: 1000 }}>

        <div className='card-body row' style={{ margin: 0, padding: '5px 0' }}>
          
          <div className='col-md-4' style={{ paddingLeft: 5, borderRight: '1px solid var(--overview__border-right)' }}>
            <div className='chart-overview-market'>
              <div className="card-img-top">
                <ChartView keyIndex={"VN_INDEX"} component={this.component} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}/>
                <IndexInfo full={true} keyIndex={"VN_INDEX"} t={t} component={this.component} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}/>
              </div>
            </div>
            {
              (!this.props.table ? '':
              <div className='table-overview-market'>

              <div className='card overflowAuto'>
                <div className='card-header'>
                  {this.state.isShowHSXShare && t('top_10_stocks_shares_trade')}
                  {!this.state.isShowHSXShare && t('top_10_stocks_value_trade')}
                  {'  '}
                  <span className='cursor_ponter' style={{float: "right"}}>
                    <span onClick={() => this.setState({ isShowHSXShare: !this.state.isShowHSXShare })}
                      title={this.state.isShowHSXShare ? "Chuyển qua top GTGD" : "Chuyển qua top KLGD"}>
                      <IconExchange/>
                    </span>
                  </span>
                </div>
                <PerfectScrollbar>
                  <div className='card-body table-index-height'>
                    {this.state.isShowHSXShare && <TableIndex get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} component={this.component} t={t} data={JSON.stringify(this.state.dataKLGD_HSX)} name_col_last='priceboard_total_qtty_trading' />}
                    {!this.state.isShowHSXShare && <TableIndex get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} component={this.component} t={t} data={JSON.stringify(this.state.dataGTGD_HSX)} name_col_last='priceboard_total_value_trading' />}
                  </div>
                </PerfectScrollbar>
              </div>

              <div className='card'>
                <div className='card-header'>{t('top_10_stocks_incre')}</div>
                <PerfectScrollbar>
                  <div className='card-body table-index-height'>
                    <TableIndex get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} component={this.component} t={t} data={JSON.stringify(this.state.dataPRIUP_HSX)} name_col_last='priceboard_total_qtty_trading' />
                  </div>
                </PerfectScrollbar>
              </div>
              <div className='card'>
                <div className='card-header'>{t('top_10_stocks_decre')}</div>
                <PerfectScrollbar>
                  <div className='card-body table-index-height'>
                    <TableIndex get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} component={this.component} t={t} data={JSON.stringify(this.state.dataPRIDWN_HSX)} name_col_last='priceboard_total_qtty_trading' />
                  </div>
                </PerfectScrollbar>
              </div>
            </div>
              )
            }
          </div>
          <div className='col-md-4' style={{ borderRight: '1px solid var(--overview__border-right)' }}>
            <div className='chart-overview-market'>
              <div className="card-img-top">
                <ChartView keyIndex={"HNX_INDEX"} component={this.component} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}/>
                <IndexInfo full={true} keyIndex={"HNX_INDEX"} t={t} component={this.component} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}/>
              </div>
            </div>
            {(!this.props.table ? '' :
              <div className='table-overview-market'>
              <div className='card'>
                <div className='card-header'>
                  {this.state.isShowHNXShare && t('top_10_stocks_shares_trade')}
                  {!this.state.isShowHNXShare && t('top_10_stocks_value_trade')}
                  {'  '}
                  <span className='cursor_ponter' style={{float: "right"}}>
                    <span onClick={() => this.setState({ isShowHNXShare: !this.state.isShowHNXShare })}
                      title={this.state.isShowHNXShare ? "Chuyển qua top GTGD" : "Chuyển qua top KLGD"}>
                      <IconExchange/>
                    </span>
                  </span>
                </div>
                <PerfectScrollbar>
                  <div className='card-body table-index-height'>
                    {this.state.isShowHNXShare && <TableIndex get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} component={this.component} t={t} data={JSON.stringify(this.state.dataKLGD_HNX)} name_col_last='priceboard_total_qtty_trading' />}
                    {!this.state.isShowHNXShare && <TableIndex get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} component={this.component} t={t} data={JSON.stringify(this.state.dataGTGD_HNX)} name_col_last='priceboard_total_value_trading' />}
                  </div>
                </PerfectScrollbar>
              </div>
              <div className='card'>
                <div className='card-header'>{t('top_10_stocks_incre')}</div>
                <PerfectScrollbar>
                  <div className='card-body table-index-height'>
                    <TableIndex get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} component={this.component} t={t} data={JSON.stringify(this.state.dataPRIUP_HNX)} name_col_last='priceboard_total_qtty_trading' />
                  </div>
                </PerfectScrollbar>
              </div>
              <div className='card'>
                <div className='card-header'>{t('top_10_stocks_decre')}</div>
                <PerfectScrollbar>
                  <div className='card-body table-index-height'>
                    <TableIndex get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} component={this.component} t={t} data={JSON.stringify(this.state.dataPRIDWN_HNX)} name_col_last='priceboard_total_qtty_trading' />
                  </div>
                </PerfectScrollbar>
              </div>
            </div>
            )}
          </div>
          <div className='col-md-4' style={{ paddingRight: 5 }}>
            <div className='chart-overview-market'>
              <div className="card-img-top">
                <ChartView keyIndex={"UPCOM_INDEX"} component={this.component} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}/>
                <IndexInfo full={true} keyIndex={"UPCOM_INDEX"} t={t} component={this.component} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}/>
              </div>
            </div>
            {(!this.props.table ? '' : 
            <div className='table-overview-market'>
            <div className='card'>
              <div className='card-header'>
                {this.state.isShowUPCShare && t('top_10_stocks_shares_trade')}
                {!this.state.isShowUPCShare && t('top_10_stocks_value_trade')}
                {'  '}
                <span className='cursor_ponter' style={{float: "right"}}>
                  <span onClick={() => this.setState({ isShowUPCShare: !this.state.isShowUPCShare })}
                  title={this.state.isShowUPCShare ? "Chuyển qua top GTGD" : "Chuyển qua top KLGD"}>
                    <IconExchange/>
                  </span>
                </span>
              </div>
              <PerfectScrollbar>
                <div className='card-body table-index-height'>
                  {this.state.isShowUPCShare && <TableIndex get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} component={this.component} t={t} data={JSON.stringify(this.state.dataKLGD_UPC)} name_col_last='priceboard_total_qtty_trading' />}
                  {!this.state.isShowUPCShare && <TableIndex get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} component={this.component} t={t} data={JSON.stringify(this.state.dataGTGD_UPC)} name_col_last='priceboard_total_value_trading' />}
                </div>
              </PerfectScrollbar>
            </div>
            <div className='card'>
              <div className='card-header'>{t('top_10_stocks_incre')}</div>
              <PerfectScrollbar>
                <div className='card-body table-index-height'>
                  <TableIndex get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} component={this.component} t={t} data={JSON.stringify(this.state.dataPRIUP_UPC)} name_col_last='priceboard_total_qtty_trading' />
                </div>
              </PerfectScrollbar>
            </div>
            <div className='card'>
              <div className='card-header'>{t('top_10_stocks_decre')}</div>
              <PerfectScrollbar>
                <div className='card-body table-index-height'>
                  <TableIndex get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} component={this.component} t={t} data={JSON.stringify(this.state.dataPRIDWN_UPC)} name_col_last='priceboard_total_qtty_trading' />
                </div>
              </PerfectScrollbar>
            </div>
          </div>)}
          </div>

        </div>
      </div>
    )
  }
}

export default translate('translations')(OVERVIEW_MARKET_TAB);