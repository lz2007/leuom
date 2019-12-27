avalon.filters.showPrices = function (priceList) {
    let prices = '';
    if (!priceList) {
        return prices;
    }
    for (let i = 0; i < priceList.length; i++) {
        if (i !== 0) {
            prices += '，';
        }
        prices += priceList[i].discount_price + '/' + priceList[i].count_unit;
    }
    return prices;
}

avalon.filters.decodeHTML = function (str) {
    return decodeURIComponent(str);
}

avalon.filters.showPercent = function (str) {
    return '-' === $.trim(str) ? str : (Number(str) * 100).toFixed(2) + '%';
}

avalon.filters.numberShowPercent = function (str) {
    return '-' === $.trim(str) ? str : Number(str).toFixed(2) + '%';
}

avalon.filters.isNull = function (str) {
    if (str === 0)
        return 0;
    if (str)
        return str;
    else
        return '-';

};

// 秒转时分秒
avalon.filters.formatSeconds =function (value) {
    let secondTime = parseInt(value);// 秒
    let minuteTime = 0;// 分
    let hourTime = 0;// 小时
    if(secondTime > 60) {//如果秒数大于60，将秒数转换成整数
        //获取分钟，除以60取整数，得到整数分钟
        minuteTime = parseInt(secondTime / 60);
        //获取秒数，秒数取佘，得到整数秒数
        secondTime = parseInt(secondTime % 60);
        //如果分钟大于60，将分钟转换成小时
        if(minuteTime > 60) {
            //获取小时，获取分钟除以60，得到整数小时
            hourTime = parseInt(minuteTime / 60);
            //获取小时后取佘的分，获取分钟除以60取佘的分
            minuteTime = parseInt(minuteTime % 60);
        }
    }
    //秒
    let result = "";
    if(secondTime > 0) {
        if (secondTime<10){
            result = "0" + parseInt(secondTime);
        }else {
            result = "" + parseInt(secondTime);
        }
    }else{
        result = "00"
    }

    //分
    if(minuteTime > 0) {
        if (minuteTime<10){
            result = "0" + parseInt(minuteTime) + ":" + result;
        }else {
            result = "" + parseInt(minuteTime) + ":" + result;
        }
    }else{
        result ="00 :" + result;
    }
    //时
    if(hourTime > 0) {
        if (hourTime<10){
            result = "0" + parseInt(hourTime) + ":" + result;
        }else {
            result = "" + parseInt(hourTime) + ":" + result;
        }
    }else{
            result ="00 :" + result;
    }
    return result;
};