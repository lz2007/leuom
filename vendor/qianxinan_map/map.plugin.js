/**
 *
 * @author      binyixian
 * @createDate 2019-7-11 09:09:12
 */
'use strict';

const mapData = require('/vendor/qianxinan_map/tsconfig').tsconfig;

(($) => {
    let defaultOptions = {
        level: {
            labels: [{
                    name: '高',
                    color: '#df522b',
                    className: 'high'
                },
                {
                    name: '中高',
                    color: '#e9a13d',
                    className: 'middle-high'
                },
                {
                    name: '中',
                    color: '#eec84a',
                    className: 'middle'
                },
                {
                    name: '中低',
                    color: '#b6d6a7',
                    className: 'middle-low'
                },
                {
                    name: '低',
                    color: '#9cd0e8',
                    className: 'low'
                }
            ],
            position: 'absolute',
            offset: {
                right: 20,
                bottom: 10
            },
            color: '#fff',
            textAlign: 'center'
        },
        filterSelector: {
            className: 'filter',
            position: 'absolute',
            width: '',
            height: '',
            backgroundColor: 'rgba(50, 50, 50, 0.7)',
            color: 'rgb(255, 255, 255)',
            offset: {
                left: 20,
                top: 20
            },
        },
        tipsFormat: '$1<br>采集工作站故障台数：$2台',
        hoverColor: '#d4b817',
        errTxt: '数据为空或数据格式有误！',
        tsconfig: {
            fileName: 'tsconfig.json',
            filePath: '/vendor/qianxinan_map/tsconfig.json',
        }
    };

    $.fn.mapTools = function (areaData = {}, maxCount, options = {}) {
        options = $.extend(defaultOptions, options);
        (!areaData || !areaData.length) && $.error(options.errTxt);

        const mapFilter = $('<div class="map-filter" style="position:' + options.filterSelector.position +
            ';display:none;border-style:solid;white-space: nowrap;z-index:9999999;transition:left 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s, top 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s;background-color:' + options.filterSelector.backgroundColor +
            ';border-width: 0;border-color:rgb(51, 51, 51);border-radius: 4px;color:' + options.filterSelector.color + ';font:14px/21px Microsoft YaHei;padding:5px;left:0;top:0;"></div>');

        //初始化
        const init = () => {
            mapLoad();
        };

        //地图加载
        const mapLoad = () => {
            $(".map-filter").remove();
            $(".map-scale").remove();

            let isSelect = false,
                svgDOM = $(this[0].contentDocument),
                offset =
                (options.level.offset.top && 'top:' + options.level.offset.top + 'px;' || '') +
                (options.level.offset.right && 'right:' + options.level.offset.right + 'px;' || '') +
                (options.level.offset.bottom && 'bottom:' + options.level.offset.bottom + 'px;' || '') +
                (options.level.offset.left && 'left:' + options.level.offset.left + 'px;' || ''),
                scaleHtml = '<div class="map-scale" style="position:' + options.level.position + ';' + offset +
                'font:14px/21px Microsoft YaHei;text-align:' + options.level.textAlign + ';color:' +
                options.level.color + ';"><p style="margin:0;">' + options.level.labels[0].name + '</p>';

            options.level.labels && $.map(options.level.labels, (val, key) => {
                scaleHtml += '<a class="' + val.className + '" title="' + val.name + '" style="background-color:' +
                    val.color + ';width:50px;height:25px;display:block;margin:3px 0;border-radius:3px;cursor:pointer;" bg-color="' + val.color + '"></a>'
            });
            scaleHtml += '<p style="margin:0;">' + options.level.labels[options.level.labels.length - 1].name + '</p></div>';
            this.after(scaleHtml, mapFilter.html(options.tipsFormat));

            $.map(mapData.features, (v, k) => {
                $.map(areaData, (i) => {
                    if (parseInt(v.properties.adcode) !== parseInt(i.code)) return true;
                    svgDOM.contents().find('svg g#layer_' + v.properties.adcode).data({
                        adcode: v.properties.adcode,
                        name: v.properties.name,
                        count: i.count
                    });

                    let average = (10 - parseInt(maxCount % 10) + maxCount) / 5;
                    let item = i.count / average;
                    // let item = parseInt(i.count / average);
                    svgDOM.contents().find('svg g#layer_' + v.properties.adcode + ' path').removeClass('low middle-low middle middle-high high opacity');
                    // switch (item) {
                    //     case 0:
                    //         svgDOM.contents().find('svg g#layer_' + v.properties.adcode + ' path').addClass('low');
                    //         break;
                    //     case 1:
                    //         svgDOM.contents().find('svg g#layer_' + v.properties.adcode + ' path').addClass('middle-low');
                    //         break;
                    //     case 2:
                    //         svgDOM.contents().find('svg g#layer_' + v.properties.adcode + ' path').addClass('middle');
                    //         break;
                    //     case 3:
                    //         svgDOM.contents().find('svg g#layer_' + v.properties.adcode + ' path').addClass('middle-high');
                    //         break;
                    //     case 4:
                    //         svgDOM.contents().find('svg g#layer_' + v.properties.adcode + ' path').addClass('high');
                    //         break;
                    // }
                    if (item >= 0 && item <= 1) {
                        svgDOM.contents().find('svg g#layer_' + v.properties.adcode + ' path').addClass('low');
                    } else if (item > 1 && item <= 2) {
                        svgDOM.contents().find('svg g#layer_' + v.properties.adcode + ' path').addClass('middle-low');
                    } else if (item > 2 && item <= 3) {
                        svgDOM.contents().find('svg g#layer_' + v.properties.adcode + ' path').addClass('middle');
                    } else if (item > 3 && item <= 4) {
                        svgDOM.contents().find('svg g#layer_' + v.properties.adcode + ' path').addClass('middle-high');
                    } else if (item > 4 && item <= 5) {
                        svgDOM.contents().find('svg g#layer_' + v.properties.adcode + ' path').addClass('high');
                    }

                });
            });

            svgDOM.on('mousemove', (e) => {
                if (!isSelect) return;
                let pageX = e.pageX,
                    pageY = e.pageY,
                    filterWidth = mapFilter.width(),
                    filterHeight = mapFilter.height(),
                    domWidth = $(document).width(),
                    domHeight = $(document).height(),
                    size = {
                        left: (pageX + filterWidth + options.filterSelector.offset.left * 2 > domWidth ? pageX - options.filterSelector.offset.left - filterWidth : pageX + options.filterSelector.offset.left),
                        top: (pageY + filterHeight + options.filterSelector.offset.top * 2 > domHeight ? pageY - filterHeight : pageY + options.filterSelector.offset.top),
                    };
                mapFilter.show().css(size);
            }).contents().find('svg g').hover((e) => {
                isSelect = true;
                let areaName = $(e.currentTarget).find('text').text(),
                    count = $(e.currentTarget).data('count'),
                    text = formatTxt(areaName, (count || (parseInt(count) !== 0 ? '-' : 0)));
                mapFilter.html(text);
            }, () => {
                mapFilter.hide();
                isSelect = false;
            });
            scaleClickHandler.apply($('.map-scale a'), [svgDOM]);
        };

        //绑定点击事件
        const scaleClickHandler = function () {
            let svgDom = arguments[0];
            this.unbind("click"); //先解除之前绑定的点击事件
            this.click(function () {
                let type = $(this).attr('class').split(' ')[0],
                    obj = svgDom.contents().find('svg path.' + type),
                    attrColor = $(this).attr('bg-color');
                $(this).toggleClass('lightgray');
                $(this).css('background-color', $(this).hasClass('lightgray') ? 'lightgray' : attrColor)
                if (!obj.length) return;
                let oldClass = obj.attr('class'),
                    newClass = ' opacity';
                svgDom.contents().find('svg path.' + type).attr('class', oldClass.indexOf('opacity') === -1 ? (oldClass + newClass) : oldClass.replace(newClass, ''));
            });
        };

        //格式化浮动框文本
        const formatTxt = function () {
            let txt = options.tipsFormat;
            $.map(arguments, (val, key) => {
                txt = txt.replace('$' + (key + 1), val);
            });
            return txt;
        };

        //执行初始化
        init();
    }
})(jQuery);