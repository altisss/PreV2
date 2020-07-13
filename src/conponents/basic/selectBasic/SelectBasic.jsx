import React from "react";
import i18n from '../../translate/i18n';
const SelectBasic = props => {
  return (
      <select
        id={props.name}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        className={"form-control "+props.classextend}
        disabled={props.disabled}
      >
        {props.options.map(item => 
            <option key={item.id || item.key|| item.c0 || item.c1} value={item.id || item.key}>
              {i18n.t(item.name) || i18n.t(item.c1)}
            </option>
        )}
      </select>
  );
};

export default SelectBasic;
