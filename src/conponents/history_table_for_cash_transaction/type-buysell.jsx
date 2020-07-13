import React from "react";
const TypeBuySell = props => {
    return (
        <>
            <span>{props.t('transaction_type')}</span>
            <table>
                <tbody>
                    <tr>
                        <td onClick={() => props.handleSelectTypeBuysell('buy')}>
                            <input type="radio" id={"buy-option-" + props.nameInput} name={props.nameInput}/>
                            <label htmlFor={"buy-option-" + props.nameInput}>{props.t('priceboard_buy')}</label>
                            <div className="check"></div>
                        </td>
                        <td onClick={() => props.handleSelectTypeBuysell('sell')}>
                            <input type="radio" id={"sell-option-" + props.nameInput} name={props.nameInput}/>
                            <label htmlFor={"sell-option-" + props.nameInput}>{props.t('priceboard_sell')}</label>
                            <div className="check"></div>
                        </td>
                        <td onClick={() => props.handleSelectTypeBuysell('all')}>
                            <input type="radio" id={"all-option-" + props.nameInput} name={props.nameInput}/>
                            <label htmlFor={"all-option-" + props.nameInput}>{props.t('common_all')}</label>
                            <div className="check"></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
};
export default TypeBuySell;