import React, { PureComponent } from "react"
import commuChanel from '../../constants/commChanel'
import { translate } from 'react-i18next';
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { update_value_for_glb_sv } from "../../utils/update_value_for_glb_sv";
import PerfectScrollbar from 'react-perfect-scrollbar'
import TableHistoryIndex from './table_history_index'
import { ReactComponent as IconExchange } from '../../conponents/translate/icon/conversion-glyph-24.svg';

import ChartComponent from '../../conponents/chart_stock_info/chart_stock_info'
import TableDetail from './table_detail'
import { on_unSubStkList } from '../../utils/subcrible_functions'
// import LayoutHeader from '../../conponents/layout_header';

const remote = require('electron').remote;

class HistoryMarketLayouts extends PureComponent {
  constructor(props) {
    super(props);
    this.request_seq_comp = 0
    this.component = this.props.component
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.get_rq_seq_comp = () => {
      return ++this.request_seq_comp
    };
    this.req_component = new Map();
    if (this.props.node) {
      this.props.node.setEventListener("close", (p) => {
        on_unSubStkList(this.component)
        window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popin_window}_${this.component}`)
        window.ipcRenderer.removeAllListeners(commuChanel.popin_window)
      })
    }
    // Khai báo bắt buộc trong layout chính


    this.dataHisMrktop = {
      '1W': {},
      '1M': {},
      '3M': {},
      '6M': {},
      '1Y': {},
      '2Y': {},
      '3Y': {},
      dataDetails_HSX: []
    }
    update_value_for_glb_sv({ component: this.component, key: 'dataHisMrktop', value: this.dataHisMrktop })
    // console.log("Hello", this.dataHisMrktop);

    this.state = {
      // isShowChart: false,
      name: this.props.name,
      isShowShare: true,
      isShowHNXShare: true,
      isShowUPCShare: true,
      time_ChartData: '3M',
      index: 'HSXIndex',
      indexNum: '01',

      chart: {
        chartKLGD: {
          type: 'TV'
        },
        chartGTGD: {
          type: 'TA'
        },
        chartPRIUP: {
          type: 'TU'
        },
        chartPRIDWN: {
          type: 'TD'
        }
      },
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style,
    }
    this.index = 'HSXIndex';

    if (this.props.node) {
      this.props.node.setEventListener("close", (p) => {
        window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config)
      })
    }
  }

  componentWillMount() {
    window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
      // update state after popout window
      this.setState(agrs.state)
      this.setState({
        parent_id: agrs.parent_id,
        config: agrs.config,
      })
      change_theme(this.state.themePage)
      change_language(this.state.language, this.props)
    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      // update state after popin window
      // this.setState(agrs.state)

    })
  }

  popin_window() {
    const current_window = remote.getCurrentWindow();
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }

  componentDidMount() {

    window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
      change_theme(agrs)
      // glb_sv.themePage = agrs
      // update_value_for_glb_sv( {component: component, key: 'themePage', value: agrs})
      this.setState({ themePage: agrs })
      this.setState({ isChangeTheme: false }, () => {
        this.setState({ isChangeTheme: true })
      })
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
      change_language(agrs, this.props)
      this.setState({ language: agrs })
    })
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
      console.log('this.req_component', this.req_component.get(agrs.req_component.request_seq_comp));
      reply_send_req(agrs, this.req_component)

    })
  }
  componentWillUnmount() {
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    on_unSubStkList(this.component)

  }

  handleChangeIndex = (e) => {
    const index = e.target.value;
    const indexNum = (index) => {
      if (index === 'HSXIndex') return '01'
      if (index === 'HNXIndex') return '03'
      if (index === 'HNXUpcomIndex') return '05'
    }

    this.setState({
      index: index,
      indexNum: indexNum(index)
    });
  }

  handleChangeTime = (time_ChartData) => {
    this.setState({
      time_ChartData: time_ChartData
    });
  }

  render() {
    const { t } = this.props
    return (
      <div className='card over-market ' style={{ boxShadow: 'unset' }}>
        <div className='card-body ' style={{ padding: '10px 15px' }}>
          <div className='row'>
            <div className='col-md-8 padding5'>
              <select className='form-control-custom' onChange={this.handleChangeIndex}>
                <option value='HSXIndex'>VNI</option>
                <option value='HNXIndex'>HNX</option>
                <option value='HNXUpcomIndex'>UPCOM</option>
              </select>
              {' '}
              <span onClick={() => this.handleChangeTime('1W')} className={'time_chart ' + (this.state.time_ChartData === '1W' ? 'active' : '')}>1{t('week_short')}</span>{' '}
              <span onClick={() => this.handleChangeTime('1M')} className={'time_chart ' + (this.state.time_ChartData === '1M' ? 'active' : '')}>1{t('month_short')}</span>{' '}
              <span onClick={() => this.handleChangeTime('3M')} className={'time_chart ' + (this.state.time_ChartData === '3M' ? 'active' : '')}>3{t('month_short')}</span>{' '}
              <span onClick={() => this.handleChangeTime('6M')} className={'time_chart ' + (this.state.time_ChartData === '6M' ? 'active' : '')}>6{t('month_short')}</span>{' '}
              <span onClick={() => this.handleChangeTime('1Y')} className={'time_chart ' + (this.state.time_ChartData === '1Y' ? 'active' : '')}>1{t('year_short')}</span>{' '}
              <span onClick={() => this.handleChangeTime('2Y')} className={'time_chart ' + (this.state.time_ChartData === '2Y' ? 'active' : '')}>2{t('year_short')}</span>{' '}
              <span onClick={() => this.handleChangeTime('3Y')} className={'time_chart ' + (this.state.time_ChartData === '3Y' ? 'active' : '')}>3{t('year_short')}</span>{' '}
              {
                <ChartComponent req_component={this.req_component}
                  t={t}
                  curStk={this.state.index}
                  time={this.state.time_ChartData}
                  stkType='INDEX'
                  get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                  component={this.component}
                  get_rq_seq_comp={this.get_rq_seq_comp}
                  width={911}
                  height={250}
                />
              }
            </div>
            <div className='col-md-4 padding5' style={{ paddingRight: 20 }}>
              <div className="card stockInfoExtent">
                <div className='card-header'>
                  <i className="fa fa-info-circle"></i>{' '}{t('common_Detail')}
                </div>
                <div className="card-body widget-body" style={{ padding: '0', position: 'relative', overflow: 'auto' }}>
                  <TableDetail
                    t={t}
                    name_col_last='priceboard_total_qtty_trading'
                    get_rq_seq_comp={this.get_rq_seq_comp}
                    req_component={this.req_component}
                    request_seq_comp={this.request_seq_comp}
                    tableType={this.state.chart.chartKLGD}
                    index={this.state.index}
                    indexNum={this.state.indexNum}
                    time_ChartData={this.state.time_ChartData}
                    {...this.props} />
                </div>
              </div>
            </div>
          </div>
          <div className='flexbox__row__nowrap'>
            <div className='padding5 flex-1'>
              <div className='table-overview-market'>
                <div className='card overflowAuto'>
                  <div className='card-header'>
                    {this.state.isShowShare && t('top_100_stocks_shares_trade')}
                    {!this.state.isShowShare && t('top_100_stocks_value_trade')}
                    {'  '}
                    <span style={{ float: 'right', cursor: 'pointer' }}
                      onClick={() => this.setState({ isShowShare: !this.state.isShowShare })}
                      title={this.state.isShowShare ? "Chuyển qua top GTGD" : "Chuyển qua top KLGD"}>
                      <IconExchange />
                    </span>
                  </div>
                  <PerfectScrollbar>
                    <div className='card-body table-history-index-height'>
                      {this.state.isShowShare &&
                        <TableHistoryIndex
                          t={t}
                          name_col_last='priceboard_total_qtty_trading'
                          get_rq_seq_comp={this.get_rq_seq_comp}
                          req_component={this.req_component}
                          request_seq_comp={this.request_seq_comp}
                          tableType={this.state.chart.chartKLGD}
                          index={this.state.index}
                          indexNum={this.state.indexNum}
                          time_ChartData={this.state.time_ChartData}
                          {...this.props}
                        />}
                      {!this.state.isShowShare &&
                        <TableHistoryIndex
                          t={t}
                          name_col_last='priceboard_total_value_trading'
                          get_rq_seq_comp={this.get_rq_seq_comp}
                          req_component={this.req_component}
                          request_seq_comp={this.request_seq_comp}
                          tableType={this.state.chart.chartGTGD}
                          index={this.state.index}
                          indexNum={this.state.indexNum}
                          time_ChartData={this.state.time_ChartData}
                          {...this.props}
                        />}
                    </div>
                  </PerfectScrollbar>
                </div>
              </div>
            </div>
            <div className='padding5 flex-1'>
              <div className='table-overview-market'>
                <div className='card'>
                  <div className='card-header'>
                    {t('top_100_stocks_incre')}
                  </div>
                  <PerfectScrollbar>
                    <div className='card-body table-history-index-height'>
                      <TableHistoryIndex
                        t={t}
                        name_col_last='priceboard_total_qtty_trading'
                        get_rq_seq_comp={this.get_rq_seq_comp}
                        req_component={this.req_component}
                        request_seq_comp={this.request_seq_comp}
                        tableType={this.state.chart.chartPRIUP}
                        index={this.state.index}
                        indexNum={this.state.indexNum}
                        time_ChartData={this.state.time_ChartData}
                        {...this.props}
                      />
                    </div>
                  </PerfectScrollbar>
                </div>
              </div>
            </div>
            <div className='padding5 flex-1'>
              <div className='table-overview-market'>
                <div className='card'>
                  <div className='card-header'>
                    {t('top_100_stocks_decre')}
                  </div>
                  <PerfectScrollbar>
                    <div className='card-body table-history-index-height'>
                      <TableHistoryIndex
                        t={t}
                        name_col_last='priceboard_total_qtty_trading'
                        get_rq_seq_comp={this.get_rq_seq_comp}
                        req_component={this.req_component}
                        request_seq_comp={this.request_seq_comp}
                        tableType={this.state.chart.chartPRIDWN}
                        index={this.state.index}
                        indexNum={this.state.indexNum}
                        time_ChartData={this.state.time_ChartData}
                        {...this.props}
                      />
                    </div>
                  </PerfectScrollbar>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default translate('translations')(HistoryMarketLayouts);