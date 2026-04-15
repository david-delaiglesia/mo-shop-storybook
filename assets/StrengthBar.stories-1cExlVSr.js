import{j as r}from"./jsx-runtime-CR8kToUD.js";import{r as D}from"./index-D_eiCwOZ.js";import{p as m}from"./index-BHSVxysL.js";import{w as W}from"./I18nProvider-aqbJoy8A.js";import{T as j}from"./index-CtHRggvr.js";import"./i18next-BQrHVoyK.js";import"./context-BkADXMS_.js";import"./tiny-invariant-DsAsvojH.js";import"./index-CAcpzrYM.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},s=new e.Error().stack;s&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[s]="0f08c820-5cc1-4b0b-a6c4-ceb74a3bcaa5",e._sentryDebugIdIdentifier="sentry-dbid-0f08c820-5cc1-4b0b-a6c4-ceb74a3bcaa5")}catch{}const B=(e,s)=>!s||s.length===0?!1:e.toLowerCase().includes(s),L=e=>/[a-z]+/.test(e.toLowerCase()),O=e=>/[0-9]+/.test(e),C=e=>/[ !@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(e),F=e=>/[A-Z]+/.test(e),k=e=>Array.from(e).every(M),M=e=>{const s=e.charCodeAt();return s>=33&&s<=126},G=5,h=11,u=2,z=["mercadona"],o={SAFE:"SAFE",WEAK:"WEAK",INVALID:"INVALID",DEFAULT:"DEFAULT",WRONG_FORMAT:"WRONG_FORMAT"};class g extends D.PureComponent{isValid(){return this.props.password.length>G}isWeak(){const{password:s}=this.props,t=this.getNumberOfPassingRules()>u,a=s.length>h;return this.getReservedWords().some(this.containsReservedWord(s))||!t&&!a}containsReservedWord(s){return function(t){return B(s,t)}}getReservedWords(){const s=this.props.email.split("@")[0];return[...z,s]}isSafe(){const{password:s}=this.props,t=s.length>h,a=this.getNumberOfPassingRules()>u;return t||a}getNumberOfPassingRules(){const{password:s}=this.props;return[L(s),O(s),C(s),F(s)].filter(a=>a).length}hasProperFormat(){return k(this.props.password)}getStrengthType(){if(!this.props.password||this.props.password.length===0)return o.DEFAULT;if(!this.hasProperFormat())return o.WRONG_FORMAT;if(!this.isValid())return o.INVALID;if(this.isWeak())return o.WEAK;if(this.isSafe())return o.SAFE}getStrength(){const{t:s}=this.props;return{SAFE:{message:s("password_strength_strong_description"),className:"strength-bar--safe"},WEAK:{message:s("password_strength_weak_description"),className:"strength-bar--weak"},INVALID:{message:s("password_strength_invalid_description"),className:"strength-bar--invalid"},DEFAULT:{message:null,className:""},WRONG_FORMAT:{message:s("password_invalid_characters"),className:"strength-bar--wrong-format"}}[this.getStrengthType()]}render(){const{message:s,className:t}=this.getStrength();return r.jsxs("div",{className:`strength-bar ${t}`,"data-testid":"strength-bar",children:[r.jsxs("div",{className:"strength-bar__level-indicator",children:[r.jsx("span",{className:"strength-bar__level strength-bar__level--invalid"}),r.jsx("span",{className:"strength-bar__level strength-bar__level--weak"}),r.jsx("span",{className:"strength-bar__level strength-bar__level--safe"})]}),s&&r.jsx("p",{className:"strength-bar__message caption1-sb",tabIndex:j.ENABLED,children:s})]})}}g.propTypes={password:m.string,email:m.string,t:m.func.isRequired};g.defaultProps={password:"",email:""};const n=W(g),Q={title:"Components/StrengthBar",component:n,tags:["autodocs"],args:{email:"user@example.com"},argTypes:{password:{control:"text",description:"Password to evaluate strength for"},email:{control:"text",description:"User email (username is extracted to check against reserved words)"}},decorators:[e=>r.jsx("div",{style:{width:"300px"},children:r.jsx(e,{})})]},i={args:{password:""}},c={args:{password:"abc"}},p={args:{password:"abcdef"}},d={args:{password:"Str0ng!Pass#2024"}},l={render:()=>r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",width:"300px"},children:[r.jsxs("div",{children:[r.jsx("p",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:"Empty"}),r.jsx(n,{password:"",email:"user@example.com"})]}),r.jsxs("div",{children:[r.jsx("p",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:'Too short: "abc"'}),r.jsx(n,{password:"abc",email:"user@example.com"})]}),r.jsxs("div",{children:[r.jsx("p",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:'Weak: "abcdef"'}),r.jsx(n,{password:"abcdef",email:"user@example.com"})]}),r.jsxs("div",{children:[r.jsx("p",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:'Strong: "Str0ng!Pass#"'}),r.jsx(n,{password:"Str0ng!Pass#",email:"user@example.com"})]})]})};var S,x,_;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    password: ''
  }
}`,...(_=(x=i.parameters)==null?void 0:x.docs)==null?void 0:_.source}}};var f,b,E;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    password: 'abc'
  }
}`,...(E=(b=c.parameters)==null?void 0:b.docs)==null?void 0:E.source}}};var w,A,N;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    password: 'abcdef'
  }
}`,...(N=(A=p.parameters)==null?void 0:A.docs)==null?void 0:N.source}}};var T,v,y;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    password: 'Str0ng!Pass#2024'
  }
}`,...(y=(v=d.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};var I,R,P;l.parameters={...l.parameters,docs:{...(I=l.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '300px'
  }}>
      <div>
        <p style={{
        marginBottom: '8px',
        fontSize: '12px',
        color: '#666'
      }}>Empty</p>
        <StrengthBar password="" email="user@example.com" />
      </div>
      <div>
        <p style={{
        marginBottom: '8px',
        fontSize: '12px',
        color: '#666'
      }}>Too short: "abc"</p>
        <StrengthBar password="abc" email="user@example.com" />
      </div>
      <div>
        <p style={{
        marginBottom: '8px',
        fontSize: '12px',
        color: '#666'
      }}>Weak: "abcdef"</p>
        <StrengthBar password="abcdef" email="user@example.com" />
      </div>
      <div>
        <p style={{
        marginBottom: '8px',
        fontSize: '12px',
        color: '#666'
      }}>Strong: "Str0ng!Pass#"</p>
        <StrengthBar password="Str0ng!Pass#" email="user@example.com" />
      </div>
    </div>
}`,...(P=(R=l.parameters)==null?void 0:R.docs)==null?void 0:P.source}}};const ss=["Empty","TooShort","Weak","Strong","AllStates"];export{l as AllStates,i as Empty,d as Strong,c as TooShort,p as Weak,ss as __namedExportsOrder,Q as default};
