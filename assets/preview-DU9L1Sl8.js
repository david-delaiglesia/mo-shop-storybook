import{d as j}from"./index-TpcTfkuV.js";try{let r=typeof E<"u"?E:typeof I<"u"?I:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},e=new r.Error().stack;e&&(r._sentryDebugIds=r._sentryDebugIds||{},r._sentryDebugIds[e]="32b32015-60a1-47b3-aef2-0912f122046b",r._sentryDebugIdIdentifier="sentry-dbid-32b32015-60a1-47b3-aef2-0912f122046b")}catch{}const{useEffect:A,useMemo:_}=__STORYBOOK_MODULE_PREVIEW_API__,{global:I}=__STORYBOOK_MODULE_GLOBAL__,{logger:X}=__STORYBOOK_MODULE_CLIENT_LOGGER__;var p="backgrounds",U={light:{name:"light",value:"#F8F8F8"},dark:{name:"dark",value:"#333"}},{document:b,window:E}=I,F=()=>{var r;return!!((r=E==null?void 0:E.matchMedia("(prefers-reduced-motion: reduce)"))!=null&&r.matches)},B=r=>{(Array.isArray(r)?r:[r]).forEach(N)},N=r=>{var n;let e=b.getElementById(r);e&&((n=e.parentElement)==null||n.removeChild(e))},Y=(r,e)=>{let n=b.getElementById(r);if(n)n.innerHTML!==e&&(n.innerHTML=e);else{let d=b.createElement("style");d.setAttribute("id",r),d.innerHTML=e,b.head.appendChild(d)}},H=(r,e,n)=>{var a;let d=b.getElementById(r);if(d)d.innerHTML!==e&&(d.innerHTML=e);else{let t=b.createElement("style");t.setAttribute("id",r),t.innerHTML=e;let i=`addon-backgrounds-grid${n?`-docs-${n}`:""}`,o=b.getElementById(i);o?(a=o.parentElement)==null||a.insertBefore(t,o):b.head.appendChild(t)}},W={cellSize:100,cellAmount:10,opacity:.8},G="addon-backgrounds",R="addon-backgrounds-grid",q=F()?"":"transition: background-color 0.3s;",J=(r,e)=>{let{globals:n,parameters:d,viewMode:a,id:t}=e,{options:i=U,disable:o,grid:s=W}=d[p]||{},u=n[p]||{},c=u.value,l=c?i[c]:void 0,$=(l==null?void 0:l.value)||"transparent",m=u.grid||!1,y=!!l&&!o,f=a==="docs"?`#anchor--${t} .docs-story`:".sb-show-main",h=a==="docs"?`#anchor--${t} .docs-story`:".sb-show-main",K=d.layout===void 0||d.layout==="padded",L=a==="docs"?20:K?16:0,{cellAmount:k,cellSize:g,opacity:x,offsetX:v=L,offsetY:S=L}=s,T=a==="docs"?`${G}-docs-${t}`:`${G}-color`,w=a==="docs"?t:null;A(()=>{let O=`
    ${f} {
      background: ${$} !important;
      ${q}
      }`;if(!y){B(T);return}H(T,O,w)},[f,T,w,y,$]);let M=a==="docs"?`${R}-docs-${t}`:`${R}`;return A(()=>{if(!m){B(M);return}let O=[`${g*k}px ${g*k}px`,`${g*k}px ${g*k}px`,`${g}px ${g}px`,`${g}px ${g}px`].join(", "),P=`
        ${h} {
          background-size: ${O} !important;
          background-position: ${v}px ${S}px, ${v}px ${S}px, ${v}px ${S}px, ${v}px ${S}px !important;
          background-blend-mode: difference !important;
          background-image: linear-gradient(rgba(130, 130, 130, ${x}) 1px, transparent 1px),
           linear-gradient(90deg, rgba(130, 130, 130, ${x}) 1px, transparent 1px),
           linear-gradient(rgba(130, 130, 130, ${x/2}) 1px, transparent 1px),
           linear-gradient(90deg, rgba(130, 130, 130, ${x/2}) 1px, transparent 1px) !important;
        }
      `;Y(M,P)},[k,g,h,M,m,v,S,x]),r()},Q=(r,e=[],n)=>{if(r==="transparent")return"transparent";if(e.find(a=>a.value===r)||r)return r;let d=e.find(a=>a.name===n);if(d)return d.value;if(n){let a=e.map(t=>t.name).join(", ");X.warn(j`
        Backgrounds Addon: could not find the default color "${n}".
        These are the available colors for your story based on your configuration:
        ${a}.
      `)}return"transparent"},Z=(r,e)=>{var c;let{globals:n,parameters:d}=e,a=(c=n[p])==null?void 0:c.value,t=d[p],i=_(()=>t.disable?"transparent":Q(a,t.values,t.default),[t,a]),o=_(()=>i&&i!=="transparent",[i]),s=e.viewMode==="docs"?`#anchor--${e.id} .docs-story`:".sb-show-main",u=_(()=>`
      ${s} {
        background: ${i} !important;
        ${F()?"":"transition: background-color 0.3s;"}
      }
    `,[i,s]);return A(()=>{let l=e.viewMode==="docs"?`addon-backgrounds-docs-${e.id}`:"addon-backgrounds-color";if(!o){B(l);return}H(l,u,e.viewMode==="docs"?e.id:null)},[o,u,e]),r()},V=(r,e)=>{var y;let{globals:n,parameters:d}=e,a=d[p].grid,t=((y=n[p])==null?void 0:y.grid)===!0&&a.disable!==!0,{cellAmount:i,cellSize:o,opacity:s}=a,u=e.viewMode==="docs",c=d.layout===void 0||d.layout==="padded"?16:0,l=a.offsetX??(u?20:c),$=a.offsetY??(u?20:c),m=_(()=>{let f=e.viewMode==="docs"?`#anchor--${e.id} .docs-story`:".sb-show-main",h=[`${o*i}px ${o*i}px`,`${o*i}px ${o*i}px`,`${o}px ${o}px`,`${o}px ${o}px`].join(", ");return`
      ${f} {
        background-size: ${h} !important;
        background-position: ${l}px ${$}px, ${l}px ${$}px, ${l}px ${$}px, ${l}px ${$}px !important;
        background-blend-mode: difference !important;
        background-image: linear-gradient(rgba(130, 130, 130, ${s}) 1px, transparent 1px),
         linear-gradient(90deg, rgba(130, 130, 130, ${s}) 1px, transparent 1px),
         linear-gradient(rgba(130, 130, 130, ${s/2}) 1px, transparent 1px),
         linear-gradient(90deg, rgba(130, 130, 130, ${s/2}) 1px, transparent 1px) !important;
      }
    `},[o]);return A(()=>{let f=e.viewMode==="docs"?`addon-backgrounds-grid-docs-${e.id}`:"addon-backgrounds-grid";if(!t){B(f);return}Y(f,m)},[t,m,e]),r()},C,ae=(C=globalThis.FEATURES)!=null&&C.backgroundsStoryGlobals?[J]:[V,Z],D,de={[p]:{grid:{cellSize:20,opacity:.5,cellAmount:5},disable:!1,...!((D=globalThis.FEATURES)!=null&&D.backgroundsStoryGlobals)&&{values:Object.values(U)}}},ee={[p]:{value:void 0,grid:!1}},z,te=(z=globalThis.FEATURES)!=null&&z.backgroundsStoryGlobals?ee:{[p]:null};export{ae as decorators,te as initialGlobals,de as parameters};
