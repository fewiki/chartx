define("chartx/chart/map/tips",["canvax/index","canvax/shape/Circle","chartx/components/tips/tip","canvax/shape/Polygon","canvax/animation/Tween"],function(a,b,c,d,e){var f=function(a,b,c){this.sprite=null,this._triangle=null,this._tip=null,this.prefix=[],this._mapScale=1,this.cPointStyle="white",this._nearestPoint=null,this._thirdPoint=null,this._tween=null,this.init(a,b,c)};return f.prototype={init:function(b,d,e){_.deepExtend(this,b),this.sprite=new a.Display.Sprite({id:"map-tips"}),b=_.deepExtend({_getDefaultContent:function(a){var b="<table>",c=this;return b+="<tr style='color:#333'><td colspan='2'>"+a.area.value+"</td></tr>",_.each(a.nodesInfoList,function(a,d){b+="<tr style='color:#333'>";var e=c.prefix[d];e||(e=a.field),b+="<td>"+e+"\uff1a</td>",b+="<td>"+a.value+"</td></tr>"}),b+="</table>"}},b),this._tip=new c(_.deepExtend({alpha:1,fillStyle:"#ffffff",strokeStyle:"#b0b0b0",offset:0},b),e)},show:function(a,b){this._cPoint&&this._cPoint.remove(),this.sprite.addChild(this._tip.sprite),this._tip.show(a),this._weight(a),this._tip.sprite.toFront(),this.sprite.toFront(),this._triangle.context.globalAlpha=.7},move:function(a){this._tip.move(a)},hide:function(a){this._tip.hide(a),this._cPoint&&this._cPoint.remove(),this._triangle&&(this._triangle.context.globalAlpha=0)},_weight:function(a){function c(){p=requestAnimationFrame(c),e.update()}var f=this._tip.backR,g=a.currentTarget.localToGlobal(),h=[a.currentTarget.mapData.textX*this._mapScale+g.x,a.currentTarget.mapData.textY*this._mapScale+g.y];this._cPoint=new b({context:{x:h[0],y:h[1],r:2,fillStyle:this.cPointStyle}}),this.sprite.addChild(this._cPoint);var i="left";h[0]<560*this._mapScale/2&&(i="right");var j=80,k=[h[0]+Math.cos(-Math.PI*("left"==i?3:2)/5)*j,h[1]+Math.sin(-Math.PI*("left"==i?3:2)/5)*j];k[1]<0&&(k[1]=2);var l=this._tip.dW,m=this._tip.dH,n=[k[0]+("left"==i?-l:l),k[1]+m];if(this._thirdPoint&&this._nearestPoint){var o=this,p=null;o._tween&&o._tween.stop();var q=function(){o._tween=new e.Tween({n0:o._nearestPoint[0],n1:o._nearestPoint[1]}).to({n0:k[0],n1:k[1]},500).easing(e.Easing.Exponential.Out).onUpdate(function(){o._nearestPoint[0]=this.n0,o._nearestPoint[1]=this.n1,o._thirdPoint[0]=this.n0+("left"==i?-l:l),o._thirdPoint[1]=this.n1+m;var a=o._nearestPoint,b=o._thirdPoint;o._triangle.context.pointList=[h,[a[0],a[1]+f],[b[0]+("left"==i?f:-f),b[1]]];var c=o.sprite.localToGlobal({x:"left"==i?o._thirdPoint[0]:o._nearestPoint[0],y:o._nearestPoint[1]});o._tip.setPosition({pos:c})}).onComplete(function(){cancelAnimationFrame(p),o._tween=null}).start(),c()};q()}else{var r=k,s=n;this._triangle=new d({context:{pointList:[h,[r[0],r[1]+f],[s[0]+("left"==i?f:-f),s[1]]],fillStyle:"white",globalAlpha:.7}}),this.sprite.addChild(this._triangle),this._thirdPoint=n,this._nearestPoint=k;var t=this.sprite.localToGlobal({x:"left"==i?n[0]:k[0],y:k[1]});this._tip.setPosition({pos:t})}}},f});