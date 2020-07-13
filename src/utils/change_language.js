
function change_language(language, props) {
      if (language) props.i18n.changeLanguage(String(language).toLowerCase());
      if (typeof (Storage) !== 'undefined') {
        localStorage.setItem('lngUser', JSON.stringify(language));
      }
  }


  export {change_language};