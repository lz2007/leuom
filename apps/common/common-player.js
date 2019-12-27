/**
 * 使用videojs的播放器插件
 * @prop {String}    src             播放地址
 * @prop {String}    special_id      播放器ID
 * @prop {String}    media_type      媒体类型 true 音频；false 视频
 * @prop {boolean}   play_status     webplayer true 播放  false 停止播放; h5 true 播放  false 出现封面
 * @example
 * ```
 * demo
 * <div :if="@init">
 * <ms-player :widget="{src: @play_url, special_id:'zfyps', media_type:@media_type, player_width:@web_width, player_height:@web_height, player_left:@web_left, player_top:@web_top, play_status:@play_status}"></ms-player> 
 * </div>
 * 
 * 
 * 需要注意的是：
 * 1. ms-player外壳init为true时，播放器会初始化。webplayer会出现播放器，h5的会出现国迈科技logo。
 * 2. 在自己的当前模块不需要操作webplayer的iframe，只需要把该传的宽高，位置坐标传进ms-player即可。
 * 3. 需要播放时，请置play_status为true
 * 4. 切换播放时(点击其他数据，切换播放时)，请先置play_status为false，设置url，再置play_status为true
 * 5. ms-player在ondispose时会暂停播放当前的视频，切记在页面上如果看不到ms-player这个组件的时候，请将外壳自定义的init置为false，不然无法执行暂停操作。
 * 
 * 可参考 zfsypsjglpt-yspk-zfyps-detail 模块
 * 
 * @author lichunsheng
 * 创建时间：2018-3-21 16:01:01
 * ```
 */
import {
    playerConfig
} from '/services/configService';
// import {
//     notification
// } from "ane";
// require("/apps/common/common-player.css");

var vm, myPlayer, childFrameObj;
avalon.component("ms-player-old", {
    template: __inline("./common-player.html"),
    defaults: {
        src: avalon.noop,
        special_id: avalon.noop,
        media_type: avalon.noop,
        player_width: avalon.noop,
        player_height: avalon.noop,
        player_left: avalon.noop,
        player_top: avalon.noop,
        play_status: avalon.noop,
        show_player: playerConfig, //-----config配置，true webplayer；false h5

        onInit: function (event) {
            vm = event.vmodel;
            var _this = this;

            if (playerConfig) {
                $("#gm_webplayer").css({
                    "left": _this.player_left + "px",
                    "top": _this.player_top + "px"
                });

                $("#gm_webplayer").width(_this.player_width);
                $("#gm_webplayer").height(_this.player_height);
                $("#gm_webplayer").show();
                document.getElementById('gm_webplayer').contentWindow.web_resize(_this.player_width, _this.player_height);
            }

            this.$watch("play_status", (v) => {
                if (playerConfig) {
                    if (v)
                        document.getElementById('gm_webplayer').contentWindow.play(_this.src);
                    else
                        document.getElementById('gm_webplayer').contentWindow.stop();
                }
            });
            this.$fire('play_status', this.play_status);

            this.$watch("player_width", (v) => {
                if (playerConfig) {
                    document.getElementById('gm_webplayer').contentWindow.web_resize(v, _this.player_height);
                }
            });
            this.$fire('player_width', this.player_width);

            this.$watch("player_left", (v) => {
                if (playerConfig) {
                    $("#gm_webplayer").css({
                        "left": _this.player_left + "px"
                    });
                }
            });
            this.$fire('player_left', this.player_left);

            this.$watch("player_top", (v) => {
                if (playerConfig) {
                    $("#gm_webplayer").css({
                        "top": _this.player_top + "px"
                    });
                }
            });
            this.$fire('player_top', this.player_top);
        },
        onReady: function (event) {
            var _this = this;

            $(window).resize(function () {
                if (playerConfig && document.getElementById('gm_webplayer').style.display != "none") {
                    $("#gm_webplayer").width(_this.player_width);
                    $("#gm_webplayer").height(_this.player_height);
                    document.getElementById('gm_webplayer').contentWindow.web_resize(_this.player_width, _this.player_height);
                }
            });
        },
        onDispose: function (event) {
            if (playerConfig && document.getElementById('gm_webplayer').style.display != "none") {
                document.getElementById('gm_webplayer').contentWindow.stop();
                $("#gm_webplayer").hide();
            }
            this.play_status = false;
        }
    }
});