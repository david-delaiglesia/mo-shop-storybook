import{j as o}from"./jsx-runtime-CR8kToUD.js";import{P as s}from"./index-BHSVxysL.js";import{I as T,b as z}from"./index-B1i_q6HS.js";import{w as k}from"./ClickOutHandler-DdM9KlaA.js";import{u as E}from"./useTranslation-D0JavZPN.js";import"./index-D_eiCwOZ.js";import"./index-PmWe_g6L.js";import"./context-CjL-ExTd.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},r=new e.Error().stack;r&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[r]="feb7028b-96a5-4516-85c5-f8703f70379c",e._sentryDebugIdIdentifier="sentry-dbid-feb7028b-96a5-4516-85c5-f8703f70379c")}catch{}const l=({title:e,close:r,buttonText:d,message:P,buttonClick:C,arrowPosition:j})=>{const{t:D}=E();return o.jsxs("div",{className:`pop-over pop-over--${j}`,children:[o.jsx("h3",{className:"pop-over__title subhead1-b",children:e}),o.jsx("button",{className:"pop-over__close","aria-label":D("alerts_close"),onClick:r,children:o.jsx(T,{icon:"close"})}),o.jsx("p",{className:"pop-over__message subhead1-r",children:P}),d&&o.jsx(z.Button,{"aria-label":"botón tooltip",className:"pop-over__button",onClick:C,fullWidth:!0,size:"small",variant:"primary",children:d})]})};l.propTypes={title:s.string.isRequired,buttonText:s.string,arrowPosition:s.string,message:s.string.isRequired,buttonClick:s.func,close:s.func};l.defaultProps={arrowPosition:"right"};k(l);const x=()=>{},W={title:"Components / PopOver",component:l,tags:["autodocs"],parameters:{layout:"centered"},args:{title:"Detalles del envío",message:"Los envíos se realizan de lunes a sábado en horario de 9:00 a 21:00.",arrowPosition:"right",close:x}},a={},t={args:{arrowPosition:"left",title:"Aviso",message:"Este producto tiene disponibilidad limitada."}},i={args:{title:"Cambiar dirección",message:"Tu dirección actual no tiene cobertura de entrega.",buttonText:"Cambiar",buttonClick:x}},n={args:{title:"Política de devoluciones",message:"Dispones de 30 días desde la recepción del pedido para realizar devoluciones. Los productos deben estar en su embalaje original y sin abrir. El reembolso se realizará en el mismo método de pago utilizado."}};var c,p,u;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:"{}",...(u=(p=a.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var m,b,g;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    arrowPosition: 'left',
    title: 'Aviso',
    message: 'Este producto tiene disponibilidad limitada.'
  }
}`,...(g=(b=t.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var f,h,v;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    title: 'Cambiar dirección',
    message: 'Tu dirección actual no tiene cobertura de entrega.',
    buttonText: 'Cambiar',
    buttonClick: noop
  }
}`,...(v=(h=i.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};var y,_,w;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    title: 'Política de devoluciones',
    message: 'Dispones de 30 días desde la recepción del pedido para realizar devoluciones. Los productos deben estar en su embalaje original y sin abrir. El reembolso se realizará en el mismo método de pago utilizado.'
  }
}`,...(w=(_=n.parameters)==null?void 0:_.docs)==null?void 0:w.source}}};const q=["Default","ArrowLeft","WithButton","LongMessage"];export{t as ArrowLeft,a as Default,n as LongMessage,i as WithButton,q as __namedExportsOrder,W as default};
