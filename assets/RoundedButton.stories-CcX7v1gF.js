import{j as o}from"./jsx-runtime-CR8kToUD.js";import{p as r}from"./index-BHSVxysL.js";import"./index-D_eiCwOZ.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="3cfdf4c6-133a-4a07-99fe-404325aae34a",e._sentryDebugIdIdentifier="sentry-dbid-3cfdf4c6-133a-4a07-99fe-404325aae34a")}catch{}const p=({Icon:e,label:t,...f})=>o.jsx("button",{className:"rounded-button__button","aria-label":`${t} icon`,...f,children:o.jsx(e,{})});p.propTypes={Icon:r.func,props:r.object,label:r.string};const b=()=>o.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:o.jsx("path",{d:"M12 5v14M5 12h14",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),h=()=>o.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:o.jsx("path",{d:"M18 6L6 18M6 6l12 12",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),C={title:"System UI/RoundedButton",component:p,tags:["autodocs"],argTypes:{label:{control:"text",description:"Accessible label for the button"}}},n={args:{Icon:b,label:"Add item",onClick:()=>alert("Clicked!")}},s={args:{Icon:h,label:"Close",onClick:()=>alert("Closed!")}};var a,l,c;n.parameters={...n.parameters,docs:{...(a=n.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    Icon: PlusIcon,
    label: 'Add item',
    onClick: () => alert('Clicked!')
  }
}`,...(c=(l=n.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var d,i,u;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    Icon: CloseIcon,
    label: 'Close',
    onClick: () => alert('Closed!')
  }
}`,...(u=(i=s.parameters)==null?void 0:i.docs)==null?void 0:u.source}}};const x=["WithPlusIcon","WithCloseIcon"];export{s as WithCloseIcon,n as WithPlusIcon,x as __namedExportsOrder,C as default};
