KISSY.add('dvix/chart/scat/index', function (S, Chart, Tools, DataSection, EventType, xAxis, yAxis, Back, Graphs, Tips) {
    /*
     *@node chart在dom里的目标容器节点。
    */
    var Canvax = Chart.Canvax;
    return Chart.extend({
        init: function () {
            this.dataFrame = null;    //数据集合，由_initData 初始化
            //数据集合，由_initData 初始化
            this._xAxis = null;
            this._yAxis = null;
            this._back = null;
            this._graphs = null;
            this._tips = null;
            this.stageTip = new Canvax.Display.Sprite({ id: 'tip' });
            this.core = new Canvax.Display.Sprite({ id: 'core' });
            this.stageBg = new Canvax.Display.Sprite({ id: 'bg' });
            this.stage.addChild(this.stageBg);
            this.stage.addChild(this.core);
            this.stage.addChild(this.stageTip);
        },
        draw: function (data, opt) {
            if (opt.rotate) {
                this.rotate(opt.rotate);
            }
            this.dataFrame = this._initData(data, opt);    //初始化数据
            //初始化数据
            this._initModule(opt, this.dataFrame);    //初始化模块  
            //初始化模块  
            this._startDraw();    //开始绘图
            //开始绘图
            this._drawEnd();    //绘制结束，添加到舞台
            //绘制结束，添加到舞台
            this._arguments = arguments;    //下面这个是全局调用测试的时候用的
                                            //window.hoho = this;
        },
        //下面这个是全局调用测试的时候用的
        //window.hoho = this;
        clear: function () {
            this.stageBg.removeAllChildren();
            this.core.removeAllChildren();
            this.stageTip.removeAllChildren();
        },
        reset: function (data, opt) {
            this.clear();
            this.width = parseInt(this.element.width());
            this.height = parseInt(this.element.height());
            this.draw(data, opt);
        },
        _initModule: function (opt, data) {
            this._xAxis = new xAxis(opt.xAxis, data.xAxis);
            this._yAxis = new yAxis(opt.yAxis, data.yAxis);
            this._back = new Back(opt.back);
            this._graphs = new Graphs(opt.graphs);
            this._tips = new Tips(opt.tips);
        },
        _startDraw: function () {
            //首先
            var x = 0;
            var y = this.height - this._xAxis.h    //绘制yAxis
;
            //绘制yAxis
            this._yAxis.draw({
                pos: {
                    x: 0,
                    y: y
                },
                yMaxHeight: y
            });
            x = this._yAxis.w    //绘制x轴
;
            //绘制x轴
            this._xAxis.draw({
                w: this.width - x,
                max: { left: -x },
                pos: {
                    x: x,
                    y: y
                }
            });    //绘制背景网格
            //绘制背景网格
            this._back.draw({
                w: this.width - x,
                h: y,
                xAxis: { data: this._yAxis.data },
                yAxis: { data: this._xAxis.data },
                pos: {
                    x: x + this._xAxis.disOriginX,
                    y: y
                }
            });    //绘制主图形区域
            //绘制主图形区域
            this._graphs.draw(this._trimGraphs(), {
                w: this._xAxis.xGraphsWidth,
                h: this._yAxis.yGraphsHeight,
                pos: {
                    x: x + this._xAxis.disOriginX,
                    y: y
                }
            });    //执行生长动画
            //执行生长动画
            this._graphs.grow();
        },
        _trimGraphs: function () {
            var xArr = this._xAxis.dataOrg;
            var yArr = this._yAxis.dataOrg;    /**
             *下面三行代码，为了在用户的xAxis.field 和 yAxis.field 数量不同的情况下
             *自动扔掉多余的field数，保证每个点都有x，y坐标值
             *这样的情况是散点图和 折线 柱状图 的x 轴不一样的地方
             */
            /**
             *下面三行代码，为了在用户的xAxis.field 和 yAxis.field 数量不同的情况下
             *自动扔掉多余的field数，保证每个点都有x，y坐标值
             *这样的情况是散点图和 折线 柱状图 的x 轴不一样的地方
             */
            var fields = Math.min(yArr.length, xArr.length);
            xArr.length = fields;
            yArr.length = fields;
            var xDis = this._xAxis.xDis;
            var maxYAxis = this._yAxis.dataSection[this._yAxis.dataSection.length - 1];
            var maxXAxis = this._xAxis.dataSection[this._xAxis.dataSection.length - 1];
            var tmpData = [];
            for (var i = 0, il = yArr.length; i < il; i++) {
                !tmpData[i] && (tmpData[i] = []);
                for (var ii = 0, iil = yArr[i].length; ii < iil; ii++) {
                    var y = -(yArr[i][ii] - this._yAxis._baseNumber) / (maxYAxis - this._yAxis._baseNumber) * this._yAxis.yGraphsHeight;
                    var x = (xArr[i][ii] - this._xAxis._baseNumber) / (maxXAxis - this._xAxis._baseNumber) * this._xAxis.w;
                    tmpData[i][ii] = {
                        value: {
                            x: xArr[i][ii],
                            y: yArr[i][ii]
                        },
                        x: x,
                        y: y
                    };
                }
            }
            return tmpData;
        },
        _drawEnd: function () {
            this.stageBg.addChild(this._back.sprite);
            this.core.addChild(this._xAxis.sprite);
            this.core.addChild(this._graphs.sprite);
            this.core.addChild(this._yAxis.sprite);
            this.stageTip.addChild(this._tips.sprite);
        }
    });
}, {
    requires: [
        'dvix/chart/',
        'dvix/utils/tools',
        'dvix/utils/datasection',
        'dvix/event/eventtype',
        './xAxis',
        'dvix/components/yaxis/yAxis',
        'dvix/components/back/Back',
        './Graphs',
        'dvix/components/tips/Tips'
    ]
});