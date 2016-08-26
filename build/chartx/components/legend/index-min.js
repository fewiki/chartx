define("chartx/components/legend/index",["canvax/index","canvax/shape/Circle","chartx/components/tips/tip"],function(a,b,c){var d=function(a,b){this.data=a||[],this.width=0,this.height=0,this.tag={height:20},this.enabled=!1,this.icon={r:5,lineWidth:1,fillStyle:"#999"},this.tips={enabled:!1},this.onChecked=function(){},this.onUnChecked=function(){},this._labelColor="#999",this.layoutType="h",this.sprite=null,this.init(b)};return d.prototype={init:function(b){b&&_.deepExtend(this,b),this.sprite=new a.Display.Sprite({id:"LegendSprite"}),this.draw()},pos:function(a){a.x&&(this.sprite.context.x=a.x),a.y&&(this.sprite.context.y=a.y)},draw:function(a,b,c){this.enabled&&this._widget()},_showTips:function(b){if(this._hideTimer&&clearTimeout(this._hideTimer),this._hideTimer=null,!this._legendTip){this._legendTip=new a.Display.Sprite({id:"legend_tip"});var d=this.sprite.getStage();d.addChild(this._legendTip),this._tips=new c(this.tips,d.parent.getDomContainer()),this._tips._getDefaultContent=function(a){return a.field},this._legendTip.addChild(this._tips.sprite)}this._tips.show(b)},_hide:function(a){var b=this;this._hideTimer=setTimeout(function(){b._tips.hide()},300)},label:function(a){return a.field+"："+a.value},setStyle:function(a,b){var c=this;_.each(this.data,function(d,e){if(d.field==a&&b.fillStyle){d.fillStyle=b.fillStyle;var f=c.sprite.getChildById("lenend_field_"+e).getChildById("lenend_field_icon_"+e);f.context.fillStyle=b.fillStyle}})},getStyle:function(a){var b=null;return _.each(this.data,function(c,d){c.field==a&&(b=c)}),b},_widget:function(){var c=this,d=0,e=0;_.each(this.data,function(f,g){void 0==f.activate||f.activate?f.activate=!0:f.activate=!1;var h=new b({id:"lenend_field_icon_"+g,context:{x:0,y:c.tag.height/2,fillStyle:f.activate?"#ccc":f.fillStyle||c._labelColor,r:c.icon.r,cursor:"pointer"}});h.hover(function(a){c._showTips(c._getInfoHandler(a,f))},function(a){c._hide(a)}),h.on("mousemove",function(a){c._showTips(c._getInfoHandler(a,f))}),h.on("click",function(){});var i=c.label(f),j=new a.Display.Text(i,{id:"lenend_field_txt_"+g,context:{x:c.icon.r+3,y:c.tag.height/2,textAlign:"left",textBaseline:"middle",fillStyle:"#333",cursor:"pointer"}});j.hover(function(a){c._showTips(c._getInfoHandler(a,f))},function(a){c._hide(a)}),j.on("mousemove",function(a){c._showTips(c._getInfoHandler(a,f))}),j.on("click",function(){});var k=j.getTextWidth(),l=k+2*c.icon.r+20,m={height:c.tag.height};"v"==c.layoutType?(e+=c.tag.height,m.y=e,d=Math.max(d,l)):(e=c.tag.height,m.x=d,d+=l);var n=new a.Display.Sprite({id:"lenend_field_"+g,context:m});n.addChild(h),n.addChild(j),n.context.width=l,c.sprite.addChild(n),n.on("click",function(a){1==_.filter(c.data,function(a){return a.activate}).length&&f.activate||(h.context.fillStyle=f.activate?"#ccc":f.fillStyle||c._labelColor,f.activate=!f.activate,f.activate?c.onChecked(f.field):c.onUnChecked(f.field))})}),c.width=c.sprite.context.width=d,c.height=c.sprite.context.height=e},_getInfoHandler:function(a,b){return a.eventInfo={field:b.field,fillStyle:b.fillStyle},b.value&&(a.eventInfo.value=b.value),a}},d});