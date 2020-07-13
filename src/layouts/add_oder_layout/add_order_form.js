import React from 'react'
import { translate } from 'react-i18next'
import glb_sv from '../../utils/globalSv/service/global_service'
import FormatNumber from '../../conponents/formatNumber/FormatNumber'
import Select, { components } from 'react-select'
import { Tooltip, UncontrolledTooltip } from 'reactstrap'
import Input from '../../conponents/basic/input/Input'
import SearchAccount from '../../conponents/search_account/SearchAccount';
import SearchRightInfo from '../../conponents/search_right_info/search_right_info';

const customStyles = {
    option: base => ({
        ...base,
        height: 26,
        padding: '5px 12px',
    }),
    control: base => ({
        ...base,
        height: 25,
        minHeight: 25,
        border: '0px solid',
        backgroundColor: glb_sv.style[glb_sv.themePage].placeOrder.background_search,
    }),
    menuList: base => ({
        ...base,
        maxHeight: 300,
        width: 300,
        whiteSpace: 'nowrap',
        overflowX: 'hidden',
        backgroundColor: glb_sv.style[glb_sv.themePage].sideBar.background_menuList,
        color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
        fontFamily: 'monospace',
    }),
    menu: base => ({
        ...base,
        width: 300,
    }),
    indicatorSeparator: base => ({
        ...base,
        height: 15,
        marginTop: 6,
        display: 'none',
    }),
    dropdownIndicator: base => ({
        ...base,
        padding: 4,
        marginTop: -3,
        display: 'none',
    }),
    container: base => ({
        ...base,
    }),
    placeholder: base => ({
        ...base,
        whiteSpace: 'nowrap',
        top: '56%',
        color: glb_sv.style[glb_sv.themePage].sideBar.color_placehoder_search,
    }),
    singleValue: base => ({
        ...base,
        marginLeft: -5,
        color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
        top: '56%',
    }),
    valueContainer: base => ({
        ...base,
        marginTop: -5,
        color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
    }),
    input: base => ({
        ...base,
        color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
        paddingTop: 4,
    }),
}

function customFilter(option, searchText) {
    if (option.data.value.toLowerCase().includes(searchText.toLowerCase())) {
        return true
    } else {
        return false
    }
}

const MenuList = props => {
    const recentList = [],
        restList = []
    if (!Array.isArray(props.children)) {
        return <components.MenuList {...props}>{props.children}</components.MenuList>
    }
    props.children.forEach(item => {
        if (
            item.props.value === glb_sv.recentStkList[0] ||
            item.props.value === glb_sv.recentStkList[1] ||
            item.props.value === glb_sv.recentStkList[2] ||
            item.props.value === glb_sv.recentStkList[3] ||
            item.props.value === glb_sv.recentStkList[4] ||
            item.props.value === glb_sv.recentStkList[5] ||
            item.props.value === glb_sv.recentStkList[6] ||
            item.props.value === glb_sv.recentStkList[7] ||
            item.props.value === glb_sv.recentStkList[8] ||
            item.props.value === glb_sv.recentStkList[9]
        ) {
            recentList.push(item)
        } else restList.push(item)
    })
    return (
        <components.MenuList {...props}>
            {recentList}
            {restList}
        </components.MenuList>
    )
}

const SingleValue = props => {
    return <components.SingleValue {...props}>{props.data.text || props.children}</components.SingleValue>
}

class AddOrderForm extends React.Component {
    constructor(props) {
        super(props)
        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        this.get_rq_seq_comp = this.props.get_rq_seq_comp
        this.req_component = this.props.req_component
    }

    translateOrderTpPrice = () => {
        const { state } = this.props;
        if (state.plcOrd.orderTp === '02') {
            return 'MP'
        } else if (state.plcOrd.orderTp === '03') {
            return 'ATO'
        } else if (state.plcOrd.orderTp === '04') {
            return 'ATC'
        } else if (state.plcOrd.orderTp === '06') {
            return 'MOK'
        } else if (state.plcOrd.orderTp === '07') {
            return 'MAK'
        } else if (state.plcOrd.orderTp === '08') {
            return 'MTL'
        } else if (state.plcOrd.orderTp === '15') {
            return 'PLO'
        }
    }

    render() {
        const { t, state } = this.props;
        return (
            <>
                <div className="card width-place-order" style={{
                    marginTop: 'unset',
                    marginBottom: 0,
                    height: '100%'
                }}
                >
                    <div
                        className="card-body widget-body formmrgbottom0"
                        style={{ padding: '10px 10px 5px' }}
                    >
                        <div className="form-group marginBottom5 row no-margin-left no-margin-right">
                            <SearchAccount
                                handleChangeAccount={this.props.handleChangeAccount}
                                component={this.component}
                                req_component={this.req_component}
                                get_rq_seq_comp={this.get_rq_seq_comp}
                                get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                                language={state.language}
                                themePage={state.themePage}
                                style={state.style}
                                isShowSubno={true}
                            />
                        </div>

                        <div className="form-group marginBottom5" style={{ textAlign: 'center' }}>
                            <div className="row-sellbuy">
                                <div className="sideControl-sellbuy">
                                    <div
                                        className="section-sellbuy buy-attr"
                                        id={this.component + "section-ord-buy"}
                                        onClick={e => this.props.onClickSellBuyChange(e, '1')}
                                        tabIndex="-1"
                                    >
                                        <div className="title-sellbuy">{t('priceboard_buy')}</div>
                                        {(!!state.t1321_1 && state.t1321_1 != 0) && <div className={'value-sellbuy ' + state.t132_1_color}>
                                            <span style={{ borderRadius: 2, padding: 2 }}>
                                                <span
                                                    id="tooltip_buyqty1"
                                                    style={{ fontSize: 10, paddingLeft: 5 }}
                                                    data-t132_1={'t132_1'}
                                                    onClick={this.setPrice}
                                                >
                                                    {FormatNumber(state.t1321_1, 0, 1)}
                                                </span>
                                                &nbsp;&nbsp;
                                                <span
                                                    id="tooltip_buyprice1"
                                                    style={{ paddingRight: 5 }}
                                                    data-t132_1={'t132_1'}
                                                    onClick={this.setPrice}
                                                >
                                                    {state.t132_1 == 777777710000
                                                        ? 'ATO'
                                                        : state.t132_1 == 777777720000
                                                            ? 'ATC'
                                                            : state.t132_1 == undefined ||
                                                                state.t132_1 == 0 ||
                                                                state.t132_1 == 0.0
                                                                ? null
                                                                : FormatNumber(state.t132_1, 0, 1)}
                                                </span>
                                            </span>
                                            <UncontrolledTooltip placement="bottom" target="tooltip_buyprice1">
                                                {t('price_buy_1')}
                                            </UncontrolledTooltip>
                                            <UncontrolledTooltip placement="bottom" target="tooltip_buyqty1">
                                                {t('qty_buy_1')}
                                            </UncontrolledTooltip>
                                        </div>}
                                    </div>
                                    <div
                                        className="section-sellbuy sell-attr"
                                        id={this.component + "section-ord-sell"}
                                        onClick={e => this.props.onClickSellBuyChange(e, '2')}
                                        tabIndex="-1"
                                    >
                                        <div className="title-sellbuy">{t('priceboard_sell')}</div>
                                        {(!!state.t133_1 && state.t133_1 != 0) && <div className={'value-sellbuy ' + state.t133_1_color}>
                                            <span style={{ borderRadius: 2, padding: 2 }}>
                                                <span
                                                    id="tooltip_sellprice1"
                                                    style={{ paddingLeft: 5 }}
                                                    data-t133_1={'t133_1'}
                                                    onClick={this.setPrice}
                                                >
                                                    {state.t133_1 == 777777710000
                                                        ? 'ATO'
                                                        : state.t133_1 == 777777720000
                                                            ? 'ATC'
                                                            : state.t133_1 == undefined ||
                                                                state.t133_1 == 0 ||
                                                                state.t133_1 == 0.0
                                                                ? null
                                                                : FormatNumber(state.t133_1, 0, 1)}
                                                </span>
                                                &nbsp;&nbsp;
                                                <span
                                                    id="tooltip_sellqty1"
                                                    style={{ fontSize: 10, paddingRight: 5 }}
                                                    data-t133_1={'t133_1'}
                                                    onClick={this.setPrice}
                                                >
                                                    {FormatNumber(state.t1331_1, 0, 1)}
                                                </span>
                                                <UncontrolledTooltip
                                                    placement="bottom"
                                                    target="tooltip_sellprice1"
                                                >
                                                    {t('price_sell_1')}
                                                </UncontrolledTooltip>
                                                <UncontrolledTooltip
                                                    placement="bottom"
                                                    target="tooltip_sellqty1"
                                                >
                                                    {t('qty_sell_1')}
                                                </UncontrolledTooltip>
                                            </span>
                                        </div>}
                                    </div>
                                    {!!state.t260 && !!state.t31 && (state.t31 - state.t260) != 0 && <><div
                                        className={'section-order-match ' + state.t31_color}
                                        data-cr={'CR'}
                                        onClick={this.setPrice}
                                    >
                                        <span id="tooltip_match" className="nowrap">
                                            {state.t260 === null ||
                                                state.t260 === undefined ||
                                                state.t31 === null ||
                                                state.t31 === 0 ||
                                                state.t31 === undefined ||
                                                state.t31 - state.t260 === 0
                                                ? ''
                                                : FormatNumber(
                                                    ((state.t31 - state.t260) * 100) /
                                                    state.t260,
                                                    2,
                                                    0
                                                ) + ' %'}
                                        </span>
                                    </div>
                                        <UncontrolledTooltip placement="bottom" target="tooltip_match">
                                            {t('rate_price_current')}
                                        </UncontrolledTooltip>
                                    </>}
                                </div>
                            </div>
                        </div>

                        <div className="form-group marginBottom5 flex" style={{ minHeight: 28 }}>
                            <SearchRightInfo
                                selectedStkName={state.stkSelected}
                                stkList={state.stkList}
                                selectedStk={this.props.selectedStk}
                                themePage={state.themePage}
                                node={this.props.node ? this.props.node : null}
                                component={this.component}
                                req_component={this.req_component}
                                get_rq_seq_comp={this.get_rq_seq_comp}
                                get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                                isSynce={true}
                            />
                        </div>

                        {/* Table giá trần/sàn/tham chiếu... */}
                        <div
                            className="form-group minscroll-place-order"
                            style={{ minHeight: 28, overflow: 'auto' }}
                        >
                            <table
                                className="tableOrd table-sm table-nopadding table"
                                style={{ marginBottom: 0, fontSize: 12 }}
                            >
                                <tbody>
                                    <tr style={{ height: 20 }}>
                                        <td>
                                            <span>{t('ceiling')}:</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span
                                                onClick={() => this.props.setnewPrice('CE')}
                                                className="price_ceil_color text-right cursor_ponter"
                                            >
                                                {FormatNumber(state.t332, 0, 0)}
                                            </span>
                                        </td>
                                        <td>
                                            <span>{t('floor')}:</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span
                                                onClick={() => this.props.setnewPrice('FL')}
                                                className="price_floor_color text-right no-padding cursor_ponter"
                                            >
                                                {FormatNumber(state.t333, 0, 0)}
                                            </span>
                                        </td>
                                        <td>
                                            <span>{t('reference')}:</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span
                                                onClick={() => this.props.setnewPrice('RF')}
                                                className="price_basic_color text-right no-padding cursor_ponter"
                                            >
                                                {FormatNumber(state.t260, 0, 0)}
                                            </span>
                                        </td>
                                        <td>
                                            <span>{t('last_price')}:</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span
                                                onClick={() => this.props.setnewPrice('CR')}
                                                className={
                                                    'text-right no-padding cursor_ponter ' +
                                                    state.t31_color
                                                }
                                            >
                                                {FormatNumber(state.t31, 0, 0)}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="form-group marginBottom5 text-center" style={{ marginLeft: -2 }}>
                            <div
                                className="btn-group"
                                role="group"
                                style={{ visibility: state.plcOrd.stkName !== '' ? 'visible' : 'hidden' }}
                            >
                                {state.orderTps.map((item, index) => (
                                    <button
                                        key={index + 'ord_tp'}
                                        type="button"
                                        className={"btn btn-size btn-secondary " + this.component + 'ord_tp'}
                                        name={item.key}
                                        id={this.component + 'ord_tp_' + item.key}
                                        onClick={this.props.onChangeOrderTp}
                                    >
                                        {t(item.name)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {glb_sv.activeCode !== '028' &&
                            (<><div
                                className="form-group marginBottom5"
                                id={this.component + "orderPlc_price_formgrp"}
                                style={{ display: 'flex' }}
                            >
                                <label
                                    className="col-4 no-padding-left"
                                    style={{ paddingRight: 0 }}
                                    htmlFor={this.component + "orderPlc_price"}
                                >
                                    {t('price')}
                                </label>
                                <div className="col-8 input-group input-group-sm no-padding-right">
                                    <Input
                                        inputtype={'text'}
                                        id={this.component + "orderPlc_price"}
                                        name={'price'}
                                        disabled={state.plcOrd['orderTp'] !== '01'}
                                        value={state.plcOrd.price}
                                        onChange={this.props.handleChangePrice}
                                        onKeyDown={this.props.handleKeyPress}
                                        classextend={'form-control-sm text-right'}
                                        autoComplete="off"
                                        tabIndex="1"
                                    />
                                </div>
                            </div>

                                <div className="form-group marginBottom5" style={{ marginBottom: 0, display: 'flex' }}>
                                    <label
                                        className="col-4 no-padding-left"
                                        style={{ paddingRight: 0, whiteSpace: 'nowrap' }}
                                        htmlFor={this.component + "orderPlc_qty"}
                                    >
                                        {t('qty')}
                                    </label>
                                    <div className="col-8 formmrgbottom0 input-group input-group-sm no-padding-right">
                                        <Input
                                            inputtype={'text'}
                                            id={this.component + "orderPlc_qty"}
                                            name={'qty'}
                                            onKeyDown={this.props.handleKeyPress}
                                            value={state.plcOrd.qty}
                                            onChange={this.props.handleChangeQty}
                                            classextend={'form-control-sm text-right'}
                                            autoComplete="off"
                                            tabIndex="2"
                                        />
                                    </div>
                                </div>
                            </>)}

                        {glb_sv.activeCode === '028' &&
                            (<><div className="form-group marginBottom5" style={{ marginBottom: 0, display: 'flex' }}>
                                <label
                                    className="col-4 no-padding-left"
                                    style={{ paddingRight: 0, whiteSpace: 'nowrap' }}
                                    htmlFor={this.component + "orderPlc_qty"}
                                >
                                    {t('qty')}
                                </label>
                                <div className="col-8 formmrgbottom0 input-group input-group-sm no-padding-right">
                                    <Input
                                        inputtype={'text'}
                                        id={this.component + "orderPlc_qty"}
                                        name={'qty'}
                                        onKeyDown={this.handleKeyPress}
                                        value={state.plcOrd.qty}
                                        onChange={state.handleChangeQty}
                                        classextend={'form-control-sm text-right'}
                                        autoComplete="off"
                                        tabIndex="1"
                                    />
                                </div>
                            </div>

                                <div
                                    className="form-group marginBottom5"
                                    id={this.component + "orderPlc_price_formgrp"}
                                    style={{ display: 'flex' }}
                                >
                                    <label
                                        className="col-4 no-padding-left"
                                        style={{ paddingRight: 0 }}
                                        htmlFor={this.component + "orderPlc_price"}
                                    >
                                        {t('price')}
                                    </label>
                                    <div className="col-8 input-group input-group-sm no-padding-right">
                                        <Input
                                            inputtype={'text'}
                                            id={this.component + "orderPlc_price"}
                                            name={'price'}
                                            disabled={state.plcOrd['orderTp'] !== '01'}
                                            value={state.plcOrd.price}
                                            onChange={this.props.handleChangePrice}
                                            onKeyDown={this.props.handleKeyPress}
                                            classextend={'form-control-sm text-right'}
                                            autoComplete="off"
                                            tabIndex="2"
                                        />
                                    </div>
                                </div>
                            </>)}

                        {state.plcOrd.sb_tp === '1' && (
                            <>
                                {/* <div className="form-group" style={{ marginBottom: 0, display: 'flex' }}>
                                    <label className="col-5 no-padding-left no-padding-right">
                                        {t('buying_power_frm_proper')}&nbsp;
                                        <i
                                            className="fa fa-info-circle cursor_ponter"
                                            onClick={this.props.openModal_buypowerDetail}
                                            id="tooltip_buyPw"
                                        ></i>
                                        <Tooltip
                                            placement="top"
                                            isOpen={state.tooltipOpen_buyPw}
                                            target="tooltip_buyPw"
                                            toggle={() => this.props.toggle(3)}
                                        >
                                            {t('buyPower_detail')}
                                        </Tooltip>
                                        &nbsp;
                                        <i
                                            className="fa fa-refresh cursor_ponter"
                                            onClick={this.props.getBuyAble}
                                            id="tooltip_refesh_buyPw"
                                        ></i>
                                        <Tooltip
                                            placement="top"
                                            isOpen={state.tooltipRefesh_buyPw}
                                            target="tooltip_refesh_buyPw"
                                            toggle={() => this.props.toggle(9)}
                                        >
                                            {t('Refresh')}
                                        </Tooltip>
                                    </label>
                                    <div className="col-7 no-padding-right input-group input-group-sm">
                                        <span className="disabled form-control form-control-sm no-padding-left no-padding-right text-over text-right">
                                            {FormatNumber(state.plcOrd.buyPw, 0, 0)}
                                        </span>
                                    </div>
                                </div> */}
                                <div className="form-group" style={{ marginBottom: 0, display: 'flex' }}>
                                    <label className="col-4 no-padding-left no-padding-right">
                                        {t('max_volume_buy_tradding_short')}
                                    </label>
                                    <div className="col-8 no-padding-right input-group input-group-sm cursor_ponter">
                                        <span
                                            onClick={this.props.getMaxVolumeTradding}
                                            id="tooltip_maxvolumn"
                                            className="disabled text-right form-control form-control-sm text-over no-padding-left no-padding-right"
                                        >
                                            {FormatNumber(state.plcOrd.maxtrad_qty, 0, 0)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        {state.plcOrd.sb_tp === '2' && (
                            <>
                                <div className="form-group" style={{ marginBottom: 0, display: 'flex' }}>
                                    <label className="col-5 no-padding-left no-padding-right">
                                        {t('own_qty')}
                                    </label>
                                    <div className="col-7 no-padding-right input-group input-group-sm no-padding-left">
                                        <span
                                            style={{ textAlign: 'right' }}
                                            onClick={this.props.getMaxVolumeTradding}
                                            id="tooltip_maxvolumn"
                                            className="disabled form-control form-control-sm no-padding-left no-padding-right text-over"
                                        >
                                            {FormatNumber(state.plcOrd.stkOwn, 0, 0)} {t('share')}
                                        </span>
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0, display: 'flex' }}>
                                    <label className="col-5 no-padding-left" style={{ paddingRight: 0 }}>
                                        {t('max_volume_buy_tradding_short')}&nbsp;
                                        <i
                                            className="fa fa-refresh cursor_ponter"
                                            onClick={this.props.refeshSellAble}
                                            id="tooltip_refesh_buyPw"
                                        ></i>
                                        <Tooltip
                                            placement="top"
                                            isOpen={state.tooltipRefesh_buyPw}
                                            target="tooltip_refesh_buyPw"
                                            toggle={() => this.props.toggle(9)}
                                        >
                                            {t('Refresh')}
                                        </Tooltip>
                                    </label>
                                    <div className="col-7 no-padding-right input-group input-group-sm">
                                        <span
                                            style={{ textAlign: 'right' }}
                                            onClick={this.props.getMaxVolumeTradding}
                                            id="tooltip_maxvolumn"
                                            className="disabled cursor_ponter form-control form-control-sm  no-padding-right"
                                        >
                                            {FormatNumber(state.plcOrd.sellPw, 0, 0)} {t('share')}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-group marginBottom5" style={{ marginBottom: 0, display: 'flex' }}>
                            <label className="col-5 no-padding-left no-padding-right">
                                {t('priceboard_foreign_room')}&nbsp;
                            </label>
                            <div className="col-7 no-padding-right input-group input-group-sm">
                                <span className="disabled form-control form-control-sm no-padding-left no-padding-right text-over text-right">
                                    {FormatNumber(state.t3301, 0, 0)}
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <button
                                type="submit"
                                tabIndex="3"
                                onClick={this.props.placeOrder}
                                id={this.component + "placeOrderButton"}
                                className="btn btn-sm btn-block btn-info"
                                style={{ marginLeft: 0 }}
                            >
                                <strong>
                                    {state.plcOrd.sb_tp === '2' && <span>{t('place_selling_order')}</span>}
                                    {state.plcOrd.sb_tp === '1' && <span>{t('place_buying_order')}</span>}
                                    {state.plcOrd.sb_tp === '1' && state.stkSelected && state.stkSelected['value'] && <span>{':  '}{state.stkSelected.value}</span>}
                                    {state.plcOrd.sb_tp === '2' && state.stkSelected && state.stkSelected['value'] && <span>{':  '}{state.stkSelected.value.substr(4)}</span>}
                                </strong>
                            </button>
                        </div>
                    </div>
                </div>
            </>)
    }
}

export default translate('translations')(AddOrderForm);    