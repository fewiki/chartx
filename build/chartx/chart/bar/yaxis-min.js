define("chartx/chart/bar/yaxis",["chartx/components/yaxis/yAxis"],function(a){var b=function(a,c,d){b.superclass.constructor.apply(this,[a.bar?a.bar:a,c,d])};return Chartx.extend(b,a,{_setDataSection:function(a,b){var c=[];return _.each(a.org,function(a,b){for(var d=[],e=a[0].length,f=a.length,g=0,b=0;b<e;b++){for(var h=0,i=0;i<f;i++)h+=a[i][b],g=Math.min(a[i][b],g);d.push(h)}d.push(g),c.push(d)}),b||(b=[]),_.flatten(c).concat(b)}}),b});