import React from "react";
const TimeSelect = props => {
    
    return (
        <>
            <span>{props.t('time')}</span>
            <table>
                <tbody>
                    <tr>
                        <td onClick={() => props.handleSelectTime('0D')}>
                            <input type="radio" id={"0D-option-" + props.nameInput} name={props.nameInput} />
                            <label htmlFor={"0D-option-" + props.nameInput}>{props.t('day')}</label>
                            <div className="check"></div>
                        </td>
                        <td onClick={() => props.handleSelectTime('7D')}>
                            <input type="radio" id={"7D-option-" + props.nameInput} name={props.nameInput} />
                            <label htmlFor={"7D-option-" + props.nameInput}>{props.t('week')}</label>
                            <div className="check"></div>
                        </td>
                    </tr>
                    <tr>
                        <td onClick={() => props.handleSelectTime('30D')}>
                            <input type="radio" id={"30D-option-" + props.nameInput} name={props.nameInput} />
                            <label htmlFor={"30D-option-" + props.nameInput}>{props.t('one_month')}</label>
                            <div className="check"></div>
                        </td>
                        <td onClick={() => props.handleSelectTime('60D')}>
                            <input type="radio" id={"60D-option-" + props.nameInput} name={props.nameInput} />
                            <label htmlFor={"60D-option-" + props.nameInput}>{props.t('two_month')}</label>
                            <div className="check"></div>
                        </td>

                    </tr>
                    <tr>
                        <td onClick={() => props.handleSelectTime('90D')}>
                            <input type="radio" id={"90D-option-" + props.nameInput} name={props.nameInput} />
                            <label htmlFor={"90D-option-" + props.nameInput}>{props.t('three_month')}</label>
                            <div className="check"></div>
                        </td>
                        <td onClick={() => props.handleSelectTime('180D')}>
                            <input type="radio" id={"180D-option-" + props.nameInput} name={props.nameInput} />
                            <label htmlFor={"180D-option-" + props.nameInput}>{props.t('six_month')}</label>
                            <div className="check"></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
};
export default TimeSelect;