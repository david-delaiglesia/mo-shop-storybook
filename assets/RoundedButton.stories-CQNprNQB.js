import{j as o}from"./jsx-runtime-CR8kToUD.js";import{p as r}from"./index-BHSVxysL.js";import"./index-D_eiCwOZ.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="d2d66da9-22fa-444e-97e9-9d26b59d0445",e._sentryDebugIdIdentifier="sentry-dbid-d2d66da9-22fa-444e-97e9-9d26b59d0445")}catch{}const p=({Icon:e,label:t,...b})=>o.jsx("button",{className:"rounded-button__button","aria-label":`${t} icon`,...b,children:o.jsx(e,{})});p.propTypes={Icon:r.func,props:r.object,label:r.string};const h=()=>o.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:o.jsx("path",{d:"M12 5v14M5 12h14",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),g=()=>o.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:o.jsx("path",{d:"M18 6L6 18M6 6l12 12",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),C={title:"System UI/RoundedButton",component:p,tags:["autodocs"],argTypes:{label:{control:"text",description:"Accessible label for the button"}}},n={args:{Icon:h,label:"Add item",onClick:()=>alert("Clicked!")}},s={args:{Icon:g,label:"Close",onClick:()=>alert("Closed!")}};var l,d,a;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    Icon: PlusIcon,
    label: 'Add item',
    onClick: () => alert('Clicked!')
  }
}`,...(a=(d=n.parameters)==null?void 0:d.docs)==null?void 0:a.source}}};var c,i,u;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    Icon: CloseIcon,
    label: 'Close',
    onClick: () => alert('Closed!')
  }
}`,...(u=(i=s.parameters)==null?void 0:i.docs)==null?void 0:u.source}}};const x=["WithPlusIcon","WithCloseIcon"];export{s as WithCloseIcon,n as WithPlusIcon,x as __namedExportsOrder,C as default};
