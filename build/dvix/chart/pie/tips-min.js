define("dvix/chart/pie/tips",["canvax/","canvax/shape/Line","canvax/shape/Circle","dvix/components/tips/tip","dvix/utils/deep-extend"],function(a,b,c,d){var e=function(a,b,c){this.sprite=null,this._tip=null,this.init(a,b,c)};return e.prototype={init:function(b,c,e){_.deepExtend(this,b),this.sprite=new a.Display.Sprite({id:"tips"}),this._tip=new d(b,e)},show:function(a){this._getTipsPoint(a);this.sprite.addChild(this._tip.sprite),this._tip.show(a)},move:function(a){this._resetPosition(a),this._tip.move(a)},hide:function(a){this.sprite.removeAllChildren(),this._tip.hide(a)},_getTipsPoint:function(a){return a.target.localToGlobal(a.info.nodesInfoList[a.info.iGroup])},_resetPosition:function(a){this._getTipsPoint(a)}},e});