let language_txt = require('/vendor/language').language;

class RenderMapPopupHtml {
    constructor(data, recordOrlockDevice){
        this.data = data;
        this.recordOrlockDevice = recordOrlockDevice;
        this.gbcode = '';

        this.setChannelItem();

        this.htmlContent = `
            <div class="infowindowcontainer" style="font-size: 16px;color:#fff;word-break: break-all;">
                ${this.isLocalDomainDevice ? 
                `<p>设备名称: <span style="margin-left:18px;">${this.deviceName}</span></p>
                <p class="deviceID">国标编号: <span style="margin-left:18px;">${this.data.gbcode}</span></p>

                <p style="position: relative;">
                    剩余电量: 
                    <span style="display:inline-block;width: 42px;height: 20px;background:url(/static/image/theme/sszhxt/mapIcon/battery.png) no-repeat scroll;vertical-align: middle;margin-left: 18px;position: relative;"></span>
                    <span style="width:${this.batteryWidth}px;height: 18px;background: ${this.batteryBgColor};position:relative;left: -47px;vertical-align:top;top:4px;border-radius: 4px;display: inline-block;"></span>
                    <span style="position:absolute;left: 146px;top:1px;z-index: 1;">${this.battery}%</span>
                    ${this.lowBatteryTipsHtml}
                </p>
                <p style="white-space: nowrap;margin: 0;">
                    存储容量: 
                    <span style="display: inline-block;width: 310px;height: 20px;background: #203b6d;font-size: 12px;margin-left: 18px;">
                        <span style="display:inline-block;height: 20px;vertical-align:top;background:#a7ddff;width:${this.capacity.spanwidth}px"></span>
                        <span style="color:#ffffff;position: absolute;left: ${this.capacity.spanTwowidth}px;vertical-align: top;"></span>
                    </span>
                </p>
                <p style="display: inline-block; margin-left: 94px;">总容量：${this.capacity.capacityTotal}GB</p>
                <p style="display: inline-block;margin-left: 20px;">剩余容量：${this.capacity.capacityUsed}GB</p>
                ${this.isAllowRecord ? 
                `<p>
                    录像开关: 
                    <span style="margin-left:18px;">
                        <button id="onspan" ${this.locked ? disabled="disabled" : ''} class="btn" onclick="record('${this.data.gbcode}')" style="${this.recordSwitchColor.onColor}padding: 0px 5px;border-radius: 0;margin-right: -6px;">ON</button>
                        <button ${this.locked ? disabled="disabled" : ''} class="btn" onclick="record('${this.data.gbcode}')" id="offspan" style="${this.recordSwitchColor.offColor}padding: 0px 5px;border-radius: 0;">OFF</button>
                    </span>
                </p>` : ''}` : 
                `<p>${getLan().mapDialogRowDeviceName}：<span style="margin-left:18px;">${this.data.name}</span></p>
                <p>${getLan().mapDialogRowDeviceType}：<span style="margin-left:18px;">${this.data.type}</span></p>
                <p>${getLan().mapDialogRowDeviceModel}：<span style="margin-left:18px;">${this.data.model}</span></p>`}
                
                <div style="margin-top: 20px;margin-bottom: 5px;display: flex;flex-direction: row;flex-wrap: wrap;justify-content: space-between;">
                    ${this.isAllowVideo ? 
                    `<button id="videobutton" ${this.locked ? disabled="disabled" : ''} class="btn btn-primary  btn-sm" style="margin-bottom: 10px;background: #ffffff;border-radius: 0;border-color: #fff;width: 120px;height: 40px;color: #1055b3;font-size: 16px;" onclick="playVideo(${this.videoPostParams});">视频呼叫</button>` : ''}
                    
                    ${this.notHaveSource && this.isAllowSpeak ? 
                    `<button ${this.locked ? disabled="disabled" : ''} class="btn btn-primary  btn-sm" style=" margin-bottom: 10px;background: #ffffff;border-radius: 0;border-color: #fff;width: 120px;height: 40px;color: #1055b3;font-size: 16px;" onclick="startTalk(${this.talkPostParams});">语音呼叫</button>` : ''}
                    
                    ${this.notHaveSource && this.isAllowPhotograph ? 
                    `<button ${this.locked ? disabled="disabled" : ''} id="photobutton" class="btn btn-primary  btn-sm" style="margin-bottom: 10px;background: #ffffff;border-radius: 0;border-color: #fff;width: 120px;height: 40px;color: #1055b3;font-size: 16px;" onclick="photograph('${this.data.gbcode}');">${getLan().Photograph}</button>` : ''}

                    ${this.notHaveSource && this.isAllowLock ? 
                    `<button id="lockbutton" class="btn btn-primary  btn-sm" style="margin-bottom: 10px;background: #ffffff;border-radius: 0;border-color: #fff;width: 120px;height: 40px;color: #1055b3;font-size: 16px;" onclick="lock('${this.data.gbcode}');">${this.lockWord}</button>` : ''}
                </div>
            </div>
        `;
    }
    
    setChannelItem() {
        if (!this.isLocalDomainDevice && this.data.mytype == 0) {
            this.data.type = '执法仪记录仪';
            this.data.name = data.deviceName;
        }
    }
    // 设备名称
    get deviceName() {
        let data = this.data;
        return (!data.userName || !data.userCode) ? (data.userName + '(' + data.userCode + ')') : (data.deviceName);
    }
    // 电量
    get battery() {
        return Number(this.data.battery);
    }
    // 计算电量相对长度
    get batteryWidth() {
        return Number(this.battery) / 100 * 38;
    }
    // 电量不足
    get lowBatteryTipsHtml() {
        return Number(this.battery) <=10 ? `<span style="margin-left: 50px;color: #d72222;">电量不足</span>` : '';
    }
    // 设置电量条背景色
    get batteryBgColor() {
        let color = '';
        if(Number(this.battery) <= 25) {
            color = '#d72222';
        } else if(Number(this.battery) <= 45) {
            color = 'orange';
        } else {
            color = '#30ff00';
        }
        return color;
    }
    // 存储容量
    get capacity() {
        let capacityUsed = this.data.capacityUsed; //使用容量
        let capacityTotal = this.data.capacityTotal;
        let spanwidth, spanTwowidth;
        spanwidth = capacityTotal ? capacityUsed / capacityTotal * 310 : 0;
        spanTwowidth = spanwidth ? spanwidth / 4 + 80 : 80;
        return {
            spanwidth,
            spanTwowidth,
            capacityUsed,
            capacityTotal
        };
    }
    // 本域执法仪
    get isLocalDomainDevice() {
        return this.data.mytype == 0 && !this.data.source;
    }
    // 是否锁定
    get locked() {
        return this.data.locked;
    }
    // 是否允许视频呼叫
    get isAllowVideo() {
        return !this.data.isRealTimeView && this.data.isAllowVideo;
    }
    // 是否允许语音对剑
    get isAllowSpeak() {
        return this.data.isAllowSpeak;
    }
    // 是否允许录像
    get isAllowRecord() {
        return this.data.isAllowRecord;
    }
    // 是否允许拍照
    get isAllowPhotograph() {
        return this.data.isAllowPhotograph;
    }
    // 是否允许锁定
    get isAllowLock() {
        return this.data.isAllowLock;
    }
    get notHaveSource() {
        return !this.data.source;
    }
    // 锁定按钮文字
    get lockWord() {
        var word = '';
        if (this.locked) {
            word = getLan().remoteUnlock;
        } else {
            word = getLan().remoteLock;
        }
        return word;
    }
    // 设置开关颜色
    get recordSwitchColor() {
        let onColor, offColor;
        let color_1 = `background: #cccccc;color: #999999;`,
            color_2 = `background: #30ff00;color: #ffffff;`;
        this.recordOrlockDevice
        && !this.recordOrlockDevice.record
        || data.vedioStatus ?
        (onColor = color_1, offColor = color_2) :
        (onColor = color_2, offColor = color_1);
        return {
            onColor,
            offColor
        };
    }
    // 视频呼叫传参
    get videoPostParams() {
        let params = '';
        let count = 0; //用于判断按钮放在那个div用的，暂时没用到
        let myData = JSON.stringify(this.data).replace(/"/g, '&quot;');
        if(this.isAllowVideo) {
            count++;
            //执法仪 mytype == 0  else 多通道
            params = `'${this.data.gbcode}', '${this.data.userName}', '${this.data.userCode}', '${this.data.signal}', '${this.data.mytype == 0 ? '': this.data.name}', '${this.data.mytype}', '${myData}'`;
        }
        return params;
    }
    // 语音呼叫传参
    get talkPostParams() {
        return `'${this.data.gbcode}', '${this.data.userName}', '${this.data.userCode}', '${this.data.signal}', '${this.data.isRealTimeView}', '${this.data.mytype}'`;
    }
    // 生成的html
    get html() {
        console.log(Object.getOwnPropertyNames(this));
        for(let i in this) {
            console.log(this[i]);
        }
        return this.htmlContent;
    }
    get titleHtml() {
        return `<p style="font-size: 16px;padding-left: 30px;font-weight: bold;">${getLan().mapDeviceInfo}</p>`;
    }
}

function getLan() {
    return language_txt.sszhxt.map;
}

export { RenderMapPopupHtml };