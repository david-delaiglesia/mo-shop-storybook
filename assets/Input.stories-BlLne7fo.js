import{j as o}from"./jsx-runtime-CR8kToUD.js";import{r as T}from"./index-D_eiCwOZ.js";import{I as z}from"./Input-C4K9niTl.js";import"./index-PmWe_g6L.js";import"./index-BHSVxysL.js";import"./I18nProvider-B9Me5UDR.js";import"./index-CSL8DQR3.js";import"./i18next-TUbu9-IY.js";import"./context-BkADXMS_.js";import"./setPrototypeOf-DiOlr_ig.js";import"./hoist-non-react-statics.cjs-BtOrefUY.js";import"./index-CAcpzrYM.js";import"./react-router-Da7IngNn.js";import"./tiny-invariant-DsAsvojH.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},a=new e.Error().stack;a&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[a]="efbcc063-ee5f-4c0d-935b-e059f02290c4",e._sentryDebugIdIdentifier="sentry-dbid-efbcc063-ee5f-4c0d-935b-e059f02290c4")}catch{}const G={title:"System UI/Input",component:z,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text for the input"},size:{control:"radio",options:["default","big"],description:"Input size variant"},disabled:{control:"boolean",description:"Disabled state"},value:{control:"text",description:"Input value"},type:{control:"select",options:["text","email","password","number","tel"]}},decorators:[e=>o.jsx("div",{style:{width:"320px"},children:o.jsx(e,{})})]},t={args:{label:"Email",value:"",inputId:"email-input"}},r={args:{label:"Email",value:"user@example.com",inputId:"email-input-filled"}},s={args:{label:"Full Name",value:"",size:"big",inputId:"name-input"}},i={args:{label:"Email",value:"disabled@example.com",disabled:!0,inputId:"disabled-input"}},n={args:{label:"Email",value:"invalid-email",inputId:"error-input",validation:{type:"error",message:"Please enter a valid email address"}}},l={render:()=>{const[e,a]=T.useState("");return o.jsx("div",{style:{width:"320px"},children:o.jsx(z,{label:"Type something",value:e,onChange:_=>a(_.target.value),inputId:"interactive-input"})})}};var d,p,u;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    value: '',
    inputId: 'email-input'
  }
}`,...(u=(p=t.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var c,m,b;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    value: 'user@example.com',
    inputId: 'email-input-filled'
  }
}`,...(b=(m=r.parameters)==null?void 0:m.docs)==null?void 0:b.source}}};var g,v,f;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    label: 'Full Name',
    value: '',
    size: 'big',
    inputId: 'name-input'
  }
}`,...(f=(v=s.parameters)==null?void 0:v.docs)==null?void 0:f.source}}};var I,y,x;i.parameters={...i.parameters,docs:{...(I=i.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    value: 'disabled@example.com',
    disabled: true,
    inputId: 'disabled-input'
  }
}`,...(x=(y=i.parameters)==null?void 0:y.docs)==null?void 0:x.source}}};var h,E,S;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    value: 'invalid-email',
    inputId: 'error-input',
    validation: {
      type: 'error',
      message: 'Please enter a valid email address'
    }
  }
}`,...(S=(E=n.parameters)==null?void 0:E.docs)==null?void 0:S.source}}};var w,D,j;l.parameters={...l.parameters,docs:{...(w=l.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    return <div style={{
      width: '320px'
    }}>
        <Input label="Type something" value={value} onChange={(e: any) => setValue(e.target.value)} inputId="interactive-input" />
      </div>;
  }
}`,...(j=(D=l.parameters)==null?void 0:D.docs)==null?void 0:j.source}}};const H=["Default","WithValue","BigSize","Disabled","WithError","Interactive"];export{s as BigSize,t as Default,i as Disabled,l as Interactive,n as WithError,r as WithValue,H as __namedExportsOrder,G as default};
