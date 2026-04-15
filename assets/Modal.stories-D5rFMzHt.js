import{j as a}from"./jsx-runtime-CR8kToUD.js";import{r as f,R as t}from"./index-D_eiCwOZ.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},n=new e.Error().stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="0293168a-5dad-45d9-9fc1-2c2fcf91bcc1",e._sentryDebugIdIdentifier="sentry-dbid-0293168a-5dad-45d9-9fc1-2c2fcf91bcc1")}catch{}const S=({open:e=!0,title:n="Modal title",description:u,children:g,primaryLabel:s,secondaryLabel:l,onPrimary:k,onSecondary:N,onClose:r})=>{const p=f.useCallback(m=>{m.key==="Escape"&&(r==null||r())},[r]);return f.useEffect(()=>{if(e)return document.addEventListener("keydown",p),()=>document.removeEventListener("keydown",p)},[e,p]),e?a.jsx("div",{className:"modal-overlay",onClick:r,children:a.jsxs("div",{className:"modal-dialog",onClick:m=>m.stopPropagation(),role:"dialog","aria-modal":!0,children:[a.jsxs("div",{className:"modal-dialog__header",children:[a.jsx("h2",{className:"modal-dialog__title",children:n}),a.jsx("button",{className:"modal-dialog__close",onClick:r,"aria-label":"Close",children:"✕"})]}),u&&a.jsx("p",{className:"modal-dialog__description",children:u}),g&&a.jsx("div",{className:"modal-dialog__body",children:g}),(s||l)&&a.jsxs("div",{className:"modal-dialog__footer",children:[l&&a.jsx("button",{className:"modal-dialog__btn modal-dialog__btn--secondary",onClick:N,children:l}),s&&a.jsx("button",{className:"modal-dialog__btn modal-dialog__btn--primary",onClick:k,children:s})]})]})}):null},q={title:"Components / Modal",component:S,tags:["autodocs"],parameters:{layout:"fullscreen"},args:{open:!0,title:"Confirmar acción",description:"¿Estás seguro de que quieres continuar con esta operación?",primaryLabel:"Confirmar",secondaryLabel:"Cancelar"}},o={},d={args:{title:"Dirección de entrega",description:"Introduce tu dirección para la entrega a domicilio.",primaryLabel:"Guardar",secondaryLabel:"Cancelar",children:t.createElement("div",{style:{display:"flex",flexDirection:"column",gap:12}},t.createElement("input",{placeholder:"Calle y número",style:{padding:"10px 12px",border:"1px solid #ccc",borderRadius:8,fontSize:14}}),t.createElement("input",{placeholder:"Código postal",style:{padding:"10px 12px",border:"1px solid #ccc",borderRadius:8,fontSize:14}}),t.createElement("input",{placeholder:"Ciudad",style:{padding:"10px 12px",border:"1px solid #ccc",borderRadius:8,fontSize:14}}))}},i={args:{title:"Información",description:"Tu pedido ha sido procesado correctamente.",primaryLabel:"Aceptar",secondaryLabel:void 0}},c={args:{title:"Eliminar producto",description:"¿Estás seguro de que quieres eliminar este producto de tu lista? Esta acción no se puede deshacer.",primaryLabel:"Eliminar",secondaryLabel:"Cancelar"}};var b,y,x;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:"{}",...(x=(y=o.parameters)==null?void 0:y.docs)==null?void 0:x.source}}};var h,_,E;d.parameters={...d.parameters,docs:{...(h=d.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    title: 'Dirección de entrega',
    description: 'Introduce tu dirección para la entrega a domicilio.',
    primaryLabel: 'Guardar',
    secondaryLabel: 'Cancelar',
    children: React.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 12
      }
    }, React.createElement('input', {
      placeholder: 'Calle y número',
      style: {
        padding: '10px 12px',
        border: '1px solid #ccc',
        borderRadius: 8,
        fontSize: 14
      }
    }), React.createElement('input', {
      placeholder: 'Código postal',
      style: {
        padding: '10px 12px',
        border: '1px solid #ccc',
        borderRadius: 8,
        fontSize: 14
      }
    }), React.createElement('input', {
      placeholder: 'Ciudad',
      style: {
        padding: '10px 12px',
        border: '1px solid #ccc',
        borderRadius: 8,
        fontSize: 14
      }
    }))
  }
}`,...(E=(_=d.parameters)==null?void 0:_.docs)==null?void 0:E.source}}};var C,D,R;i.parameters={...i.parameters,docs:{...(C=i.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    title: 'Información',
    description: 'Tu pedido ha sido procesado correctamente.',
    primaryLabel: 'Aceptar',
    secondaryLabel: undefined
  }
}`,...(R=(D=i.parameters)==null?void 0:D.docs)==null?void 0:R.source}}};var j,v,L;c.parameters={...c.parameters,docs:{...(j=c.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    title: 'Eliminar producto',
    description: '¿Estás seguro de que quieres eliminar este producto de tu lista? Esta acción no se puede deshacer.',
    primaryLabel: 'Eliminar',
    secondaryLabel: 'Cancelar'
  }
}`,...(L=(v=c.parameters)==null?void 0:v.docs)==null?void 0:L.source}}};const z=["Default","WithContent","TitleOnly","Danger"];export{c as Danger,o as Default,i as TitleOnly,d as WithContent,z as __namedExportsOrder,q as default};
