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

    let _template = process.env.MAIL_TEMPLATE_ADMIN || '<head><link rel="stylesheet"href="https://cdn.jsdelivr.net/gh/Akilarlxh/Valine-Admin/source/css/mail.css"></head><body><div id="wrap"><h1 id="title1">Master,${SITE_NAME}来新客人了！</h1><br><div id="form-wrap"><form><div id="content"><div id="letter"><header style="overflow: hidden;"><img style="width:100%;z-index: 666;"src="https://ae01.alicdn.com/kf/U5bb04af32be544c4b41206d9a42fcacfd.jpg"/></header><div style="padding: 5px 20px;"><br><center><h3 id="title3">来自${NICK}的留言:</h3></center></center><br><br><center id="comment">${PARENT_COMMENT}</center><br><div style="text-align: center;margin-top: 40px;"><img src="https://ae01.alicdn.com/kf/U0968ee80fd5c4f05a02bdda9709b041eE.png"alt="hr"style="width:100%; margin:5px auto 5px auto; display: block;"/><a id="sitelink"target="_blank"href="${POST_URL}">${SITE_NAME}｜请您过目~</a></div><p style="font-size: 12px;text-align: center;color: #999;">自动书记人偶竭诚为您服务！<br> © 2020 <a style="text-decoration:none; color:rgb(246, 214, 175)"href="${SITE_URL}">${SITE_NAME}</a></p></div></div></div></form></div></div></body>';
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
    let _template = process.env.MAIL_TEMPLATE || '<head><link rel="stylesheet"href="https://cdn.jsdelivr.net/gh/Akilarlxh/Valine-Admin/source/css/mail.css"></head><body><div id="wrap"><h1 id="title1">${PARENT_NICK}&nbsp;敬启</h1><br><div id="form-wrap"><form><div id="content"><div id="letter"><header style="overflow: hidden;"><img style="width:100%;z-index: 666;"src="https://ae01.alicdn.com/kf/U5bb04af32be544c4b41206d9a42fcacfd.jpg"/></header><div style="padding: 5px 20px;"><br><center><h3 id="title3">${PARENT_NICK}，见信安：</h3></center></center><br><p style="display: inline-block;">您在<a style="text-decoration: none;color: rgb(246, 214, 175)"target="_blank"href="${POST_URL} display: inline-block;">${SITE_NAME}</a>上发表的评论:</p><center id="comment">${PARENT_COMMENT}</center><p>收到了来自${NICK}的回复：</p><center id="comment">${COMMENT}</center><br><div style="text-align: center;margin-top: 40px;"><img src="https://ae01.alicdn.com/kf/U0968ee80fd5c4f05a02bdda9709b041eE.png"alt="hr"style="width:100%; margin:5px auto 5px auto; display: block;"/><a id="sitelink"target="_blank"href="${POST_URL}">${SITE_NAME}｜请您签收~</a></div><p style="font-size: 12px;text-align: center;color: #999;">自动书记人偶竭诚为您服务！<br> © 2020 <a style="text-decoration:none; color:rgb(246, 214, 175)"href="${SITE_URL}">${SITE_NAME}</a></p></div></div></div></form></div></div></body>';
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
