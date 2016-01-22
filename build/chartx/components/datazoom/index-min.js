define("chartx/components/datazoom/index",["canvax/index","canvax/shape/Rect","canvax/shape/Line"],function(a,b,c){var d=function(a){this.range={start:0,end:1},this.count=1,this.pos={x:0,y:0},this.w=0,this.height=46,this.color="#70aae8",this.bg={fillStyle:"#999",strokeStyle:"#999",lineWidth:0},this.dragIng=function(){},this.dragEnd=function(){},a&&_.deepExtend(this,a),this.barH=this.height-6,this.barY=3,this.btnW=8,this.btnFillStyle=this.color,this.btnLeft=null,this.btnRgiht=null,this.init()};return d.prototype={init:function(){var b=this;this.sprite=new a.Display.Sprite({id:"dataZoom",context:{x:this.pos.x,y:this.pos.y}}),this.dataZoomBg=new a.Display.Sprite({id:"dataZoomBg"}),this.dataZoomBtns=new a.Display.Sprite({id:"dataZoomBtns"}),this.sprite.addChild(this.dataZoomBg),this.sprite.addChild(this.dataZoomBtns),b.widget(),b._setLines()},widget:function(){var c=this,d=new b({context:{x:0,y:this.barY,width:this.w,height:this.barH,lineWidth:this.bg.lineWidth,strokeStyle:this.bg.strokeStyle,fillStyle:this.bg.fillStyle,globalAlpha:.05}});this.sprite.addChild(d),this.btnLeft=new b({id:"btnLeft",dragEnabled:!0,context:{x:this.range.start/this.count*this.w,y:this.barY+1,width:this.btnW,height:this.barH-1,fillStyle:this.btnFillStyle,cursor:"move"}}),this.btnLeft.on("draging",function(){this.context.y=c.barY+1,this.context.x<0&&(this.context.x=0),this.context.x>c.btnRight.context.x-c.btnW-2&&(this.context.x=c.btnRight.context.x-c.btnW-2),c.rangeRect.context.width=c.btnRight.context.x-this.context.x-c.btnW,c.rangeRect.context.x=this.context.x+c.btnW,c.setRange()}),this.btnLeft.on("dragend",function(){c.dragEnd(c.range)}),this.btnRight=new b({id:"btnRight",dragEnabled:!0,context:{x:this.range.end/this.count*this.w-this.btnW,y:this.barY+1,width:this.btnW,height:this.barH-1,fillStyle:this.btnFillStyle,cursor:"move"}}),this.btnRight.on("draging",function(){this.context.y=c.barY+1,this.context.x<c.btnLeft.context.x+c.btnW+2&&(this.context.x=c.btnLeft.context.x+c.btnW+2),this.context.x>c.w-c.btnW&&(this.context.x=c.w-c.btnW),c.rangeRect.context.width=this.context.x-c.btnLeft.context.x-c.btnW,c.setRange()}),this.btnRight.on("dragend",function(){c.dragEnd(c.range)}),this.rangeRect=new b({id:"btnCenter",dragEnabled:!0,context:{x:this.btnLeft.context.x+c.btnW,y:this.barY+1,width:this.btnRight.context.x-this.btnLeft.context.x-c.btnW,height:this.barH-1,fillStyle:this.btnFillStyle,globalAlpha:.3,cursor:"move"}}),this.rangeRect.on("draging",function(a){this.context.y=c.barY+1,this.context.x<c.btnW&&(this.context.x=c.btnW),this.context.x>c.w-this.context.width-c.btnW&&(this.context.x=c.w-this.context.width-c.btnW),c.btnLeft.context.x=this.context.x-c.btnW,c.btnRight.context.x=this.context.x+this.context.width,c.setRange()}),this.rangeRect.on("dragend",function(){c.dragEnd(c.range)}),this.linesLeft=new a.Display.Sprite({id:"linesLeft"}),this._addLines({sprite:this.linesLeft}),this.linesRight=new a.Display.Sprite({id:"linesRight"}),this._addLines({sprite:this.linesRight}),this.linesCenter=new a.Display.Sprite({id:"linesCenter"}),this._addLines({count:6,sprite:this.linesCenter}),this.dataZoomBtns.addChild(this.rangeRect),this.dataZoomBtns.addChild(this.linesCenter),this.dataZoomBtns.addChild(this.btnLeft),this.dataZoomBtns.addChild(this.btnRight),this.dataZoomBtns.addChild(this.linesLeft),this.dataZoomBtns.addChild(this.linesRight)},setRange:function(){var a=this.btnLeft.context.x/this.w*this.count,b=(this.btnRight.context.x+this.btnW)/this.w*this.count;(a!=this.range.start||b!=this.range.end)&&(this.range.start=a,this.range.end=b,this.dragIng(this.range),this._setLines())},_setLines:function(){var a=this,b=a.dataZoomBtns.getChildById("linesLeft"),c=a.dataZoomBtns.getChildById("linesRight"),d=a.dataZoomBtns.getChildById("linesCenter"),e=a.dataZoomBtns.getChildById("btnLeft"),f=a.dataZoomBtns.getChildById("btnRight"),g=a.dataZoomBtns.getChildById("btnCenter");b.context.x=e.context.x+(e.context.width-b.context.width)/2,b.context.y=e.context.y+(e.context.height-b.context.height)/2,c.context.x=f.context.x+(f.context.width-c.context.width)/2,c.context.y=f.context.y+(f.context.height-c.context.height)/2,d.context.x=g.context.x+(g.context.width-d.context.width)/2,d.context.y=g.context.y+(g.context.height-d.context.height)/2},_addLines:function(a){for(var b=this,c=a.count||2,d=a.sprite,e=a.dis||2,f=0,g=c;g>f;f++)d.addChild(b._addLine({x:f*e}));d.context.width=f*e-1,d.context.height=6},_addLine:function(a){var b=a||{},d=new c({id:b.id||"",context:{x:b.x||0,y:b.y||0,xEnd:b.xEnd||0,yEnd:b.yEnd||6,lineWidth:b.lineWidth||1,strokeStyle:b.strokeStyle||"#ffffff"}});return d}},d});