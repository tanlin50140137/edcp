/**
 * 公用文件donghuan/tp5
 */
//配置
var url       = 'http://192.168.50.125/edcp/tp5/';
var ip9501 		= ''; //聊天室的
var gbEuri		= ''; //全局的首页面用来通知对方的
var rounds    = Math.ceil(Math.random()*100);

//获取url传参部分
function getQueryString()
{
	var name = window.location.search;
	if( name != undefined )
	{
		var arr = name.split('=');
		var str = arr[1]==undefined?0:arr[1];
		return str;
	}
	else
	{
		return 0;
	}
}
/*路由*/
function opennewWin(name,url,paramdata,y){
	  if( y == 1 ){
				api.showProgress({
						title: '正在加载',
						text: '请稍候...',
						modal: false
				});
				api.addEventListener({
		    	name: 'myEvent'
				}, function(ret, err) {
				    api.hideProgress();
				});
		}
    api.openWin({
          name: name,
          url: url,
					allowEdit:true,
          pageParam: paramdata
    });
}
function opennewWin2(name,url,paramdata){
    api.openWin({
          name: name,
          url: url,
					allowEdit:true,
					animation:{
						type:"fade",
						duration:300
					},
          pageParam: paramdata
    });
}
function opennewWin3(name,url,paramdata){
    api.openWin({
          name: name,
          url: url,
					allowEdit:true,
          pageParam: paramdata
    });
}
//生成不重复的随机数
function runodNmber(){
	var r=parseInt(Math.random()*38);
	var array=[];
	var strRun='';
	for(var i=0;i<7;i++)
	{
	 var flag=0;
	 do
	 {
	  for(var j=0;j<array.length;j++)
	  {
	   if(array[j]==r) {flag=1;break;}
	  }
	  if(!flag)
	  {
	   array[array.length]=r;
	  }
	  else
	  {
	   r=parseInt(Math.random()*38);
	  }
	 }while(!flag);
	}
	for(var j=0;j<array.length;j++){
	 	strRun+=array[j];
	}
	return strRun;
}
//WebSocket
function linkSocket(report){
	var obj = new Object;
	obj.server = "ws://8.135.103.186:9501";
	obj.ws = new WebSocket(obj.server);
	obj.ws.onopen = function(evt) {
		var str = JSON.stringify({
			userid:report.userid,
			msg:report.msg
		});
		obj.ws.send(str);
	}
	obj.ws.onmessage = function(evt) {
		  report.success(evt.data);
	}
	obj.ws.onclose = function(evt) {
			obj.close();
	}
	obj.close = function(){
		obj.ws.close();
	}
	obj.send = function(data) {
		var str = JSON.stringify({
			userid:data.userid,
			msg:data.msg
		});
		obj.ws.send(str);
	}
	return obj;
}
//页面监听－聊天室
function packageSocket(params,listenopen,listenmessage,listenclose,listenreconnect,listenonline,listenoffline){
    var pack 			   = new Object;
				pack.testing = '';
				pack.i 			 = 0;
				pack.pause   = 0;
				pack.state   = 0;
				pack.strDdata = {
						sendtype:1,          						//标识为文本聊天
						name:params.identity 						//标识身份绑定
					 ,msg:{
								friend:params.friend        //好友标识
					 }
				}
				//页面加载完成初始握手
				pack.ws 			= new WebSocket("ws://"+params.ipport);
				pack.ws.onopen = function(evt) {
						pack.state = 1;
						listenopen('on');
						pack.send(JSON.stringify(pack.strDdata));
				};
				pack.ws.onmessage = function(evt) {
						listenmessage(evt.data);
				};
				pack.ws.onclose   = function(evt) {
						pack.state = 3;
						listenclose("off");
						pack.ws.close();
				};
				//检查网络链接
				api.addEventListener({
						name:'online'
				}, function(ret, err){
						listenonline(ret, err);
				});
				//检查是否与服务器断开，如果断开就重新链接
				api.addEventListener({
						name:'tap'
				}, function(ret, err){
						 if(listenServer.ws.readyState != 1 ){//失败重连
								 listenreconnect(listenServer.ws.readyState);
								 pack.ws 			= new WebSocket("ws://"+params.ipport);
								 pack.ws.onopen = function(evt) {
											pack.state = 1;
											listenopen('on');
											pack.send(JSON.stringify(pack.strDdata));
								 };
								 pack.ws.onmessage = function(evt) {
											listenmessage(evt.data);
								 };
								 pack.ws.onclose   = function(evt) {
											pack.state = 3;
											listenclose("off");
											pack.ws.close();
								 };
								 api.pageDown({bottom:true},function(ret, err){});
						 }
				});
				//应用进入后台
				api.addEventListener({
            name:'pause'
        }, function(ret, err){
						//当应用进入后台开始检测链接状态
						pack.pause = 1;
        });
				//应用从后台回到前台
        api.addEventListener({
            name:'resume'
        }, function(ret, err){
						pack.pause = 0;
						if(listenServer.ws.readyState != 1 ){//失败重连
								listenreconnect(listenServer.ws.readyState);
								pack.ws 			= new WebSocket("ws://"+params.ipport);
								pack.ws.onopen = function(evt) {
										 pack.state = 1;
										 listenopen('on');
										 pack.send(JSON.stringify(pack.strDdata));
								};
								pack.ws.onmessage = function(evt) {
										 listenmessage(evt.data);
								};
								pack.ws.onclose   = function(evt) {
										 pack.state = 3;
										 listenclose("off");
										 pack.ws.close();
								};
								api.pageDown({bottom:true},function(ret, err){});
						}
        });
				//检查网络断开
				api.addEventListener({
	          name:'offline'
	      }, function(ret, err){
						listenoffline(ret, err);
	          pack.state = 4;
	      });
				//发送数据
				pack.send = function(res){
						if( pack.state == 1 ){
								pack.ws.send(res);
						}
				}
				//当应用警进入后台时-弹出状态栏通知-并显示角标
	      pack.statusBarNotification=function(t,c,extra){
	          if( pack.pause == 1 ){
							var temp = c.replace(/<\/?.+?>/g, "");
							var result = temp.replace(/ /g, "");
									result = result==''?'对方给你发了个表情':result;
	              api.notification({
									vibrate:[1,1],
									sound:'default',
	                notify: {
	                		title:t,
	                    content:"”"+result,
											extra:extra
	                }
	              });
	          }
	      }
        return pack;
}
//获取系统时间
function writeCurrentDate() {
    var now = new Date();
    var year = now.getFullYear(); //得到年份
    var month = now.getMonth();//得到月份
    var date = now.getDate();//得到日期
    var hour = now.getHours();//得到小时
    var minu = now.getMinutes();//得到分钟
    var sec = now.getSeconds();//得到秒
        month = month + 1;
		var times = year+'年'+intNums(month)+'月'+intNums(date)+' '+intNums(hour)+':'+intNums(minu)+':'+intNums(sec);
		return  times;
}
//转换数值
function intNums(int){
		if(int<10){
			int = '0'+int;
		}
		return int;
}
//true:数值型的，false：非数值型
function myIsNaN(value) {
    return typeof value === 'number' && !isNaN(value);
}
//APP动态授权
function dynamicAuthorization(name){
		var permission = name;
		var resultList = api.hasPermission({
		    list: [permission]
		});
		if (resultList[0].granted) {
			return true;
		} else {
					api.requestPermission({
							list: [permission],
					}, function(res) {
							if (res.list[0].granted) {
									return true;
							}else{
									return false;
							}
					});
		}
}
//判断是否为url
function isURL(str_url) {// 验证url
		var strRegex = "^((https|http)?://)";
		var re = new RegExp(strRegex);
		return re.test(str_url);
}
//监测应用状态
function isStateapp(){
		//应用进入后台
		api.addEventListener({
				name:'pause'
		}, function(ret, err){
				clearInterval(inteval);
		});
		//应用从后台回到前台
		api.addEventListener({
				name:'resume'
		}, function(ret, err){
			 inteval = setInterval(vm.post,5000);
		});
		//网络断开
		api.addEventListener({
				name:'offline'
		}, function(ret, err){
				clearInterval(inteval);
		});
		//网络链接
		api.addEventListener({
				name:'online'
		}, function(ret, err){
				inteval = setInterval(vm.post,5000);
		});
}
