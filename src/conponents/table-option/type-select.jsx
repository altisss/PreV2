import React from "react";
const TypeSelect = props => {
    if (props.name === 'adv-ord-list') {
        return (
            <>
                <span>{props.t('order_status')}</span>
                <table>
                    <tbody>
                        <tr>
                            <td onClick={() => props.handleSelectType('%')}>
                                <input type="radio" id={"%-option-" + props.nameInput} name={props.nameInput} />
                                <label htmlFor={"%-option-" + props.nameInput}>{props.t('choose_all_kind')}</label>
                                <div className="check"></div>
                            </td>
                            <td onClick={() => props.handleSelectType('1')}>
                                <input type="radio" id={"1-option-" + props.nameInput} name={props.nameInput} />
                                <label htmlFor={"1-option-" + props.nameInput}>{props.t('wait_to_process')}</label>
                                <div className="check"></div>
                            </td>
                        </tr>
                        <tr>
                            <td onClick={() => props.handleSelectType('2')}>
                                <input type="radio" id={"2-option-" + props.nameInput} name={props.nameInput} />
                                <label htmlFor={"2-option-" + props.nameInput}>{props.t('finish_process')}</label>
                                <div className="check"></div>
                            </td>
                            <td onClick={() => props.handleSelectType('3')}>
                                <input type="radio" id={"3-option-" + props.nameInput} name={props.nameInput} />
                                <label htmlFor={"3-option-" + props.nameInput}>{props.t('cancel_order')}</label>
                                <div className="check"></div>
                            </td>
    
                        </tr>
                        <tr>
                            <td onClick={() => props.handleSelectType('4')}>
                                <input type="radio" id={"4-option-" + props.nameInput} name={props.nameInput} />
                                <label htmlFor={"4-option-" + props.nameInput}>{props.t('processing')}</label>
                                <div className="check"></div>
                            </td>
                            <td onClick={() => props.handleSelectType('9')}>
                                <input type="radio" id={"9-option-" + props.nameInput} name={props.nameInput} />
                                <label htmlFor={"9-option-" + props.nameInput}>{props.t('process_fail')}</label>
                                <div className="check"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </>
        )
    } else if (props.name === 'history-list') {
        return (
            <>
                <span>{props.t('order_status')}</span>
                <table>
                    <tbody>
                        <tr>
                            <td onClick={() => props.handleSelectType('%')}>
                                <input type="radio" id={"%-option-" + props.nameInput} name={props.nameInput} />
                                <label htmlFor={"%-option-" + props.nameInput}>{props.t('choose_all_kind')}</label>
                                <div className="check"></div>
                            </td>
                        </tr>
                        <tr>
                            <td onClick={() => props.handleSelectType('1')}>
                                <input type="radio" id={"1-option-" + props.nameInput} name={props.nameInput} />
                                <label htmlFor={"1-option-" + props.nameInput}>{props.t('transaction_stock')}</label>
                                <div className="check"></div>
                            </td>
                        </tr>
                        <tr>
                            <td onClick={() => props.handleSelectType('2')}>
                                <input type="radio" id={"2-option-" + props.nameInput} name={props.nameInput} />
                                <label htmlFor={"2-option-" + props.nameInput}>{props.t('transaction_cash')}</label>
                                <div className="check"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </>
        )
    }
    return '';
};
export default TypeSelect;
