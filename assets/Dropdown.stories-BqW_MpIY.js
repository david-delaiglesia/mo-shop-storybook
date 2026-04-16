import{j as d}from"./jsx-runtime-CR8kToUD.js";import{w as T}from"./ClickOutHandler-DdM9KlaA.js";import{p as a}from"./index-BHSVxysL.js";import"./index-D_eiCwOZ.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},o=new e.Error().stack;o&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[o]="797b8434-2116-4fa6-a2cd-29b8158b1ec4",e._sentryDebugIdIdentifier="sentry-dbid-797b8434-2116-4fa6-a2cd-29b8158b1ec4")}catch{}const x=T,E="dropdown__content",l=({header:e,content:o,open:D,toggleDropdown:_,datatest:S,ariaLabel:O,disabled:P})=>d.jsxs("div",{className:"drop-down","data-testid":S,children:[d.jsx("button",{type:"button",className:"drop-down__trigger","aria-haspopup":!0,onClick:_,"data-testid":"dropdown-button","aria-label":O,disabled:P,children:e}),D&&d.jsx("div",{className:E,"data-testid":"dropdown-content",children:o})]});l.defaultProps={datatest:"drop-down"};l.propTypes={content:a.node.isRequired,header:a.node.isRequired,open:a.bool.isRequired,toggleDropdown:a.func.isRequired,datatest:a.string,ariaLabel:a.string,disabled:a.bool};x(l);const I=[{value:"turismo",label:"Turismo"},{value:"furgoneta",label:"Furgoneta"},{value:"camion",label:"Camión"},{value:"moto",label:"Motocicleta"}],k={title:"Components / Dropdown",component:l,tags:["autodocs"],parameters:{layout:"padded"},args:{label:"Tipo de vehículo",placeholder:"Selecciona una opción",options:I}},s={},n={args:{value:"turismo"}},t={args:{disabled:!0}},r={args:{label:"País",options:[{value:"es",label:"España"},{value:"pt",label:"Portugal"},{value:"fr",label:"Francia"},{value:"it",label:"Italia"},{value:"de",label:"Alemania"},{value:"uk",label:"Reino Unido"},{value:"nl",label:"Países Bajos"}]}};var i,u,c;s.parameters={...s.parameters,docs:{...(i=s.parameters)==null?void 0:i.docs,source:{originalSource:"{}",...(c=(u=s.parameters)==null?void 0:u.docs)==null?void 0:c.source}}};var p,b,m;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    value: 'turismo'
  }
}`,...(m=(b=n.parameters)==null?void 0:b.docs)==null?void 0:m.source}}};var g,f,v;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...(v=(f=t.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var w,y,h;r.parameters={...r.parameters,docs:{...(w=r.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(h=(y=r.parameters)==null?void 0:y.docs)==null?void 0:h.source}}};const q=["Default","WithSelection","Disabled","ManyOptions"];export{s as Default,t as Disabled,r as ManyOptions,n as WithSelection,q as __namedExportsOrder,k as default};
