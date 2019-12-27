/*
 * @Author: linzhanhong 
 * @Date: 2018-12-27 11:00:22 
 * @Last Modified by: mikey.liangzhu
 * @Last Modified time: 2019-08-07 15:13:42
 */

import '../../common/common-tyywglpt.css';
import '../../common/common-sbzygl.css';
import './jdzxpt-kphczl-mix.less';

import {
    KphczlModel
} from './jdzxpt-kphczl-mix';

export const name = 'jdzxpt-kphczl-ccqk';

let mixModel = new KphczlModel(name);
avalon.component(name, {
    template: __inline('./jdzxpt-kphczl-mix.html'),
    defaults: avalon.mix(true, {}, mixModel)
});