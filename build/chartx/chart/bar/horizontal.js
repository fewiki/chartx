define("chartx/chart/bar/horizontal",["chartx/chart/index","chartx/utils/tools","chartx/utils/datasection","chartx/components/xaxis/xAxis_h","chartx/components/yaxis/yAxis_h","chartx/components/back/Back","./horizontal/graphs","chartx/utils/dataformat"],function(a,b,c,d,e,f,g,h){var i=a.Canvax;return a.extend({init:function(a,b,c){this._xAxis=null,this._yAxis=null,this._back=null,this._graphs=null,_.deepExtend(this,c),this.dataFrame=this._initData(b,this)},draw:function(){this.core=new i.Display.Sprite({id:"core"}),this.stageBg=new i.Display.Sprite({id:"bg"}),this.stage.addChild(this.stageBg),this.stage.addChild(this.core),this.rotate&&this._rotate(this.rotate),this._initModule(),this._startDraw(),this._drawEnd(),this._arguments=arguments},_initData:h,_initModule:function(){this._xAxis=new d(this.xAxis,this.dataFrame.xAxis),this._yAxis=new e(this.yAxis,this.dataFrame.yAxis),this._back=new f(this.back),this._graphs=new g(this.graphs,this.tips,this.canvax.getDomContainer(),this.dataFrame)},_startDraw:function(){var a=parseInt(this.height-this._xAxis.h);this._yAxis.draw({pos:{x:0,y:a},yMaxHeight:a});var b=this._yAxis.w;this._xAxis.draw({graphh:this.height,graphw:this.width,yAxisW:b}),this._xAxis.yAxisW!=b&&(this._yAxis.resetWidth(this._xAxis.yAxisW),b=this._xAxis.yAxisW),this._back.draw({w:this.width-b,h:a,xAxis:{data:[{}].concat(this._yAxis.data)},yAxis:{enabled:1,data:this._xAxis.layoutData},pos:{x:b,y:a}}),this._graphs.draw(this._trimGraphs(),{w:this._xAxis.xGraphsWidth,h:this._yAxis.yGraphsHeight,pos:{x:b,y:a},yDataSectionLen:this._xAxis.dataSection.length}),this._graphs.grow()},_trimGraphs:function(){var a=this._yAxis.data,b=this._xAxis.dataOrg,c=b.length,d=this._yAxis.yDis1,e=d/(c+1);this._graphs.checkBarW(e);for(var f=this._xAxis.dataSection[this._xAxis.dataSection.length-1],g=[],h=0,i=a.length;i>h;h++)for(var j=0;c>j;j++){!g[j]&&(g[j]=[]);var k=-b[j][h]/f*this._xAxis.xGraphsWidth,l=a[h].y-d/2+e*(j+1);g[j][h]={value:b[j][h],x:k,y:l}}return g},_drawEnd:function(){this.stageBg.addChild(this._back.sprite),this.core.addChild(this._xAxis.sprite),this.core.addChild(this._graphs.sprite),this.core.addChild(this._yAxis.sprite)}})});

define("chartx/chart/bar/horizontal/graphs",["canvax/index","canvax/shape/Rect","canvax/animation/Tween","chartx/components/tips/tip","chartx/utils/tools"],function(a,b,c,d,e){var f=function(a,b,c,e){this.dataFrame=e,this.w=0,this.h=0,this.pos={x:0,y:0},this._colors=["#42a8d7","#666666","#6f8cb2","#c77029","#f15f60","#ecb44f","#ae833a","#896149"],this.bar={width:12,radius:2},this.text={enabled:0,fillStyle:"#999999",fontSize:12,textAlign:"left",format:null},this.eventEnabled=!0,this.sprite=null,this.txtsSp=null,this.yDataSectionLen=0,_.deepExtend(this,a),this._tip=new d(b,c),this.init()};return f.prototype={init:function(){this.sprite=new a.Display.Sprite({id:"graphsEl"}),this.txtsSp=new a.Display.Sprite({id:"txtsSp",context:{visible:!1}})},setX:function(a){this.sprite.context.x=a},setY:function(a){this.sprite.context.y=a},_getColor:function(a,b,c,d){var e=null;return _.isString(a)&&(e=a),_.isArray(a)&&(e=a[c]),_.isFunction(a)&&(e=a({iGroup:c,iNode:b,value:d})),e&&""!=e||(e=this._colors[c]),e},checkBarW:function(a){this.bar.width>=a&&(this.bar.width=a-1>1?a-1:1)},draw:function(c,d){if(_.deepExtend(this,d),0!=c.length){this.data=c;for(var f=c[0].length,g=0;f>g;g++){for(var h=new a.Display.Sprite({id:"barGroup"+g}),i=new a.Display.Sprite({id:"barGroupHover"+g}),j=0,k=c.length;k>j;j++){var l=c[j][g],m=this._getColor(this.bar.fillStyle,g,j,l.value),n=parseInt(Math.abs(l.x)),o={x:0,y:Math.round(l.y-this.bar.width/2),width:n,height:parseInt(this.bar.width),fillStyle:m};if(this.bar.radius){var p=Math.min(this.bar.width/2,n);p=Math.min(p,this.bar.radius),o.radius=[p,p,0,0]}var q=new b({id:"bar_"+j+"_"+g,context:o}),r=new b({id:"bar_"+j+"_"+g+"hover",context:{x:0,y:Math.round(l.y-this.bar.width/2),width:this.w,height:parseInt(this.bar.width),fillStyle:"black",globalAlpha:0,cursor:"pointer"}});if(r.target=q,r.row=g,r.column=j,this.eventEnabled){var s=this;r.on("mouseover",function(a){var b=this.target.context;b.y--,b.height+=2,s.sprite.addChild(s._tip.sprite),s._tip.show(s._setTipsInfoHandler(a,this.row,this.column))}),r.on("mousemove",function(a){s._tip.move(s._setTipsInfoHandler(a,this.row,this.column))}),r.on("mouseout",function(a){var b=this.target.context;b.y++,b.height-=2,s._tip.hide(a),s.sprite.removeChild(s._tip.sprite)})}var t=l.value;t=_.isFunction(this.text.format)?this.text.format(t):e.numAddSymbol(t);var u=new a.Display.Text(t,{context:{x:n+2,y:l.y,fillStyle:this.text.fillStyle,fontSize:this.text.fontSize,textAlign:this.text.textAlign}});u.context.x+u.getTextWidth()>this.w&&(u.context.x=n-u.getTextWidth()-2),u.context.y=l.y-u.getTextHeight()/2,this.txtsSp.addChild(u),h.addChild(q),i.addChild(r)}this.sprite.addChild(h),this.sprite.addChild(i)}this.sprite.addChild(this.txtsSp),this.sprite.context.x=this.pos.x,this.sprite.context.y=this.pos.y}},grow:function(){function a(){d=requestAnimationFrame(a),c.update()}var b=this,d=null,e=function(){new c.Tween({h:0}).to({h:b.h},500).onUpdate(function(){b.sprite.context.scaleX=this.h/b.h}).onComplete(function(){b._growEnd(),cancelAnimationFrame(d)}).start();a()};e()},_growEnd:function(){this.text.enabled&&(this.txtsSp.context.visible=!0)},_setXaxisYaxisToTipsInfo:function(a){a.tipsInfo.xAxis={field:this.dataFrame.xAxis.field,value:this.dataFrame.xAxis.org[0][a.tipsInfo.iNode]};var b=this;_.each(a.tipsInfo.nodesInfoList,function(a,c){a.field=b.dataFrame.yAxis.field[c]})},_setTipsInfoHandler:function(a,b,c){return a.tipsInfo={iGroup:c,iNode:b,nodesInfoList:this._getNodeInfo(b)},this._setXaxisYaxisToTipsInfo(a),a},_getNodeInfo:function(a){var b=[],c=this;return _.each(this.data,function(d,e){var f=_.clone(d[a]);f.fillStyle=c._getColor(c.bar.fillStyle,a,e,f.value),b.push(f)}),b}},f});

define("chartx/chart/bar/horizontal/tips",["chartx/components/tips/tip"],function(){});

define("chartx/chart/bar/horizontal/xaxis",["chartx/components/xaxis/xAxis_h"],function(a){var b=function(a,c){this.xDis1=0,b.superclass.constructor.apply(this,arguments)};return Chartx.extend(b,a,{}),b});