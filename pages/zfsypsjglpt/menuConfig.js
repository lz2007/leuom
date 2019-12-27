//菜单配置文件

// 执法视音频
export let list = [{
        key: 'zfsypsjglpt-sypgl-zfjlysyp',
        title: '执法记录仪视音频',
        icon: 'nav-zfsypsjglpt-mtgl',
        iconActive: 'nav-zfsypsjglpt-mtgl-active',
        lic: 'AUDIO_MENU_SYPGL',
        children: [{
            key: 'zfsypsjglpt-sypgl-zfjlysyp',
            title: '执法仪媒体',
            lic: 'AUDIO_MENU_SYPGL_ZFYSYP_JJ',
            url: '/zfsypsjglpt-sypgl-zfjlysyp'
        }, {
            key: 'zfsypsjglpt-sypgl-baqmt',
            title: '办案区媒体',
            lic: 'AUDIO_MENU_SYPGL_ZFYSYP_BAQMT',
            url: '/zfsypsjglpt-sypgl-baqmt'
        }]
    },
    {
        key: 'zfda',
        title: '执法档案',
        icon: 'nav-zfsypsjglpt-zfda',
        iconActive: 'nav-zfsypsjglpt-zfda-active',
        lic: 'AUDIO_MENU_ZFDA',
        children: [{
                key: 'zfsypsjglpt-zfda-jqgl_gongan',
                title: '警情管理',
                lic: 'AUDIO_MENU_ZFDA_JQGL',
                url: '/zfsypsjglpt-zfda-jqgl_gongan'
            },
            {
                key: 'zfsypsjglpt-zfda-ajgl_gongan',
                title: '案件管理',
                lic: 'AUDIO_MENU_ZFDA_AJGL',
                url: '/zfsypsjglpt-zfda-ajgl_gongan'
            },
            {
                key: 'zfsypsjglpt-zfda-jycx_jiaojing',
                title: '简易程序',
                lic: 'AUDIO_MENU_ZFDA_JTWF_JYCX',
                children: [],
                url: '/zfsypsjglpt-zfda-jycx_jiaojing'
            },
            {
                key: 'zfsypsjglpt-zfda-fxccf_jiaojing',
                title: '非现场处罚',
                lic: 'AUDIO_MENU_ZFDA_JTWF_FXCCL',
                children: [],
                url: '/zfsypsjglpt-zfda-fxccf_jiaojing'
            },
            {
                key: 'zfsypsjglpt-zfda-qzcs_jiaojing',
                title: '强制措施',
                lic: 'AUDIO_MENU_ZFDA_JTWF_QZCS',
                children: [],
                url: '/zfsypsjglpt-zfda-qzcs_jiaojing'
            },
            {
                key: 'zfsypsjglpt-zfda-sgcl_jiaojing',
                title: '事故处理',
                lic: 'AUDIO_MENU_ZFDA_SGCL',
                url: '/zfsypsjglpt-zfda-sgcl_jiaojing'
            }
            // {
            //     key: 'zfsypsjglpt-zfda-jtwf',
            //     title: '交通违法',
            //     lic: 'AUDIO_MENU_ZFDA_JTWF',
            //     url: '/zfsypsjglpt-zfda-jtwf'
            // }
        ]
    },
    {
        key: "zfsypsjglpt-lxhf",
        title: "录像回放",
        url: '/zfsypsjglpt-lxhf',
        lic: 'AUDIO_MENU_LXHF',
        icon: 'nav-zfsypsjglpt-lxhf',
        iconActive: 'nav-zfsypsjglpt-lxhf-active'
    },
    {
        key: "zfsypsjglpt-gjhf",
        title: "轨迹回放",
        url: '/zfsypsjglpt-gjhf',
        lic: 'AUDIO_MENU_GJCX',
        icon: 'nav-zfsypsjglpt-gjhf',
        iconActive: 'nav-zfsypsjglpt-gjhf-active'
    }, {
        key: 'zfsypsjglpt-gjcx',
        title: '告警查询',
        lic: 'AUDIO_MENU_GJGL_GJCX',
        // url: '/zfsypsjglpt-gjcx',
        icon: 'nav-zfsypsjglpt-gjcx',
        iconActive: 'nav-zfsypsjglpt-gjcx-active',
        children: [{
                key: 'zfsypsjglpt-gjcx',
                title: '设备告警',
                lic: 'AUDIO_MENU_GJGL_GJCX_SBGJ',
                url: '/zfsypsjglpt-gjcx'
            },
            {
                key: 'zfsypsjglpt-yhgj',
                title: '用户告警',
                lic: 'AUDIO_MENU_GJGL_GJCX_YHGJ',
                url: '/zfsypsjglpt-yhgj'
            },
            {
                key: 'zfsypsjglpt-ywgj',
                title: '业务告警',
                lic: 'AUDIO_MENU_GJGL_GJCX_YWGJ',
                url: '/zfsypsjglpt-ywgj'
            }
        ]     
    },
    // {
    //     key: 'jdkp',
    //     title: '监督考评',
    //     icon: 'jdkp',
    //     lic: 'AUDIO_MENU_JDKP',
    //     children: [{
    //             key: 'zfsypsjglpt-jdkp-kphczl_gongan',
    //             title: '考评抽查总览-公安',
    //             lic: 'AUDIO_MENU_JDKP_KPCCZL_GA',
    //             url: '/zfsypsjglpt-jdkp-kphczl_gongan'
    //         },
    //         {
    //             key: 'zfsypsjglpt-jdkp-jqkp_gongan',
    //             title: '警情考评',
    //             lic: 'AUDIO_MENU_JDKP_JQKP',
    //             url: '/zfsypsjglpt-jdkp-jqkp_gongan'
    //         },
    //         {
    //             key: 'zfsypsjglpt-jdkp-ajkp_gongan',
    //             title: '案件考评',
    //             lic: 'AUDIO_MENU_JDKP_AJKP',
    //             url: '/zfsypsjglpt-jdkp-ajkp_gongan'
    //         },
    //         {
    //             key: 'zfsypsjglpt-jdkp-kphczl_jiaojing',
    //             title: '考评抽查总览-交警',
    //             lic: 'AUDIO_MENU_JDKP_KPCCZL',
    //             url: '/zfsypsjglpt-jdkp-kphczl_jiaojing'
    //         },
    //         {
    //             key: 'zfsypsjglpt-jdkp-jycx_jiaojing',
    //             title: '简易程序考评',
    //             lic: 'AUDIO_MENU_JDKP_JTWFKP_JYCX',
    //             url: '/zfsypsjglpt-jdkp-jycx_jiaojing'
    //         },
    //         {
    //             key: 'zfsypsjglpt-jdkp-fxccf_jiaojing',
    //             title: '非现场处罚考评',
    //             lic: 'AUDIO_MENU_JDKP_JTWFKP_FXCCF',
    //             url: '/zfsypsjglpt-jdkp-fxccf_jiaojing'
    //         },
    //         {
    //             key: 'zfsypsjglpt-jdkp-qzcs_jiaojing',
    //             title: '强制措施',
    //             lic: 'AUDIO_MENU_JDKP_JTWFKP_QZCS',
    //             url: '/zfsypsjglpt-jdkp-qzcs_jiaojing'
    //         },
    //         {
    //             key: 'zfsypsjglpt-jdkp-sgcl_jiaojing',
    //             title: '事故处理考评',
    //             lic: 'AUDIO_MENU_JDKP_SGCLKP',
    //             url: '/zfsypsjglpt-jdkp-sgcl_jiaojing'
    //         }
    //     ]
    // },
    {
        key: 'zfsypsjglpt-znsb-rlbk',
        title: '智能识别',
        icon: 'nav-zfsypsjglpt-znsb',
        iconActive: 'nav-zfsypsjglpt-znsb-active',
        lic: 'AUDIO_MENU_ZNSB',
        children: [{
                key: 'zfsypsjglpt-znsb-rlbk',
                title: '人脸识别',
                lic: 'AUDIO_MENU_ZNSB_RLSB',
                url: '/zfsypsjglpt-znsb-rlbk'
            },
            {
                key: 'zfsypsjglpt-znsb-cpbk',
                title: '车牌识别',
                lic: 'AUDIO_MENU_ZNSB_CPSB',
                url: '/zfsypsjglpt-znsb-cpbk'
            },
            {
                key: 'zfsypsjglpt-znsb-rzhy',
                title: '人证核验',
                lic: 'AUDIO_MENU_ZNSB_RZHY',
                url: '/zfsypsjglpt-znsb-rzhy'
            }
        ]
    },
    {
        key: 'tjfx',
        title: '统计分析',
        icon: 'nav-zfsypsjglpt-sjfx',
        iconActive: 'nav-zfsypsjglpt-sjfx-active',
        lic: 'AUDIO_MENU_TJFX',
        children: [{
                key: 'zfsypsjglpt-tjfx-slqktj',
                title: '摄录情况统计',
                lic: 'AUDIO_MENU_TJFX_SLQKTJ_JJ',
                url: '/zfsypsjglpt-tjfx-slqktj'
            },
            {
                key: 'zfsypsjglpt-tjfx-glqktj_jiaojing',
                title: '关联情况统计',
                lic: 'AUDIO_MENU_TJFX_GLQKTJ_ALL',
                url: '/zfsypsjglpt-tjfx-glqktj_jiaojing'
            }
        ]
    },
    {
        key: 'zfsypsjglpt-rzgl-index',
        title: '日志管理',
        icon: 'rzgl',
        lic: 'AUDIO_MENU_RZGL',
        children: [],
        url: '/zfsypsjglpt-rzgl-index'
    }
];

// 执法档案
export let zfdaMenu = [{
        key: 'zfsypsjglpt-zfda-jtwf-jycx',
        title: '简易程序',
        lic: 'AUDIO_MENU_ZFDA_JTWF_JYCX',
        children: [],
        url: '/zfsypsjglpt-zfda-jtwf-jycxkp'
    },
    {
        key: 'zfsypsjglpt-zfda-jtwf-fxccf',
        title: '非现场处罚',
        lic: 'AUDIO_MENU_ZFDA_JTWF_FXCCL',
        children: [],
        url: '/zfsypsjglpt-zfda-jtwf-fxccf'
    },
    {
        key: 'zfsypsjglpt-zfda-jtwf-qzcs',
        title: '强制措施',
        lic: 'AUDIO_MENU_ZFDA_JTWF_QZCS',
        children: [],
        url: '/zfsypsjglpt-zfda-jtwf-qzcs'
    }
];

// 监督考评
export let jdkpMenu = [{
        key: 'zfsypsjglpt-jdkp-jycxkp',
        title: '简易程序',
        icon: 'rzgl',
        lic: 'AUDIO_FUNCTION_JDKP_JTWFKP_JYCX',
        children: [],
        url: '/zfsypsjglpt-jdkp-jycxkp'
    },
    {
        key: 'zfsypsjglpt-jdkp-fxccf_jiaojing',
        title: '非现场处罚',
        icon: 'rzgl',
        lic: 'AUDIO_FUNCTION_JDKP_JTWFKP_FXCCF',
        children: [],
        url: '/zfsypsjglpt-jdkp-fxccf_jiaojing'
    },
    {
        key: 'zfsypsjglpt-jdkp-qzcs_jiaojing',
        title: '强制措施',
        icon: 'rzgl',
        lic: 'AUDIO_FUNCTION_JDKP_JTWFKP_QZCS',
        children: [],
        url: '/zfsypsjglpt-jdkp-qzcs_jiaojing'
    }
];