import './sszhxt-jqdj.css'
export const name = 'sszhxt-jqdj';

import { jqdjUrl } from '/services/configService';

avalon.component(name, {
    template: __inline('./sszhxt-jqdj.html'),
    defaults: {
        jqdjUrl: jqdjUrl
    }
});
