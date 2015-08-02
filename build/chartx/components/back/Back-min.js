define("chartx/components/back/Back",["canvax/index","canvax/shape/Line","chartx/utils/tools"],function(a,b,c){var d=function(a){this.w=0,this.h=0,this.pos={x:0,y:0},this.enabled=1,this.xOrigin={enabled:1,lineWidth:2,strokeStyle:"#0088cf"},this.yOrigin={enabled:1,lineWidth:2,strokeStyle:"#0088cf",biaxial:!1},this.xAxis={enabled:1,data:[],org:null,lineType:"solid",lineWidth:1,strokeStyle:"#f5f5f5",filter:null},this.yAxis={enabled:0,data:[],org:null,lineType:"solid",lineWidth:1,strokeStyle:"#f5f5f5",filter:null},this.sprite=null,this.xAxisSp=null,this.yAxisSp=null,this.init(a)};return d.prototype={init:function(b){_.deepExtend(this,b),this.sprite=new a.Display.Sprite},setX:function(a){this.sprite.context.x=a},setY:function(a){this.sprite.context.y=a},draw:function(a){_.deepExtend(this,a),this._widget(),this.setX(this.pos.x),this.setY(this.pos.y)},update:function(a){this.sprite.removeAllChildren(),this.draw(a)},_widget:function(){var c=this;if(this.enabled){c.xAxisSp=new a.Display.Sprite,c.sprite.addChild(c.xAxisSp),c.yAxisSp=new a.Display.Sprite,c.sprite.addChild(c.yAxisSp);for(var d=c.xAxis.data,e=0,f=d.length;f>e;e++){var g=d[e],h=new b({context:{xStart:0,yStart:g.y,xEnd:c.w,yEnd:g.y,lineType:c.xAxis.lineType,lineWidth:c.xAxis.lineWidth,strokeStyle:c.xAxis.strokeStyle}});c.xAxis.enabled&&(_.isFunction(c.xAxis.filter)&&c.xAxis.filter({layoutData:c.yAxis.data,index:e,line:h}),c.xAxisSp.addChild(h))}for(var d=c.yAxis.data,e=0,f=d.length;f>e;e++){var g=d[e],h=new b({context:{xStart:g.x,yStart:0,xEnd:g.x,yEnd:-c.h,lineType:c.yAxis.lineType,lineWidth:c.yAxis.lineWidth,strokeStyle:c.yAxis.strokeStyle,visible:g.x?!0:!1}});c.yAxis.enabled&&(_.isFunction(c.yAxis.filter)&&c.yAxis.filter({layoutData:c.xAxis.data,index:e,line:h}),c.yAxisSp.addChild(h))}var i=null==c.yAxis.org?0:_.find(c.yAxis.data,function(a){return a.content==c.yAxis.org}).x,h=new b({context:{xStart:i,xEnd:i,yEnd:-c.h,lineWidth:c.yOrigin.lineWidth,strokeStyle:c.yOrigin.strokeStyle}});if(c.yOrigin.enabled&&c.sprite.addChild(h),c.yOrigin.biaxial){var j=new b({context:{xStart:c.w,xEnd:c.w,yEnd:-c.h,lineWidth:c.yOrigin.lineWidth,strokeStyle:c.yOrigin.strokeStyle}});c.yOrigin.enabled&&c.sprite.addChild(j)}var k=null==c.xAxis.org?0:_.find(c.xAxis.data,function(a){return a.content==c.xAxis.org}).y,h=new b({context:{yStart:k,xEnd:c.w,yEnd:k,lineWidth:c.xOrigin.lineWidth,strokeStyle:c.xOrigin.strokeStyle}});c.xOrigin.enabled&&c.sprite.addChild(h)}}},d});