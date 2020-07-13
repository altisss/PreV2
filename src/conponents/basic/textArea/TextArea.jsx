import React from "react";
import i18n from '../../translate/i18n';
const TextArea = props => (
    <textarea
      className="form-control"
      name={props.name}
      rows={props.rows}
      cols={props.cols}
      value={props.value}
      onChange={props.handleChange}
      placeholder={i18n.t(props.placeholder)}
    />
);

export default TextArea;
