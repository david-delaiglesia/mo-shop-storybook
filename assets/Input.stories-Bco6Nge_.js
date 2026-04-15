import{j as i}from"./jsx-runtime-CR8kToUD.js";import{r as V}from"./index-D_eiCwOZ.js";import{c as g}from"./index-PmWe_g6L.js";import{P as t}from"./index-BHSVxysL.js";import{w as k}from"./I18nProvider-aqbJoy8A.js";import{T as z}from"./index-CtHRggvr.js";import"./i18next-BQrHVoyK.js";import"./context-BkADXMS_.js";import"./tiny-invariant-DsAsvojH.js";import"./index-CAcpzrYM.js";try{let a=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},e=new a.Error().stack;e&&(a._sentryDebugIds=a._sentryDebugIds||{},a._sentryDebugIds[e]="80a0f2fb-251b-4a9e-a4d7-4969afd7da71",a._sentryDebugIdIdentifier="sentry-dbid-80a0f2fb-251b-4a9e-a4d7-4969afd7da71")}catch{}const r={TYPE_TEXT:"text",ACTIVE_CLASS_NAME:"active",DISABLED_CLASS_NAME:"disabled",SPACE_KEY_CODE:32,INPUT_CLASS_NAME:"input-text",INPUT_CLASS_LABEL:"input-text__label",INPUT_CLASS_BIG:"input-text-big",MESSAGE_CLASS_NAME:"input-text__message",DISABLED_INPUT_CLASS_NAME:"input-disabled",EMPTY_CLASS_NAME:""},b={BIG:"big",DEFAULT:"default"};class S extends V.Component{constructor(){super(),this.state={isActive:!1,shouldShowValidationFeedback:!0},this.onFocus=this.onFocus.bind(this),this.onBlur=this.onBlur.bind(this),this.onChange=this.onChange.bind(this),this.onKeyDown=this.onKeyDown.bind(this)}onFocus(e){this.setState({isActive:!0,shouldShowValidationFeedback:!1}),this.props.onFocus&&this.props.onFocus(e)}onBlur(e){const{value:s,onBlur:n}=this.props,o=!!s;this.setState({isActive:o,shouldShowValidationFeedback:!0}),n&&n(e)}onChange(e){this.setState({shouldShowValidationFeedback:!1}),this.props.onChange&&this.props.onChange(e)}onKeyDown(e){const{value:s}=e.target;if(s.length===0&&this.isSpaceKey(e.keyCode))return e.preventDefault()}isSpaceKey(e){return e===r.SPACE_KEY_CODE}getClassNameByStatus(){const{ACTIVE_CLASS_NAME:e,EMPTY_CLASS_NAME:s,DISABLED_CLASS_NAME:n}=r;return this.state.isActive||!!this.props.value?this.props.disabled?n:e:s}buildErrorClassName(e){return this.shouldShowError()?`${e}--${this.props.validation.type}`:r.EMPTY_CLASS_NAME}disabledClassName(){if(this.props.disabled)return r.DISABLED_INPUT_CLASS_NAME}shouldShowError(){const{validation:e}=this.props;return e&&e.message&&this.state.shouldShowValidationFeedback}getClassName(){const e=this.props.size===b.BIG;return g(r.INPUT_CLASS_NAME,{[r.INPUT_CLASS_BIG]:e},this.buildErrorClassName(r.INPUT_CLASS_NAME),this.disabledClassName())}getLabelClassName(){return g(r.INPUT_CLASS_LABEL,this.getClassNameByStatus())}getErrorClassName(){const{MESSAGE_CLASS_NAME:e}=r;return`${e} ${this.buildErrorClassName(e)}`}render(){const{validation:e,inputId:s,reference:n,label:o,datatest:U,children:K,t:h,...O}=this.props;return i.jsxs("div",{className:this.getClassName(),children:[i.jsx("label",{className:this.getLabelClassName(),children:h(o)}),i.jsxs("div",{className:"input-container",children:[i.jsx("input",{...O,className:"ym-hide-content",id:s,"aria-label":h(o),ref:n,onChange:this.onChange,onFocus:this.onFocus,onBlur:this.onBlur,onKeyDown:this.onKeyDown,"data-testid":U}),K]}),this.shouldShowError()&&i.jsx("p",{"data-testid":"input-error",className:this.getErrorClassName(),tabIndex:z.ENABLED,children:h(e.message)})]})}}S.propTypes={inputId:t.string,type:t.string,size:t.oneOf([b.BIG,b.DEFAULT]),label:t.string,value:t.any,onChange:t.func,onClick:t.func,onBlur:t.func,validation:t.object,name:t.string,maxLength:t.number,reference:t.oneOfType([t.func,t.object]),autoFocus:t.bool,autoComplete:t.oneOf(["off","on","new-password","current-password","email"]),onFocus:t.func,datatest:t.string,tabIndex:t.number,disabled:t.bool,children:t.node,t:t.func.isRequired};S.defaultProps={type:r.TYPE_TEXT,value:"",autoFocus:!1,disabled:!1,autoComplete:"on",datatest:"input"};const j=k(S),Q={title:"System UI/Input",component:j,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text for the input"},size:{control:"radio",options:["default","big"],description:"Input size variant"},disabled:{control:"boolean",description:"Disabled state"},value:{control:"text",description:"Input value"},type:{control:"select",options:["text","email","password","number","tel"]}},decorators:[a=>i.jsx("div",{style:{width:"320px"},children:i.jsx(a,{})})]},l={args:{label:"Email",value:"",inputId:"email-input"}},d={args:{label:"Email",value:"user@example.com",inputId:"email-input-filled"}},u={args:{label:"Full Name",value:"",size:"big",inputId:"name-input"}},p={args:{label:"Email",value:"disabled@example.com",disabled:!0,inputId:"disabled-input"}},c={args:{label:"Email",value:"invalid-email",inputId:"error-input",validation:{type:"error",message:"Please enter a valid email address"}}},m={render:()=>{const[a,e]=V.useState("");return i.jsx("div",{style:{width:"320px"},children:i.jsx(j,{label:"Type something",value:a,onChange:s=>e(s.target.value),inputId:"interactive-input"})})}};var E,f,A;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    value: '',
    inputId: 'email-input'
  }
}`,...(A=(f=l.parameters)==null?void 0:f.docs)==null?void 0:A.source}}};var _,C,I;d.parameters={...d.parameters,docs:{...(_=d.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    value: 'user@example.com',
    inputId: 'email-input-filled'
  }
}`,...(I=(C=d.parameters)==null?void 0:C.docs)==null?void 0:I.source}}};var v,N,y;u.parameters={...u.parameters,docs:{...(v=u.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    label: 'Full Name',
    value: '',
    size: 'big',
    inputId: 'name-input'
  }
}`,...(y=(N=u.parameters)==null?void 0:N.docs)==null?void 0:y.source}}};var T,x,L;p.parameters={...p.parameters,docs:{...(T=p.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    value: 'disabled@example.com',
    disabled: true,
    inputId: 'disabled-input'
  }
}`,...(L=(x=p.parameters)==null?void 0:x.docs)==null?void 0:L.source}}};var D,w,B;c.parameters={...c.parameters,docs:{...(D=c.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    value: 'invalid-email',
    inputId: 'error-input',
    validation: {
      type: 'error',
      message: 'Please enter a valid email address'
    }
  }
}`,...(B=(w=c.parameters)==null?void 0:w.docs)==null?void 0:B.source}}};var P,M,F;m.parameters={...m.parameters,docs:{...(P=m.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    return <div style={{
      width: '320px'
    }}>
        <Input label="Type something" value={value} onChange={(e: any) => setValue(e.target.value)} inputId="interactive-input" />
      </div>;
  }
}`,...(F=(M=m.parameters)==null?void 0:M.docs)==null?void 0:F.source}}};const ee=["Default","WithValue","BigSize","Disabled","WithError","Interactive"];export{u as BigSize,l as Default,p as Disabled,m as Interactive,c as WithError,d as WithValue,ee as __namedExportsOrder,Q as default};
