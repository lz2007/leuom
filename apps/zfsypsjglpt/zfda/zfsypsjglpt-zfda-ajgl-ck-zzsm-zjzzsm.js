
import {
    Gm
} from '/apps/common/common-tools.js';
require('/apps/common/common-datepick');
export const name = "zfsypsjglpt-zfda-ajgl-ck-zzsm-zjzzsm";
function Tools() {};
Tools.prototype = Object.create(new Gm().tool);
let Gm_tool = new Tools();
function Format() {};
Format.prototype = Object.create(new Gm().format);
let Gm_format = new Format();
let zfyps_vm = avalon.component(name, {
    template: __inline("./zfsypsjglpt-zfda-ajgl-ck-zzsm-zjzzsm.html"),
    defaults: {
        input_blur(e) {
           $(e.target).text(e.target.value);
        },
        css: {
            width: '100%',
            height: '100%',
        },
        ly: {
            value: '',
        },
        nr: {
            value: '',
        },
        spsx: {
            value: '',
        },
        cyrqk: {
            value: '',
        },
        dqdd: {
           value: '',    
        },
        fzjs: {
            value: '',
        },
        zltz: {
            value: '',
        },
        zzff: {
            value: '',
        },
        bz: {
            value: ''
        },
        date: {
            name: '调取时间',
            id: 'dqsj',
            timeChange(e) {
                this.value = e;
            },
            placeHolder: '请选择调取时间',
            value: '',
            time: '',
            showTime: false,
            endDate: '',
        },
        propArr: ['ly', 'nr', 'zltz', 'zzff', 'bz', 'spsx', 'cyrqk', 'dqdd', 'fzjs', 'date'],
        onInit() {
            let data = Gm_tool.getStorage('zjzzsm');
            if (data) {
                Object.keys(data).forEach((val, key) => {
                    if (val == 'date') {
                        this[val].time = Gm_format.formatDate(data[val], true);
                    } else {
                        this[val].value = data[val];
                    }
                })
            }
        },
        onReady() {
           
        },
        onDispose(){
            let data = {},
                that = this;
            that.propArr.forEach((val, key) => {
                data[val] = that[val].value;
            });
            Gm_tool.setStorage('zjzzsm', data, 0.5, function () { 
                console.log(data) 
            }) ;
        }
    }
});

