import i18n from 'i18next';
import { reactI18nextModule } from "react-i18next";
import en from './language/en.json';
import vi from './language/vi.json';
import cn from './language/cn.json';
// import glb_sv from '../../services/global_service';
// import en from '../../../public/language/en.json';
// import vi from '../../../public/language/vi.json';
// import cn from '../../../public/language/cn.json';
// import GetJson from './loadjson.js';
// const en = GetJson(1);
// const en = GetJson(2);

i18n
  .use(reactI18nextModule)
  .init({
    // we init with resources
    resources: {
      en: {
        translations: en
      },
      vi: {
        translations: vi
      },
      cn: {
        translations: cn
      }
    },
    fallbackLng: 'vi',

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',

    keySeparator: false, // we use content as keys

    interpolation: {
      escapeValue: false, // not needed for react!!
      formatSeparator: ','
    },

    react: {
      wait: true
    }
  });

export default i18n;