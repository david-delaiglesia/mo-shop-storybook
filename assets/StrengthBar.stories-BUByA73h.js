import{j as e}from"./jsx-runtime-CR8kToUD.js";import{r as P}from"./index-D_eiCwOZ.js";import{c as D,a as B,b as I,d as F,e as O,i as L}from"./strings-CwBk-h74.js";import{p as m}from"./index-BHSVxysL.js";import{w as k}from"./I18nProvider-B9Me5UDR.js";import{T as G}from"./index-CSL8DQR3.js";import"./react-router-Da7IngNn.js";import"./setPrototypeOf-DiOlr_ig.js";import"./tiny-invariant-DsAsvojH.js";import"./hoist-non-react-statics.cjs-BtOrefUY.js";import"./i18next-TUbu9-IY.js";import"./context-BkADXMS_.js";import"./index-CAcpzrYM.js";try{let r=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},s=new r.Error().stack;s&&(r._sentryDebugIds=r._sentryDebugIds||{},r._sentryDebugIds[s]="a93d2ec0-96bd-4497-aac6-a334cdcb57b8",r._sentryDebugIdIdentifier="sentry-dbid-a93d2ec0-96bd-4497-aac6-a334cdcb57b8")}catch{}const z=5,h=11,u=2,U=["mercadona"],o={SAFE:"SAFE",WEAK:"WEAK",INVALID:"INVALID",DEFAULT:"DEFAULT",WRONG_FORMAT:"WRONG_FORMAT"};class g extends P.PureComponent{isValid(){return this.props.password.length>z}isWeak(){const{password:s}=this.props,t=this.getNumberOfPassingRules()>u,a=s.length>h;return this.getReservedWords().some(this.containsReservedWord(s))||!t&&!a}containsReservedWord(s){return function(t){return D(s,t)}}getReservedWords(){const s=this.props.email.split("@")[0];return[...U,s]}isSafe(){const{password:s}=this.props,t=s.length>h,a=this.getNumberOfPassingRules()>u;return t||a}getNumberOfPassingRules(){const{password:s}=this.props;return[B(s),I(s),F(s),O(s)].filter(a=>a).length}hasProperFormat(){return L(this.props.password)}getStrengthType(){if(!this.props.password||this.props.password.length===0)return o.DEFAULT;if(!this.hasProperFormat())return o.WRONG_FORMAT;if(!this.isValid())return o.INVALID;if(this.isWeak())return o.WEAK;if(this.isSafe())return o.SAFE}getStrength(){const{t:s}=this.props;return{SAFE:{message:s("password_strength_strong_description"),className:"strength-bar--safe"},WEAK:{message:s("password_strength_weak_description"),className:"strength-bar--weak"},INVALID:{message:s("password_strength_invalid_description"),className:"strength-bar--invalid"},DEFAULT:{message:null,className:""},WRONG_FORMAT:{message:s("password_invalid_characters"),className:"strength-bar--wrong-format"}}[this.getStrengthType()]}render(){const{message:s,className:t}=this.getStrength();return e.jsxs("div",{className:`strength-bar ${t}`,"data-testid":"strength-bar",children:[e.jsxs("div",{className:"strength-bar__level-indicator",children:[e.jsx("span",{className:"strength-bar__level strength-bar__level--invalid"}),e.jsx("span",{className:"strength-bar__level strength-bar__level--weak"}),e.jsx("span",{className:"strength-bar__level strength-bar__level--safe"})]}),s&&e.jsx("p",{className:"strength-bar__message caption1-sb",tabIndex:G.ENABLED,children:s})]})}}g.propTypes={password:m.string,email:m.string,t:m.func.isRequired};g.defaultProps={password:"",email:""};const n=k(g),rs={title:"Components/StrengthBar",component:n,tags:["autodocs"],args:{email:"user@example.com"},argTypes:{password:{control:"text",description:"Password to evaluate strength for"},email:{control:"text",description:"User email (username is extracted to check against reserved words)"}},decorators:[r=>e.jsx("div",{style:{width:"300px"},children:e.jsx(r,{})})]},i={args:{password:""}},p={args:{password:"abc"}},c={args:{password:"abcdef"}},d={args:{password:"Str0ng!Pass#2024"}},l={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",width:"300px"},children:[e.jsxs("div",{children:[e.jsx("p",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:"Empty"}),e.jsx(n,{password:"",email:"user@example.com"})]}),e.jsxs("div",{children:[e.jsx("p",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:'Too short: "abc"'}),e.jsx(n,{password:"abc",email:"user@example.com"})]}),e.jsxs("div",{children:[e.jsx("p",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:'Weak: "abcdef"'}),e.jsx(n,{password:"abcdef",email:"user@example.com"})]}),e.jsxs("div",{children:[e.jsx("p",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:'Strong: "Str0ng!Pass#"'}),e.jsx(n,{password:"Str0ng!Pass#",email:"user@example.com"})]})]})};var x,S,f;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    password: ''
  }
}`,...(f=(S=i.parameters)==null?void 0:S.docs)==null?void 0:f.source}}};var b,_,w;p.parameters={...p.parameters,docs:{...(b=p.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    password: 'abc'
  }
}`,...(w=(_=p.parameters)==null?void 0:_.docs)==null?void 0:w.source}}};var E,v,N;c.parameters={...c.parameters,docs:{...(E=c.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    password: 'abcdef'
  }
}`,...(N=(v=c.parameters)==null?void 0:v.docs)==null?void 0:N.source}}};var T,y,A;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    password: 'Str0ng!Pass#2024'
  }
}`,...(A=(y=d.parameters)==null?void 0:y.docs)==null?void 0:A.source}}};var R,W,j;l.parameters={...l.parameters,docs:{...(R=l.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(j=(W=l.parameters)==null?void 0:W.docs)==null?void 0:j.source}}};const ts=["Empty","TooShort","Weak","Strong","AllStates"];export{l as AllStates,i as Empty,d as Strong,p as TooShort,c as Weak,ts as __namedExportsOrder,rs as default};
