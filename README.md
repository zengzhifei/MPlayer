# web-logger
A logger plugin for web pag.


## 用途

- 监听页面所有XMLHttpRequest请求和响应
- 监听页面所有语法或代码运行时的异常错误
- 触发监听事件后，通过配置回调函数获取或记录监听结果

## 下载

手动下载:
[https://github.com/zengzhifei/web-logger/releases/latest](https://github.com/zengzhifei/web-logger/releases/latest)

Git下载: 
````
    git clone git@github.com:zengzhifei/web-logger.git
````

## 使用

- 引入插件
````html
    <script src="path/to/web-logger.min.js"></script>
````

- 配置插件
````html
    <script>
        let options = {
            // 插件挂载模块
            mountedModules: ['network','error'],
            // 模块通用回调方法
            modulesCallback: function(data) {
                // todo
            },
            // 模块单独配置
            network: {
                //模块单独回调方法
                callback: function(data) {
                  // todo
                }
            },
            // 更多模块
            ...
        };
    </script>
````

- 初始化插件
````html
    <script>
        let logger = new WebLogger(options);
    </script>
````

- 属性
````html
    <script>
        // 插件所有配置
        logger.configs;
        
        // 插件所有可用模块
        logger.modules;
        
        // 插件版本
        logger.version;
    </script>
````

- API
````html
    <script>
        /**
         * 获取或设置配置 
         * param:  name[string]  配置名称
         * param:  value 配置值
         * return: mixed
         */
        logger.config(name,value);
        
        /**
         * 获取模块所有配置
         * param: module[string] 模块名
         * return object
         */
        logger.getModuleConfig(module);
        
        /**
         * 重载模块所有配置
         * param: module[string] 模块名
         * return bool
         */
        logger.reload(module);
    </script>
````

## 交流
QQ 群：106453161

![](./test/img/web-logger_qq-group.png)

## License

[The MIT License](./LICENSE)