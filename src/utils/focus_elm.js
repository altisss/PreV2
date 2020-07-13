function focusELM(key) {
    const elm = document.getElementById(key);
    if (elm) elm.focus();
};
export {focusELM}