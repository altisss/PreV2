import React from "react";
const Status = props => {
    return (
        <>
            <span>{props.t('order_status')}</span>
            <table>
                <tbody>
                    <tr>
                        <td onClick={() => props.handleSelectStatus('3')}>
                            <input type="radio" id={"3-option-" + props.nameInput} name={props.nameInput} />
                            <label htmlFor={"3-option-" + props.nameInput}>{props.t('wait_to_match')}</label>
                            <div className="check"></div>
                        </td>
                        <td onClick={() => props.handleSelectStatus('45')}>
                            <input type="radio" id={"45-option-" + props.nameInput} name={props.nameInput} />
                            <label htmlFor={"45-option-" + props.nameInput}>{props.t('hist_ord_dt_matched')}</label>
                            <div className="check"></div>
                        </td>

                    </tr>
                    <tr>
                        <td onClick={() => props.handleSelectStatus('wait')}>
                            <input type="radio" id={"wait-option-" + props.nameInput} name={props.nameInput} />
                            <label htmlFor={"wait-option-" + props.nameInput}>{props.t('wait_to_process')}</label>
                            <div className="check"></div>
                        </td>
                        <td onClick={() => props.handleSelectStatus('all')}>
                            <input type="radio" id={"all-option-" + props.nameInput} name={props.nameInput} />
                            <label htmlFor={"all-option-" + props.nameInput}>{props.t('common_all')}</label>
                            <div className="check"></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
};
export default Status;