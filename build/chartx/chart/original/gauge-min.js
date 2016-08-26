define("chartx/chart/original/gauge",["chartx/chart/index","chartx/utils/tools","chartx/utils/gradient-color","chartx/utils/datasection","chartx/chart/original/gauge/graphs","chartx/chart/original/gauge/xaxis","chartx/components/tips/tip","chartx/utils/dataformat"],function(a,b,c,d,e,f,g,h){var i=a.Canvax;return a.extend({xAxis:{},_graphs:null,_xAxis:null,init:function(a,b,c){this.padding.top=10,this.padding.bottom=5,c.dataZoom?(this.padding.bottom+=46,this.dataZoom={start:0,end:b.length-2}):this.padding.bottom=10,_.deepExtend(this,c),this.dataFrame=this._initData(b,c)},_setStages:function(){this.core=new i.Display.Sprite({id:"core"}),this.stageBg=new i.Display.Sprite({id:"bg"}),this.stage.addChild(this.stageBg),this.stage.addChild(this.core)},draw:function(){this._setStages(),this._initModule(),this._startDraw(),this._drawEnd(),this.dataZoom&&this._initDataZoom(),this.inited=!0},updateTitle:function(a){this._graphs.updateTitle({title:a.num,duration:a.duration})},_initData:function(a,b){var c=h.apply(this,arguments);return c},_initModule:function(){this._graphs=new e(this.graphs,this.canvax.getDomContainer())},_initDataZoom:function(){var a=this;require(["chartx/components/datazoom/index"],function(b){var c=a.width-a.padding.left-a.padding.right-4,d=2,e=_.deepExtend({w:c,h:30,color:"#00a8e6",pos:{x:d,y:a.height-a.padding.top-a.padding.bottom},dragIng:function(b){a._updateRange(b)},dragEnd:function(b){a.fire("datazoomRange",b)}},a.dataZoom);a._dataZoom=new b(e),a._updateRange(a._dataZoom.range),a.core.addChild(a._dataZoom.sprite),a.xAxis.width=c-1,a._xAxis=new f(a.xAxis),a._xAxis.draw({pos:{x:0,y:a._dataZoom.barY+a._dataZoom.barH}}),a._dataZoom.dataZoomBg.addChild(a._xAxis.sprite)})},_startDraw:function(a){var b=this,c=b.width-b.padding.left-b.padding.right,d=b.height-b.padding.top-b.padding.bottom,e=parseInt(c/2),f=d;b._graphs.draw({w:c-b.padding.bottom,h:d,pos:{x:e,y:f}});var g=parseInt((d-b._graphs.h)/2+b._graphs.maxR);b._graphs.setY(g)},_updateRange:function(a){var b=this,c=parseInt(a.start),d=parseInt(a.end);b._graphs.updateRange({scale:{start:c/b.dataZoom.count,end:d/b.dataZoom.count},subtitle:{start:c,end:d}})},_drawEnd:function(){this.core.context.y=this.padding.top,this.core.context.x=this.padding.left,this.core.addChild(this._graphs.sprite)}})});