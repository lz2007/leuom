/**
 * 使用ms-time-datepicker的日期插件。传参为时间戳形式，显示格式为"YYYY-MM-DD"
 * @prop {string}     currentSelect        0--本周，1--本月，2--自定义时间，3--近三天    
 * @prop {function}   timeCallback     回调函数，回调(startTime, endTime)
 * @prop {object}     initTime         在使用缓存机制时，当选择的时间为自定义时间，可以利用initTime选择开始时间和结束时间。对象例子---{startTime: 1561910400000,endTime: 1562515199000}
 * @example
 * ```
 * demo
 * <ms-time-datepicker :widget="{currentSelect: @currentSelect, setCallback: @setCallback, initTime:@initTime}"></ms-time-datepicker>
 * 
 * 
 * 
 * 可参考 zfsypsjglpt-sypgl-baqmt 模块
 * 
 * @author lichunsheng
 * 创建时间：2019-7-15 15:00:00
 * ```
 */

import moment from 'moment';
require('/apps/common/common-datepicker.less');

avalon.component('ms-time-datepicker', {
    template: __inline('./common-datepicker.html'),
    defaults: {
        timeSelectOptions: [
            {
                value: "0",
                label: "本周"
            },
            {
                value: "1",
                label: "本月"
            },
            {
                value: "2",
                label: "自定义时间"
            }
        ],
        timeSelect: [],
        onchangeTime(e) {
            this.timeSelect = [e.target.value.toString()];

            let startTime, endTime;
            startTime = getSelectStartTime(e.target.value);
            endTime = getSelectEndTime(e.target.value);

            if (e.target.value == "2") {
                if (this.initTime && $.isEmptyObject(this.initTime)) {} else {
                    startTime = moment(parseInt(this.initTime.startTime)).format('YYYY-MM-DD');
                    endTime = moment(parseInt(this.initTime.endTime)).format('YYYY-MM-DD');
                    this.initTime = {};
                }
                this.timeSelectBox = true;
            } else {
                this.timeSelectBox = false;
            }
            this.setCallback(startTime, endTime);
        },

        endDate: moment().format('YYYY-MM-DD'),
        timeSelectBox: false,
        currentSelect: "3", //0--本周，1--本月，2--自定义时间，3--近三天    
        timeCallback: avalon.noop,
        setCallback(startTime, endTime) {
            this.startTime = startTime;
            this.endTime = endTime;
            let a = parseInt(moment(startTime + " 00:00:00").format('x'));
            let b = parseInt(moment(endTime + " 23:59:59").format('x'));
            this.timeCallback(this.timeSelect[0], a, b);
        },
        initTime: avalon.noop,

        startTimeChange(e) {
            this.startTime = e.target.value;
            this.setCallback(this.startTime, this.endTime);
        },
        startTime: moment().subtract(3, 'month').format('YYYY-MM-DD'),

        endTimeChange(e) {
            this.endTime = e.target.value;
            this.setCallback(this.startTime, this.endTime);
        },
        endTime: moment().format('YYYY-MM-DD'),

        onInit: function (event) {
            this.$watch("currentSelect", (v) => {
                let obj = {
                    target: {
                        value: this.currentSelect
                    }
                };
                this.onchangeTime(obj);
            });
            this.$fire('currentSelect', this.currentSelect);
        },
        onReady: function (event) {},
        onDispose: function (event) {}
    }
});

function getSelectStartTime(item) {
    let time = "";
    switch (item) {
        case "0":
            if (moment().format('d') == "0") {
                time = moment().day(-6).format('YYYY-MM-DD');
            } else {
                time = moment().day(1).format('YYYY-MM-DD');
            }
            break;
        case "1":
            time = moment().startOf('month').format('YYYY-MM-DD');
            break;
        case "2":
            time = moment().subtract(3, 'month').format('YYYY-MM-DD');
            break;
        default:
            time = moment().subtract(2, 'day').format('YYYY-MM-DD');
            break;
    }
    return time;
}

function getSelectEndTime(item) {
    let time = "";
    switch (item) {
        case "0":
            if (moment().format('d') == "0") {
                time = moment().day(0).format('YYYY-MM-DD');
            } else {
                time = moment().day(7).format('YYYY-MM-DD');
            }
            break;
        case "1":
            time = moment().endOf('month').format('YYYY-MM-DD');
            break;
        case "2":
            time = moment().format('YYYY-MM-DD');
            break;
        default:
            time = moment().format('YYYY-MM-DD');
            break;
    }
    return time;
}

function getSelectStartTimeStamp(item) {
    let time = getSelectStartTime(item) + " 00:00:00";
    return parseInt(moment(time).format("x"));
}

function getSelectEndTimeStamp(item) {
    let time = getSelectEndTime(item) + " 23:59:59";
    return parseInt(moment(time).format("x"));
}

export {
    getSelectStartTimeStamp,
    getSelectEndTimeStamp,
}