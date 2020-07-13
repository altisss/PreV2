function hide_title(id){
    const elemms = document.querySelectorAll('.' + id);
    for (let i = 0; i < elemms.length; i++) {
      const current = elemms[i];
      if (current === undefined || current === null) { return; }
      else if (!current.classList.contains('hide_title')) {
        current.classList.add('hide_title');
      }
    }
}

function show_title(id) {
  const elemms = document.querySelectorAll('.' + id);
  for (let i = 0; i < elemms.length; i++) {
    const current = elemms[i];
    if (current === undefined || current === null) { return; }
    else if (current.classList.contains('hide_title')) {
      current.classList.remove('hide_title');
    }
  }
};

export {hide_title, show_title}
