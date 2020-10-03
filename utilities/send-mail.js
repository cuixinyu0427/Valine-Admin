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

    let _template = process.env.MAIL_TEMPLATE_ADMIN || '<head><base target="_blank"/><style type="text/css"> ::-webkit-scrollbar { display: none; } </style><style id="cloudAttachStyle"type="text/css"> #divNeteaseBigAttach, #divNeteaseBigAttach_bak { display: none; } </style><style id="blockquoteStyle"type="text/css"> blockquote { display: none; } </style></head><body tabindex="0"role="listitem"><div id="content"><div style="background: white; width: 95%; max-width: 800px; margin: auto auto; border-radius: 5px; border:orange 1px solid; overflow: hidden; -webkit-box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.12); box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.18);"><header style="overflow: hidden;"><img style="width:100%;z-index: 666;"src="https://ae01.alicdn.com/kf/U5bb04af32be544c4b41206d9a42fcacfd.jpg"/></header><div style="padding: 5px 20px;"><p style="position: relative; color: white; float: left; z-index: 999; background: orange; padding: 5px 30px; margin: -25px auto 0 ; box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.30)">Master,${SITE_NAME}来新客人了！</p><br /><center><h3>来自<span style="text-decoration: none;color: orange">${NICK}</span>的留言</h3></center><br /><center style="border-bottom:#ddd 1px solid;border-left:#ddd 1px solid;padding-bottom:20px;background-color:#eee;margin:15px 0px;padding-left:20px;padding-right:20px;border-top:#ddd 1px solid;border-right:#ddd 1px solid;padding-top:20px">${COMMENT}</center> &nbsp; &nbsp; <br /><div style="text-align: center;margin-top: 40px;"><img src="https://ae01.alicdn.com/kf/U0968ee80fd5c4f05a02bdda9709b041eE.png"alt="hr"style="width:100%; margin:5px auto 5px auto; display: block;"/><a style="text-transform: uppercase; text-decoration: none; font-size: 14px; border: 2px solid #6c7575; color: #2f3333; padding: 10px; display: inline-block; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; margin: 10px auto 0;"target="_blank"href="${POST_URL}">${SITE_NAME}｜请您过目~</a></div> &nbsp; &nbsp; <p style="font-size: 12px;text-align: center;color: #999;">期待您的下次光临！<br /> © 2020 <a style="text-decoration:none; color:orange"href="${SITE_URL}">${SITE_NAME}</a></p></div></div></div><script> var _c = document.getElementById("content"); _c.innerHTML = (_c.innerHTML ||"") .replace(/(href|formAction|onclick|javascript)/gi,"__$1") .replace(/<\/?marquee>/gi,""); </script><style type="text/css"> body { font-size: 14px; font-family: arial, verdana, sans-serif; line-height: 1.666; padding: 0; margin: 0; overflow: auto; white-space: normal; word-wrap: break-word; min-height: 100px; } td, input, button, select, body { font-family: Helvetica,"Microsoft Yahei", verdana; } pre { white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word; width: 95%; } th, td { font-family: arial, verdana, sans-serif; line-height: 1.666; } img { border: 0; } header, footer, section, aside, article, nav, hgroup, figure, figcaption { display: block; } blockquote { margin-right: 0px; } </style><style id="ntes_link_color"type="text/css"> a, td a { color: #236da1; } </style></body>';
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
    let _template = process.env.MAIL_TEMPLATE || '<head><base target="_blank"/><style type="text/css"> ::-webkit-scrollbar { display: none; } </style><style id="cloudAttachStyle"type="text/css"> #divNeteaseBigAttach, #divNeteaseBigAttach_bak { display: none; } </style><style id="blockquoteStyle"type="text/css"> blockquote { display: none; } </style></head><body tabindex="0"role="listitem"><div id="content"><div style="background: white; width: 95%; max-width: 800px; margin: auto auto; border-radius: 5px; border:orange 1px solid; overflow: hidden; -webkit-box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.12); box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.18);"><header style="overflow: hidden;"><img style="width:100%;z-index: 666;"src="https://ae01.alicdn.com/kf/U5bb04af32be544c4b41206d9a42fcacfd.jpg"/></header><div style="padding: 5px 20px;"><p style="position: relative; color: white; float: left; z-index: 999; background: orange; padding: 5px 30px; margin: -25px auto 0 ; box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.30)">Dear&nbsp;${PARENT_NICK}</p><br /><center><h3>来自<span style="text-decoration: none;color: orange">${NICK}</span>的回复</h3></center><br /> &nbsp; &nbsp; <p style="border-bottom:#ddd 1px solid;border-left:#ddd 1px solid;padding-bottom:20px;background-color:#eee;margin:15px 0px;padding-left:20px;padding-right:20px;border-top:#ddd 1px solid;border-right:#ddd 1px solid;padding-top:20px">您在<a style="text-decoration: none;color: orange"target="_blank"href="${POST_URL}">${SITE_NAME}</a>上发表的评论：</p> &nbsp; &nbsp; <center>${PARENT_COMMENT}</center> &nbsp; &nbsp; <p style="border-bottom:#ddd 1px solid;border-left:#ddd 1px solid;padding-bottom:20px;background-color:#eee;margin:15px 0px;padding-left:20px;padding-right:20px;border-top:#ddd 1px solid;border-right:#ddd 1px solid;padding-top:20px">收到了来自${NICK}的回复：</p><p><center><%-text%></center></p><br /><div style="text-align: center;margin-top: 40px;"><img src="https://ae01.alicdn.com/kf/U0968ee80fd5c4f05a02bdda9709b041eE.png"alt="hr"style="width:100%; margin:5px auto 5px auto; display: block;"/><a style="text-transform: uppercase; text-decoration: none; font-size: 14px; border: 2px solid #6c7575; color: #2f3333; padding: 10px; display: inline-block; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; margin: 10px auto 0;"target="_blank"href="${POST_URL}">${SITE_NAME}｜请您签收~</a></div> &nbsp; &nbsp; <p style="font-size: 12px;text-align: center;color: #999;">自动书记人偶竭诚为您服务！<br /> © 2020 <a style="text-decoration:none; color:orange"href="${SITE_URL}">${SITE_NAME}</a></p></div></div></div><script> var _c = document.getElementById("content"); _c.innerHTML = (_c.innerHTML ||"") .replace(/(href|formAction|onclick|javascript)/gi,"__$1") .replace(/<\/?marquee>/gi,""); </script><style type="text/css"> body { font-size: 14px; font-family: arial, verdana, sans-serif; line-height: 1.666; padding: 0; margin: 0; overflow: auto; white-space: normal; word-wrap: break-word; min-height: 100px; } td, input, button, select, body { font-family: Helvetica,"Microsoft Yahei", verdana; } pre { white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word; width: 95%; } th, td { font-family: arial, verdana, sans-serif; line-height: 1.666; } img { border: 0; } header, footer, section, aside, article, nav, hgroup, figure, figcaption { display: block; } blockquote { margin-right: 0px; } </style><style id="ntes_link_color"type="text/css"> a, td a { color: #236da1; } </style></body>';
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
