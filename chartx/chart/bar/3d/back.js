define('chartx/chart/bar/3d/back',
    [
        "canvax/index",
        "canvax/shape/Line",
        "chartx/utils/tools"
    ],
    function (Canvax, Line, Tools) {
        var Back = function (root) {

            var opt = root.back;
            this.root = root;
            this.w = 0;
            this.h = 0;

            this.pos = {
                x: 0,
                y: 0
            }

            this.enabled = 1;

            this.xOrigin = {                                //原点开始的x轴线
                enabled: 1,
                lineWidth: 1,
                strokeStyle: '#e6e6e6'
            }
            this.yOrigin = {                                //原点开始的y轴线
                enabled: 1,
                lineWidth: 1,
                strokeStyle: '#e6e6e6',
                biaxial: false
            }
            this.xAxis = {                                //x轴上的线
                enabled: 1,
                data: [],                      //[{y:100},{}]
                org: null,                    //x轴坐标原点，默认为上面的data[0]
                // data     : [{y:0},{y:-100},{y:-200},{y:-300},{y:-400},{y:-500},{y:-600},{y:-700}],
                lineType: 'solid',                //线条类型(dashed = 虚线 | '' = 实线)
                lineWidth: 1,
                strokeStyle: '#f0f0f0', //'#e5e5e5',
                filter: null
            }
            this.yAxis = {                                //y轴上的线
                enabled: 1,
                data: [],                      //[{x:100},{}]
                org: null,                    //y轴坐标原点，默认为上面的data[0]
                // data     : [{x:100},{x:200},{x:300},{x:400},{x:500},{x:600},{x:700}],
                lineType: 'solid',                      //线条类型(dashed = 虚线 | '' = 实线)
                lineWidth: 1,
                strokeStyle: '#f0f0f0',//'#e5e5e5',
                filter: null
            }

            this.sprite = null;                       //总的sprite
            this.xAxisSp = null;                       //x轴上的线集合
            this.yAxisSp = null;                       //y轴上的线集合

            this.animation = true;
            this.resize = false;

            this.init(opt);
        };

        Back.prototype = {

            init: function (opt) {
                _.deepExtend(this, opt);
                this.sprite = new Canvax.Display.Sprite();
            },
            setX: function ($n) {
                this.sprite.context.x = $n
            },
            setY: function ($n) {
                this.sprite.context.y = $n
            },

            draw: function (opt) {
                _.deepExtend(this, opt);
                //this._configData(opt);
                this._widget();
                this.setX(this.pos.x);
                this.setY(this.pos.y);

                this.root._localToScreen(this.sprite);

                this.root._screenToWorld(this.sprite);

                this.root._projectionToScreen(this.sprite);

                this.root._screenToLocal(this.sprite);

            },
            update: function (opt) {
                this.sprite.removeAllChildren();
                this.draw(opt);
            },
            _widget: function () {
                var self = this;

                var _depth = -100;
                if (!this.enabled) {
                    return
                }

                self.xAxisSp = new Canvax.Display.Sprite(), self.sprite.addChild(self.xAxisSp)
                self.yAxisSp = new Canvax.Display.Sprite(), self.sprite.addChild(self.yAxisSp)

                //x轴方向的线集合
                var arr = self.xAxis.data;
                for (var a = 0, al = arr.length; a < al; a++) {
                    var o = arr[a];
                    var line = new Line({
                        id: "back_line_" + a,
                        context: {
                            xStart: 0,
                            yStart: o.y,
                            xEnd: 0,//self.w,
                            yEnd: o.y,
                            lineType: self.xAxis.lineType,
                            lineWidth: self.xAxis.lineWidth,
                            strokeStyle: self.xAxis.strokeStyle
                        }
                    });

                    //todo:line的context不能保留额外的值
                    line.zStart=_depth;
                    line.zEnd=_depth;

                    if (self.xAxis.enabled) {
                        _.isFunction(self.xAxis.filter) && self.xAxis.filter({
                            layoutData: self.yAxis.data,
                            index: a,
                            line: line
                        });
                        self.xAxisSp.addChild(line);

                        if (false && this.animation && !this.resize) {
                            line.animate({
                                xStart: 0,
                                xEnd: self.w
                            }, {
                                duration: 500,
                                //easing : 'Back.Out',//Tween.Easing.Elastic.InOut
                                delay: (al - a) * 80,
                                id: line.id
                            });
                        } else {
                            line.context.xStart = 0;
                            line.context.xEnd = self.w;
                        }

                        //绘制Z轴的线条
                        var line = new Line({
                            id: "back_line_" + a,
                            context: {
                                xStart: 0,
                                yStart: o.y,
                                xEnd: 0,//self.w,
                                yEnd: o.y,
                                lineType: self.xAxis.lineType,
                                lineWidth: self.xAxis.lineWidth,
                                strokeStyle: self.xAxis.strokeStyle
                            }
                        });
                        line.zStart=0;
                        line.zEnd=_depth;
                        self.xAxisSp.addChild(line);

                    }

                }
                ;

                //y轴方向的线集合
                var arr = self.yAxis.data
                for (var a = 0, al = arr.length; a < al; a++) {
                    var o = arr[a]
                    var line = new Line({
                        context: {
                            xStart: o.x,
                            yStart: 0,
                            xEnd: o.x,
                            yEnd: -self.h,
                            lineType: self.yAxis.lineType,
                            lineWidth: self.yAxis.lineWidth,
                            strokeStyle: self.yAxis.strokeStyle,
                            visible: o.x ? true : false
                        }
                    })

                    line.zStart=_depth;
                    line.zEnd=_depth;

                    if (self.yAxis.enabled) {
                        _.isFunction(self.yAxis.filter) && self.yAxis.filter({
                            layoutData: self.xAxis.data,
                            index: a,
                            line: line
                        });
                        self.yAxisSp.addChild(line);

                        //绘制Z轴的线条
                        var line = new Line({
                            context: {
                                xStart: o.x,
                                yStart: 0,
                                xEnd: o.x,
                                yEnd: 0,
                                lineType: self.yAxis.lineType,
                                lineWidth: self.yAxis.lineWidth,
                                strokeStyle: self.yAxis.strokeStyle,
                                visible: o.x ? true : false
                            }
                        })

                        line.zStart=0;
                        line.zEnd=_depth;

                        self.yAxisSp.addChild(line);
                    }
                }
                ;

                //原点开始的y轴线
                var xAxisOrg = (self.yAxis.org == null ? 0 : _.find(self.yAxis.data, function (obj) {
                    return obj.content == self.yAxis.org
                }).x );

                //self.yAxis.org = xAxisOrg;
                var line = new Line({
                    context: {
                        xStart: xAxisOrg,
                        yStart: 0,
                        xEnd: xAxisOrg,
                        yEnd: -self.h,
                        lineWidth: self.yOrigin.lineWidth,
                        strokeStyle: self.yOrigin.strokeStyle
                    }
                });
                line.zStart=0;
                line.zEnd=0;

                if (self.yOrigin.enabled)
                    self.sprite.addChild(line)

                if (self.yOrigin.biaxial) {
                    var lineR = new Line({
                        context: {
                            xStart: self.w,
                            yStart: 0,
                            xEnd: self.w,
                            yEnd: -self.h,
                            lineWidth: self.yOrigin.lineWidth,
                            strokeStyle: self.yOrigin.strokeStyle
                        }
                    })
                    lineR.zStart=0;
                    lineR.zEnd=0;
                    if (self.yOrigin.enabled)
                        self.sprite.addChild(lineR)

                }

                //原点开始的x轴线
                var yAxisOrg = (self.xAxis.org == null ? 0 : _.find(self.xAxis.data, function (obj) {
                    return obj.content == self.xAxis.org
                }).y );

                //self.xAxis.org = yAxisOrg;
                var line = new Line({
                    context: {
                        yStart: yAxisOrg,
                        xEnd: self.w,
                        yEnd: yAxisOrg,
                        lineWidth: self.xOrigin.lineWidth,
                        strokeStyle: self.xOrigin.strokeStyle
                    }
                })
                line.zStart=0;
                line.zEnd=0;
                if (self.xOrigin.enabled)
                    self.sprite.addChild(line)
            }

        };

        return Back;
    });