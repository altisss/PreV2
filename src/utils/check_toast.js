function checkToast (toast, type, message, toastId) {
    if (toast.isActive(toastId)) {
      return;
    }
    toast[type](message, { toastId });
}

export{checkToast}