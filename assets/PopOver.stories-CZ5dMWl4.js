import{j as o}from"./jsx-runtime-CR8kToUD.js";import{P as s}from"./index-BHSVxysL.js";import{b as T}from"./index-BZNHOSKP.js";import{I as z}from"./index-DUXFFBFE.js";import{w as k}from"./ClickOutHandler-DdM9KlaA.js";import{u as E}from"./useTranslation-jnQkdB0s.js";import"./index-D_eiCwOZ.js";import"./index-PmWe_g6L.js";import"./context-BkADXMS_.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},r=new e.Error().stack;r&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[r]="b81c6fda-d36c-4292-945e-9b7caab36b45",e._sentryDebugIdIdentifier="sentry-dbid-b81c6fda-d36c-4292-945e-9b7caab36b45")}catch{}const d=({title:e,close:r,buttonText:l,message:P,buttonClick:C,arrowPosition:j})=>{const{t:D}=E();return o.jsxs("div",{className:`pop-over pop-over--${j}`,children:[o.jsx("h3",{className:"pop-over__title subhead1-b",children:e}),o.jsx("button",{className:"pop-over__close","aria-label":D("alerts_close"),onClick:r,children:o.jsx(z,{icon:"close"})}),o.jsx("p",{className:"pop-over__message subhead1-r",children:P}),l&&o.jsx(T.Button,{"aria-label":"botón tooltip",className:"pop-over__button",onClick:C,fullWidth:!0,size:"small",variant:"primary",children:l})]})};d.propTypes={title:s.string.isRequired,buttonText:s.string,arrowPosition:s.string,message:s.string.isRequired,buttonClick:s.func,close:s.func};d.defaultProps={arrowPosition:"right"};k(d);const x=()=>{},q={title:"Components / PopOver",component:d,tags:["autodocs"],parameters:{layout:"centered"},args:{title:"Detalles del envío",message:"Los envíos se realizan de lunes a sábado en horario de 9:00 a 21:00.",arrowPosition:"right",close:x}},a={},t={args:{arrowPosition:"left",title:"Aviso",message:"Este producto tiene disponibilidad limitada."}},i={args:{title:"Cambiar dirección",message:"Tu dirección actual no tiene cobertura de entrega.",buttonText:"Cambiar",buttonClick:x}},n={args:{title:"Política de devoluciones",message:"Dispones de 30 días desde la recepción del pedido para realizar devoluciones. Los productos deben estar en su embalaje original y sin abrir. El reembolso se realizará en el mismo método de pago utilizado."}};var c,p,m;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:"{}",...(m=(p=a.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var u,b,g;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(w=(_=n.parameters)==null?void 0:_.docs)==null?void 0:w.source}}};const M=["Default","ArrowLeft","WithButton","LongMessage"];export{t as ArrowLeft,a as Default,n as LongMessage,i as WithButton,M as __namedExportsOrder,q as default};
