import{j as o}from"./jsx-runtime-CR8kToUD.js";import{P as r}from"./index-BHSVxysL.js";import{b as P}from"./index-BZNHOSKP.js";import{I as T}from"./index-DUXFFBFE.js";import{w as z}from"./ClickOutHandler-DdM9KlaA.js";import{u as L}from"./useTranslation-jnQkdB0s.js";import"./index-D_eiCwOZ.js";import"./index-PmWe_g6L.js";import"./context-BkADXMS_.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},s=new e.Error().stack;s&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[s]="77a3e585-1e29-4b7c-9fab-f24e6833d268",e._sentryDebugIdIdentifier="sentry-dbid-77a3e585-1e29-4b7c-9fab-f24e6833d268")}catch{}const l=({title:e,close:s,buttonText:d,message:x,buttonClick:w,arrowPosition:D})=>{const{t:E}=L();return o.jsxs("div",{className:`pop-over pop-over--${D}`,children:[o.jsx("h3",{className:"pop-over__title subhead1-b",children:e}),o.jsx("button",{className:"pop-over__close","aria-label":E("alerts_close"),onClick:s,children:o.jsx(T,{icon:"close"})}),o.jsx("p",{className:"pop-over__message subhead1-r",children:x}),d&&o.jsx(P.Button,{"aria-label":"botón tooltip",className:"pop-over__button",onClick:w,fullWidth:!0,size:"small",variant:"primary",children:d})]})};l.propTypes={title:r.string.isRequired,buttonText:r.string,arrowPosition:r.string,message:r.string.isRequired,buttonClick:r.func,close:r.func};l.defaultProps={arrowPosition:"right"};z(l);const V={title:"Components / PopOver",component:l,tags:["autodocs"],parameters:{layout:"centered"},args:{triggerLabel:"Más información",title:"Detalles del envío",content:"Los envíos se realizan de lunes a sábado en horario de 9:00 a 21:00.",placement:"bottom"}},t={},a={args:{placement:"top",triggerLabel:"Ver arriba",title:"Aviso",content:"Este producto tiene disponibilidad limitada."}},n={args:{title:void 0,content:"Entrega estimada: 24-48 horas."}},i={args:{title:"Política de devoluciones",content:"Dispones de 30 días desde la recepción del pedido para realizar devoluciones. Los productos deben estar en su embalaje original y sin abrir. El reembolso se realizará en el mismo método de pago utilizado."}};var c,p,m;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:"{}",...(m=(p=t.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var u,b,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    placement: 'top',
    triggerLabel: 'Ver arriba',
    title: 'Aviso',
    content: 'Este producto tiene disponibilidad limitada.'
  }
}`,...(g=(b=a.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var f,v,h;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    title: undefined,
    content: 'Entrega estimada: 24-48 horas.'
  }
}`,...(h=(v=n.parameters)==null?void 0:v.docs)==null?void 0:h.source}}};var y,_,j;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    title: 'Política de devoluciones',
    content: 'Dispones de 30 días desde la recepción del pedido para realizar devoluciones. Los productos deben estar en su embalaje original y sin abrir. El reembolso se realizará en el mismo método de pago utilizado.'
  }
}`,...(j=(_=i.parameters)==null?void 0:_.docs)==null?void 0:j.source}}};const B=["Default","Top","NoTitle","LongContent"];export{t as Default,i as LongContent,n as NoTitle,a as Top,B as __namedExportsOrder,V as default};
