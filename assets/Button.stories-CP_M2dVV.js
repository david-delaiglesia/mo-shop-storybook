var Re=Object.defineProperty;var Ee=(e,r,n)=>r in e?Re(e,r,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[r]=n;var L=(e,r,n)=>Ee(e,typeof r!="symbol"?r+"":r,n);import{j as t}from"./jsx-runtime-CR8kToUD.js";import{c}from"./index-PmWe_g6L.js";import{p as s}from"./index-BHSVxysL.js";import{w as Qe,c as ze}from"./I18nProvider-DE68jI5S.js";import{L as _e}from"./Loader-PwE9zvXG.js";import{I as Ce}from"./Icon-DxYcXoKU.js";import{r as Oe}from"./index-D_eiCwOZ.js";import"./index-CVcxIVxE.js";import"./i18next-BcTDXNBN.js";import"./context-BkADXMS_.js";import"./tiny-invariant-DsAsvojH.js";import"./index-CAcpzrYM.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},r=new e.Error().stack;r&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[r]="7631bbfa-5756-4adb-bfb6-1332a3f77bf2",e._sentryDebugIdIdentifier="sentry-dbid-7631bbfa-5756-4adb-bfb6-1332a3f77bf2")}catch{}const U=({as:e,className:r,type:n,text:d,icon:x,fit:y,destructive:_,size:a,activeFeedback:o,t:g,...u})=>t.jsxs(e,{type:e==="button"?n:null,className:c("btn",r,`btn--${a}`,{"btn--fit":y,"btn--destructive":_,"btn--loading":o}),...u,children:[o&&t.jsx(_e,{}),!o&&d&&t.jsx("span",{className:"button__text",children:g(d)}),!o&&x&&t.jsx(Ce,{icon:x})]});U.defaultProps={className:"",type:"button",text:"",icon:"",fit:!1,destructive:!1,size:"default",as:"button",activeFeedback:!1};U.propTypes={className:s.string,type:s.oneOf(["button","submit","reset"]),text:s.string,icon:s.string,fit:s.bool,destructive:s.bool,size:s.oneOf(["small","default","big"]),as:s.oneOfType([s.elementType,s.string]),activeFeedback:s.bool,t:s.func.isRequired};const l=Qe(U),Ue={SET_PENDING_ACTION:"SET_PENDING_ACTION"};function Le(e){return{payload:e,type:Ue.SET_PENDING_ACTION}}function We(e){return"Minified Redux error #"+e+"; visit https://redux.js.org/Errors?code="+e+" for the full message or use the non-minified dev environment for full errors. "}var W=function(){return Math.random().toString(36).substring(7).split("").join(".")};""+W(),""+W();function q(e,r){return function(){return r(e.apply(this,arguments))}}function qe(e,r){if(typeof e=="function")return q(e,r);if(typeof e!="object"||e===null)throw new Error(We(16));var n={};for(var d in e){var x=e[d];typeof x=="function"&&(n[d]=q(x,r))}return n}function m(e){class r extends Oe.Component{constructor(a){super(a);L(this,"state",{uuid:"",activeFeedback:!1});this.setFeedback=this.setFeedback.bind(this)}componentDidUpdate(a){const{pendingActionUuid:o}=this.props,{pendingActionUuid:g}=a;if(o===g)return;const{uuid:u}=this.state,C=u.length>0&&o===u,B=!o&&g===u;if(C)return this.setState({activeFeedback:!0});if(B)return this.setState({activeFeedback:!1})}setFeedback(a){const{autoBlock:o,pendingActionUuid:g,isAsync:u,actions:C,onClick:B}=this.props,Ie=o&&g;if(a&&a.preventDefault(),!u){B();return}if(Ie)return;const O=crypto.randomUUID();C.setPendingAction(O),this.setUuid(O),B(O)}setUuid(a){this.setState({uuid:a})}render(){const{...a}=this.props;return t.jsx(e,{...a,onClick:this.setFeedback,activeFeedback:this.state.activeFeedback})}}r.propTypes={onClick:s.func.isRequired,pendingActionUuid:s.string,autoBlock:s.bool,actions:s.shape({setPendingAction:s.func.isRequired}).isRequired,isAsync:s.bool},r.defaultProps={isAsync:!0};function n({pendingActionUuid:y}){return{pendingActionUuid:y}}function d(y){return{actions:{setPendingAction:qe(Le,y)}}}return ze(n,d)(r)}const i=({className:e,...r})=>t.jsx(l,{className:c("btn--primary",e),...r});i.defaultProps={className:""};i.propTypes={className:s.string};i.withFeedback=m(i);const p=({className:e,...r})=>t.jsx(l,{className:c("btn--secondary",e),...r});p.defaultProps={className:""};p.propTypes={className:s.string};p.withFeedback=m(p);const f=({className:e,...r})=>t.jsx(l,{className:c("btn--tertiary",e),...r});f.defaultProps={className:""};f.propTypes={className:s.string};f.withFeedback=m(f);const b=({className:e,...r})=>t.jsx(l,{className:c("btn--quaternary",e),...r});b.defaultProps={className:""};b.propTypes={className:s.string};b.withFeedback=m(b);const h=({className:e,...r})=>t.jsx(l,{className:c("btn--quinary",e),...r});h.defaultProps={className:""};h.propTypes={className:s.string};h.withFeedback=m(h);const v=({className:e,...r})=>t.jsx(l,{className:c("btn--oval",e),...r});v.defaultProps={className:""};v.propTypes={className:s.string};v.withFeedback=m(v);const S=({className:e,...r})=>t.jsx(l,{className:c("btn--rounded",e),...r});S.defaultProps={className:""};S.propTypes={className:s.string};S.withFeedback=m(S);const Ve=({children:e,width:r="280px"})=>t.jsx("div",{style:{width:r},children:e}),at={title:"Components/Button",component:i,tags:["autodocs"],decorators:[e=>t.jsx(Ve,{children:t.jsx(e,{})})],argTypes:{text:{control:"text",description:"Button text (i18n key or plain text)"},size:{control:"radio",options:["small","default"],description:"Button size (small = 32px, default = 40px)"},disabled:{control:"boolean",description:"Disabled state"},fit:{control:"boolean",description:"Auto-width (fit content)"},destructive:{control:"boolean",description:"Destructive/danger variant (red)"},activeFeedback:{control:"boolean",description:"Shows a loading spinner"}}},j={args:{text:"Primary Button"}},P={args:{text:"Disabled Primary",disabled:!0}},N={args:{text:"Loading...",activeFeedback:!0}},k={render:e=>t.jsx(p,{...e}),args:{text:"Secondary Button"}},T={render:e=>t.jsx(f,{...e}),args:{text:"Tertiary Button"}},D={decorators:[],render:e=>t.jsx("div",{style:{width:"280px",background:"#f5f5f5",padding:"16px",borderRadius:"8px"},children:t.jsx(b,{...e})}),args:{text:"Quaternary Button",icon:"big-chevron"}},w={render:e=>t.jsx(h,{...e}),args:{text:"Quinary Button"}},F={render:e=>t.jsx(v,{...e}),args:{icon:"big-chevron"}},A={render:e=>t.jsx(S,{...e}),args:{text:"Rounded"}},I={args:{text:"Small Primary",size:"small"}},R={decorators:[],args:{text:"Fit Width",fit:!0}},E={decorators:[],render:()=>t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"280px"},children:[t.jsx(i,{text:"Primary"}),t.jsx(p,{text:"Secondary"}),t.jsx(f,{text:"Tertiary"}),t.jsx("div",{style:{background:"#f5f5f5",padding:"8px",borderRadius:"4px"},children:t.jsx(b,{text:"Quaternary",icon:"big-chevron"})}),t.jsx(h,{text:"Quinary"}),t.jsxs("div",{style:{display:"flex",gap:"12px",alignItems:"center"},children:[t.jsx(v,{icon:"big-chevron"}),t.jsx(S,{text:"Rounded"})]})]})},Q={decorators:[],render:()=>t.jsxs("div",{style:{display:"flex",gap:"24px",alignItems:"flex-start"},children:[t.jsxs("div",{style:{width:"200px"},children:[t.jsx("p",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:"Small (32px)"}),t.jsx(i,{text:"Small",size:"small"})]}),t.jsxs("div",{style:{width:"200px"},children:[t.jsx("p",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:"Default (40px)"}),t.jsx(i,{text:"Default"})]})]})},z={decorators:[],render:()=>t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"280px"},children:[t.jsx(i,{text:"Destructive Primary",destructive:!0}),t.jsx(p,{text:"Destructive Secondary",destructive:!0})]})};var V,G,M;j.parameters={...j.parameters,docs:{...(V=j.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    text: 'Primary Button'
  }
}`,...(M=(G=j.parameters)==null?void 0:G.docs)==null?void 0:M.source}}};var $,H,J;P.parameters={...P.parameters,docs:{...($=P.parameters)==null?void 0:$.docs,source:{originalSource:`{
  args: {
    text: 'Disabled Primary',
    disabled: true
  }
}`,...(J=(H=P.parameters)==null?void 0:H.docs)==null?void 0:J.source}}};var K,X,Y;N.parameters={...N.parameters,docs:{...(K=N.parameters)==null?void 0:K.docs,source:{originalSource:`{
  args: {
    text: 'Loading...',
    activeFeedback: true
  }
}`,...(Y=(X=N.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,ee,te;k.parameters={...k.parameters,docs:{...(Z=k.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  render: args => <ButtonSecondary {...args} />,
  args: {
    text: 'Secondary Button'
  }
}`,...(te=(ee=k.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var re,se,ae;T.parameters={...T.parameters,docs:{...(re=T.parameters)==null?void 0:re.docs,source:{originalSource:`{
  render: args => <ButtonTertiary {...args} />,
  args: {
    text: 'Tertiary Button'
  }
}`,...(ae=(se=T.parameters)==null?void 0:se.docs)==null?void 0:ae.source}}};var ne,oe,ie;D.parameters={...D.parameters,docs:{...(ne=D.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  decorators: [],
  render: args => <div style={{
    width: '280px',
    background: '#f5f5f5',
    padding: '16px',
    borderRadius: '8px'
  }}>
      <ButtonQuaternary {...args} />
    </div>,
  args: {
    text: 'Quaternary Button',
    icon: 'big-chevron'
  }
}`,...(ie=(oe=D.parameters)==null?void 0:oe.docs)==null?void 0:ie.source}}};var ce,de,ue;w.parameters={...w.parameters,docs:{...(ce=w.parameters)==null?void 0:ce.docs,source:{originalSource:`{
  render: args => <ButtonQuinary {...args} />,
  args: {
    text: 'Quinary Button'
  }
}`,...(ue=(de=w.parameters)==null?void 0:de.docs)==null?void 0:ue.source}}};var pe,le,me;F.parameters={...F.parameters,docs:{...(pe=F.parameters)==null?void 0:pe.docs,source:{originalSource:`{
  render: args => <ButtonOval {...args} />,
  args: {
    icon: 'big-chevron'
  }
}`,...(me=(le=F.parameters)==null?void 0:le.docs)==null?void 0:me.source}}};var xe,ye,ge;A.parameters={...A.parameters,docs:{...(xe=A.parameters)==null?void 0:xe.docs,source:{originalSource:`{
  render: args => <ButtonRounded {...args} />,
  args: {
    text: 'Rounded'
  }
}`,...(ge=(ye=A.parameters)==null?void 0:ye.docs)==null?void 0:ge.source}}};var fe,be,he;I.parameters={...I.parameters,docs:{...(fe=I.parameters)==null?void 0:fe.docs,source:{originalSource:`{
  args: {
    text: 'Small Primary',
    size: 'small'
  }
}`,...(he=(be=I.parameters)==null?void 0:be.docs)==null?void 0:he.source}}};var ve,Se,Be;R.parameters={...R.parameters,docs:{...(ve=R.parameters)==null?void 0:ve.docs,source:{originalSource:`{
  decorators: [],
  args: {
    text: 'Fit Width',
    fit: true
  }
}`,...(Be=(Se=R.parameters)==null?void 0:Se.docs)==null?void 0:Be.source}}};var je,Pe,Ne;E.parameters={...E.parameters,docs:{...(je=E.parameters)==null?void 0:je.docs,source:{originalSource:`{
  decorators: [],
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '280px'
  }}>
      <ButtonPrimary text="Primary" />
      <ButtonSecondary text="Secondary" />
      <ButtonTertiary text="Tertiary" />
      <div style={{
      background: '#f5f5f5',
      padding: '8px',
      borderRadius: '4px'
    }}>
        <ButtonQuaternary text="Quaternary" icon="big-chevron" />
      </div>
      <ButtonQuinary text="Quinary" />
      <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    }}>
        <ButtonOval icon="big-chevron" />
        <ButtonRounded text="Rounded" />
      </div>
    </div>
}`,...(Ne=(Pe=E.parameters)==null?void 0:Pe.docs)==null?void 0:Ne.source}}};var ke,Te,De;Q.parameters={...Q.parameters,docs:{...(ke=Q.parameters)==null?void 0:ke.docs,source:{originalSource:`{
  decorators: [],
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start'
  }}>
      <div style={{
      width: '200px'
    }}>
        <p style={{
        marginBottom: '8px',
        fontSize: '12px',
        color: '#666'
      }}>Small (32px)</p>
        <ButtonPrimary text="Small" size="small" />
      </div>
      <div style={{
      width: '200px'
    }}>
        <p style={{
        marginBottom: '8px',
        fontSize: '12px',
        color: '#666'
      }}>Default (40px)</p>
        <ButtonPrimary text="Default" />
      </div>
    </div>
}`,...(De=(Te=Q.parameters)==null?void 0:Te.docs)==null?void 0:De.source}}};var we,Fe,Ae;z.parameters={...z.parameters,docs:{...(we=z.parameters)==null?void 0:we.docs,source:{originalSource:`{
  decorators: [],
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '280px'
  }}>
      <ButtonPrimary text="Destructive Primary" destructive />
      <ButtonSecondary text="Destructive Secondary" destructive />
    </div>
}`,...(Ae=(Fe=z.parameters)==null?void 0:Fe.docs)==null?void 0:Ae.source}}};const nt=["Primary","PrimaryDisabled","PrimaryLoading","Secondary","Tertiary","Quaternary","Quinary","Oval","Rounded","SmallSize","FitWidth","AllVariants","AllSizes","DestructiveVariants"];export{Q as AllSizes,E as AllVariants,z as DestructiveVariants,R as FitWidth,F as Oval,j as Primary,P as PrimaryDisabled,N as PrimaryLoading,D as Quaternary,w as Quinary,A as Rounded,k as Secondary,I as SmallSize,T as Tertiary,nt as __namedExportsOrder,at as default};
