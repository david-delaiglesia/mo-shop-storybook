import{j as s}from"./jsx-runtime-CR8kToUD.js";import{r as f}from"./index-D_eiCwOZ.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},l=new e.Error().stack;l&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[l]="f670e69c-12b1-49d8-964b-4a1828a4f805",e._sentryDebugIdIdentifier="sentry-dbid-f670e69c-12b1-49d8-964b-4a1828a4f805")}catch{}const T=({label:e="Select",options:l=[],placeholder:E="Select an option",disabled:d=!1,value:k,onChange:c})=>{var b;const[n,u]=f.useState(!1),[p,O]=f.useState(k||""),m=(b=l.find(a=>a.value===p))==null?void 0:b.label,N=a=>{O(a),u(!1),c==null||c(a)};return s.jsxs("div",{className:"drop-down",children:[e&&s.jsx("label",{style:{fontSize:12,color:"#888",marginBottom:4,display:"block"},children:e}),s.jsxs("button",{type:"button",className:"drop-down__trigger",onClick:()=>!d&&u(!n),disabled:d,"aria-haspopup":!0,"aria-expanded":n,children:[s.jsx("span",{style:{color:m?"#333":"#999"},children:m||E}),s.jsx("span",{style:{transform:n?"rotate(180deg)":"none",transition:"transform 0.2s",fontSize:10},children:"▼"})]}),n&&s.jsx("div",{className:"dropdown__content",children:l.map(a=>s.jsx("div",{className:`dropdown-item${a.value===p?" dropdown-item--selected":""}`,onClick:()=>N(a.value),children:a.label},a.value))})]})},M=[{value:"turismo",label:"Turismo"},{value:"furgoneta",label:"Furgoneta"},{value:"camion",label:"Camión"},{value:"moto",label:"Motocicleta"}],F={title:"Components / Dropdown",component:T,tags:["autodocs"],parameters:{layout:"padded"},args:{label:"Tipo de vehículo",placeholder:"Selecciona una opción",options:M}},o={},r={args:{value:"turismo"}},t={args:{disabled:!0}},i={args:{label:"País",options:[{value:"es",label:"España"},{value:"pt",label:"Portugal"},{value:"fr",label:"Francia"},{value:"it",label:"Italia"},{value:"de",label:"Alemania"},{value:"uk",label:"Reino Unido"},{value:"nl",label:"Países Bajos"}]}};var v,g,y;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:"{}",...(y=(g=o.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var S,x,h;r.parameters={...r.parameters,docs:{...(S=r.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    value: 'turismo'
  }
}`,...(h=(x=r.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var w,j,_;t.parameters={...t.parameters,docs:{...(w=t.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...(_=(j=t.parameters)==null?void 0:j.docs)==null?void 0:_.source}}};var D,I,P;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    label: 'País',
    options: [{
      value: 'es',
      label: 'España'
    }, {
      value: 'pt',
      label: 'Portugal'
    }, {
      value: 'fr',
      label: 'Francia'
    }, {
      value: 'it',
      label: 'Italia'
    }, {
      value: 'de',
      label: 'Alemania'
    }, {
      value: 'uk',
      label: 'Reino Unido'
    }, {
      value: 'nl',
      label: 'Países Bajos'
    }]
  }
}`,...(P=(I=i.parameters)==null?void 0:I.docs)==null?void 0:P.source}}};const R=["Default","WithSelection","Disabled","ManyOptions"];export{o as Default,t as Disabled,i as ManyOptions,r as WithSelection,R as __namedExportsOrder,F as default};
