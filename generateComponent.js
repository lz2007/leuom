/*
 * @Author: linzhanhong 
 * @Date: 2019-01-30 10:31:58 
 * @Last Modified by: linzhanhong
 * @Last Modified time: 2019-01-30 16:23:05
 */

// generateComponent.js`
// 执行 npm run new:comp 命令自动生成 avalon 模块组件
// 执行出错请检查node、npm版本

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
// 解决node低版本不支持async、await问题 (npm install --save-dev asyncawait)
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const resolve = (...file) => path.resolve(__dirname, ...file);
const log = message => console.log(chalk.green(`${message}`));
const successLog = message => console.log(chalk.blue(`${message}`));
const errorLog = error => console.log(chalk.red(`${error}`));
const {
    AvalonHtmlTemplate,
    AvalonJsTemplate,
    AvalonLessTemplate,
} = require('./generateTemplate');

const generateFile = (path, data) => {
    if (fs.existsSync(path)) {
        errorLog(`${path}文件已存在`);
        return;
    }
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, 'utf8', err => {
            if (err) {
                errorLog(err.message);
                reject(err);
            } else {
                successLog(`生成 ${path}`);
                resolve(true);
            }
        });
    });
};
log(`==> 请输入在apps/**/**目录下要生成的组件路径（不带后缀名），如在apps/sszhxt/下生成 my-comp 组件，应输入：sszhxt/my-comp
==> 如需生成pages下组件，请输入 ../pages/**/文件名（不带后缀名）`);
console.log(chalk.black.bgGreen(`请输入：`));
let componentName = '';
process.stdin.on('data', async (chunk => {
    // 输入路径
    const inputName = String(chunk).trim().toString();
    // 文件路径（不用后缀）
    const componentPath = resolve('./apps', inputName);
    let pathPiece = inputName.split('/');
    // 生成文件父级目录
    let pathDir = pathPiece.slice(0, pathPiece.length - 1).join('/')
    const componentDirectory = resolve('./apps', pathDir);

    const hasComponentDirectory = fs.existsSync(componentDirectory);
    if (!hasComponentDirectory) {
        log(`==> 正在新建组件所在目录 ${componentDirectory}`);
        dotExistDirectoryCreate(componentDirectory);
    }

    try {
        if (inputName.includes('/')) {
            const inputArr = inputName.split('/');
            componentName = inputArr[inputArr.length - 1];
        } else {
            componentName = inputName;
        }
        log(`==> 正在生成文件...`);
        // 生成html/js/less文件
        await (generateFile(`${componentPath}.html`, AvalonHtmlTemplate(componentName)));
        await (generateFile(`${componentPath}.js`, AvalonJsTemplate(componentName)));
        await (generateFile(`${componentPath}.less`, AvalonLessTemplate(componentName)));
        successLog(`==> 生成组件成功!`);
    } catch (e) {
        errorLog(e.message);
    }

    process.stdin.emit('end');
}));
process.stdin.on('end', () => {
    log('exit');
    process.exit();
});

function dotExistDirectoryCreate(directory) {
    return new Promise((resolve) => {
        mkdirs(directory, function () {
            resolve(true);
        });
    });
}

// 递归创建目录
function mkdirs(directory, callback) {
    var exists = fs.existsSync(directory);
    if (exists) {
        callback();
    } else {
        mkdirs(path.dirname(directory), function () {
            fs.mkdirSync(directory);
            callback();
        });
    }
}