/*
 * @Author: Linzhanhong
 * @Date: 2019-09-25 11:14:57
 * @LastEditors: Linzhanhong
 * @LastEditTime: 2019-09-27 17:40:02
 * @Description: Switch 开关组件
 *               在两种状态间切换时用到的开关选择器
 *               for example:
 *               ```
 *                  <ms-switch :widget="{onSwitch: @onSwitch, loading: @loading, on: '开', off: '关'}"></ms-switch>
 *               ```
 */

require('./common-switch.less');

export const name = 'ms-switch';

avalon.component(name, {
    template: __inline('./common-switch.html'),
    defaults: {
        onSwitch: avalon.noop, // 状态切换时触发事件
        loading: false, // 是否加载中
        value: false, // 开关状态 true => 开
        on: 'ON', // 开 显示开的文字或者HTML
        off: 'OFF', // 关 显示关的文字或者HTML
        disabled: false,
        currentVal: false,
        switchFn(e) {
            if(this.loading) return;
            this.value = !this.value;
            this.currentVal = this.value;
            let target = avalon(this.$element);
            if(target.hasClass('common-switch-on')) {
                this.onSwitch(this.value);
            } else {
                this.onSwitch(this.value);
            }
        },
        onInit(e) {
            this.currentVal = this.value;
        },
        onReady(e) {
            // this.$watch('loading', (v) => {
            //     if(!v) {
            //         this.value = this.currentVal;
            //     }
            // });
        },
        onDispose() {

        }
    }
});