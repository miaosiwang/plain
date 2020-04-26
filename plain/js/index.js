// 页面准备就绪
$(function(){

	// 开始按钮
	var btn = $(".btn");

	// 首页
	var home = $(".start-bg");

	// 游戏页面
	var game = $(".game");
	var game_width;
	var game_height;

	// 我方飞机
	var myplane = $(".myplane");
	var myplane_width;
	var myplane_height;

	// 移动背景的计时器
	var movebgTimer;
	// 生成子弹的计时器
	var createbulletTimer;
	// 移动子弹的计时器
	var moveBulletTimer;
	// 生成敌方飞机的计时器
	var createEnemyPlaneTimer;
	//移动敌方飞机的计时器
	var moveEnemyPlaneTimer;


	// 给开始游戏按钮绑定点击事件
	btn.click(function(){

		// 首页隐藏
		home.hide();
		// 游戏页显示
		game.show();

		game_width = game.width();
		game_height = game.height();
		myplane_width = myplane.width();
		myplane_height = myplane.height();


		// 调用移动游戏背景的方法
		move_bg();

		// 调用移动我方飞机的方法
		move_plane();

		// 创建每一颗子弹
		creatEveryBullet();

		// 移动每一颗子弹
		moveEveryBullet();

		// 创建每一架敌方飞机
		createEveryEnemyPlane();

		// 移动每一架敌方飞机 
		moveEveryEnemyPlane();

	})

	// 移动游戏背景方法
	var move_bg = function(){
		var bg_top=0;

		// 计时器
		// setInterval(function(){函数体},1000)
		movebgTimer = setInterval(function(){
			if(bg_top++ == 568) {
				bg_top=0;
			}

			game.css({
				backgroundPositionY:bg_top
			})
		},2)
	}
	


	//移动我方飞机的方法
	var move_plane = function(){
		// 鼠标移动事件
		game.mousemove(function(e){
			// 鼠标移动坐标
			var mouseX = e.offsetX;
			var mouseY = e.offsetY;

		    // 飞机移动的坐标
		    var x = mouseX - myplane_width/2;
		    var y = mouseY - myplane_height/2;


		    // 飞机的边界控制

		    // 飞机移动的最大x
		    var max_x = game_width - myplane_width;
		    var max_y = game_height - myplane_height;

		    x = x<0 ? 0 : x>max_x ? max_x : x;
		    y = y<0 ? 0 : y>max_y ? max_y : y;

			// 移动我方飞机
			myplane.css({
				left:x,
				top:y
			})
		})
	}
	


	// 子弹类 构造函数
	function Bullet(){
		// 	子弹宽高
		this.bulletWidth = 6;
		this.bulletHeight = 14;

		// 子弹移动坐标
		this.bulletX = 0;
		this.bulletY = 0;

		// 子弹的dom元素
		this.currentBullet = null;

		// 子弹图片路径
		this.bulletSrc = "images/cartridge_power.png"
	}


	// 创建子弹的原型方法
	Bullet.prototype.createBullet = function(){
		var bullet_element = "<img src='" + this.bulletSrc + "'>";
		// 创建的子弹元素
		this.currentBullet = $(bullet_element);

		// 获取我方飞机的 left, top
		var myplaneX = myplane.position().left;
		var myplaneY = myplane.position().top;
		

		// 子弹出现的坐标： 
		// 子弹出现的left = 我方飞机的left + 我方飞机宽度的一半 - 子弹宽度的一半
		this.bulletX = myplaneX + myplane_width/2 - this.bulletWidth/2;
		// 子弹出现的top =  我方飞机的top - 子弹高度
		this.bulletY = myplaneY - this.bulletHeight;

		// 创建的子弹的样式
		this.currentBullet.css({
			width:this.bulletWidth,
			height:this.bulletHeight,
			position:"absolute",
			left:this.bulletX,
			top: this.bulletY
		})

		//把创建的子弹插入到页面上
		game.append(this.currentBullet);

	}
	// 移动子弹的原型方法
	Bullet.prototype.moveBullet = function(i){
		// this.bulletY = this.bulletY - 1;
		this.bulletY -= 1;

		// 子弹超出屏幕
		if(this.bulletY <0){
			// 页面中的子弹 Dom移除
			this.currentBullet.remove();
			// 数组里面的子弹 移除 从下标i 开始切,切1位
			bullets.splice(i,1);
		}

		this.currentBullet.css({
			top:this.bulletY
		})
	}

	// 判断子弹是否是否碰撞敌方飞机
	Bullet.prototype.shootEnemyPlane = function(i){
		// var mybullet = this;

		// 循环出每一架敌方飞机
		for(var j = 0; j<enemyPlanes.length; j++){
			if (this.bulletX >= enemyPlanes[j].enemyPlaneX - this.bulletWidth && this.bulletX <= enemyPlanes[j].enemyPlaneX + enemyPlanes[j].enemyPlaneWidth && this.bulletY >= enemyPlanes[j].enemyPlaneY - this.bulletHeight && this.bulletY <= enemyPlanes[j].enemyPlaneY+enemyPlanes[j].enemyPlaneHeight) {

				// 击中敌机
				enemyPlanes[j].enemyPlaneBlood -= 1;

				// 移除击中的子弹
				this.currentBullet.remove();
				bullets.splice(i,1)


				enemyPlanes[j].currentEnemyPlane.attr({
					src:enemyPlanes[j].enemyPlaneHurtSrc
				})

				// 敌机血量为0
				if(enemyPlanes[j].enemyPlaneBlood <= 0){
					// 创建一个爆炸的敌机图
					var boomEnemyPlane_element = "<img src='"+enemyPlanes[j].enemyPlaneDieSrc+"'>"
					var boomEnemyPlane = $(boomEnemyPlane_element);

					boomEnemyPlane.css({
						width:enemyPlanes[j].enemyPlaneWidth,
						height:enemyPlanes[j].enemyPlaneHeight,
						position:'absolute',
						left:enemyPlanes[j].enemyPlaneX,
						top:enemyPlanes[j].enemyPlaneY
					})

					// 移出原来的飞机
					enemyPlanes[j].currentEnemyPlane.remove();
					enemyPlanes.splice(j,1);

					// 将爆炸的飞机放入页面中
					game.append(boomEnemyPlane);

					// 爆炸的飞机过0.4秒再移除掉
					setTimeout(function(){
						boomEnemyPlane.remove()
					},400)
				}


			}
		}
	}



	// 存储所有子弹的数组
	var bullets = [];


	// 创建每一个子弹实例
	function creatEveryBullet(){
		// 计时器 
		createbulletTimer = setInterval(function(){
			// 实例化每一颗子弹对象
			var bullet = new Bullet();
			// 通过实例化的子弹对象, 创建每一个子弹的标签
			bullet.createBullet();

			// 把每一颗子弹  存到数组里面
			bullets.push(bullet);

		},500)

	}
	





	// 移动每一个子弹实例
	function moveEveryBullet(){
		moveBulletTimer = setInterval(function(){

			// 循环每一颗子弹
			for(var i = 0; i<bullets.length; i++){
				// 每一个子弹都调用移动子弹的原型方法
				bullets[i].moveBullet(i);

				if(bullets[i] == undefined){
					// 如果没有子弹，跳出当前的函数，不执行 子弹碰撞的验证
					return;
				}
				//判断每一颗子弹是否碰撞到敌机
				bullets[i].shootEnemyPlane(i);

			}

		},5)
	}



	 /*===============敌机代码==================*/
	 // 存储敌机数据
	 var enemy = [{
	 	img:'images/plain1.png',
	 	hurt:"images/plain1.png",
	 	dieImg:"images/plain1_die.gif",
	 	width:34,
	 	height:24,
	 	blood:1
	 },{
	 	img:'images/plain2.png',
	 	hurt:"images/plain2_hurt.gif",
	 	dieImg:"images/plain2_die.gif",
	 	width:46,
	 	height:60,
	 	blood:5
	 },{
	 	img:'images/plain3.gif',
	 	hurt:"images/plain3_hurt.gif",
	 	dieImg:"images/plain3_die.gif",
	 	width:110,
	 	height:164,
	 	blood:10
	 }]


	 // 构建一个敌机类（构造函数）
	 function EnemyPlane(){

	 	// 根据上面敌机的数组,随机生成的敌机类型  数据
	 	var emy = null;	

	 	// Math.random(); 获取随机数  [0,1)
	 	// [0-0.5]      小型飞机
	 	// (0.5 - 0.9]  中型飞机
	 	// (0.9 - 1)    大型飞机
	 	var random = Math.random();
	 	// 随机生成敌机
	 	if (random <= 0.5) {
	 		emy = enemy[0]; //小
	 	}else if(random <= 0.9){
	 		emy = enemy[1]; //中
	 	}else {
	 		emy = enemy[2]; //大
	 	}

	 	// 地方飞机的宽和高
	 	this.enemyPlaneWidth = emy.width;
	 	this.enemyPlaneHeight = emy.height;

	 	// 随机生成敌机的 x,y坐标
	 	this.enemyPlaneX =  Math.random()*(game_width - this.enemyPlaneWidth);
	 	this.enemyPlaneY =  -this.enemyPlaneHeight;

	 	// 敌机的图片
	 	// 正常
	 	this.enemyPlaneSrc = emy.img;
	 	// 受伤
	 	this.enemyPlaneHurtSrc = emy.hurt;
	 	// 击毁
	 	this.enemyPlaneDieSrc = emy.dieImg;

	 	// 敌机的血量
	 	this.enemyPlaneBlood = emy.blood;

	 	// 敌机的DOM元素
	 	this.currentEnemyPlane = null;

	 }

	 // 创建敌机元素 原型方法
	 EnemyPlane.prototype.createEnemyPlane = function(){
	 	// 创建DOM元素
	 	var enemyPlane_element = "<img src='" + this.enemyPlaneSrc + "'>";
	 	this.currentEnemyPlane = $(enemyPlane_element);

	 	// 敌机的样式
	 	this.currentEnemyPlane.css({
	 		width:this.enemyPlaneWidth,
	 		height:this.enemyPlaneHeight,
	 		position:"absolute",
	 		left:this.enemyPlaneX,
	 		top:this.enemyPlaneY
	 	})

	 	// 插入到页面中
	 	game.append(this.currentEnemyPlane);

	 }

	 // 移动敌方飞机的原型方法
	 EnemyPlane.prototype.moveEnemyPlane = function(i){
	 	this.enemyPlaneY++;

	 	// 飞机飞出屏幕
	 	if(this.enemyPlaneY>=game_height){
	 		// 移出当前这一架敌方飞机
	 		this.currentEnemyPlane.remove();

	 		// 从数组里面移出敌机
	 		enemyPlanes.splice(i,1);
	 	}else{
	 		// 移动敌方飞机
		 	this.currentEnemyPlane.css({
		 		top:this.enemyPlaneY
		 	})
	 	}

	 }



	 // 存储所有敌机的数组
	 var enemyPlanes = [];
	 // 创建敌机实例
	 function createEveryEnemyPlane(){
	 	createEnemyPlaneTimer = setInterval(function(){
	 		//实例化敌机对象
	 		var enemyPlane = new EnemyPlane;
	 		// 创建敌机元素
	 		enemyPlane.createEnemyPlane();

	 		// 把敌机存到数组中
	 		enemyPlanes.push(enemyPlane)
	 	},1500)
	 }
	


	 // 移动每一架敌方飞机
	 function moveEveryEnemyPlane(){
	 	moveEnemyPlaneTimer = setInterval(function(){
	 		// 循环每一架敌机
	 		for(var i = 0; i<enemyPlanes.length; i++){
	 			enemyPlanes[i].moveEnemyPlane(i);

	 			// 获取到我方飞机的 x,y
	 			var myplaneX = myplane.position().left;
	 			var myplaneY = myplane.position().top;


	 			// console.log(enemyPlanes[i].enemyPlaneY,enemyPlanes[i].enemyPlaneHeight,myplaneX,myplaneY)

	 			// 100+'100' = "100100"

	 			// 判断每一架敌机是否碰撞我方飞机
	 			if (myplaneX>=enemyPlanes[i].enemyPlaneX-myplane_width&&myplaneX<=enemyPlanes[i].enemyPlaneX+enemyPlanes[i].enemyPlaneWidth&&myplaneY<=enemyPlanes[i].enemyPlaneY+enemyPlanes[i].enemyPlaneHeight&&myplaneY>=enemyPlanes[i].enemyPlaneY-myplane_height) {
	 				// console.log("撞到了")

	 				// 跟换我方飞机图片
	 				myplane.css({
	 					backgroundImage:"url('images/me_die.gif')"
	 				})

	 				// 停止鼠标事件
	 				game.unbind();

	 				// 清除所有计时器
	 				clearInterval(movebgTimer); //移动背景计时器
	 				clearInterval(createbulletTimer); //创建子弹计时器
	 				clearInterval(moveBulletTimer);  //移动子弹计时器
	 				clearInterval(createEnemyPlaneTimer); //创建敌机计时器
	 				clearInterval(moveEnemyPlaneTimer) //移动敌机计时器

	 				// 清除页面中所有的子弹和敌机
	 				// children() 子元素
	 				game.children("img").remove()

	 				// 只执行一次的计时器
	 				setTimeout(function(){
	 					// 把我方飞机恢复
	 					myplane.css({
	 						backgroundImage:"url(images/me.gif)",
	 						left: "calc(50% - 60px/2)",
							top: "80%"
	 					})

	 					// 首页显示
	 					home.show();
	 					// 游戏页隐藏
	 					game.hide();



	 				},2000)

	 				
	 			}



	 		}
	 	},20)
	 }

	 
	

})





