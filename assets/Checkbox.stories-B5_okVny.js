import{j as s}from"./jsx-runtime-CR8kToUD.js";import{r as A}from"./index-D_eiCwOZ.js";import{p as n}from"./index-BHSVxysL.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="df8dd4ec-bd3d-4237-befe-729308a682e8",e._sentryDebugIdIdentifier="sentry-dbid-df8dd4ec-bd3d-4237-befe-729308a682e8")}catch{}class l extends A.Component{buildID(t){return t?t.replace(" ","-"):this.getRandomID()}getRandomID(){return Math.floor(Math.random()*9998)+1}render(){const{checked:t,inputLabel:d,label:i,onChange:D}=this.props,h=this.buildID(i);return s.jsxs("div",{className:"checkbox",children:[s.jsx("input",{id:h,...d&&{"aria-label":d},className:"checkbox__input",type:"checkbox",checked:t,onChange:D}),s.jsx("label",{htmlFor:h,className:"checkbox__label",role:"checkbox",children:i})]})}}l.propTypes={checked:n.bool,onChange:n.func,label:n.string,inputLabel:n.string};const S={title:"System UI/Checkbox",component:l,tags:["autodocs"],argTypes:{checked:{control:"boolean",description:"Checked state of the checkbox"},label:{control:"text",description:"Label text displayed next to the checkbox"},inputLabel:{control:"text",description:"Aria-label for the input element"}}},r={args:{checked:!1,label:"Accept terms and conditions",onChange:()=>{}}},a={args:{checked:!0,label:"Accept terms and conditions",onChange:()=>{}}},c={render:()=>{const[e,t]=A.useState(!1);return s.jsx(l,{checked:e,label:"Click me to toggle",onChange:()=>t(!e)})}},o={args:{checked:!1,label:"Remember me",inputLabel:"Remember my login credentials",onChange:()=>{}}};var p,b,m;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    checked: false,
    label: 'Accept terms and conditions',
    onChange: () => {}
  }
}`,...(m=(b=r.parameters)==null?void 0:b.docs)==null?void 0:m.source}}};var u,g,k;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    checked: true,
    label: 'Accept terms and conditions',
    onChange: () => {}
  }
}`,...(k=(g=a.parameters)==null?void 0:g.docs)==null?void 0:k.source}}};var f,x,C;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Checkbox checked={checked} label="Click me to toggle" onChange={() => setChecked(!checked)} />;
  }
}`,...(C=(x=c.parameters)==null?void 0:x.docs)==null?void 0:C.source}}};var y,I,_;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    checked: false,
    label: 'Remember me',
    inputLabel: 'Remember my login credentials',
    onChange: () => {}
  }
}`,...(_=(I=o.parameters)==null?void 0:I.docs)==null?void 0:_.source}}};const j=["Unchecked","Checked","Interactive","WithAriaLabel"];export{a as Checked,c as Interactive,r as Unchecked,o as WithAriaLabel,j as __namedExportsOrder,S as default};
