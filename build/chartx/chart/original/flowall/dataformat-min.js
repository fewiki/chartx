define("chartx/chart/original/flowall/dataformat",[],function(){return function(a,b){var c={org:a,maxLinks:0,nodes:{},edges:{}},d=a.shift();return _.each(a,function(a,b){var e={};if(_.each(d,function(b,c){e[b]=a[c]}),c.nodes[e.node]=e,e.link){var f=_.keys(e.link).length;f>c.maxLinks&&(c.maxLinks=f,c.maxLinkSNode=e),c.maxLinks=Math.max(c.maxLinks,_.keys(e.link).length),_.each(e.link,function(a,b){var d=e.node+"_"+b,f={value:a};c.edges[d]=f})}}),_.each(c.edges,function(a,b){a.from=c.nodes[b.split(/[_-]/)[0]],a.to=c.nodes[b.split(/[_-]/)[1]],a.to.flowin=a.value}),c}});