try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},f=new e.Error().stack;f&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[f]="0e7eff94-f2b3-43eb-85f4-a42d1e8fb852",e._sentryDebugIdIdentifier="sentry-dbid-0e7eff94-f2b3-43eb-85f4-a42d1e8fb852")}catch{}function b(e){for(var f=[],d=1;d<arguments.length;d++)f[d-1]=arguments[d];var n=Array.from(typeof e=="string"?[e]:e);n[n.length-1]=n[n.length-1].replace(/\r?\n([\t ]*)$/,"");var u=n.reduce(function(t,s){var i=s.match(/\n([\t ]+|(?!\s).)/g);return i?t.concat(i.map(function(g){var r,a;return(a=(r=g.match(/[\t ]/g))===null||r===void 0?void 0:r.length)!==null&&a!==void 0?a:0})):t},[]);if(u.length){var l=new RegExp(`
[	 ]{`+Math.min.apply(Math,u)+"}","g");n=n.map(function(t){return t.replace(l,`
`)})}n[0]=n[0].replace(/^\r?\n/,"");var o=n[0];return f.forEach(function(t,s){var i=o.match(/(?:^|\n)( *)$/),g=i?i[1]:"",r=t;typeof t=="string"&&t.includes(`
`)&&(r=String(t).split(`
`).map(function(a,c){return c===0?a:""+g+a}).join(`
`)),o+=r+n[s+1]}),o}export{b as d};
