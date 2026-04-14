import{j as i}from"./jsx-runtime-CR8kToUD.js";import{r as W}from"./index-D_eiCwOZ.js";try{let a=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},n=new a.Error().stack;n&&(a._sentryDebugIds=a._sentryDebugIds||{},a._sentryDebugIds[n]="41ee8ff3-85e2-48a9-8f1f-003169f42d0a",a._sentryDebugIdIdentifier="sentry-dbid-41ee8ff3-85e2-48a9-8f1f-003169f42d0a")}catch{}const X=({label:a,options:n=[],value:p,multiple:b=!1,onChange:c})=>{const[s,w]=W.useState(p?[p]:[]),I=e=>{let l;b?l=s.includes(e)?s.filter(T=>T!==e):[...s,e]:l=[e],w(l),c==null||c(b?l:l[0])};return i.jsxs("div",{className:"button-picker",role:"group",children:[a&&i.jsx("span",{className:"button-picker__label",children:a}),n.map(e=>i.jsx("button",{type:"button",className:`button-picker__option${s.includes(e.value)?" button-picker__option--selected":""}`,onClick:()=>I(e.value),disabled:e.disabled,"aria-pressed":s.includes(e.value),children:e.label},e.value))]})},z={title:"Components / ButtonPicker",component:X,tags:["autodocs"],parameters:{layout:"padded"},args:{label:"Formato de envío",options:[{value:"standard",label:"Estándar"},{value:"express",label:"Express"},{value:"same-day",label:"Mismo día"}]}},r={},t={args:{value:"express"}},o={args:{options:[{value:"standard",label:"Estándar"},{value:"express",label:"Express"},{value:"same-day",label:"Mismo día",disabled:!0}]}},u={args:{label:"Alergenos",multiple:!0,options:[{value:"gluten",label:"Gluten"},{value:"lactose",label:"Lactosa"},{value:"nuts",label:"Frutos secos"},{value:"soy",label:"Soja"},{value:"eggs",label:"Huevos"}]}},d={args:{label:"Talla",options:[{value:"xs",label:"XS"},{value:"s",label:"S"},{value:"m",label:"M"},{value:"l",label:"L"},{value:"xl",label:"XL"}],value:"m"}};var m,v,f;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:"{}",...(f=(v=r.parameters)==null?void 0:v.docs)==null?void 0:f.source}}};var g,x,y;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    value: 'express'
  }
}`,...(y=(x=t.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var S,_,E;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    options: [{
      value: 'standard',
      label: 'Estándar'
    }, {
      value: 'express',
      label: 'Express'
    }, {
      value: 'same-day',
      label: 'Mismo día',
      disabled: true
    }]
  }
}`,...(E=(_=o.parameters)==null?void 0:_.docs)==null?void 0:E.source}}};var k,D,h;u.parameters={...u.parameters,docs:{...(k=u.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    label: 'Alergenos',
    multiple: true,
    options: [{
      value: 'gluten',
      label: 'Gluten'
    }, {
      value: 'lactose',
      label: 'Lactosa'
    }, {
      value: 'nuts',
      label: 'Frutos secos'
    }, {
      value: 'soy',
      label: 'Soja'
    }, {
      value: 'eggs',
      label: 'Huevos'
    }]
  }
}`,...(h=(D=u.parameters)==null?void 0:D.docs)==null?void 0:h.source}}};var j,M,L;d.parameters={...d.parameters,docs:{...(j=d.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    label: 'Talla',
    options: [{
      value: 'xs',
      label: 'XS'
    }, {
      value: 's',
      label: 'S'
    }, {
      value: 'm',
      label: 'M'
    }, {
      value: 'l',
      label: 'L'
    }, {
      value: 'xl',
      label: 'XL'
    }],
    value: 'm'
  }
}`,...(L=(M=d.parameters)==null?void 0:M.docs)==null?void 0:L.source}}};const A=["Default","WithSelection","WithDisabled","Multiple","Sizes"];export{r as Default,u as Multiple,d as Sizes,o as WithDisabled,t as WithSelection,A as __namedExportsOrder,z as default};
