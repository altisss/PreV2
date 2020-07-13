import React from "react";
import i18n from '../../translate/i18n';
const CheckBox = props => {
  return (
    <div className={props.divClass}>
      {props.options.map(option => {
        return (
          <React.Fragment key={props.name}>
            <input
              className={props.checkboxClass}
              id={props.name}
              name={props.name}
              onChange={props.onChange}
              value={option}
              checked={props.selectedoptions.indexOf(option) > -1}
              type="checkbox"
            />
            <label className="custom-control-label align-middle" htmlFor={props.name}>{i18n.t(option)}</label>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CheckBox;
