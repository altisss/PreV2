function change_theme(agrs) {
    if (agrs === 'dark-theme') {
        const body = document.getElementsByTagName('body');
        if (body[0].classList.contains('light-theme')) body[0].classList.remove('light-theme');
        if (body[0].classList.contains('light-theme-china')) body[0].classList.remove('light-theme-china');
        if (body[0].classList.contains('dark-theme-china')) body[0].classList.remove('dark-theme-china');
        if (!body[0].classList.contains('dark-theme')) body[0].classList.add('dark-theme');
    }else
    if (agrs === 'light-theme') {
        const body = document.getElementsByTagName('body');
        if (body[0].classList.contains('dark-theme')) body[0].classList.remove('dark-theme');
        if (body[0].classList.contains('light-theme-china')) body[0].classList.remove('light-theme-china');       
        if (body[0].classList.contains('dark-theme-china')) body[0].classList.remove('dark-theme-china');
        if (!body[0].classList.contains('light-theme')) body[0].classList.add('light-theme');
    }else 
    if (agrs === 'dark-theme-china') {
        const body = document.getElementsByTagName('body');
        if (body[0].classList.contains('light-theme')) body[0].classList.remove('light-theme');
        if (body[0].classList.contains('dark-theme')) body[0].classList.remove('dark-theme');
        if (body[0].classList.contains('light-theme-china')) body[0].classList.remove('light-theme-china');
        if (!body[0].classList.contains('dark-theme-china')) body[0].classList.add('dark-theme-china');
    }else 
    if (agrs === 'light-theme-china') {
        const body = document.getElementsByTagName('body');
        if (body[0].classList.contains('dark-theme')) body[0].classList.remove('dark-theme');
        if (body[0].classList.contains('light-theme')) body[0].classList.remove('light-theme');
        if (body[0].classList.contains('dark-theme-china')) body[0].classList.remove('dark-theme-china');
        if (!body[0].classList.contains('light-theme-china')) body[0].classList.add('light-theme-china');
    }
};

export {change_theme};