import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import OVERVIEW_MARKET_TAB from "../over_view_market_layout/overview_market_layout"
import HISTORY_MARKET_TAB from '../history_market_layout/history_market_layout'
import RightInfo from '../right_info_layout/right_info_layout'
import MarketInfor from '../market_infor_layout/market_infor_layout'
import StockInfoLayout from '../stock_info_layout/stock_info_layout'
import OwnForgeinerTab from '../own_foreiger_tab/own_foreiger_tab'
import ADVERTIS_ORDER from '../advertis_order_layout/advertis_order_layout'
import LIQUID_MARKET_TAB from '../mkt_info_liquid_layout/market_liquidity'
import TRADE_FOREIGNER_TAB from '../trade_foreigner_layout/trade_foreigner_layout'
import BankConnection from '../bank_connection_layout/bank_connection'
import ExtendContractMargin from '../extencontract_margin_layout/extencontract-margin'
import RepayMargin from '../repay_margin_layout/repay-margin'
import InternalCashTransfer from '../cash_transfer_layout/cash-transfer'
import CashWithdraw from '../withdraw-regist-layout/withdraw-regist'
import CashinAdvance from '../cashin_advance_layout/cashin_advance'
import DepositInform from '../deposit-inform-layout/deposit-inform'
import ChangePass from '../account-info-layout/change-password'
import ChangeOrder from '../account-info-layout/change-order'
import ASSET_MANAGE_TAB from '../asset-manage-layout/asset-manage'
import ASSET_MARGIN_TAB from '../asset-margin-layout/asset-margin'
import TRANSACTION_INFO_TAB from '../transaction-info-layout/transaction-info';
import AddOrder from '../add_oder_layout/add_oder_layout';
import AdvanceOrder from "../advance-order/advance-order";
import ConfirmOrder from '../confirm-order/confirm-order'
import RightForBuy from '../right-forBuy/right-forBuy'
import OddLotOrder from '../oddlot-order/oddlot-order'
import RegisterEmailSms from '../register_email_sms/register-email-sms'
import InternalShareTransferComponent from '../internal-share-transfer/internal_share_transfer_component'

import components from '../../constants/components'
import layout_config from '../../utils/config_layout/basic_config.json'
// import { Model, Layout } from '../../conponents/flexbox';
import Layout from '../../conponents/flexbox/view/Layout';
import Model from '../../conponents/flexbox/model/Model';
import commuChanel from '../../constants/commChanel';


// function getModel(workspace = layout_config) {
//   console.log("map_components -> workspace ? :", workspace);
//   let MODEL = workspace;
//   return MODEL
// }

// A simple component that shows the pathname of the current location
class ShowTheLocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      model: Model.fromJson(layout_config),
      match: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
      history: PropTypes.object.isRequired,

    };
    this.onAddLayout = this.props.onAddLayout
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
  }

  contents() { return <Layout ref="layout" model={this.state.model} factory={this.factory} /> }

  factory = (node) => {
    var component = node.getComponent();
    // console.log('factory', component, this.props.language)

    if (component.includes(components.AddOrder)) {
      return <AddOrder component={component} language={this.props.language}
        themePage={this.props.themePage} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key}
        style={this.props.style}
        active_components={this.props.active_components}
      />
    }

    if (component.includes(components.OVERVIEW_MARKET_TAB)) {
      return <OVERVIEW_MARKET_TAB component={component} language={this.props.language}
        themePage={this.props.themePage} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} table={true}
        name={node.getName().key}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.HISTORY_MARKET_TAB)) {
      return <HISTORY_MARKET_TAB component={component} language={this.props.language}
        themePage={this.props.themePage} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key} socket_sv={this.props.socket_sv} glb_sv={this.props.glb_sv}
        active_components={this.active_components}

      />
    }

    else if (component.includes(components.RightInfo)) {
      return <RightInfo component={component} language={this.props.language}
        themePage={this.props.themePage} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.OWN_FOREIGER_TAB)) {
      return <OwnForgeinerTab
        language={this.props.language}
        themePage={this.props.themePage}
        style={this.props.style}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key}
        active_components={this.props.active_components}
      />
    }
    else if (component.includes(components.ADVERTIS_ORDER)) {
      return <ADVERTIS_ORDER language={this.props.language}
        themePage={this.props.themePage}
        style={this.props.style}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key}
        active_components={this.props.active_components}
      />
    }
    else if (component.includes(components.LIQUID_MARKET_TAB)) {
      return <LIQUID_MARKET_TAB language={this.props.language}
        themePage={this.props.themePage}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.TRADE_FOREIGNER_TAB)) {
      return <TRADE_FOREIGNER_TAB language={this.props.language}
        themePage={this.props.themePage}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.bank_connection)) {
      return <BankConnection name={node.getName().key}
        language={this.props.language}
        themePage={this.props.themePage}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.extend_contract)) {
      return <ExtendContractMargin name={node.getName().key}
        language={this.props.language}
        themePage={this.props.themePage}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.repay_margin)) {
      return <RepayMargin name={node.getName().key}
        language={this.props.language}
        themePage={this.props.themePage}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }
    else if (component.includes(components.cash_transfer)) {
      return <InternalCashTransfer
        name={node.getName().key}
        language={this.props.language}
        themePage={this.props.themePage}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.cashin_advance)) {
      return <CashinAdvance
        name={node.getName().key}
        language={this.props.language}
        themePage={this.props.themePage}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        style={this.props.style}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.deposit_inform)) {
      return <DepositInform
        name={node.getName().key}
        language={this.props.language}
        themePage={this.props.themePage}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }


    else if (component.includes(components.cash_withdraw)) {
      return <CashWithdraw
        name={node.getName().key}
        language={this.props.language}
        themePage={this.props.themePage}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.change_login)) {
      return <ChangePass
        name={node.getName().key}
        language={this.props.language}
        themePage={this.props.themePage}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.change_order)) {
      return <ChangeOrder
        name={node.getName().key}
        language={this.props.language}
        themePage={this.props.themePage}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }
    else if (component.includes(components.MarketInfor)) {
      return <MarketInfor component={component} language={this.props.language}
        themePage={this.props.themePage} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key}
      />
    }

    else if (component.includes(components.stock_info_layout)) {
      return <StockInfoLayout language={this.props.language}
        themePage={this.props.themePage}
        style={this.props.style}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.asset_manage)) {
      return <ASSET_MANAGE_TAB language={this.props.language}
        themePage={this.props.themePage}
        style={this.props.style}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key}
      />
    }
    else if (component.includes(components.asset_margin)) {
      return <ASSET_MARGIN_TAB language={this.props.language}
        themePage={this.props.themePage}
        style={this.props.style}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key}
        active_components={this.props.active_components}
      />
    }
    else if (component.includes(components.transaction_info)) {
      return <TRANSACTION_INFO_TAB language={this.props.language}
        themePage={this.props.themePage}
        style={this.props.style}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key}
        active_components={this.props.active_components}
      />
    }
    else if (component.includes(components.advance_order)) {
      return <AdvanceOrder language={this.props.language}
        themePage={this.props.themePage}
        style={this.props.style}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        name={node.getName().key}
        active_components={this.props.active_components}
      />
    }
    else if (component.includes(components.confirm_order)) {
      return <ConfirmOrder language={this.props.language}
        themePage={this.props.themePage}
        style={this.props.style}
        component={component}
        name={node.getName().key}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.right_forbuy)) {
      return <RightForBuy language={this.props.language}
        themePage={this.props.themePage}
        style={this.props.style}
        component={component}
        name={node.getName().key}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }

    else if (component.includes(components.oddlot_order)) {
      return <OddLotOrder language={this.props.language}
        themePage={this.props.themePage}
        style={this.props.style}
        component={component}
        name={node.getName().key}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }
    else if (component.includes(components.register_email_sms)) {
      return <RegisterEmailSms language={this.props.language}
        themePage={this.props.themePage}
        style={this.props.style}
        component={component}
        name={node.getName().key}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }
    else if (component.includes(components.stock_transfer)) {
      return <InternalShareTransferComponent
        name={node.getName().key}
        language={this.props.language}
        themePage={this.props.themePage}
        style={this.props.style}
        component={component}
        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
        active_components={this.props.active_components}
      />
    }

  }

  get_component_name() {
    const { match, location, history } = this.props;
    const component_name = location.pathname.split('/')[1]
    const component = component_name.split('___')[0]
    const name = component_name.split('___')[1]
    return { component, name }
  }

  componentDidMount() {
    const { t } = this.props
    // console.log(this.props.active_components)
    const component_name = this.get_component_name()
    this.refs.layout.addTabToTabSet(`#${this.state.model._nextId}`, {
      component: component_name.component,
      // name: t(`${component_name.name}`),
      name: <span key={t(`${component_name.name}`)}>{t(`${component_name.name}`)} &nbsp; <i onMouseDown={this.popin_window} className="fa fa-get-pocket" aria-hidden="true"></i></span>,
      enableRename: false,
      enableClose: false
    });
  }

  popin_window = () => {
    const component_name = this.get_component_name()
    window.ipcRenderer.send(commuChanel.bf_popin_window, component_name.component)
  }

  render() {
    return (
      <>
        {this.contents()}
      </>
    )

  }
}

// Create a new component that is "connected" (to borrow redux
// terminology) to the router.
const ShowTheLocationWithRouter = withRouter(ShowTheLocation);

export default (ShowTheLocationWithRouter)