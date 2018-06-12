/*
app.js 是应用程序的启动入口文件
 */

// 加载express模块
var express = require('express');
// 加载模板模块
var swig = require('swig');
//加载数据库模块
var mongoose=require("mongoose");
//加载body-parser，用来处理post提交过来的数据
var bodyParser=require('body-parser');
//加载cookies模块
var Cookies=require('cookies');
// 创建app应用 =>相当于nodejs中的http.createServer方法创建服务器对象
var app = express();
var User=require('./models/User');
//设置静态文件托管
//当用户访问的url以pulbic开始，那么直接返回对应__dirname+'/public'下的文件
app.use('/public',express.static(__dirname+'/public'));
// 配置应用模板
// 定义当前应用所使用的模板引擎
/*
参数：
第一个参数定义模板引擎的名称，同时也是模板文件的后缀
第二个参数是用于解析模板内容的方法
 */
app.engine('html', swig.renderFile);
/*
设置模板文件存放的目录
第一个参数必须是views，第二个参数是目录
 */
app.set('views', './views');
/*
注册所使用的模板引擎，第一个参数必须是view engine
第二个参数必须与app.engine中的第一个参数相同
 */
app.set('view engine', 'html');
//在开发过程中，需要取消模块缓存
swig.setDefaults({cache:false});
//bodyPaser设置
app.use(bodyParser.urlencoded({extended:true}));

//设置cookie
app.use(function (req,res,next) {
	req.cookies=new Cookies(req,res);
	//解析登录用户的cookie信息
	req.userInfo={};
	if(req.cookies.get('userInfo')){
		try{
            req.userInfo=JSON.parse(req.cookies.get('userInfo'));
            //获取当前登录用户的类型,是否是管理员
            User.findById(req.userInfo._id).then(function (userInfo) {
                req.userInfo.isAdmin=Boolean(userInfo.isAdmin);
                next();
            })

		}catch(e){
            next();
        }
	}else{
        next();
    }

});

/*模板不同的功能划分模块*/
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));


/*
创建路由绑定
参数：
path：访问者路径
回调参数：
req：保存客户端请求的一些信息
res：服务器响应的信息
next：方法，用于执行下一个与路由规则符合的函数
 */
// 首页
/*app.get('/',function(req,res,next){
	// res.send('<h1>欢迎光临我的博客</h1>');//这是未加载模板时的输出
	/!*!/!*render方法读取views目录下的指定文件，解析并返回给客户端
	参数：
	第一个：要解析的文件，相对于views目录,可以省略扩展名，程序会自动在views下找到index.html
	第二个：要传递个模板的数据（第二个参数不是必须的）
	*!/!*!/
	res.render('index');
});*/
/*app.get('/main.css',function (req,res,next) {
	res.setHeader('content-type','text/css');
	res.send('body {background:red;}');
})*/

// 监听http请求
mongoose.connect('mongodb://localhost:27017/blog',function (err) {
	if(err){
		console.log('数据库连接失败');
	}else{
        console.log('数据库连接成功');
        app.listen(8080);
	}
});


/*
用户发送http请求 -> url ->解析路由  ->找到匹配的规则 ->执行指定的绑定函数，返回对应内容至用户
/public  -> 静态 -> 直接读取指定目录下的文件，返回给用户
->动态 ->处理业务逻辑，加载模块，解析模板 ->返回数据给用户*/
