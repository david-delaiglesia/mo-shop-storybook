try{let e=typeof window<"u"?window:typeof o<"u"?o:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="31d31892-2cc3-4d22-9dac-fa1196bcdccc",e._sentryDebugIdIdentifier="sentry-dbid-31d31892-2cc3-4d22-9dac-fa1196bcdccc")}catch{}const{STORY_CHANGED:a}=__STORYBOOK_MODULE_CORE_EVENTS__,{addons:c}=__STORYBOOK_MODULE_PREVIEW_API__,{global:o}=__STORYBOOK_MODULE_GLOBAL__;var _="storybook/highlight",r="storybookHighlight",g=`${_}/add`,y=`${_}/reset`,{document:l}=o,I=(e="#FF4785",t="dashed")=>`
  outline: 2px ${t} ${e};
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(255,255,255,0.6);
`,i=c.getChannel(),O=e=>{let t=r;s();let d=Array.from(new Set(e.elements)),n=l.createElement("style");n.setAttribute("id",t),n.innerHTML=d.map(h=>`${h}{
          ${I(e.color,e.style)}
         }`).join(" "),l.head.appendChild(n)},s=()=>{var d;let e=r,t=l.getElementById(e);t&&((d=t.parentNode)==null||d.removeChild(t))};i.on(a,s);i.on(y,s);i.on(g,O);
