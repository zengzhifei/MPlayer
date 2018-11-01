# MPlayer

一款基于H5的弹幕播放器插件(A danmaku player plugin for mobile).


## 用途

- 提供H5视频播放
- 提供H5视频直播
- 提供H5弹幕播放

## 下载

手动下载：
[https://github.com/zengzhifei/MPlayer/releases/latest](https://github.com/zengzhifei/MPlayer/releases/latest)

Git下载：
````
    git clone git@github.com:zengzhifei/MPlayer.git
````

## 使用

- 引入插件
````html
    <!--依赖于jquery插件-->
    <script src="path/to/jquery.min.js"></script>
    <script src="path/to/MPlayer.min.js"></script>
````

- 配置插件
````html
    <script>
          let options = {
                // 播放器挂载节点         
                el: '#root',
                // 是否开启插件日志
                debug: false,
                // 播放器视频配置，支持所有video原生属性
                video: {
                    //是否自动播放
                    autoplay: false,
                    //是否显示原生控件，该属性为false则显示插件自带控件
                    controls: false,
                    //是否循环播放
                    loop: false,
                    //是否预加载
                    preload: false,
                    //视频地址
                    src: '',
                    //视频缩略图
                    poster: '',
                    //视频初始播放时刻
                    currentTime: 0,
                    //视频源宽高比例 int
                    whRatio:0,
                },
                // 播放器控件配置
                controls: {
                    //设置默认视频源方向(landscape:水平,portrait:垂直，默认landscape)
                    defaultVideoOrientation: 'landscape',
                    //是否默认显示弹幕开关
                    defaultDanmakuSwitch: true,
                    //是否默认显示声音开关
                    defaultVoiceSwitch: true,
                    //是否默认显示全屏开关
                    defaultScreenFull: false,
                    //自定义配置控件背景色
                    backgroundColor: '',
                },
                // 播放器弹幕配置
                danmaku: {
                    //最大显示行数
                    maxRows: 3,
                    //最大显示长度
                    maxLength: 30,
                    //弹幕滚动速度，建议不配置，插件会自动计算
                    speed: 4000,
                    //弹幕滚动方式，linear:匀速 swing：非匀速
                    easing: 'linear',
                    //是否循环弹幕列表
                    loop: false,
                    // 是否自动释放内存(true模式下，loop不可用)
                    clearMemory: true,
                    //弹幕显示字体大小
                    fontSize: 16,
                    //弹幕显示字体颜色
                    fontColor: '#FFF',
                    //弹幕通用显示背景颜色
                    backgroundColor: 'rgba(179,179,115,0.6)',
                    //弹幕个人显示背景颜色
                    myBackgroundColor: 'rgba(0,205,0,0.6)',
                    //弹幕关键字过滤
                    filterKeyWords:[]
                }
        };
    </script>
````

- 初始化插件
````html
    <script>
        let mPlayer = new MPlayer(options);
    </script>
````

- 属性
````html
    <script>
        //播放器id
        mPlayer.id;   
        
        //插件版本
        mPlayer.version;          
    </script>
````

- API
````html
    <script>
        /**
         * 获取或设置配置 
         * param:  name[string,object]  配置名称
         * param:  value 配置值
         * return: mixed
         */
        mPlayer.config(name,value);
        
        /**
         * 添加弹幕列表
         * param: options[array] 弹幕列表：img:头像 name:名称 text:内容,fontColor:字体颜色,isMe:是否是本人
         * return object
         */
        mPlayer.addDanmaku(options);
        
        /**
         * 启用插件扩展
         * param: type[string] 扩展名(comment,upvote,hits,collect,live)
         * param: icon[string,null] 扩展icon(icon-1,icon-2) icon为空或不存在则卸载该扩展
         * param: fn[function] 监听该枯燥点击事件的回调函数
         * return type为空时，返回可扩展列表
         * return type不为空，扩展启用成功后，返回扩展文字域DOM
         */
        let extend = mPlayer.extend(type,icon,fn);
        
        /**
         * 扩展启用成功后配置扩展说明
         */
        extend.innerText = '我是扩展';
        extend.innerHTML = '<span>我是扩展</span>';
        
        /**
         * 启用插件自定义扩展
         * param: icon[string] icon地址
         * param: fn[function] 监听该扩展点击事件的调函数
         * 扩展启用成功后，返回扩展文字域DOM
         */
        let custom = mPlayer.addExtender(icon,fn);
        custom.innerText = '我是自定义扩展';
        custom.innerHTML = '<span>我是自定义扩展</span>';
        
        /**
         * 获取弹幕当前开关状态
         * return true为开启 false为关闭
         */
        mPlayer.getDanmakuStatus();
        
        /**
         * 获取弹幕池大小
         * return int
         */
        mPlayer.getDanmakuPoolSize();
        
        /**
         * 监听播放器事件，支持video所有原生事件
         * param: event[string,object] 事件名 例如:play,pause...
         * param: fn[function] 事件响应回调函数
         */
        mPlayer.on(event,fn);
        //也支持以事件对象传入多个监听事件
        mPlayer.on({play:fn1,pause:fn2});
        
        /**
         * 播放视频 
         */
        mPlayer.playVideo();
        
        /**
         * 暂停视频 
         */
        mPlayer.pauseVideo();
        
        /**
         * 重载视频 
         */
        mPlayer.reloadVideo();
        
         /**
          * 开启声音 
          */
         mPlayer.openVoice();

        /**
         * 关闭声音
         */
        mPlayer.closeVoice();

         /**
          * 开启弹幕 
          */
         mPlayer.openDanmaku();

        /**
         * 关闭弹幕
         */
        mPlayer.closeDanmaku();
        
         /**
          * 全屏播放
          */
         mPlayer.fullScreen();

        /**
         * 小窗播放
         */
        mPlayer.middleScreen();
        
         /**
          * 获取video属性
          * @param name 属性名
          * @return 属性
          */
         mPlayer.getVideo(name);
         
         /**
          * 设置video属性
          * @param name 属性名
          * @param value 属性值
          */
         mPlayer.setVideo(name,value);
         
        /**
         * 弹幕状态加锁
         */
        mPlayer.lockDanmaku();
        
        /**
         * 弹幕状态解锁
         */
        mPlayer.unlockDanmaku();
        
        /**
         * 声音状态加锁
         */
        mPlayer.lockVoice();
        
        /**
         * 声音状态解锁
         */
        mPlayer.unlockVoice();
        
        /**
         * 屏幕状态加锁
         */
        mPlayer.lockScreen();
        
        /**
         * 屏幕状态解锁
         */
        mPlayer.unlockScreen();
    </script>
````

## License

[The MIT License](./LICENSE)