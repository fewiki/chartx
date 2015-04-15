define("chartx/components/line/Graphs",["canvax/index","canvax/shape/Rect","chartx/utils/tools","canvax/animation/Tween","chartx/components/line/Group"],function(a,b,c,d,e){var f=function(a,b){this.w=0,this.h=0,this.y=0,this.opt=a,this.root=b,this.ctx=b.stage.context2D,this.data=[],this.disX=0,this.groups=[],this.iGroup=0,this.iNode=-1,this.sprite=null,this.induce=null,this.event={enabled:0},this.init(a)};return f.prototype={init:function(b){this.opt=b,this.sprite=new a.Display.Sprite},setX:function(a){this.sprite.context.x=a},setY:function(a){this.sprite.context.y=a},getX:function(){return this.sprite.context.x},getY:function(){return this.sprite.context.y},draw:function(a){_.deepExtend(this,a),this._widget(a)},grow:function(){_.each(this.groups,function(a){a._grow()})},add:function(a,b){var c=this;_.deepExtend(this,a);var d=new e(b,c.opt,c.ctx);d.draw({data:c.data[b]}),c.sprite.addChildAt(d.sprite,b),c.groups.splice(b,0,d),_.each(this.groups,function(a,b){a._groupInd=b,a.update({data:c.data[b]})})},remove:function(a){var b=this.groups.splice(a,1)[0];b.destroy()},update:function(a){_.deepExtend(this,a);var b=this;_.each(this.groups,function(a,c){a.update({data:b.data[c]})})},_widget:function(){for(var a=this,c=0,d=a.data.length;d>c;c++){var f=new e(c,a.opt,a.ctx);f.draw({data:a.data[c]}),a.sprite.addChild(f.sprite),a.groups.push(f)}a.induce=new b({id:"induce",context:{y:-a.h,width:a.w,height:a.h,fillStyle:"#000000",globalAlpha:0,cursor:a.event.enabled?"pointer":""}}),a.sprite.addChild(a.induce),a.induce.on("hold mouseover",function(b){b.tipsInfo=a._getInfoHandler(b),a._fireHandler(b)}),a.induce.on("drag mousemove",function(b){b.tipsInfo=a._getInfoHandler(b),a._fireHandler(b)}),a.induce.on("release mouseout",function(b){b.tipsInfo=a._getInfoHandler(b),a._fireHandler(b),a.iGroup=0,a.iNode=-1}),a.induce.on("click",function(b){b.tipsInfo=a._getInfoHandler(b),a._fireHandler(b)})},_getInfoHandler:function(a){var b=a.point.x,d=a.point.y-this.h;b=b>this.w?this.w:b;for(var e=0==this.disX?0:parseInt((b+this.disX/2)/this.disX),f=[],g=c.getDisMinATArr(d,_.pluck(f,"y")),h=0,i=this.groups.length;i>h;h++){var j=this.groups[h].getNodeInfoAt(e);j&&f.push(j)}this.iGroup=g,this.iNode=e;var k={iGroup:this.iGroup,iNode:this.iNode,nodesInfoList:_.clone(f)};return k},_fireHandler:function(a){var b=this,c={eventType:a.type,iGroup:a.tipsInfo.iGroup+1,iNode:a.tipsInfo.iNode+1};_.isFunction(b.root.event.on)&&b.root.event.on(c)}},f});