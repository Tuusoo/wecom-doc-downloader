# 操作步骤
*仅适用于企业微信官网的“服务端API”，“客户端API”文档的抓取，其他的我没操作过*
*主要功能是用于抓取企微文档内容以离线查阅*  

1.修改index.js文件中的**START_URL**，改为文档的地址，例如：
```
https://developer.work.weixin.qq.com/document/path/90664
```
2.运行
```
node index.js
```
3.大概率会被腾讯检测到异常，如果出现异常，脚本会自动退出，需要手动打开网页进行验证，验证完后，重新运行脚本(一般就只会异常一次)。输出为raw-docs文件夹  

4.运行
```
node fetch-img.js
```
抓取图片文件，输出为final-docs文件夹  

5.dist是我手动组装的，docs文件夹为final-docs中的文档内容，doc-script.js是文档的脚本，doc-style.css是文档的样式。两个html文档主要是从企微官方文档中复制的菜单栏的标签，然后手动修改了class以及删除了无用的标签，并加了些样式，脚本（index.js）用来控制菜单栏的展开收起。