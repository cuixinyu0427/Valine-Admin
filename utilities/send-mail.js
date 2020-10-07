'use strict';
const nodemailer = require('nodemailer');

let config = {
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
}

if (process.env.SMTP_SERVICE != null) {
    config.service = process.env.SMTP_SERVICE;
} else {
    config.host = process.env.SMTP_HOST;
    config.port = parseInt(process.env.SMTP_PORT);
    config.secure = process.env.SMTP_SECURE === "false" ? false : true;
}

const transporter = nodemailer.createTransport(config);

transporter.verify(function(error, success) {
    if (error) {
        console.log('SMTP邮箱配置异常：', error);
    }
    if (success) {
        console.log("SMTP邮箱配置正常！");
    }
});

exports.notice = (comment) => {
    let SITE_NAME = process.env.SITE_NAME;
    let NICK = comment.get('nick');
    let COMMENT = comment.get('comment');
    let POST_URL = process.env.SITE_URL + comment.get('url') + '#' + comment.get('objectId');
    let SITE_URL = process.env.SITE_URL;

    let _template = process.env.MAIL_TEMPLATE_ADMIN || '<head><base target="_blank"/><style type="text/css"> ::-webkit-scrollbar { display: none; } </style><style id="from-wrapstyle"type="text/css"> #form-wrap { overflow: hidden; height: 447px; position: relative; top: 0px; transition: all 1s ease-in-out .3s; z-index: 0; } </style><style id="from-wraphoverstyle"type="text/css"> #form-wrap:hover { height: 2000px; top: -200px; } </style></head><body><div style="width: 530px;margin: 20px auto 0;height: 1000px;"><h1 style="color: white;z-index: 100;background: rgb(246, 214, 175);padding: 5px 30px;margin: -25px auto 0;box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.30);">Master,${SITE_NAME}来新客人了！</h1><br><div id="form-wrap"><img src="https://cdn.jsdelivr.net/gh/Akilarlxh/Valine-Admin@v1.0/source/img/before.png"alt="before"style="position: absolute;bottom: 126px;left: 0px;background-repeat: no-repeat;width: 530px;height: 317px;z-index:-100"><div style="position: relative;overflow: visible;height: 1500px;width: 500px;margin: 0px auto;transition: all 1s ease-in-out .3s;padding-top:200px;"><form><div style="background: white;width: 95%;max-width: 800px;margin: auto auto;border-radius: 5px;border: 1px solid;overflow: hidden;-webkit-box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.12);box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.18);"><img style="width:100%;overflow: hidden;"src="https://ae01.alicdn.com/kf/U5bb04af32be544c4b41206d9a42fcacfd.jpg"/><div style="padding: 5px 20px;"><br><center><h3 style="text-decoration: none; color: rgb(246, 214, 175);">来自${NICK}的留言:</h3></center><br><br><center style="border-bottom: #ddd 1px solid;border-left: #ddd 1px solid;padding-bottom: 20px;background-color: #eee;margin: 15px 0px;padding-left: 20px;padding-right: 20px;border-top: #ddd 1px solid;border-right: #ddd 1px solid;padding-top: 20px;font-family:"Arial","Microsoft YaHei","黑体","宋体", sans-serif;">${COMMENT}</center><div style="text-align: center;margin-top: 40px;"><img src="https://ae01.alicdn.com/kf/U0968ee80fd5c4f05a02bdda9709b041eE.png"alt="hr"style="width:100%; margin:5px auto 5px auto; display: block;"/><a style="text-transform: uppercase;text-decoration: none;font-size: 14px;border: 2px solid #6c7575;color: #2f3333;padding: 10px;display: inline-block;margin: 10px auto 0;background-color: rgb(246, 214, 175);"target="_blank"href="${POST_URL}">${SITE_NAME}｜请您过目~</a></div><p style="font-size: 12px;text-align: center;color: #999;">自动书记人偶竭诚为您服务！<br> © 2020 <a style="text-decoration:none; color:rgb(246, 214, 175)"href="${SITE_URL}">${SITE_NAME}</a></p></div></div></form></div><img src="https://cdn.jsdelivr.net/gh/Akilarlxh/Valine-Admin@v1.0/source/img/after.png"alt="after"style="position: absolute;bottom: -2px;left: 0;background-repeat: no-repeat;width: 530px;height: 259px;z-index:100"></div></div></body>';
    let _subject = process.env.MAIL_SUBJECT_ADMIN || 'Master，${SITE_NAME}来新客人了！';
    let emailSubject = eval('`' + _subject + '`');
    let emailContent = eval('`' + _template + '`');

    let mailOptions = {
        from: '"' + process.env.SENDER_NAME + '" <' + process.env.SENDER_EMAIL + '>',
        to: process.env.BLOGGER_EMAIL || process.env.SENDER_EMAIL,
        subject: emailSubject,
        html: emailContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('博主通知邮件成功发送: %s', info.response);
        comment.set('isNotified', true);
        comment.save();
    });
}

exports.send = (currentComment, parentComment)=> {
    let PARENT_NICK = parentComment.get('nick');
    let SITE_NAME = process.env.SITE_NAME;
    let NICK = currentComment.get('nick');
    let COMMENT = currentComment.get('comment');
    let PARENT_COMMENT = parentComment.get('comment');
    let POST_URL = process.env.SITE_URL + currentComment.get('url') + '#' + currentComment.get('objectId');
    let SITE_URL = process.env.SITE_URL;

    let _subject = process.env.MAIL_SUBJECT || '${PARENT_NICK}，您在『${SITE_NAME}』上的评论收到了回复';
    let _template = process.env.MAIL_TEMPLATE || '<head><base target="_blank"/><style type="text/css"> ::-webkit-scrollbar { display: none; } </style><style id="from-wrapstyle"type="text/css"> #form-wrap { overflow: hidden; height: 447px; position: relative; top: 0px; transition: all 1s ease-in-out .3s; z-index:0; } </style><style id="from-wraphoverstyle"type="text/css"> #form-wrap:hover { height: 2000px; top: -200px; } </style></head><body><div style="width: 530px;margin: 20px auto 0;height: 1000px;"><h1 style="color: white;z-index: 100;background: rgb(246, 214, 175);padding: 5px 30px;margin: -25px auto 0;box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.30);">${PARENT_NICK}&nbsp;敬启</h1><br><div id="form-wrap"><img src="https://cdn.jsdelivr.net/gh/Akilarlxh/Valine-Admin@v1.0/source/img/before.png"alt="before"style="position: absolute;bottom: 126px;left: 0px;background-repeat: no-repeat;width: 530px;height: 317px;z-index:-100"><div style="position: relative;overflow: visible;height: 1500px;width: 500px;margin: 0px auto;transition: all 1s ease-in-out .3s;padding-top:200px;"<form><div style="background: white;width: 95%;max-width: 800px;margin: auto auto;border-radius: 5px;border: 1px solid;overflow: hidden;-webkit-box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.12);box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.18);"><img style="width:100%;overflow: hidden;"src="https://ae01.alicdn.com/kf/U5bb04af32be544c4b41206d9a42fcacfd.jpg"/><div style="padding: 5px 20px;"><br><center><h3 style="text-decoration: none; color: rgb(246, 214, 175);">${PARENT_NICK}，见信安：</h3></center><br><p style="display: inline-block;">您在<a style="text-decoration: none;color: rgb(246, 214, 175)"target="_blank"href="${POST_URL} display: inline-block;">${SITE_NAME}</a>上发表的评论:</p><center style="border-bottom: #ddd 1px solid;border-left: #ddd 1px solid;padding-bottom: 20px;background-color: #eee;margin: 15px 0px;padding-left: 20px;padding-right: 20px;border-top: #ddd 1px solid;border-right: #ddd 1px solid;padding-top: 20px;font-family:"Arial","Microsoft YaHei","黑体","宋体", sans-serif;">${PARENT_COMMENT}</center><p>收到了来自${NICK}的回复：</p><center style="border-bottom: #ddd 1px solid;border-left: #ddd 1px solid;padding-bottom: 20px;background-color: #eee;margin: 15px 0px;padding-left: 20px;padding-right: 20px;border-top: #ddd 1px solid;border-right: #ddd 1px solid;padding-top: 20px;font-family:"Arial","Microsoft YaHei","黑体","宋体", sans-serif;">${COMMENT}</center><br><div style="text-align: center;margin-top: 40px;"><img src="https://ae01.alicdn.com/kf/U0968ee80fd5c4f05a02bdda9709b041eE.png"alt="hr"style="width:100%; margin:5px auto 5px auto; display: block;"/><a style="text-transform: uppercase;text-decoration: none;font-size: 14px;border: 2px solid #6c7575;color: #2f3333;padding: 10px;display: inline-block;margin: 10px auto 0;background-color: rgb(246, 214, 175);"target="_blank"href="${POST_URL}">${SITE_NAME}｜请您签收~</a></div><p style="font-size: 12px;text-align: center;color: #999;">自动书记人偶竭诚为您服务！<br> © 2020 <a style="text-decoration:none; color:rgb(246, 214, 175)"href="${SITE_URL}">${SITE_NAME}</a></p></div></div></form></div><img src="https://cdn.jsdelivr.net/gh/Akilarlxh/Valine-Admin@v1.0/source/img/after.png"alt="after"style="position: absolute;bottom: -2px;left: 0;background-repeat: no-repeat;width: 530px;height: 259px;z-index:100"></div></div></body>';
    let emailSubject = eval('`' + _subject + '`');
    let emailContent = eval('`' + _template + '`');

    let mailOptions = {
        from: '"' + process.env.SENDER_NAME + '" <' + process.env.SENDER_EMAIL + '>', // sender address
        to: parentComment.get('mail'),
        subject: emailSubject,
        html: emailContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('AT通知邮件成功发送: %s', info.response);
        currentComment.set('isNotified', true);
        currentComment.save();
    });
};
