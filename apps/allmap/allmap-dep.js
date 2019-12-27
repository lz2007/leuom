/*
 * @Description: 地图依赖集合
 * @Author: Linzhanhong
 * @LastEditors: Linzhanhong
 * @Date: 2019-08-05 14:58:50
 * @LastEditTime: 2019-08-29 18:45:12
 */

import { allMapConfig } from '/services/configService';
import Type, {BAIDU, MAPLITE, MINEMAP, PGIS, OL} from './allmap-type';

let server = allMapConfig.basemap;
let version = allMapConfig.version || 'v2.0.0';

let mode = allMapConfig.mode.trim().split('-');
let type = '';
Object.keys(Type).forEach(function(value) {
    if(mode[0] === value) {
        type = value;
    }
});

// 地图依赖文件
export const dep = {
    [OL]: {
        js: [],
        css: []
    },
    [BAIDU]: {
        js: [
            'https://cdn.bootcss.com/jquery/1.12.1/jquery.js', 
            // 'http://api.map.baidu.com/api?v=2.0&ak=DyKna0bWQQzFFWrhgdyFVIQA',
            'http://api.map.baidu.com/getscript?v=2.0&ak=DyKna0bWQQzFFWrhgdyFVIQA&services=&t=20190622163250',
            'http://api.map.baidu.com/library/DistanceTool/1.2/src/DistanceTool_min.js'
        ],
        css: []
    },
    [MAPLITE]: {
        js: [
            'http://map.maplite.cn/api'
        ],
        css: []
    },
    [PGIS]: {
        js: [
            server + '/PGIS_S_TileMapTDT/js/EzMapAPI.js'
        ],
        css: []
    },
    [MINEMAP]: {
        js: [
            server + '/minemapapi/' + version + '/plugins/edit/minemap-edit.js',
            server + '/minemapapi/' + version + '/plugins/turf/turf.min.js',
            server + '/minemapapi/' + version + '/minemap.js',
        ],
        css: [
            server + '/minemapapi/' + version + '/minemap.css'
        ]
    }
}
let mapDep = dep[Type[type]];

export default mapDep;