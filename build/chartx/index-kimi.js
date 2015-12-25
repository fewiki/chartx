window.Chartx || (Chartx = {
    _start  : function () {
        var __FILE__, scripts = document.getElementsByTagName("script");
        for( var i = scripts.length - 1; i>=0 ; i--  ){
            var __F__ = scripts[ i ].getAttribute("src");
            if( __F__.indexOf("chartx/index") >= 0 ){
                __FILE__ = __F__.substr(0 , __F__.indexOf("chartx/"));
                break;
            }
        };

        var furl = __FILE__.replace(/(^\s*)|(\s*$)/g, "").replace(/[^"]*(thx\/charts.+)/, "$1");

        var cmdDefine = define;
        var packages  = [{name:"canvax"} , {name:"chartx"}];
        /**
         *检查包是否在集合中
         */
        function checkInBackages(id) {
            if (packages.length > 0) {
                for (var i = 0, l = packages.length; i < l; i++) {
                    if (id.indexOf(packages[i].name) == 0) {
                        return true
                    }
                }
            }
        };
        window.define = function( id , deps , factory ){
            //只有固定的一些包是按照amd规范写的才需要转换。
            //比如canvax项目，是按照amd规范的，但是这个包是给业务项目中去使用的。
            //而这个业务使用seajs规范，所以业务中自己的本身的module肯定是按照seajs来编写的不需要转换

            if( typeof id == "string" && checkInBackages(id) ){
                //只有canvax包下面的才需要做转换，因为canvax的module是安装amd格式编写的
                //"thx/charts/1.9.21/"
                return cmdDefine(furl+id , deps , function( require, exports, module ){
                    var depList = [];
                    for( var i = 0 , l = deps.length ; i<l ; i++ ){
                        depList.push( require( furl+deps[i]) );
                    }
                    //return factory.apply(window , depList);

                    //其实用上面的直接return也是可以的
                    //但是为了遵循cmd的规范，还是给module的exports赋值
                    module.exports = factory.apply(window , depList);
                });
            } else {
            
                return cmdDefine.apply(window , arguments);
            }
        };

        Chartx._start = null;
        delete Chartx._start;
    }
});

Chartx._start && Chartx._start();


define(
    "chartx/chart/index", [
        "canvax/index",
        "canvax/core/Base"
    ],
    function(Canvax, CanvaxBase) {
        var Chart = function(node, data, opts) {
            //为了防止用户在canvax加载了并且给underscore添加了deepExtend扩展后又加载了一遍underscore
            //检测一遍然后重新自己添加一遍扩展
            if (_ && !_.deepExtend) {
                CanvaxBase.setDeepExtend();
            }

            this.el = CanvaxBase.getEl(node) //chart 在页面里面的容器节点，也就是要把这个chart放在哪个节点里
            this.width = parseInt(this.el.offsetWidth) //图表区域宽
            this.height = parseInt(this.el.offsetHeight) //图表区域高

            this.padding = {
                top: 20,
                right: 10,
                bottom: 0,
                left: 10
            }

            //Canvax实例
            this.canvax = new Canvax({
                el: this.el
            });
            this.stage = new Canvax.Display.Stage({
                id: "main-chart-stage" + new Date().getTime()
            });
            this.canvax.addChild(this.stage);

            //为所有的chart添加注册事件的能力
            arguments.callee.superclass.constructor.apply(this, arguments);
            this.init.apply(this, arguments);
        };

        Chart.Canvax = Canvax;

        Chart.extend = function(props, statics, ctor) {
            var me = this;
            var BaseChart = function() {
                me.apply(this, arguments);
                if (ctor) {
                    ctor.apply(this, arguments);
                }
            };
            BaseChart.extend = me.extend;
            return CanvaxBase.creatClass(BaseChart, me, props, statics);
        };

        Chartx.extend = CanvaxBase.creatClass;

        CanvaxBase.creatClass(Chart, Canvax.Event.EventDispatcher, {
            inited : false,
            init: function() {},
            dataFrame: null, //每个图表的数据集合 都 存放在dataFrame中。
            draw: function() {},
            /*
             * chart的销毁 
             */
            destroy: function() {
                this.clean();
                this.el.innerHTML = "";
                this._destroy && this._destroy();
            },
            /*
             * 清除整个图表
             **/
            clean: function() {
                for (var i=0,l=this.canvax.children.length;i<l;i++){
                    var stage = this.canvax.getChildAt(i);
                    for( var s = 0 , sl=stage.children.length ; s<sl ; s++){
                        stage.getChildAt(s).destroy();
                        s--;
                        sl--;
                    }
                };
            },
            /**
             * 容器的尺寸改变重新绘制
             */
            resize: function() {
                this.clean();
                this.width = parseInt(this.el.offsetWidth);
                this.height = parseInt(this.el.offsetHeight);
                this.canvax.resize();
                this.draw();
            },
            /**
             * reset有两种情况，一是data数据源改变， 一个options的参数配置改变。
             * @param obj {data , options}
             */
            reset: function(obj) {
                /*如果用户有调用reset就说明用户是有想要绘制的 
                 *还是把这个权利交给使用者自己来控制吧
                if( !obj || _.isEmpty(obj)){
                    return;
                }
                */
                //如果只有数据的变化
                if (obj && obj.data && !obj.options && this.resetData) {
                    this.resetData( obj.data );
                    return;
                };
                if (obj && obj.options) {
                    //注意，options的覆盖用的是deepExtend
                    //所以只需要传入要修改的 option部分

                    _.deepExtend(this, obj.options);

                    //配置的变化有可能也会导致data的改变
                    this.dataFrame && (this.dataFrame = this._initData(this.dataFrame.org));
                }
                if (obj && obj.data) {
                    //数据集合，由_initData 初始化
                    this.dataFrame = this._initData(obj.data);
                }
                this.clean();
                this.canvax.getDomContainer().innerHTML = "";
                this.draw();
            },

            _rotate: function(angle) {
                var currW = this.width;
                var currH = this.height;
                this.width = currH;
                this.height = currW;

                var self = this;
                _.each(self.stage.children, function(sprite) {
                    sprite.context.rotation = angle || -90;
                    sprite.context.x = (currW - currH) / 2;
                    sprite.context.y = (currH - currW) / 2;
                    sprite.context.rotateOrigin.x = self.width * sprite.context.$model.scaleX / 2;
                    sprite.context.rotateOrigin.y = self.height * sprite.context.$model.scaleY / 2;
                });
            },

            //默认每个chart都要内部实现一个_initData
            _initData: function(data) {
                return data;
            }
        });

        return Chart;

    }
);

define(
    "chartx/chart/theme",[
        "chartx/utils/colorformat"
    ],
    function( ColorFormat ){
    	var brandColor = "#ff6600";
        var colors = ["#ff8533","#73ace6","#82d982","#e673ac","#cd6bed","#8282d9","#c0e650","#e6ac73","#6bcded","#73e6ac","#ed6bcd","#9966cc"]
        var Theme = {
            colors : colors,
            brandColor : brandColor
        };
        return Theme;
    }
);

define(
    "chartx/components/anchor/Anchor" , 
    [
        "canvax/index",
        "canvax/shape/Line",
        "canvax/shape/Circle"
    ],
    function(Canvax, Line, Circle){
        var Anchor = function(opt){
            this.w = 0;
            this.h = 0;
    
            this.enabled = 0 ; //1,0 true ,false 

            this.xAxis   = {
                lineWidth   : 1,
                fillStyle   : '#0088cf',
                lineType    : "dashed"
            }
            this.yAxis   = {
                lineWidth   : 1,
                fillStyle   : '#0088cf',
                lineType    : "dashed"
            }
            this.node    = {
                enabled     : 1,                 //是否有
                r           : 2,                 //半径 node 圆点的半径
                fillStyle   : '#0088cf',
                strokeStyle : '#0088cf',
                lineWidth   : 2
            }
            this.text    = {
                enabled   : 0,
                fillStyle : "#0088cf"
            }

            this.pos     = {
                x           : 0,
                y           : 0
            }   
            this.cross   = {
                x           : 0,
                y           : 0
            }

            this.sprite  = null;

            this._txt    = null;
            this._circle = null;
            this._xAxis  = null;
            this._yAxis  = null;

            this.init( opt );
        };
    
        Anchor.prototype = {
            init:function( opt ){
                if( opt ){
                    _.deepExtend( this , opt );
                }
    
                this.sprite = new Canvax.Display.Sprite({
                    id : "AnchorSprite"
                });
            },
            draw:function(opt , _xAxis , _yAxis){
                this._xAxis = _xAxis;
                this._yAxis = _yAxis;
                this._initConfig( opt );
                this.sprite.context.x = this.pos.x;
                this.sprite.context.y = this.pos.y;
                if( this.enabled ){ 
                    this._widget();
                } 
            },
            show:function(){
                this.sprite.context.visible = true;
                this._circle.context.visible= true;
                if( this._txt ){
                    this._txt.context.visible = true;
                }
            },
            hide:function(){
                this.sprite.context.visible = false;
                this._circle.context.visible= false;
                if( this._txt ){
                    this._txt.context.visible = false;
                }
            },
            //初始化配置
            _initConfig:function( opt ){
              	if( opt ){
                    _.deepExtend( this , opt );
                }
            },
            resetCross : function( cross ){
                this._xLine.context.yStart = cross.y;
                this._xLine.context.yEnd   = cross.y;
                this._yLine.context.xStart = cross.x;
                this._yLine.context.xEnd   = cross.x;

                var nodepos = this.sprite.localToGlobal( cross );
                this._circle.context.x     = nodepos.x;
                this._circle.context.y     = nodepos.y;

                if(this.text.enabled){
                    var nodepos = this.sprite.localToGlobal( cross );
                    this._txt.context.x = parseInt(nodepos.x);
                    this._txt.context.y = parseInt(nodepos.y);
                    
                    var xd    = this._xAxis.dataSection;
                    var xdl   = xd.length;
                    var xText = parseInt(cross.x / this.w * (xd[ xdl - 1 ] - xd[0]) + xd[0]);

                    var yd    = this._yAxis.dataSection;
                    var ydl   = yd.length;
                    var yText = parseInt( (this.h - cross.y) / this.h * (yd[ ydl - 1 ] - yd[0]) + yd[0]);
                    this._txt.resetText("（X："+xText+"，Y："+yText+"）");

                    if( cross.y <= 20 ){
                        this._txt.context.textBaseline = "top"
                    } else {
                        this._txt.context.textBaseline = "bottom"
                    }
                    if( cross.x <= this._txt.getTextWidth() ){
                        this._txt.context.textAlign    = "left"
                    } else {
                        this._txt.context.textAlign    = "right"
                    }
                }
            },
            _widget:function(){
                var self = this
                self._xLine = new Line({
                    id      : 'x',
                    context : {
                        xStart      : 0,
                        yStart      : self.cross.y,
                        xEnd        : self.w,
                        yEnd        : self.cross.y,
                        lineWidth   : self.xAxis.lineWidth,
                        strokeStyle : self.xAxis.fillStyle,
                        lineType    : self.xAxis.lineType
                    }
                });
                self.sprite.addChild(self._xLine);

                self._yLine = new Line({
                    id      : 'y',
                    context : {
                        xStart      : self.cross.x,
                        yStart      : 0,
                        xEnd        : self.cross.x,
                        yEnd        : self.h,
                        lineWidth   : self.yAxis.lineWidth,
                        strokeStyle : self.yAxis.fillStyle,
                        lineType    : self.yAxis.lineType
                    }
                });
                this.sprite.addChild(self._yLine);

                var nodepos = self.sprite.localToGlobal( self.cross );
                self._circle = new Circle({
                    context : {
                        x           : parseInt(nodepos.x),
                        y           : parseInt(nodepos.y),
                        r           : self._getProp( self.node.r ),
                        fillStyle   : self._getProp( self.node.fillStyle ) || "#ff0000",
                        strokeStyle : self._getProp( self.node.strokeStyle ) || '#cc3300',
                        lineWidth   : self._getProp( self.node.lineWidth ) || 4
                    }
                });
                self.sprite.getStage().addChild(self._circle);

                if(self.text.enabled){
                    self._txt = new Canvax.Display.Text( "" , {
                        context : {
                            x : parseInt(nodepos.x),
                            y : parseInt(nodepos.y),
                            textAlign : "right",
                            textBaseline : "bottom",
                            fillStyle    : self.text.fillStyle
                        }
                    } );
                    self.sprite.getStage().addChild(self._txt);
                }
            },
            _getProp : function( s ){
                if( _.isFunction( s ) ){
                    return s();
                }
                return s
            }           
        };
        return Anchor;
    
    } 
)


define(
    "chartx/components/back/Back" ,
    [
         "canvax/index",
         "canvax/shape/Line",
         "chartx/utils/tools"
    ],
    function( Canvax, Line, Tools){
        var Back = function(opt){
            this.w       = 0;   
            this.h       = 0;
    
            this.pos     = {
                x : 0,
                y : 0
            }

            this.enabled = 1;
    
            this.xOrigin = {                                //原点开始的x轴线
                    enabled     : 1,
                    lineWidth   : 1,
                    strokeStyle : '#e6e6e6'
            }
            this.yOrigin = {                                //原点开始的y轴线               
                    enabled     : 1,
                    lineWidth   : 1,
                    strokeStyle : '#e6e6e6',
                    biaxial     : false
            }
            this.xAxis   = {                                //x轴上的线
                    enabled     : 1,
                    data        : [],                      //[{y:100},{}]
                    org         : null,                    //x轴坐标原点，默认为上面的data[0]
                    // data     : [{y:0},{y:-100},{y:-200},{y:-300},{y:-400},{y:-500},{y:-600},{y:-700}],
                    lineType    : 'solid',                //线条类型(dashed = 虚线 | '' = 实线)
                    lineWidth   : 1,
                    strokeStyle : '#f0f0f0', //'#e5e5e5',
                    filter      : null 
            }
            this.yAxis   = {                                //y轴上的线
                    enabled     : 0,
                    data        : [],                      //[{x:100},{}]
                    org         : null,                    //y轴坐标原点，默认为上面的data[0]
                    // data     : [{x:100},{x:200},{x:300},{x:400},{x:500},{x:600},{x:700}],
                    lineType    : 'solid',                      //线条类型(dashed = 虚线 | '' = 实线)
                    lineWidth   : 1,
                    strokeStyle : '#f0f0f0',//'#e5e5e5',
                    filter      : null
            } 
    
            this.sprite       = null;                       //总的sprite
            this.xAxisSp      = null;                       //x轴上的线集合
            this.yAxisSp      = null;                       //y轴上的线集合
    
            this.init(opt);
        };
    
        Back.prototype = {
    
            init:function(opt){
                _.deepExtend(this , opt); 
                this.sprite = new Canvax.Display.Sprite();
            },
            setX:function($n){
                this.sprite.context.x = $n
            },
            setY:function($n){
                this.sprite.context.y = $n
            },
    
            draw : function(opt){
                _.deepExtend( this , opt );
                //this._configData(opt);
                this._widget();
                this.setX(this.pos.x);
                this.setY(this.pos.y);
            },
            update : function( opt ){
                this.sprite.removeAllChildren();
                this.draw( opt );
            },
            _widget:function(){
                var self  = this;
                if(!this.enabled){
                    return
                }

                self.xAxisSp   = new Canvax.Display.Sprite(),  self.sprite.addChild(self.xAxisSp)
                self.yAxisSp   = new Canvax.Display.Sprite(),  self.sprite.addChild(self.yAxisSp)
   
                //x轴方向的线集合
                var arr = self.xAxis.data;
                for(var a = 0, al = arr.length; a < al; a++){
                    var o = arr[a];
                    var line = new Line({
                        id : "back_line_"+a,
                        context : {
                            xStart      : 0,
                            yStart      : o.y,
                            xEnd        : 0,//self.w,
                            yEnd        : o.y,
                            lineType    : self.xAxis.lineType,
                            lineWidth   : self.xAxis.lineWidth,
                            strokeStyle : self.xAxis.strokeStyle  
                        }
                    });
                    if(self.xAxis.enabled){
                        _.isFunction( self.xAxis.filter ) && self.xAxis.filter({
                            layoutData : self.yAxis.data,
                            index      : a,
                            line       : line
                        });
                        self.xAxisSp.addChild(line);
                        
                        line.animate({
                            xStart : 0,
                            xEnd : self.w
                        } , {
                            duration : 500,
                            //easing : 'Back.Out',//Tween.Easing.Elastic.InOut
                            delay : (al-a) * 80,
                            id : line.id
                        });

                    };
                };

                //y轴方向的线集合
                var arr = self.yAxis.data
                for(var a = 0, al = arr.length; a < al; a++){
                    var o = arr[a]
                    var line = new Line({
                        context : {
                            xStart      : o.x,
                            yStart      : 0,
                            xEnd        : o.x,
                            yEnd        : -self.h,
                            lineType    : self.yAxis.lineType,
                            lineWidth   : self.yAxis.lineWidth,
                            strokeStyle : self.yAxis.strokeStyle,
                            visible     : o.x ? true : false
                        }
                    })
                    if(self.yAxis.enabled){
                        _.isFunction( self.yAxis.filter ) && self.yAxis.filter({
                            layoutData : self.xAxis.data,
                            index      : a,
                            line       : line
                        });
                        self.yAxisSp.addChild(line);
                    }
                };

                //原点开始的y轴线
                var xAxisOrg = (self.yAxis.org == null ? 0 : _.find( self.yAxis.data , function(obj){
                    return obj.content == self.yAxis.org
                } ).x );
            
                //self.yAxis.org = xAxisOrg;
                var line = new Line({
                    context : {
                        xStart      : xAxisOrg,
                        xEnd        : xAxisOrg,
                        yEnd        : -self.h,
                        lineWidth   : self.yOrigin.lineWidth,
                        strokeStyle : self.yOrigin.strokeStyle
                    }
                })
                if(self.yOrigin.enabled)
                    self.sprite.addChild(line)

                if( self.yOrigin.biaxial ){
                    var lineR = new Line({
                        context : {
                            xStart      : self.w,
                            xEnd        : self.w,
                            yEnd        : -self.h,
                            lineWidth   : self.yOrigin.lineWidth,
                            strokeStyle : self.yOrigin.strokeStyle
                        }
                    })
                    if(self.yOrigin.enabled)
                        self.sprite.addChild(lineR)

                }
    
                //原点开始的x轴线
                var yAxisOrg = (self.xAxis.org == null ? 0 : _.find( self.xAxis.data , function(obj){
                    return obj.content == self.xAxis.org
                } ).y );

                //self.xAxis.org = yAxisOrg;
                var line = new Line({
                    context : {
                        yStart      : yAxisOrg,
                        xEnd        : self.w,
                        yEnd        : yAxisOrg,
                        lineWidth   : self.xOrigin.lineWidth,
                        strokeStyle : self.xOrigin.strokeStyle
                    }
                })
                if(self.xOrigin.enabled)
                    self.sprite.addChild(line)
            }
        };
    
        return Back;
    
    }
)


define(
    "chartx/components/datazoom/index", [
        "canvax/index",
        "canvax/shape/Rect",
        "canvax/shape/Line"
    ],
    function(Canvax, Rect, Line) {

        var dataZoom = function(opt) {
            //0-1
            this.range = {
                start: 0,
                end: 1
            };
            this.count = 1;
            this.pos = {
                x: 0,
                y: 0
            };
            this.w = 0;
            this.h = dataZoom.height;

            this.color = "#70aae8";

            this.bg = {
                fillStyle : "#999",
                strokeStyle: "#999",
                lineWidth : 0
            }

            this.dragIng = function(){};
            this.dragEnd = function(){};

            opt && _.deepExtend(this, opt);
            this.barH = this.h - 6;
            this.barY = 6 / 2;
            this.btnW = 8;
            this.btnFillStyle = this.color;
            this.btnLeft = null;
            this.btnRgiht = null;

            this.init();
        };

        dataZoom.prototype = {
            init: function() {
                var me = this;
                this.sprite = new Canvax.Display.Sprite({
                    id : "dataZoom",
                    context: {
                        x: this.pos.x,
                        y: this.pos.y
                    }
                }); 
                this.dataZoomBg = new Canvax.Display.Sprite({
                    id : "dataZoomBg"
                });
                this.dataZoomBtns = new Canvax.Display.Sprite({
                    id : "dataZoomBtns"
                });
                this.sprite.addChild( this.dataZoomBg );
                this.sprite.addChild( this.dataZoomBtns );
                me.widget();
                me._setLines()
            },
            widget: function() {
                var me = this;
                var bgRect = new Rect({
                    context: {
                        x: 0,
                        y: this.barY,
                        width: this.w,
                        height: this.barH,
                        lineWidth: this.bg.lineWidth,
                        strokeStyle: this.bg.strokeStyle,
                        fillStyle: this.bg.fillStyle,
                        globalAlpha: 0.05
                    }
                });
                this.sprite.addChild(bgRect);


                this.btnLeft = new Rect({
                    id          : 'btnLeft',
                    dragEnabled : true,
                    context: {
                        x: this.range.start/this.count * this.w,
                        y: this.barY+1,
                        width: this.btnW,
                        height: this.barH-1,
                        fillStyle : this.btnFillStyle,
                        cursor: "move"
                    }
                });
                this.btnLeft.on("draging" , function(){
                   this.context.y = me.barY+1;
                   if(this.context.x<0){
                       this.context.x = 0;
                   };
                   if(this.context.x > (me.btnRight.context.x-me.btnW-2)){
                       this.context.x = me.btnRight.context.x-me.btnW-2
                   };
                   me.rangeRect.context.width = me.btnRight.context.x - this.context.x - me.btnW;
                   me.rangeRect.context.x = this.context.x + me.btnW;
                   me.setRange();
                });
                this.btnLeft.on("dragend" , function(){
                   me.dragEnd( me.range );
                });


                this.btnRight = new Rect({
                    id          : 'btnRight',
                    dragEnabled : true,
                    context: {
                        x: this.range.end / this.count * this.w - this.btnW,
                        y: this.barY+1,
                        width: this.btnW,
                        height: this.barH-1,
                        fillStyle : this.btnFillStyle,
                        cursor : "move"
                    }
                });
                this.btnRight.on("draging" , function(){
                    this.context.y = me.barY+1;
                    if( this.context.x < (me.btnLeft.context.x + me.btnW + 2) ){
                        this.context.x = me.btnLeft.context.x + me.btnW + 2;
                    };
                    if( this.context.x > me.w - me.btnW ){
                        this.context.x = me.w - me.btnW;
                    };
                    me.rangeRect.context.width = this.context.x - me.btnLeft.context.x - me.btnW;
                    me.setRange();
                });
                this.btnRight.on("dragend" , function(){
                    me.dragEnd( me.range );
                });


                //中间矩形拖拽区域
                this.rangeRect = new Rect({
                    id          : 'btnCenter',
                    dragEnabled : true,
                    context : {
                        x : this.btnLeft.context.x + me.btnW,
                        y : this.barY + 1,
                        width : this.btnRight.context.x - this.btnLeft.context.x - me.btnW,
                        height : this.barH - 1,
                        fillStyle : this.btnFillStyle,
                        globalAlpha : 0.3,
                        cursor : "move"
                    }
                });
                this.rangeRect.on("draging" , function(e){
                    this.context.y = me.barY + 1;
                    if( this.context.x < me.btnW ){
                        this.context.x = me.btnW; 
                    };
                    if( this.context.x > me.w - this.context.width - me.btnW ){
                        this.context.x = me.w - this.context.width - me.btnW;
                    };
                    me.btnLeft.context.x  = this.context.x - me.btnW;
                    me.btnRight.context.x = this.context.x + this.context.width;
                    me.setRange();
                });
                this.rangeRect.on("dragend" , function(){
                    me.dragEnd( me.range );
                });

                this.linesLeft = new Canvax.Display.Sprite({ id : "linesLeft" });
                this._addLines({
                    sprite : this.linesLeft,
                })
                this.linesRight = new Canvax.Display.Sprite({ id : "linesRight" });
                this._addLines({
                    sprite : this.linesRight,
                })
                this.linesCenter = new Canvax.Display.Sprite({ id : "linesCenter" });
                this._addLines({
                    count  : 6,
                    // dis    : 1,
                    sprite : this.linesCenter,
                })

                this.dataZoomBtns.addChild( this.rangeRect );
                this.dataZoomBtns.addChild( this.linesCenter );

                this.dataZoomBtns.addChild( this.btnLeft );
                this.dataZoomBtns.addChild( this.btnRight );

                this.dataZoomBtns.addChild( this.linesLeft );
                this.dataZoomBtns.addChild( this.linesRight );
            },
            setRange : function(){
                var start = (this.btnLeft.context.x / this.w)*this.count ;
                var end = ( (this.btnRight.context.x + this.btnW) / this.w)*this.count;
                this.range.start = start;
                this.range.end = end;
                this.dragIng( this.range );

                this._setLines()
            },

            _setLines : function(){
                var me = this
                var linesLeft  = me.dataZoomBtns.getChildById('linesLeft')
                var linesRight = me.dataZoomBtns.getChildById('linesRight')
                var linesCenter = me.dataZoomBtns.getChildById('linesCenter')
                
                var btnLeft    = me.dataZoomBtns.getChildById('btnLeft')
                var btnRight   = me.dataZoomBtns.getChildById('btnRight')
                var btnCenter  = me.dataZoomBtns.getChildById('btnCenter')
                
                linesLeft.context.x = btnLeft.context.x + (btnLeft.context.width - linesLeft.context.width ) / 2
                linesLeft.context.y = btnLeft.context.y + (btnLeft.context.height - linesLeft.context.height ) / 2

                linesRight.context.x = btnRight.context.x + (btnRight.context.width - linesRight.context.width ) / 2
                linesRight.context.y = btnRight.context.y + (btnRight.context.height - linesRight.context.height ) / 2

                linesCenter.context.x = btnCenter.context.x + (btnCenter.context.width - linesCenter.context.width ) / 2
                linesCenter.context.y = btnCenter.context.y + (btnCenter.context.height - linesCenter.context.height ) / 2
            },

            _addLines:function($o){
                var me = this
                var count  = $o.count || 2
                var sprite = $o.sprite
                var dis    = $o.dis || 2
                for(var a = 0, al = count; a < al; a++){
                    sprite.addChild(me._addLine({
                        x : a * dis
                    }))
                }
                sprite.context.width = a * dis - 1, sprite.context.height = 6
            },

            _addLine:function($o){
                var o = $o || {}
                var line = new Line({
                    id     : o.id || '',
                    context: {
                        x: o.x || 0,
                        y: o.y || 0,
                        xEnd: o.xEnd || 0,
                        yEnd: o.yEnd || 6,
                        lineWidth: o.lineWidth || 1,
                        strokeStyle: o.strokeStyle || '#ffffff'
                    }
                });
                return line
            }
        };

        dataZoom.height = 46;
        return dataZoom;
    }
);



/*
 * legendData :
 * [
 *    { field : "uv" , value : 100 , fillStyle : "red" }
 *    ......
 * ]
 *
 **/
define(
    "chartx/components/legend/index" , 
    [
        "canvax/index",
        "canvax/shape/Rect"
    ],
    function(Canvax , Rect){
        var Legend = function(data , opt){
            this.data = data || [];
            this.w = 0;
            this.h = 0;
            this.tag = {
                height : 20
            }
            this.enabled = 1 ; //1,0 true ,false 

            this.icon = {
                width : 6,
                height: 6,
                lineWidth : 1,
                fillStyle : "#999"
            }
            this.layoutType = "vertical"

            this.sprite  = null;

            this.init( opt );
        };
    
        Legend.prototype = {
            init:function( opt ){
                if( opt ){
                    _.deepExtend( this , opt );
                };
                this.sprite = new Canvax.Display.Sprite({
                    id : "LegendSprite"
                });

                this.draw();
            },
            pos : function( pos ){
                this.sprite.context.x = pos.x;
                this.sprite.context.y = pos.y;
            },
            draw:function(opt , _xAxis , _yAxis){
                if( this.enabled ){ 
                    this._widget();
                } 
            },
            label : function( info ){
                return info.field+"："+info.value;
            },
            _widget:function(){
                var me = this;

                var max = 0;
                _.each( this.data , function( obj , i ){
                    var sprite = new Canvax.Display.Sprite({
                        context : {
                            height : me.tag.height,
                            y      : me.tag.height*i
                        }
                    });
                    var icon   = new Rect({
                        context : {
                            width : me.icon.width,
                            height: me.icon.height,
                            x     : 0,
                            y     : me.tag.height/2 - me.icon.height/2,
                            fillStyle : obj.fillStyle
                        }
                    });
                    sprite.addChild( icon );

                    var content= me.label(obj);
                    var txt    = new Canvax.Display.Text( content , {
                        context : {
                            x : me.icon.width+6,
                            y : me.tag.height / 2,
                            textAlign : "left",
                            textBaseline : "middle",
                            fillStyle : "#333" //obj.fillStyle
                        }
                    } );
                    sprite.addChild(txt);

                    sprite.context.width = me.icon.width + 6 + txt.getTextWidth();
                    max = Math.max( max , sprite.context.width );
                    me.sprite.addChild(sprite);
                } );

                me.sprite.context.width  = max;
                me.sprite.context.height = me.sprite.children.length * me.tag.height;
                
                me.w = max+10;
                me.h = me.sprite.children.length * me.tag.height;
            }
        };
        return Legend;
    
    } 
)


define(
    "chartx/components/markline/index",
    [
         "canvax/index",
         "canvax/shape/BrokenLine",
         "canvax/display/Sprite",
         "canvax/display/Text"
    ],
    function(Canvax, BrokenLine, Sprite, Text){
        var markLine = function(opt){
            this.w      = 0;
            this.h      = 0
            this.field  = null;
            this.origin = {
                x : 0 , y : 0
            };

            this.line       = {
                y           : 0,
                list        : [],
                strokeStyle : '#000000',
                lineWidth   : 1,
                smooth      : false,
                lineType    : 'dashed'
            };

            this.text = {
                enabled  : false,
                content  : '',
                fillStyle: '#999999',
                fontSize : 12,
                format   : null,
                lineType : 'dashed'
            }

            this.filter = function( ){
                
            }

            this._doneHandle = null;
            this.done   = function( fn ){
                this._doneHandle = fn;
            };
            this.txt = null
           
            opt && _.deepExtend(this, opt);
            this.init();
        }
        markLine.prototype = {
            init : function(){
                var me = this;

                this.sprite  = new Sprite({ 
                    context : {
                        x : this.origin.x,
                        y : this.origin.y
                    }
                });
                setTimeout( function(){
                    me.widget();
                } , 10 );
            },
            widget : function(){
                var me = this
                var line = new BrokenLine({               //线条
                    id : "line",
                    context : {
                        y           : me.line.y,
                        pointList   : me.line.list,
                        strokeStyle : me.line.strokeStyle,
                        lineWidth   : me.line.lineWidth,
                        lineType    : me.line.lineType
                    }
                });
                me.sprite.addChild(line)


                if(me.text.enabled){
                    var txt = new Text(me.text.content, {           //文字
                        context : me.text
                    })
                    this.txt = txt
                    me.sprite.addChild(txt)

                    if(_.isNumber(me.text.x)){
                        txt.context.x = me.text.x, txt.context.y = me.text.y
                    }else{
                        txt.context.x = this.w - txt.getTextWidth() 
                        txt.context.y = me.line.y - txt.getTextHeight()
                    }
                }

                me._done();
                me.filter( me );
            },
            _done : function(){
                _.isFunction( this._doneHandle ) && this._doneHandle.apply( this , [] );
            },
        }
        return markLine
    } 
);


define(
    "chartx/components/markpoint/index",
    [
         "canvax/index",
         "canvax/animation/Tween"
    ],
    function( Canvax , Tween ){
        var markPoint = function( userOpts , chartOpts , data ){
            this.markTarget = null; //markpoint标准的对应元素
            this.data       = data; //这里的data来自加载markpoint的各个chart，结构都会有不一样，但是没关系。data在markpoint本身里面不用作业务逻辑，只会在fillStyle 等是function的时候座位参数透传给用户
            this.point      = {
                x : 0 , y : 0
            };
            this.normalColor = "#6B95CF";
            this.shapeType   = "droplet";//"circle";
            this.fillStyle   = null;
            this.strokeStyle = null;
            this.lineWidth   = 1;
            this.globalAlpha = 0.7;

            this.duration    = 800;//如果有动画，则代表动画时长
            this.easing      = Tween.Easing.Linear.None;//动画类型

            //droplet opts
            this.hr = 8;
            this.vr = 12;

            //circle opts
            this.r  = 5;
            
            this.sprite = null;
            this.shape  = null;

            this.iGroup = null;
            this.iNode  = null;
            this.iLay   = null;

            this._doneHandle = null;
            this.done   = function( fn ){
                this._doneHandle = fn;
            };

            this.realTime = false; //是否是实时的一个点，如果是的话会有动画
            this.tween    = null;  // realTime 为true的话，tween则为对应的一个缓动对象
            this.filter  = function(){};//过滤函数

            if( "markPoint" in userOpts ){
                this.enabled = true;
                _.deepExtend( this , userOpts.markPoint );
            };
            chartOpts && _.deepExtend( this , chartOpts );

            
            this.init();
        }
        markPoint.prototype = {
            init : function(){
                var me = this;
                this.sprite  = new Canvax.Display.Sprite({ 
                    context : {
                        x : this.point.x,
                        y : this.point.y
                    }
                });
                this.sprite.on("destroy" , function( e ){
                    if (me.tween) {
                        me.tween.stop();
                        Tween.remove( me.tween );
                    };
                    if(me.timer){
                        cancelAnimationFrame(me.timer);
                    }
                });
                setTimeout( function(){
                    me.widget();
                } , 10 );
            },
            widget : function(){
                this._fillStyle   = this._getColor( this.fillStyle   , this.data );
                this._strokeStyle = this._getColor( this.strokeStyle , this.data );
                switch (this.shapeType.toLocaleLowerCase()){
                    case "circle" :
                        this._initCircleMark();
                        break;
                    case "droplet" :
                        this._initDropletMark();
                        break;
                };
               
            },
            _getColor : function( c , data , normalColor ){
                var color = c;
                if( _.isFunction( c ) ){
                    color = c( data );
                }
                //缺省颜色
                if( (!color || color == "") ){
                    //如果有传normal进来，就不管normalColor参数是什么，都直接用
                    if( arguments.length >= 3 ){
                        color = normalColor;
                    } else {
                        color = this.normalColor;
                    }
                }
                return color;
            },
            _done : function(){
                this.shape.context.visible   = true;
                this.shapeBg && (this.shapeBg.context.visible = true);
                this.shapeCircle && ( this.shapeCircle.context.visible = true );
                _.isFunction( this._doneHandle ) && this._doneHandle.apply( this , [] );
                _.isFunction(this.filter) && this.filter( this );
            },
            _initCircleMark  : function(){
                var me = this;
                require(["canvax/shape/Circle"] , function( Circle ){
                    var ctx = {
                        r : me.r,
                        fillStyle   : me._fillStyle,
                        lineWidth   : me.lineWidth,
                        strokeStyle : me._strokeStyle,
                        globalAlpha : me.globalAlpha,
                        cursor      : "point",
                        visible     : false
                    };
                    me.shape = new Circle({
                        context : ctx
                    });
                    me.sprite.addChild( me.shape );
                    me._realTimeAnimate();
                    me._done();
                });
            },
            destroy : function(){
                if(this.tween){
                    this.tween.stop();
                }
                this.sprite.destroy();
            },
            _realTimeAnimate : function(){
                var me = this;
                if( me.realTime ){
                    if( !me.shapeBg ){
                        me.shapeBg = me.shape.clone();
                        me.sprite.addChildAt( me.shapeBg , 0 );
                    };
                
                    me.timer = null;
                    var growAnima = function(){
                       me.tween = new Tween.Tween( { r : me.r , alpha : me.globalAlpha } )
                       .to( { r : me.r * 3 , alpha : 0 }, me.duration )
                       .onUpdate( function (  ) {
                           me.shapeBg.context.r = this.r;
                           me.shapeBg.context.globalAlpha = this.alpha;
                       } ).repeat(Infinity).delay(800)
                       .onComplete(function(){
                           //debugger;
                       })
                       .easing( me.easing )
                       .start();
                       animate();
                    };
                    function animate(){
                        //console.log(1);
                        me.timer    = requestAnimationFrame( animate ); 
                        Tween.update();
                    };
                    growAnima();
                }

            },
            _initDropletMark : function(){
                var me = this;
                require(["canvax/shape/Droplet","canvax/shape/Circle"] , function( Droplet , Circle){
                    var ctx = {
                        y      : -me.vr,
                        scaleY : -1,
                        hr     : me.hr,
                        vr     : me.vr,
                        fillStyle   : me._fillStyle,
                        lineWidth   : me.lineWidth,
                        strokeStyle : me._strokeStyle,
                        globalAlpha : me.globalAlpha,
                        cursor  : "point",
                        visible : false
                    };
                    me.shape = new Droplet({
                        hoverClone : false,
                        context : ctx
                    });
                    me.sprite.addChild( me.shape );

                    var circleCtx = {
                        y : -me.vr,
                        x : 1,
                        r : Math.max(me.hr-6 , 2) ,
                        fillStyle   : "#fff",//me._fillStyle,
                        //lineWidth   : 0,
                        //strokeStyle : me._strokeStyle,
                        //globalAlpha : me.globalAlpha,
                        visible     : false
                    };
                    me.shapeCircle = new Circle({
                        context : circleCtx
                    });
                    me.sprite.addChild( me.shapeCircle );


                    me._done();
                    
                });
            }
        }
        return markPoint
    } 
);


define(
    "chartx/components/tips/tip",
    [
         "canvax/index",
         "canvax/shape/Rect",
         "chartx/utils/tools"
    ],
    function( Canvax , Rect, Tools ){
        var Tip = function( opt , tipDomContainer ){
            this.enabled = true;
            this.tipDomContainer = tipDomContainer;
            this.cW      = 0;  //容器的width
            this.cH      = 0;  //容器的height
    
            this.dW      = 0;  //html的tips内容width
            this.dH      = 0;  //html的tips内容Height

            this.backR   = "5px";  //背景框的 圆角 
    
            this.sprite  = null;
            this.content = null; //tips的详细内容

            this.fillStyle   = "rgba(255,255,255,0.95)";//"#000000";
            this.text        = {
                fillStyle    : "#999"
            };
            this.strokeStyle = "#ccc";
            this.lineWidth   = 1;
            this.alpha       = 0.5;
            
            this._tipDom = null;
            //this._back   = null;

            this.offset = 10; //tips内容到鼠标位置的偏移量
        
            //所有调用tip的 event 上面 要附带有符合下面结构的tipsInfo属性
            //会deepExtend到this.indo上面来
            this.tipsInfo    = {
                //nodesInfoList : [],//[{value: , fillStyle : ...} ...]符合iNode的所有Group上面的node的集合
                //iGroup        : 0, //数据组的索引对应二维数据map的x
                //iNode         : 0  //数据点的索引对应二维数据map的y
            };
            this.prefix  = [];
            this.init(opt);
        }
        Tip.prototype = {
            init : function(opt){
                _.deepExtend( this , opt );
                this.sprite = new Canvax.Display.Sprite({
                    id : "TipSprite"
                });
                var self = this;
                this.sprite.on("destroy" , function(){
                    self._tipDom = null;
                });
            },
            show : function(e){
                if( !this.enabled ) return;
                this.hide();
                var stage = e.target.getStage();
                this.cW   = stage.context.width;
                this.cH   = stage.context.height;
    
                this._initContent(e);
                this._initBack(e);
                
                this.setPosition(e);

                this.sprite.toFront();
            },
            move : function(e){
                if( !this.enabled ) return;
                this._setContent(e);
                this._resetBackSize(e);
                this.setPosition(e);
            },
            hide : function(){
                if( !this.enabled ) return;
                this.sprite.removeAllChildren();
                this._removeContent();
            },
            /**
             *@pos {x:0,y:0}
             */
            setPosition : function( e ){
                if(!this._tipDom) return;
                var pos = e.pos || e.target.localToGlobal( e.point );
                var x   = this._checkX( pos.x + this.offset );
                var y   = this._checkY( pos.y + this.offset );

                var _backPos = this.sprite.parent.globalToLocal( { x : x , y : y} );
                //this.sprite.context.x = _backPos.x;
                //this.sprite.context.y = _backPos.y;
                this._tipDom.style.cssText += ";visibility:visible;left:"+x+"px;top:"+y+"px;";
            },
            /**
             *content相关-------------------------
             */
            _initContent : function(e){
                this._tipDom = document.createElement("div");
                this._tipDom.className = "chart-tips";
                this._tipDom.style.cssText += "；-moz-border-radius:"+this.backR+"; -webkit-border-radius:"+this.backR+"; border-radius:"+this.backR+";background:"+this.fillStyle+";border:1px solid "+this.strokeStyle+";visibility:hidden;position:absolute;display:inline-block;*display:inline;*zoom:1;padding:6px;color:"+this.text.fillStyle+";line-height:1.5"
                this._tipDom.style.cssText += "; -moz-box-shadow:1px 1px 3px "+this.strokeStyle+"; -webkit-box-shadow:1px 1px 3px "+this.strokeStyle+"; box-shadow:1px 1px 3px "+this.strokeStyle+";"
                this.tipDomContainer.appendChild( this._tipDom );
                this._setContent(e);
            },
            _removeContent : function(){
                if(!this._tipDom){
                    return;
                };
                this.tipDomContainer.removeChild( this._tipDom );
                this._tipDom = null;
            },
            _setContent : function(e){
                if (!this._tipDom){
                    return;
                } 
                this._tipDom.innerHTML = this._getContent(e);
                this.dW = this._tipDom.offsetWidth;
                this.dH = this._tipDom.offsetHeight;
            },
            _getContent : function(e){
                _.extend( this.tipsInfo , (e.tipsInfo || e.eventInfo || {}) );
                var tipsContent = _.isFunction(this.content) ? this.content( this.tipsInfo ) : this.content ;
                if( !tipsContent && tipsContent != 0 ){
                    tipsContent = this._getDefaultContent( this.tipsInfo );
                }
                return tipsContent;
            },
            _getDefaultContent : function( info ){
                var str  = "<table>";
                var self = this;
                _.each( info.nodesInfoList , function( node , i ){

                    str+= "<tr style='color:"+ (node.color || node.fillStyle || node.strokeStyle) +"'>";
                    var prefixName = self.prefix[i];
                    if( prefixName ) {
                        str+="<td>"+ prefixName +"：</td>";
                    } else {
                        if( node.field ){
                            str+="<td>"+ node.field +"：</td>";
                        }
                    };

                    str += "<td>"+ Tools.numAddSymbol(node.value) +"</td></tr>";
                });
                str+="</table>";
                return str;
            },
            /**
             *Back相关-------------------------
             */
            _initBack : function(e){
                return
                var opt = {
                    x : 0,
                    y : 0,
                    width  : this.dW,
                    height : this.dH,
                    lineWidth : this.lineWidth,
                    //strokeStyle : "#333333",
                    fillStyle : this.fillStyle,
                    radius : [ this.backR ],
                    globalAlpha  : this.alpha
                };

                if( this.strokeStyle ){
                    opt.strokeStyle = this.strokeStyle;
                }
               
                /*
                this._back = new Rect({
                    id : "tipsBack",
                    context : opt
                });
                this.sprite.addChild( this._back );
                */
            },
            _resetBackSize:function(e){
                /*
                this._back.context.width  = this.dW;
                this._back.context.height = this.dH;
                */
            },
    
            /**
             *获取back要显示的x
             *并且校验是否超出了界限
             */
            _checkX : function( x ){
                var w = this.dW + 2; //后面的2 是 两边的linewidth
                if( x < 0 ){
                    x = 0;
                }
                if( x + w > this.cW ){
                    x = this.cW - w;
                }
                return x
            },
    
            /**
             *获取back要显示的x
             *并且校验是否超出了界限
             */
            _checkY : function( y ){
                var h = this.dH + 2; //后面的2 是 两边的linewidth
                if( y < 0 ){
                    y = 0;
                }
                if( y + h > this.cH ){
                    y = this.cH - h;
                }
                return y
            }
        }
        return Tip
    } 
);


define(
    "chartx/components/xaxis/xAxis", [
        "canvax/index",
        "canvax/core/Base",
        "canvax/shape/Line",
        "chartx/utils/tools"
    ],
    function(Canvax, CanvaxBase, Line, Tools) {
        var xAxis = function(opt, data) {
            this.graphw = 0;
            this.graphh = 0;
            this.yAxisW = 0;
            this.w = 0;
            this.h = 0;

            this.disY = 1;
            this.dis = 6; //线到文本的距离

            this.label = "";
            this._label = null; //this.label对应的文本对象

            this.line = {
                enabled: 1, //是否有line
                width: 1,
                height: 4,
                strokeStyle: '#cccccc'
            };

            this.text = {
                fillStyle: '#999',
                fontSize: 12,
                rotation: 0,
                format: null,
                textAlign: null
            };
            this.maxTxtH = 0;

            this.pos = {
                x: null,
                y: null
            };

            //this.display = "block";
            this.enabled = 1; //1,0 true ,false 

            this.disXAxisLine = 0; //x轴两端预留的最小值
            this.disOriginX = 0; //背景中原点开始的x轴线与x轴的第一条竖线的偏移量
            this.xGraphsWidth = 0; //x轴宽(去掉两端)

            this.dataOrg = []; //源数据
            this.dataSection = []; //默认就等于源数据
            this._layoutDataSection = []; //dataSection的format后的数据
            this.data = []; //{x:100, content:'1000'}
            this.layoutData = []; //this.data(可能数据过多),重新编排过滤后的数据集合, 并根据此数组展现文字和线条
            this.sprite = null;

            this._textMaxWidth = 0;
            this.leftDisX = 0; //x轴最左边需要的间距。默认等于第一个x value字符串长度的一半

            //过滤器，可以用来过滤哪些yaxis 的 节点是否显示已经颜色之类的
            //@params params包括 dataSection , 索引index，txt(canvax element) ，line(canvax element) 等属性
            this.filter = null; //function(params){}; 

            this.isH = false; //是否为横向转向的x轴

            this.animation = true;

            this.uniform = false;

            this.init(opt, data);
        };

        xAxis.prototype = {
            init: function(opt, data) {
                this.sprite = new Canvax.Display.Sprite({
                    id: "xAxisSprite"
                });
                this._initHandle(opt, data);
            },
            _initHandle: function(opt, data) {
                data && data.org && (this.dataOrg = data.org);

                if (opt) {
                    _.deepExtend(this, opt);
                }

                if (this.text.rotation != 0 && this.text.rotation % 90 == 0) {
                    this.isH = true;
                }

                if (!this.line.enabled) {
                    this.line.height = 1
                }

                if (this.dataSection.length == 0) {
                    this.dataSection = this._initDataSection(this.dataOrg);
                };

                //先计算出来显示文本
                this._layoutDataSection = this._formatDataSectionText(this.dataSection);

                //然后计算好最大的width 和 最大的height，外部组件需要用
                this._setTextMaxWidth();
                this._setXAxisHeight();

            },
            /**
             *return dataSection 默认为xAxis.dataOrg的的faltten
             *即 [ [1,2,3,4] ] -- > [1,2,3,4]
             */
            _initDataSection: function(data) {
                return _.flatten(data);
            },
            setX: function($n) {
                this.sprite.context.x = $n
            },
            setY: function($n) {
                this.sprite.context.y = $n
            },
            //数据变化，配置没变的情况
            resetData: function(data , opt) {
                //先在field里面删除一个字段，然后重新计算
                if (opt) {
                    _.deepExtend(this, opt);
                };
                this.sprite.removeAllChildren();
                this.dataSection = [];

                this._initHandle(null, data);

                this.draw();
            },
            //配置和数据变化
            update: function(opt, data) {
                //先在field里面删除一个字段，然后重新计算
                _.deepExtend(this, opt);
                this.resetData(data);
            },
            draw: function(opt) {
                // this.data = [{x:0,content:'0000'},{x:100,content:'10000'},{x:200,content:'20000'},{x:300,content:'30000'},{x:400,content:'0000'},{x:500,content:'10000'},{x:600,content:'20000'}]

                this._getLabel();
                this._initConfig(opt);
                this.data = this._trimXAxis(this.dataSection, this.xGraphsWidth);
                var me = this;
                _.each(this.data, function(obj, i) {
                    obj.layoutText = me._layoutDataSection[i];
                });

                this._trimLayoutData();

                this.setX(this.pos.x);
                this.setY(this.pos.y);

                if (this.enabled) { //this.display != "none"
                    this._widget();

                    if (!this.text.rotation) {
                        this._layout();
                    }
                }
                // this.data = this.layoutData
            },
            _getLabel: function() {
                if (this.label && this.label != "") {

                    this._label = new Canvax.Display.Text(this.label, {
                        context: {
                            fontSize: this.text.fontSize,
                            textAlign: this.isH ? "center" : "left",
                            textBaseline: this.isH ? "top" : "middle",
                            fillStyle: this.text.fillStyle,
                            rotation: this.isH ? -90 : 0
                        }
                    });
                }
            },
            //初始化配置
            _initConfig: function(opt) {
                if (opt) {
                    _.deepExtend(this, opt);
                };

                this.yAxisW = Math.max(this.yAxisW, this.leftDisX);
                this.w = this.graphw - this.yAxisW;
                if (this.pos.x == null) {
                    this.pos.x = this.yAxisW + this.disOriginX;
                };
                if (this.pos.y == null) {
                    this.pos.y = this.graphh - this.h;
                };
                this.xGraphsWidth = parseInt(this.w - this._getXAxisDisLine() - (this.uniform ? this.xGraphsWidth % (_.flatten(this.dataOrg).length || 1) : 0) );

                if (this._label) {
                    if (this.isH) {
                        this.xGraphsWidth -= this._label.getTextHeight() + 5
                    } else {
                        this.xGraphsWidth -= this._label.getTextWidth() + 5
                    }
                };
                this.disOriginX = parseInt((this.w - this.xGraphsWidth) / 2);
            },
            _trimXAxis: function(data, xGraphsWidth) {
                var tmpData = [];
                var dis = xGraphsWidth / (data.length + 1);
                for (var a = 0, al = data.length; a < al; a++) {
                    var o = {
                        'content': data[a],
                        'x': parseInt(dis * (a + 1))
                    }
                    tmpData.push(o);
                };
                return tmpData;
            },
            _formatDataSectionText: function(arr) {
                if (!arr) {
                    arr = this.dataSection;
                };
                var me = this;
                var currArr = [];
                _.each(arr, function(val) {
                    currArr.push(me._getFormatText(val));
                });
                return currArr;
            },
            _getXAxisDisLine: function() { //获取x轴两端预留的距离
                var disMin = this.disXAxisLine
                var disMax = 2 * disMin
                var dis = disMin
                dis = disMin + this.w % _.flatten(this.dataOrg).length
                dis = dis > disMax ? disMax : dis
                dis = isNaN(dis) ? 0 : dis
                return dis
            },
            _setXAxisHeight: function() { //检测下文字的高等
                if (!this.enabled) { //this.display == "none"
                    this.dis = 0;
                    this.h = 3; //this.dis;//this.max.txtH;
                } else {
                    var txt = new Canvax.Display.Text(this._layoutDataSection[0] || "test", {
                        context: {
                            fontSize: this.text.fontSize
                        }
                    });

                    this.maxTxtH = txt.getTextHeight();

                    if (!!this.text.rotation) {
                        if (this.text.rotation % 90 == 0) {
                            this.h = this._textMaxWidth + this.line.height + this.disY + this.dis + 3;
                        } else {
                            var sinR = Math.sin(Math.abs(this.text.rotation) * Math.PI / 180);
                            var cosR = Math.cos(Math.abs(this.text.rotation) * Math.PI / 180);
                            this.h = sinR * this._textMaxWidth + txt.getTextHeight() + 5;
                            this.leftDisX = cosR * txt.getTextWidth() + 8;
                        }
                    } else {
                        this.h = this.disY + this.line.height + this.dis + this.maxTxtH;
                        this.leftDisX = txt.getTextWidth() / 2;
                    }
                }
            },
            _getFormatText: function(text) {
                var res;
                if (_.isFunction(this.text.format)) {
                    res = this.text.format(text);
                } else {
                    res = text
                }
                if (_.isArray(res)) {
                    res = Tools.numAddSymbol(res);
                }
                if (!res) {
                    res = text;
                };
                return res;
            },
            _widget: function() {
                var arr = this.layoutData

                if (this._label) {
                    this._label.context.x = this.xGraphsWidth + 5;
                    this.sprite.addChild(this._label);
                };

                for (var a = 0, al = arr.length; a < al; a++) {
                    var xNode = new Canvax.Display.Sprite({
                        id: "xNode" + a
                    });

                    var o = arr[a]
                    var x = o.x,
                        y = this.disY + this.line.height + this.dis

                    //文字
                    var txt = new Canvax.Display.Text((o.layoutText || o.content), {
                        id: "xAxis_txt_" + CanvaxBase.getUID(),
                        context: {
                            x: x,
                            y: y + 20,
                            fillStyle: this.text.fillStyle,
                            fontSize: this.text.fontSize,
                            rotation: -Math.abs(this.text.rotation),
                            textAlign: this.text.textAlign || (!!this.text.rotation ? "right" : "center"),
                            textBaseline: !!this.text.rotation ? "middle" : "top",
                            globalAlpha: 0
                        }
                    });
                    xNode.addChild(txt);

                    if (!!this.text.rotation && this.text.rotation != 90) {
                        txt.context.x += 5;
                        txt.context.y += 3;
                    };

                    if (this.line.enabled) {
                        //线条
                        var line = new Line({
                            context: {
                                x: x,
                                y: this.disY,
                                xEnd: 0,
                                yEnd: this.line.height + this.disY,
                                lineWidth: this.line.width,
                                strokeStyle: this.line.strokeStyle
                            }
                        });
                        xNode.addChild(line);
                    };

                    //这里可以由用户来自定义过滤 来 决定 该node的样式
                    _.isFunction(this.filter) && this.filter({
                        layoutData: arr,
                        index: a,
                        txt: txt,
                        line: line || null
                    });

                    this.sprite.addChild(xNode);

                    if (this.animation) {
                        txt.animate({
                            globalAlpha: 1,
                            y: txt.context.y - 20
                        }, {
                            duration: 500,
                            easing: 'Back.Out', //Tween.Easing.Elastic.InOut
                            delay: a * 80,
                            id: txt.id
                        });
                    } else {
                        txt.context.y = txt.context.y - 20;
                        txt.context.globalAlpha = 1;
                    };
                };
            },
            /*校验最后一个文本是否超出了界限。然后决定是否矫正*/
            _layout: function() {

                if (this.sprite.getNumChildren() == 0)
                    return;

                var popText = this.sprite.getChildAt(this.sprite.getNumChildren() - 1).getChildAt(0);
                if (popText) {
                    var pc = popText.context;
                    if (pc.textAlign == "center" &&
                        pc.x + popText.context.width / 2 > this.w) {
                        pc.x = this.w - popText.context.width / 2
                    };
                    if (pc.textAlign == "left" &&
                        pc.x + popText.context.width > this.w) {
                        pc.x = this.w - popText.context.width
                    };
                    if (this.data.length > 2) {
                        //倒数第二个text
                        var popPreText = this.sprite.getChildAt(this.sprite.getNumChildren() - 2).getChildAt(0);

                        var ppc = popPreText.context;

                        //如果最后一个文本 和 倒数第二个 重叠了，就 隐藏掉
                        if (ppc.visible && pc.x < ppc.x + ppc.width) {
                            pc.visible = false;
                        }
                    }
                }
            },
            _setTextMaxWidth: function() {
                var arr = this._layoutDataSection;
                var maxLenText = arr[0];

                for (var a = 0, l = arr.length; a < l; a++) {
                    if (arr[a].length > maxLenText.length) {
                        maxLenText = arr[a];
                    }
                };

                var txt = new Canvax.Display.Text(maxLenText || "test", {
                    context: {
                        fillStyle: this.text.fillStyle,
                        fontSize: this.text.fontSize
                    }
                });

                this._textMaxWidth = txt.getTextWidth();
                this._textMaxHeight = txt.getTextHeight();

                return this._textMaxWidth;
            },
            _trimLayoutData: function() {

                var tmp = []
                var arr = this.data

                var mw = this._textMaxWidth + 10;

                if (!!this.text.rotation) {
                    mw = this._textMaxHeight * 1.5;
                };

                //总共能多少像素展现
                var n = Math.min(Math.floor(this.w / mw), arr.length - 1); //能展现几个

                if (n >= arr.length - 1) {
                    this.layoutData = arr;
                } else {
                    //需要做间隔
                    var dis = Math.max(Math.ceil(arr.length / n - 1), 0); //array中展现间隔
                    //存放展现的数据
                    for (var a = 0; a < n; a++) {
                        var obj = arr[a + dis * a];
                        obj && tmp.push(obj);
                    };
                    this.layoutData = tmp;
                };
            }
        };

        return xAxis;

    }
)

define(
    "chartx/components/yaxis/yAxis", [
        "canvax/index",
        "canvax/core/Base",
        "canvax/shape/Line",
        "chartx/utils/tools",
        'chartx/utils/datasection'
    ],
    function(Canvax, CanvaxBase, Line, Tools, DataSection) {
        var yAxis = function(opt, data , data1) {

            this.w = 0;
            this.enabled = 1; //true false 1,0都可以
            this.dis = 6; //线到文本的距离
            this.field = null; //这个 轴 上面的 field

            this.label = "";
            this._label = null; //label的text对象

            this.line = {
                enabled: 1, //是否有line
                width: 4,
                lineWidth: 1,
                strokeStyle: '#cccccc'
            };

            this.text = {
                fillStyle: '#999',
                fontSize: 12,
                format: null,
                rotation: 0

            };
            this.pos = {
                x: 0,
                y: 0
            };
            this.place = "left"; //yAxis轴默认是再左边，但是再双轴的情况下，可能会right
            this.biaxial = false; //是否是双轴中的一份
            this.layoutData = []; //dataSection对应的layout数据{y:-100, content:'1000'}
            this.dataSection = []; //从原数据dataOrg 中 结果datasection重新计算后的数据
            this.dataOrg = []; //源数据

            this.sprite = null;
            //this.x           = 0;
            //this.y           = 0;
            this.disYAxisTopLine = 6; //y轴顶端预留的最小值
            this.yMaxHeight = 0; //y轴最大高
            this.yGraphsHeight = 0; //y轴第一条线到原点的高

            this.baseNumber = null;
            this.basePoint = null; //value为baseNumber的point {x,y}

            //过滤器，可以用来过滤哪些yaxis 的 节点是否显示已经颜色之类的
            //@params params包括 dataSection , 索引index，txt(canvax element) ，line(canvax element) 等属性
            this.filter = null; //function(params){}; 

            this.isH = false; //是否横向

            this.animation = true;

            this.sort = null; //"asc" //排序，默认从小到大, desc为从大到小，之所以不设置默认值为asc，是要用null来判断用户是否进行了配置

            this.init(opt, data , data1);
        };

        yAxis.prototype = {
            init: function(opt, data , data1) {
                _.deepExtend(this, opt);

                if (this.text.rotation != 0 && this.text.rotation % 90 == 0) {
                    this.isH = true;
                }

                this._initData(data , data1);
                this.sprite = new Canvax.Display.Sprite();
            },
            setX: function($n) {
                this.sprite.context.x = $n
            },
            setY: function($n) {
                this.sprite.context.y = $n
            },
            setAllStyle: function(sty) {
                _.each(this.sprite.children, function(s) {
                    _.each(s.children, function(cel) {
                        if (cel.type == "text") {
                            cel.context.fillStyle = sty;
                        } else if (cel.type == "line") {
                            cel.context.strokeStyle = sty;
                        }
                    });
                });
            },
            //数据变化，配置没变的情况
            resetData: function(data,opt) {
                //先在field里面删除一个字段，然后重新计算
                if (opt) {
                    _.deepExtend(this, opt);
                };
                this.sprite.removeAllChildren();
                this.dataSection = [];
                //_.deepExtend( this , opt );
                this._initData(data);
                this.draw();
            },
            //配置和数据变化
            update: function(opt, data) {
                //先在field里面删除一个字段，然后重新计算
                this.sprite.removeAllChildren();
                this.dataSection = [];
                _.deepExtend(this, opt);
                this._initData(data);
                this.draw();
            },
            _getLabel: function() {
                if (this.label && this.label != "") {
                    this._label = new Canvax.Display.Text(this.label, {
                        context: {
                            fontSize: this.text.fontSize,
                            textAlign: "left",
                            textBaseline: this.isH ? "top" : "bottom",
                            fillStyle: this.text.fillStyle,
                            rotation: this.isH ? -90 : 0
                        }
                    });
                }
            },
            draw: function(opt) {
                opt && _.deepExtend(this, opt);
                this._getLabel();
                this.yGraphsHeight = this.yMaxHeight - this._getYAxisDisLine();

                if (this._label) {
                    if (this.isH) {
                        this.yGraphsHeight -= this._label.getTextWidth();
                    } else {
                        this.yGraphsHeight -= this._label.getTextHeight();
                    }
                    this._label.context.y = -this.yGraphsHeight - 5;
                };
                this.setX(this.pos.x);
                this.setY(this.pos.y);
                this._trimYAxis();
                this._widget();
            },
            _trimYAxis: function() {
                var max = this.dataSection[this.dataSection.length - 1];
                var tmpData = [];
                for (var a = 0, al = this.dataSection.length; a < al; a++) {
                    var y = -(this.dataSection[a] - this._bottomNumber) / (max - this._bottomNumber) * this.yGraphsHeight;
                    y = isNaN(y) ? 0 : parseInt(y);
                    tmpData[a] = {
                        content: this.dataSection[a],
                        y: y
                    };
                }

                this.layoutData = tmpData;

                //设置basePoint
                var basePy = -(this.baseNumber - this._bottomNumber) / (max - this._bottomNumber) * this.yGraphsHeight;
                basePy = isNaN(basePy) ? 0 : parseInt(basePy);
                this.basePoint = {
                    content: this.baseNumber,
                    y: basePy
                }
            },
            _getYAxisDisLine: function() { //获取y轴顶高到第一条线之间的距离         
                var disMin = this.disYAxisTopLine
                var disMax = 2 * disMin
                var dis = disMin
                dis = disMin + this.yMaxHeight % this.dataSection.length;
                dis = dis > disMax ? disMax : dis
                return dis
            },
            _setDataSection: function(data) {
                var arr = [];
                if (!this.biaxial) {
                    arr = _.flatten(data.org); //_.flatten( data.org );
                } else {
                    if (this.place == "left") {
                        arr = _.flatten(data.org[0]);
                        this.field = _.flatten([this.field[0]]);
                    } else {
                        arr = _.flatten(data.org[1]);
                        this.field = _.flatten([this.field[1]]);
                    }
                }
                return arr;
            },
            //data1 == [1,2,3,4]
            _initData: function(data , data1) {
                var arr = this._setDataSection(data , data1);
                this.dataOrg = data.org; //这里必须是data.org
                if (this.dataSection.length == 0) {
                    this.dataSection = DataSection.section(arr, 3);
                };

                //如果还是0
                if (this.dataSection.length == 0) {
                    this.dataSection = [0]
                };

                if (this.sort) {
                    var sort = "asc";
                    if (_.isString(this.sort)) {
                        sort = this.sort;
                    }
                    if (_.isArray(this.sort)) {
                        var i = 0;
                        if (this.place == "right") {
                            i = 1;
                        };
                        if (this.sort[i]) {
                            sort = this.sort[i];
                        };
                    };
                    if (sort == "desc") {
                        this.dataSection.reverse();
                    };
                };

                this._bottomNumber = this.dataSection[0];
                /*
                if(arr.length == 1){
                    this.dataSection[0] = arr[0] * 2;
                    this._bottomNumber  = 0;
                }
                */
                if (this.baseNumber == null) {
                    this.baseNumber = this._bottomNumber > 0 ? this._bottomNumber : 0;
                }
            },
            resetWidth: function(w) {
                var self = this;
                self.w = w;
                if (self.line.enabled) {
                    self.sprite.context.x = w - self.dis - self.line.width;
                } else {
                    self.sprite.context.x = w - self.dis;
                }
            },
            _widget: function() {
                var self = this;
                if (!self.enabled) {
                    self.w = 0;
                    return;
                }
                var arr = this.layoutData;
                var maxW = 0;
                self._label && self.sprite.addChild(self._label);
                for (var a = 0, al = arr.length; a < al; a++) {
                    var o = arr[a];
                    var x = 0,
                        y = o.y;
                    var content = o.content
                    if (_.isFunction(self.text.format)) {
                        content = self.text.format(content, self);
                    } else {
                        content = Tools.numAddSymbol(content);
                    }
                    var yNode = new Canvax.Display.Sprite({
                        id: "yNode" + a
                    });

                    　
                    var textAlign = (self.place == "left" ? "right" : "left");
                    //为横向图表把y轴反转后的 逻辑
                    if (self.text.rotation == 90 || self.text.rotation == -90) {
                        textAlign = "center";
                        if (a == arr.length - 1) {
                            textAlign = "right";
                        }
                    };
                    var posy = y + (a == 0 ? -3 : 0) + (a == arr.length - 1 ? 3 : 0);
                    //为横向图表把y轴反转后的 逻辑
                    if (self.text.rotation == 90 || self.text.rotation == -90) {
                        if (a == arr.length - 1) {
                            posy = y - 2;
                        }
                        if (a == 0) {
                            posy = y;
                        }
                    };

                    //文字
                    var txt = new Canvax.Display.Text(content, {
                        id: "yAxis_txt_" + CanvaxBase.getUID(),
                        context: {
                            x: x + (self.place == "left" ? -5 : 5),
                            y: posy + 20,
                            fillStyle: self.text.fillStyle,
                            fontSize: self.text.fontSize,
                            rotation: -Math.abs(this.text.rotation),
                            textAlign: textAlign,
                            textBaseline: "middle",
                            globalAlpha: 0
                        }
                    });
                    yNode.addChild(txt);

                    maxW = Math.max(maxW, txt.getTextWidth());
                    if (self.text.rotation == 90 || self.text.rotation == -90) {
                        maxW = Math.max(maxW, txt.getTextHeight());
                    }

                    if (self.line.enabled) {
                        //线条
                        var line = new Line({
                            context: {
                                x: 0 + (self.place == "left" ? +1 : -1) * self.dis - 2,
                                y: y,
                                xEnd: self.line.width,
                                yEnd: 0,
                                lineWidth: self.line.lineWidth,
                                strokeStyle: self.line.strokeStyle
                            }
                        });
                        yNode.addChild(line);
                    };
                    //这里可以由用户来自定义过滤 来 决定 该node的样式
                    _.isFunction(self.filter) && self.filter({
                        layoutData: self.layoutData,
                        index: a,
                        txt: txt,
                        line: line
                    });

                    self.sprite.addChild(yNode);

                    if (self.animation) {
                        txt.animate({
                            globalAlpha: 1,
                            y: txt.context.y - 20
                        }, {
                            duration: 500,
                            easing: 'Back.Out', //Tween.Easing.Elastic.InOut
                            delay: a * 80,
                            id: txt.id
                        });
                    } else {
                        txt.context.y = txt.context.y - 20;
                        txt.context.globalAlpha = 1;
                    }
                };

                maxW += self.dis;

                self.sprite.context.x = maxW + self.pos.x;
                if (self.line.enabled) {
                    self.w = maxW + self.dis + self.line.width + self.pos.x;
                } else {
                    self.w = maxW + self.dis + self.pos.x;
                }
            }
        };

        return yAxis;
    })