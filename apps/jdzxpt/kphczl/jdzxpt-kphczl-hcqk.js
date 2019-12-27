/*
 * @Author: linzhanhong 
 * @Date: 2018-12-27 14:56:42 
 * @Last Modified by: linzhanhong
 * @Last Modified time: 2018-12-28 16:47:09
 */



import '../../common/common-tyywglpt.css';
import '../../common/common-sbzygl.css';
import './jdzxpt-kphczl-mix.less';

import { KphczlModel } from './jdzxpt-kphczl-mix';

export const name = 'jdzxpt-kphczl-hcqk';

let mixModel = new KphczlModel(name);
avalon.component(name, {
    template: __inline('./jdzxpt-kphczl-mix.html'),
    defaults: avalon.mix(true, {}, mixModel)
});
