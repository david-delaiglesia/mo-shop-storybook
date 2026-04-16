import{j as r}from"./jsx-runtime-CR8kToUD.js";import{B as t,a as v,b as ir,c as dr,d as cr,e as lr,f as pr}from"./ButtonRounded-C4S_eXFK.js";import"./index-D_eiCwOZ.js";import"./index-PmWe_g6L.js";import"./index-BHSVxysL.js";import"./I18nProvider-C3sHuns_.js";import"./index-BqxkDl-g.js";import"./i18next-TUbu9-IY.js";import"./context-BkADXMS_.js";import"./setPrototypeOf-DiOlr_ig.js";import"./hoist-non-react-statics.cjs-BtOrefUY.js";import"./index-CAcpzrYM.js";import"./react-router-CYZJUDQM.js";import"./tiny-invariant-DsAsvojH.js";import"./Loader-PwE9zvXG.js";import"./Icon-BkYp6zYs.js";import"./redux-DvQH5oc5.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},a=new e.Error().stack;a&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[a]="ac6896e7-24d9-4ac0-a917-24b60f499a0a",e._sentryDebugIdIdentifier="sentry-dbid-ac6896e7-24d9-4ac0-a917-24b60f499a0a")}catch{}const ur=({children:e,width:a="280px"})=>r.jsx("div",{style:{width:a},children:e}),Tr={title:"Components/Button",component:t,tags:["autodocs"],decorators:[e=>r.jsx(ur,{children:r.jsx(e,{})})],argTypes:{text:{control:"text",description:"Button text (i18n key or plain text)"},size:{control:"radio",options:["small","default"],description:"Button size (small = 32px, default = 40px)"},disabled:{control:"boolean",description:"Disabled state"},fit:{control:"boolean",description:"Auto-width (fit content)"},destructive:{control:"boolean",description:"Destructive/danger variant (red)"},activeFeedback:{control:"boolean",description:"Shows a loading spinner"}}},s={args:{text:"Primary Button"}},o={args:{text:"Disabled Primary",disabled:!0}},n={args:{text:"Loading...",activeFeedback:!0}},i={render:e=>r.jsx(v,{...e}),args:{text:"Secondary Button"}},d={render:e=>r.jsx(ir,{...e}),args:{text:"Tertiary Button"}},c={decorators:[],render:e=>r.jsx("div",{style:{width:"280px",background:"#f5f5f5",padding:"16px",borderRadius:"8px"},children:r.jsx(dr,{...e})}),args:{text:"Quaternary Button",icon:"big-chevron"}},l={render:e=>r.jsx(cr,{...e}),args:{text:"Quinary Button"}},p={render:e=>r.jsx(lr,{...e}),args:{icon:"big-chevron"}},u={render:e=>r.jsx(pr,{...e}),args:{text:"Rounded"}},x={args:{text:"Small Primary",size:"small"}},m={decorators:[],args:{text:"Fit Width",fit:!0}},y={decorators:[],render:()=>r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"280px"},children:[r.jsx(t,{text:"Primary"}),r.jsx(v,{text:"Secondary"}),r.jsx(ir,{text:"Tertiary"}),r.jsx("div",{style:{background:"#f5f5f5",padding:"8px",borderRadius:"4px"},children:r.jsx(dr,{text:"Quaternary",icon:"big-chevron"})}),r.jsx(cr,{text:"Quinary"}),r.jsxs("div",{style:{display:"flex",gap:"12px",alignItems:"center"},children:[r.jsx(lr,{icon:"big-chevron"}),r.jsx(pr,{text:"Rounded"})]})]})},g={decorators:[],render:()=>r.jsxs("div",{style:{display:"flex",gap:"24px",alignItems:"flex-start"},children:[r.jsxs("div",{style:{width:"200px"},children:[r.jsx("p",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:"Small (32px)"}),r.jsx(t,{text:"Small",size:"small"})]}),r.jsxs("div",{style:{width:"200px"},children:[r.jsx("p",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:"Default (40px)"}),r.jsx(t,{text:"Default"})]})]})},f={decorators:[],render:()=>r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"280px"},children:[r.jsx(t,{text:"Destructive Primary",destructive:!0}),r.jsx(v,{text:"Destructive Secondary",destructive:!0})]})};var b,B,S;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    text: 'Primary Button'
  }
}`,...(S=(B=s.parameters)==null?void 0:B.docs)==null?void 0:S.source}}};var h,j,D;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    text: 'Disabled Primary',
    disabled: true
  }
}`,...(D=(j=o.parameters)==null?void 0:j.docs)==null?void 0:D.source}}};var P,Q,w;n.parameters={...n.parameters,docs:{...(P=n.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    text: 'Loading...',
    activeFeedback: true
  }
}`,...(w=(Q=n.parameters)==null?void 0:Q.docs)==null?void 0:w.source}}};var z,R,T;i.parameters={...i.parameters,docs:{...(z=i.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: args => <ButtonSecondary {...args} />,
  args: {
    text: 'Secondary Button'
  }
}`,...(T=(R=i.parameters)==null?void 0:R.docs)==null?void 0:T.source}}};var k,I,F;d.parameters={...d.parameters,docs:{...(k=d.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: args => <ButtonTertiary {...args} />,
  args: {
    text: 'Tertiary Button'
  }
}`,...(F=(I=d.parameters)==null?void 0:I.docs)==null?void 0:F.source}}};var O,_,A;c.parameters={...c.parameters,docs:{...(O=c.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(A=(_=c.parameters)==null?void 0:_.docs)==null?void 0:A.source}}};var L,V,W;l.parameters={...l.parameters,docs:{...(L=l.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: args => <ButtonQuinary {...args} />,
  args: {
    text: 'Quinary Button'
  }
}`,...(W=(V=l.parameters)==null?void 0:V.docs)==null?void 0:W.source}}};var E,C,q;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: args => <ButtonOval {...args} />,
  args: {
    icon: 'big-chevron'
  }
}`,...(q=(C=p.parameters)==null?void 0:C.docs)==null?void 0:q.source}}};var G,H,J;u.parameters={...u.parameters,docs:{...(G=u.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: args => <ButtonRounded {...args} />,
  args: {
    text: 'Rounded'
  }
}`,...(J=(H=u.parameters)==null?void 0:H.docs)==null?void 0:J.source}}};var K,M,N;x.parameters={...x.parameters,docs:{...(K=x.parameters)==null?void 0:K.docs,source:{originalSource:`{
  args: {
    text: 'Small Primary',
    size: 'small'
  }
}`,...(N=(M=x.parameters)==null?void 0:M.docs)==null?void 0:N.source}}};var U,X,Y;m.parameters={...m.parameters,docs:{...(U=m.parameters)==null?void 0:U.docs,source:{originalSource:`{
  decorators: [],
  args: {
    text: 'Fit Width',
    fit: true
  }
}`,...(Y=(X=m.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,$,rr;y.parameters={...y.parameters,docs:{...(Z=y.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(rr=($=y.parameters)==null?void 0:$.docs)==null?void 0:rr.source}}};var er,tr,ar;g.parameters={...g.parameters,docs:{...(er=g.parameters)==null?void 0:er.docs,source:{originalSource:`{
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
}`,...(ar=(tr=g.parameters)==null?void 0:tr.docs)==null?void 0:ar.source}}};var sr,or,nr;f.parameters={...f.parameters,docs:{...(sr=f.parameters)==null?void 0:sr.docs,source:{originalSource:`{
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
}`,...(nr=(or=f.parameters)==null?void 0:or.docs)==null?void 0:nr.source}}};const kr=["Primary","PrimaryDisabled","PrimaryLoading","Secondary","Tertiary","Quaternary","Quinary","Oval","Rounded","SmallSize","FitWidth","AllVariants","AllSizes","DestructiveVariants"];export{g as AllSizes,y as AllVariants,f as DestructiveVariants,m as FitWidth,p as Oval,s as Primary,o as PrimaryDisabled,n as PrimaryLoading,c as Quaternary,l as Quinary,u as Rounded,i as Secondary,x as SmallSize,d as Tertiary,kr as __namedExportsOrder,Tr as default};
