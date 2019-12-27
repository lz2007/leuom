import 'mmRouter';
import {
    menu as menuStore
} from './storeService';

function getPage(component) {
    const html = `<xmp is="${component}" :widget="{id:'${component.replace(/\-/g, '_')}',expire:${Date.now()}}"></xmp>`;
    return html;
}

function applyRouteConfig(config, parentRoute, accPath = '') {
    config.map(function (route) {
        let apps = {};
        if (route.component) {
            apps.currentPage = route.component;
        }
        if (route.apps) {
            apps = route.apps;
        }
        avalon.router.add(accPath + route.path, function () {
            Object.keys(apps).map(viewName => {
                let component = apps[viewName];
                if (typeof component === 'function') {
                    component(function (m) {
                        menuStore.selectedKeys$.onNext([m.name]);
                        if (!avalon.vmodels[parentRoute.name]) {
                            global.location.href = parentRoute['sysName'] + '#!/' + parentRoute['name'].replace(/\_/g, '-');
                        } else {
                            avalon.vmodels[parentRoute.name][viewName] = getPage(m.name);
                        }
                    });
                } else {
                    avalon.vmodels[parentRoute.name][viewName] = getPage(component.name);
                }
            });
        });
        // TODO 支持嵌套路由
        route.children && applyRouteConfig(route.children, route, accPath + route.path);
    });
}

require('/apps/common/common-header');
require('/apps/common/common-sidebar');
require('/apps/common/common-currentbar');

var vUri = global.location.hash.replace(/#!\//);
const routeConfig = [
    {
        path: '/jdzxpt-kphczl-ccqk',
        component(resolve) {
            require.async('/apps/jdzxpt/kphczl/jdzxpt-kphczl-ccqk', resolve);
        }
    },
    {
        path: '/jdzxpt-khjg-khjg',
        component(resolve) {
            require.async('/apps/jdzxpt/khjg/jdzxpt-khjg-khjg', resolve);
        }
    },
    {
        path: '/jdzxpt-khjg-khjg-qzpz',
        component(resolve) {
            require.async('/apps/jdzxpt/khjg/jdzxpt-khjg-khjg-qzpz', resolve);
        }
    },
    {
        path: '/jdzxpt-kphczl-hcqk',
        component(resolve) {
            require.async('/apps/jdzxpt/kphczl/jdzxpt-kphczl-hcqk', resolve);
        }
    },
    {
        path: '/jdzxpt-dxcc-jycx',
        component(resolve) {
            require.async('/apps/jdzxpt/dxcc/jdzxpt-dxcc-jycx', resolve);
        }
    },
    {
        path: '/jdzxpt-dxcc-jq',
        component(resolve) {
            require.async('/apps/jdzxpt/dxcc/jdzxpt-dxcc-jq', resolve);
        }
    },
    {
        path: '/jdzxpt-dxcc-aj',
        component(resolve) {
            require.async('/apps/jdzxpt/dxcc/jdzxpt-dxcc-aj', resolve);
        }
    },
    {
        path: '/jdzxpt-dxcc-fxccf',
        component(resolve) {
            require.async('/apps/jdzxpt/dxcc/jdzxpt-dxcc-fxccf', resolve);
        }
    },
    {
        path: '/jdzxpt-dxcc-qzcs',
        component(resolve) {
            require.async('/apps/jdzxpt/dxcc/jdzxpt-dxcc-qzcs', resolve);
        }
    },
    {
        path: '/jdzxpt-kphc-detail',
        component(resolve) {
            require.async('/apps/jdzxpt/kphc/jdzxpt-kphc-detail', resolve);
        }
    },
    {
        path: '/jdzxpt-dxcc-sgcl',
        component(resolve) {
            require.async('/apps/jdzxpt/dxcc/jdzxpt-dxcc-sgcl', resolve);
        }
    },
    {
        path: '/jdzxpt-dxcc-jycx',
        component(resolve) {
            require.async('/apps/jdzxpt/dxcc/jdzxpt-dxcc-jycx', resolve);
        }
    },
    {
        path: '/jdzxpt-sjcc-jq',
        component(resolve) {
            require.async('/apps/jdzxpt/sjcc/jdzxpt-sjcc-jq', resolve);
        }
    },
    {
        path: '/jdzxpt-sjcc-aj',
        component(resolve) {
            require.async('/apps/jdzxpt/sjcc/jdzxpt-sjcc-aj', resolve);
        }
    },
    {
        path: '/jdzxpt-sjcc-fxccf',
        component(resolve) {
            require.async('/apps/jdzxpt/sjcc/jdzxpt-sjcc-fxccf', resolve);
        }
    },
    {
        path: '/jdzxpt-sjcc-qzcs',
        component(resolve) {
            require.async('/apps/jdzxpt/sjcc/jdzxpt-sjcc-qzcs', resolve);
        }
    },
    {
        path: '/jdzxpt-sjcc-sgcl',
        component(resolve) {
            require.async('/apps/jdzxpt/sjcc/jdzxpt-sjcc-sgcl', resolve);
        }
    },
    {
        path: '/jdzxpt-sjcc-jycx',
        component(resolve) {
            require.async('/apps/jdzxpt/sjcc/jdzxpt-sjcc-jycx', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-yhgl',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-yhgl', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-bmgl',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-bmgl', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-gnqx',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-gnqx', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-yhlb',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-yhlb', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-zdlb',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-zdlb', resolve);
        }
    },
    // {
    //     path: '/tyyhrzpt-xtpzgl-xtcd',
    //     component(resolve) {
    //         require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-xtcd', resolve);
    //     }
    // },
    // {
    //     path: '/tyyhrzpt-xtpzgl-xtgg',
    //     component(resolve) {
    //         require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-xtgg', resolve);
    //     }
    // },
    {
        path: '/tyyhrzpt-xtpzgl-sjzd',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-sjzd', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-czrz',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-czrz', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-zfyrz',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-zfyrz', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-cjgzzrz',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-cjgzzrz', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-htglxtrz',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-htglxtrz', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-rztj',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-rztj', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-sbk-rlk',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-sbk-rlk', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-sbk-cpk',
        component(resolve) {
            require.async('/apps/tyyhrzpt/xtpzgl/tyyhrzpt-xtpzgl-sbk-cpk', resolve);
        }
    },
    {
        path: '/tyywglpt-yxjk-cjgzz',
        component(resolve) {
            require.async('/apps/tyywglpt/yxjk/tyywglpt-yxjk-cjgzz', resolve);
        }
    },
    {
        path: '/tyywglpt-yxjk-ccfw',
        component(resolve) {
            require.async('/apps/tyywglpt/yxjk/tyywglpt-yxjk-ccfw', resolve);
        }
    },
    {
        path: '/zfsypsjglpt-tjfx-zctj',
        component(resolve) {
            require.async('/apps/zfsypsjglpt/tjfx/zfsypsjglpt-tjfx-zctj', resolve);
        }
    },
    {
        path: '/tyywglpt-sbzygl-zdsbgl',
        component(resolve) {
            require.async('/apps/tyywglpt/sbzygl/tyywglpt-sbzygl-zdsbgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sbzygl-zdsbgl-main',
        component(resolve) {
            require.async('/apps/tyywglpt/sbzygl/tyywglpt-sbzygl-zdsbgl-main', resolve);
        }
    },
    {
        path: '/tyywglpt-sbzygl-bjgl',
        component(resolve) {
            require.async('/apps/tyywglpt/sbzygl/tyywglpt-sbzygl-bjgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sbzygl-cjgzzgl',
        component(resolve) {
            require.async('/apps/tyywglpt/sbzygl/tyywglpt-sbzygl-cjgzzgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sbzygl-cjgzztj',
        component(resolve) {
            require.async('/apps/tyywglpt/sbzygl/tyywglpt-sbzygl-cjgzztj', resolve);
        }
    },
    {
        path: '/tyywglpt-sbzygl-cjgzzgl-main',
        component(resolve) {
            require.async('/apps/tyywglpt/sbzygl/tyywglpt-sbzygl-cjgzzgl-main', resolve);
        }
    },
    {
        path: '/tyywglpt-sbzygl-dlspcjsbgl',
        component(resolve) {
            require.async('/apps/tyywglpt/sbzygl/tyywglpt-sbzygl-dlspcjsbgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sbxhgl-zfyxhgl',
        component(resolve) {
            require.async('/apps/tyywglpt/sbxhgl/tyywglpt-sbxhgl-zfyxhgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sbxhgl-cjzxhgl',
        component(resolve) {
            require.async('/apps/tyywglpt/sbxhgl/tyywglpt-sbxhgl-cjzxhgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ptjlgl-index',
        component(resolve) {
            require.async('/apps/tyywglpt/ptjlgl/tyywglpt-ptjlgl-index', resolve);
        }
    },
    {
        path: '/tyywglpt-baqgl-baqgl',
        component(resolve) {
            require.async('/apps/tyywglpt/baqgl/tyywglpt-baqgl-baqgl', resolve);
        }
    },
    {
        path: '/tyywglpt-baqgl-sbdjgl',
        component(resolve) {
            require.async('/apps/tyywglpt/baqgl/tyywglpt-baqgl-sbdjgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ptjlgl-slwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/ptjlgl/tyywglpt-ptjlgl-slwgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ptjlgl-bywgl',
        component(resolve) {
            require.async('/apps/tyywglpt/ptjlgl/tyywglpt-ptjlgl-bywgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ptjlgl-xlwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/ptjlgl/tyywglpt-ptjlgl-xlwgl', resolve);
        }
    },
    {
        path: '/tyywglpt-rwgl-sjscrw',
        component(resolve) {
            require.async('/apps/tyywglpt/rwgl/tyywglpt-rwgl-sjscrw', resolve);
        }
    }, {
        path: '/tyywglpt-rwgl-zdglfw',
        component(resolve) {
            require.async('/apps/tyywglpt/rwgl/tyywglpt-rwgl-zdglfw', resolve);
        }
    }, {
        path: '/tyywglpt-rwgl-lxxzrw',
        component(resolve) {
            require.async('/apps/tyywglpt/rwgl/tyywglpt-rwgl-lxxzrw', resolve);
        }
    }, {
        path: '/tyywglpt-rwgl-sslxrw',
        component(resolve) {
            require.async('/apps/tyywglpt/rwgl/tyywglpt-rwgl-sslxrw', resolve);
        }
    }, {
        path: '/tyywglpt-rwgl-zfysjrw',
        component(resolve) {
            require.async('/apps/tyywglpt/rwgl/tyywglpt-rwgl-zfysjrw', resolve);
        }
    },
    {
        path: '/tyywglpt-rwgl-baqspccrw',
        component(resolve) {
            require.async('/apps/tyywglpt/rwgl/tyywglpt-rwgl-baqspccrw', resolve);
        }
    },
    {
        path: '/tyywglpt-ptjlgl-sjgbptgl',
        component(resolve) {
            require.async('/apps/tyywglpt/ptjlgl/tyywglpt-ptjlgl-sjgbptgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ccfwgl-cjzscfwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/ccfwgl/tyywglpt-ccfwgl-cjzscfwgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ccfwgl-khdscfwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/ccfwgl/tyywglpt-ccfwgl-khdscfwgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ccfwgl-baqspccgl',
        component(resolve) {
            require.async('/apps/tyywglpt/ccfwgl/tyywglpt-ccfwgl-baqspccgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ccfwgl-baqlxfwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/ccfwgl/tyywglpt-ccfwgl-baqlxfwgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ccfwgl-4gzfylxfwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/ccfwgl/tyywglpt-ccfwgl-4gzfylxfwgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sjgl-sbsjrz',
        component(resolve) {
            require.async('/apps/tyywglpt/sjbgl/tyywglpt-sjgl-sbsjrz', resolve);
        }
    },
    {
        path: '/tyywglpt-gjgl-gjsz',
        component(resolve) {
            require.async('/apps/tyywglpt/gjgl/tyywglpt-gjgl-gjsz', resolve);
        }
    },
    {
        path: '/tyywglpt-sjbgl-zfysjbgl',
        component(resolve) {
            require.async('/apps/tyywglpt/sjbgl/tyywglpt-sjbgl-zfysjbgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sjbgl-cjzsjbgl',
        component(resolve) {
            require.async('/apps/tyywglpt/sjbgl/tyywglpt-sjbgl-cjzsjbgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sjbgl-zfjly',
        component(resolve) {
            require.async('/apps/tyywglpt/sjbgl/tyywglpt-sjbgl-zfjly', resolve);
        }
    },
    {
        path: '/tyywglpt-bacspz-baq',
        component(resolve) {
            require.async('/apps/tyywglpt/bacspz/tyywglpt-bacspz-baq', resolve);
        }
    },
    {
        path: '/tyywglpt-bacspz-gns',
        component(resolve) {
            require.async('/apps/tyywglpt/bacspz/tyywglpt-bacspz-gns', resolve);
        }
    },
    {
        path: '/tyywglpt-sqgl-index',
        component(resolve) {
            require.async('/apps/tyywglpt/sqgl/tyywglpt-sqgl-index', resolve);
        }
    },
    {
        path: '/sszhxt-spjk',
        component(resolve) {
            require.async('/apps/sszhxt/spjk/sszhxt-spjk', resolve);
        }
    },
    {
        path: '/sszhxt-lxhf',
        component(resolve) {
            require.async('/apps/sszhxt/lxhf/sszhxt-lxhf', resolve);
        }
    }, {
        path: '/sszhxt-dzwl',
        component(resolve) {
            require.async('/apps/sszhxt/dzwl/sszhxt-dzwl', resolve);
        }
    }, {
        path: '/sszhxt-sszh',
        component(resolve) {
            require.async('/apps/sszhxt/sszh/sszhxt-sszh', resolve);
        }
    }, {
        path: '/sszhxt-sszh-spbf',
        component(resolve) {
            require.async('/apps/sszhxt/sszh/sszhxt-sszh-spbf', resolve);
        }
    }, {
        path: '/sszhxt-gjgl',
        component(resolve) {
            require.async('/apps/sszhxt/gjgl/sszhxt-gjgl', resolve);
        }
    }, {
        path: '/sszhxt-gjgl-gjcx',
        component(resolve) {
            require.async('/apps/sszhxt/gjgl/sszhxt-gjgl-gjcx', resolve);
        }
    }, {
        path: '/sszhxt-gjgl-gjdy',
        component(resolve) {
            require.async('/apps/sszhxt/gjgl/sszhxt-gjgl-gjdy', resolve);
        }
    }, {
        path: '/sszhxt-gjgl-gjsz',
        component(resolve) {
            require.async('/apps/sszhxt/gjgl/sszhxt-gjgl-gjsz', resolve);
        }
    }, {
        path: '/sszhxt-znsb-rlbk',
        component(resolve) {
            require.async('/apps/sszhxt/znsb/sszhxt-znsb-rlbk', resolve);
        }
    }, {
        path: '/sszhxt-znsb-rzhy',
        component(resolve) {
            require.async('/apps/sszhxt/znsb/sszhxt-znsb-rzhy', resolve);
        }
    }, {
        path: '/sszhxt-znsb-rlbk-detail',
        component(resolve) {
            require.async('/apps/sszhxt/znsb/sszhxt-znsb-rlbk-detail', resolve);
        }
    }, {
        path: '/sszhxt-znsb-cpbk',
        component(resolve) {
            require.async('/apps/sszhxt/znsb/sszhxt-znsb-cpbk', resolve);
        }
    }, {
        path: '/sszhxt-znsb-cpbk-detail',
        component(resolve) {
            require.async('/apps/sszhxt/znsb/sszhxt-znsb-cpbk-detail', resolve);
        }
    }, {
        path: '/sszhxt-znsb-bk',
        component(resolve) {
            require.async('/apps/sszhxt/znsb/sszhxt-znsb-bk', resolve);
        }
    }, {
        path: '/sszhxt-gjglcontrol',
        component(resolve) {
            require.async('/apps/sszhxt/gjgl/sszhxt-gjglcontrol', resolve);
        }
    },{
        path: '/tyywglpt-yxjk-xtfw',
        component(resolve) {
            require.async('/apps/tyywglpt/yxjk/tyywglpt-yxjk-xtfw', resolve);
        }
    }
    , {
        path: '/sszhxt-gjcx',
        component(resolve) {
            require.async('/apps/sszhxt/gjcx/sszhxt-gjcx', resolve);
        }
    }, {
        path: '/sszhxt-jqdj',
        component(resolve) {
            require.async('/apps/sszhxt/jqdj/sszhxt-jqdj', resolve);
        }
    }, {
        name: 'sszhxt_xxcj',
        path: '/sszhxt-xxcj',
        sysName: 'sszhxt.html',
        component(resolve) {
            require.async('/apps/sszhxt/xxcj/sszhxt-xxcj', resolve);
        },
        children: [{
                path: '/sszhxt-xxcj-sfzcj',
                component(resolve) {
                    require.async('/apps/sszhxt/xxcj/sszhxt-xxcj-sfzcj', resolve);
                }
            },
            {
                path: '/sszhxt-xxcj-rlcj',
                component(resolve) {
                    require.async('/apps/sszhxt/xxcj/sszhxt-xxcj-rlcj', resolve);
                }
            },
            {
                path: '/sszhxt-xxcj-cpcj',
                component(resolve) {
                    require.async('/apps/sszhxt/xxcj/sszhxt-xxcj-cpcj', resolve);
                }
            },
        ]
    },{
        path: '/tyywglpt-ccfwgl-4gzfylxfwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-ccfwgl-4gzfylxfwgl', resolve);
        }
    }
];

export function routerserver(name) {
    applyRouteConfig(routeConfig, {
        name
    });
}