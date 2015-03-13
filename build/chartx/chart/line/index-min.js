define("chartx/chart/line/index",["chartx/chart/index","chartx/utils/tools","chartx/utils/datasection","./xaxis","chartx/components/yaxis/yAxis","chartx/components/back/Back","chartx/components/anchor/Anchor","chartx/components/line/Graphs","./tips","chartx/utils/dataformat"],function(a,b,c,d,e,f,g,h,i,j){var k=a.Canvax;return a.extend({init:function(a,b,c){this.event={enabled:0,This:this,on:this._click},this._xAxis=null,this._yAxis=null,this._anchor=null,this._back=null,this._graphs=null,this._tips=null,_.deepExtend(this,c),this.dataFrame=this._initData(b,this)},draw:function(){this.stageTip=new k.Display.Sprite({id:"tip"}),this.core=new k.Display.Sprite({id:"core"}),this.stageBg=new k.Display.Sprite({id:"bg"}),this.stage.addChild(this.stageBg),this.stage.addChild(this.core),this.stage.addChild(this.stageTip),this.rotate&&this._rotate(this.rotate),this._initModule(),this._startDraw(),this._drawEnd(),this._arguments=arguments},_initData:j,_initModule:function(){this._xAxis=new d(this.xAxis,this.dataFrame.xAxis),this._yAxis=new e(this.yAxis,this.dataFrame.yAxis),this._back=new f(this.back),this._anchor=new g(this.anchor),this._graphs=new h(this.graphs,this),this._tips=new i(this.tips,this.dataFrame,this.canvax.getDomContainer())},_startDraw:function(){var a=0,b=this.height-this._xAxis.h;this._yAxis.draw({pos:{x:a,y:b},yMaxHeight:b});var c=this._yAxis.w;if(a=c,this._xAxis.draw({w:this.width-c,max:{left:-c},pos:{x:a,y:b}}),this._back.draw({w:this.width-c,h:b,xAxis:{data:this._yAxis.data},yAxis:{data:this._xAxis.layoutData},pos:{x:a+this._xAxis.disOriginX,y:b}}),this._anchor.enabled){var d=this._getPosAtGraphs(this._anchor.xIndex,this._anchor.num);this._anchor.draw({w:this.width,h:b,pos:{x:d.x,y:b+d.y}}),this._anchor.setX(a+this._xAxis.disOriginX)}this._graphs.draw({w:this._xAxis.xGraphsWidth,h:this._yAxis.yGraphsHeight,data:this._trimGraphs(),disX:this._getGraphsDisX(),smooth:this.smooth,event:{enabled:this.event.enabled}}),this._graphs.setX(a+this._xAxis.disOriginX),this._graphs.setY(b),this._graphs.grow();var e=this;this._graphs.sprite.on("hold mouseover",function(a){e._tips.enabled&&(e._setXaxisYaxisToTipsInfo(a),e._tips.show(a))}),this._graphs.sprite.on("drag mousemove",function(a){e._tips.enabled&&(e._setXaxisYaxisToTipsInfo(a),e._tips.move(a))}),this._graphs.sprite.on("release mouseout",function(a){e._tips.enabled&&e._tips.hide(a)})},_setXaxisYaxisToTipsInfo:function(a){a.tipsInfo.xAxis={field:this.dataFrame.xAxis.field,value:this.dataFrame.xAxis.org[0][a.tipsInfo.iNode]};var b=this;_.each(a.tipsInfo.nodesInfoList,function(a,c){a.field=b.dataFrame.yAxis.field[c]})},_trimGraphs:function(){for(var a=this._yAxis.dataSection[this._yAxis.dataSection.length-1],b=this.dataFrame.xAxis.org[0].length,c=this.dataFrame.yAxis.org,d=[],e=0,f=c.length;f>e;e++)for(var g=0,h=c[e].length;h>g;g++){d[e]?"":d[e]=[];var i=g/(b-1)*this._xAxis.xGraphsWidth;1==b&&1==c[e].length&&(i=this._xAxis.xGraphsWidth/2);var j=-(c[e][g]-this._yAxis._baseNumber)/(a-this._yAxis._baseNumber)*this._yAxis.yGraphsHeight;j=isNaN(j)?0:j,d[e][g]={value:c[e][g],x:i,y:j}}return d},_getPosAtGraphs:function(a,b){var c=this._yAxis.dataSection[this._yAxis.dataSection.length-1],d=this.dataFrame.xAxis.org[0].length,e=a/(d-1)*this._xAxis.xGraphsWidth,f=-(b-this._yAxis._baseNumber)/(c-this._yAxis._baseNumber)*this._yAxis.yGraphsHeight;return{x:e,y:f}},_getGraphsDisX:function(){var a=this._xAxis.xGraphsWidth/(this.dataFrame.xAxis.org[0].length-1);return 1==this.dataFrame.xAxis.org[0].length&&(a=0),a},_drawEnd:function(){this.stageBg.addChild(this._back.sprite),this.stageBg.addChild(this._anchor.sprite),this.core.addChild(this._xAxis.sprite),this.core.addChild(this._graphs.sprite),this.core.addChild(this._yAxis.sprite),this.stageTip.addChild(this._tips.sprite)},_click:function(a){this.This;this.on(a)}})});