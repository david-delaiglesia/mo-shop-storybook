import{j as r}from"./jsx-runtime-CR8kToUD.js";import"./index-D_eiCwOZ.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},a=new e.Error().stack;a&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[a]="4b755a14-fcb7-4672-b617-2023870b129c",e._sentryDebugIdIdentifier="sentry-dbid-4b755a14-fcb7-4672-b617-2023870b129c")}catch{}const j={success:"✓",error:"✗",info:"ℹ",warning:"⚠"},C=({message:e="Operation completed.",variant:a="success",actionLabel:d,onAction:w,onClose:x,showClose:N=!0})=>r.jsxs("div",{className:`snackbar snackbar--${a}`,role:"alert",children:[r.jsx("span",{className:"snackbar__icon",children:j[a]}),r.jsx("span",{className:"snackbar__message",children:e}),d&&r.jsx("button",{className:"snackbar__action",onClick:w,children:d}),N&&r.jsx("button",{className:"snackbar__close",onClick:x,"aria-label":"Close",children:"✕"})]}),T={title:"Components / SnackBar",component:C,tags:["autodocs"],parameters:{layout:"padded"},args:{message:"Producto añadido al carrito correctamente.",variant:"success",showClose:!0}},s={},o={args:{message:"No se pudo completar la operación. Inténtalo de nuevo.",variant:"error"}},n={args:{message:"Tu pedido está siendo preparado.",variant:"info"}},c={args:{message:"Quedan pocas unidades de este producto.",variant:"warning"}},t={args:{message:"Producto eliminado del carrito.",variant:"info",actionLabel:"Deshacer"}};var i,p,u;s.parameters={...s.parameters,docs:{...(i=s.parameters)==null?void 0:i.docs,source:{originalSource:"{}",...(u=(p=s.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var l,m,g;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    message: 'No se pudo completar la operación. Inténtalo de nuevo.',
    variant: 'error'
  }
}`,...(g=(m=o.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var b,f,_;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    message: 'Tu pedido está siendo preparado.',
    variant: 'info'
  }
}`,...(_=(f=n.parameters)==null?void 0:f.docs)==null?void 0:_.source}}};var h,k,v;c.parameters={...c.parameters,docs:{...(h=c.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    message: 'Quedan pocas unidades de este producto.',
    variant: 'warning'
  }
}`,...(v=(k=c.parameters)==null?void 0:k.docs)==null?void 0:v.source}}};var y,I,S;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    message: 'Producto eliminado del carrito.',
    variant: 'info',
    actionLabel: 'Deshacer'
  }
}`,...(S=(I=t.parameters)==null?void 0:I.docs)==null?void 0:S.source}}};const W=["Success","Error","Info","Warning","WithAction"];export{o as Error,n as Info,s as Success,c as Warning,t as WithAction,W as __namedExportsOrder,T as default};
