KISSY.add("dvix/chart/radar/back",function(a,b,c,d){var e=function(a){this.width=0,this.height=0,this.pos={x:0,y:0},this.r=0,this.yDataSection=[],this.xDataSection=[],this.strokeStyle="#999999",this.lineWidth=1,this.sprite=null,this.init(a)};return e.prototype={init:function(a){_.deepExtend(this,a),this.sprite=new b.Display.Sprite({id:"back"})},draw:function(a){_.deepExtend(this,a),this._layout(),this._widget()},_layout:function(){this.sprite.context.x=this.pos.x,this.sprite.context.y=this.pos.y},_widget:function(){for(var a=parseInt(Math.asin(Math.PI/180*45)*this.r),b=0,e=this.yDataSection.length;e>b;b++){var f=new c({id:"isogon_"+b,context:{x:a,y:a,r:this.r/e*(b+1),n:this.xDataSection.length,strokeStyle:this.strokeStyle,lineWidth:this.lineWidth}});this.sprite.addChild(f)}for(var g=this.sprite.children[this.sprite.children.length-1].context.pointList,h=0,i=g.length;i>h;h++){var j=new d({id:"line_"+h,context:{xStart:a,yStart:a,xEnd:g[h][0]+a,yEnd:g[h][1]+a,lineWidth:this.lineWidth,strokeStyle:this.strokeStyle}});this.sprite.addChild(j)}}},e},{requires:["canvax/","canvax/shape/Isogon","canvax/shape/Line","dvix/utils/deep-extend"]});