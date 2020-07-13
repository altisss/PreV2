import React from "react";
const Input = props => {

  return (
      <input
        className={"form-control form-control-sm " + (props.classextend || '')}
        id={props.id||props.name}
        name={props.name}
        type={props.inputtype}
        value={props.value}
        placeholder={props.placeholder}
        disabled={props.disabled}
        maxLength={props.maxLength}
        minLength={props.minLength}
        autoComplete="off"
        tabIndex={props.tabIndex}
        {...props}
      />
  );
};

export default Input;
