function filterNumber(numberstr){
    if (typeof numberstr === 'number') return numberstr;
    else if (numberstr != null && numberstr.length > 0) {
      return Number(numberstr.replace(/\D/g, ''));
    }
  };

export {filterNumber}