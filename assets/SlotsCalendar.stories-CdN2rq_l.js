import{j as e}from"./jsx-runtime-CR8kToUD.js";import{r as p}from"./index-D_eiCwOZ.js";try{let s=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},i=new s.Error().stack;i&&(s._sentryDebugIds=s._sentryDebugIds||{},s._sentryDebugIds[i]="719b742b-765d-4fa7-a874-06ef6adaa3eb",s._sentryDebugIdIdentifier="sentry-dbid-719b742b-765d-4fa7-a874-06ef6adaa3eb")}catch{}const D=[{date:"2026-04-15",dayName:"Mié",dayNum:15,slots:[{id:"1",time:"09:00 - 11:00",price:"Gratis",tag:"Recomendado",available:!0},{id:"2",time:"11:00 - 13:00",price:"2,50 €",available:!0},{id:"3",time:"13:00 - 15:00",price:"2,50 €",available:!0},{id:"4",time:"17:00 - 19:00",price:"3,50 €",available:!1},{id:"5",time:"19:00 - 21:00",price:"3,50 €",available:!0}]},{date:"2026-04-16",dayName:"Jue",dayNum:16,slots:[{id:"6",time:"09:00 - 11:00",price:"Gratis",available:!0},{id:"7",time:"11:00 - 13:00",price:"2,50 €",available:!0},{id:"8",time:"17:00 - 19:00",price:"3,50 €",available:!0}]},{date:"2026-04-17",dayName:"Vie",dayNum:17,slots:[{id:"9",time:"09:00 - 11:00",price:"Gratis",tag:"Recomendado",available:!0},{id:"10",time:"13:00 - 15:00",price:"2,50 €",available:!0}]},{date:"2026-04-18",dayName:"Sáb",dayNum:18,slots:[{id:"11",time:"09:00 - 11:00",price:"4,00 €",available:!0},{id:"12",time:"11:00 - 13:00",price:"4,00 €",available:!0}]}],S=({title:s="Elige tu franja de entrega",days:i=D,onSlotSelect:n})=>{var m;const[r,j]=p.useState(((m=i[0])==null?void 0:m.date)||""),[h,o]=p.useState(""),c=i.find(a=>a.date===r);return e.jsxs("div",{className:"slots-calendar",children:[e.jsxs("div",{className:"slots-calendar__header",children:[e.jsx("span",{className:"slots-calendar__title",children:s}),e.jsxs("div",{className:"slots-calendar__nav",children:[e.jsx("button",{className:"slots-calendar__nav-btn","aria-label":"Previous",children:"❮"}),e.jsx("button",{className:"slots-calendar__nav-btn","aria-label":"Next",children:"❯"})]})]}),e.jsx("div",{className:"slots-calendar__days",children:i.map(a=>e.jsxs("div",{className:`slots-calendar__day${a.date===r?" slots-calendar__day--selected":""}`,onClick:()=>{j(a.date),o("")},children:[e.jsx("div",{className:"slots-calendar__day-name",children:a.dayName}),e.jsx("div",{className:"slots-calendar__day-num",children:a.dayNum})]},a.date))}),e.jsx("div",{className:"slots-calendar__slots",children:c==null?void 0:c.slots.map(a=>e.jsxs("div",{className:["slots-calendar__slot",a.id===h?"slots-calendar__slot--selected":"",a.available?"":"slots-calendar__slot--unavailable"].filter(Boolean).join(" "),onClick:()=>{a.available&&(o(a.id),n==null||n(r,a.id))},children:[e.jsx("span",{className:"slots-calendar__slot-time",children:a.time}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:8},children:[a.tag&&e.jsx("span",{className:"slots-calendar__slot-tag",children:a.tag}),a.price&&e.jsx("span",{className:"slots-calendar__slot-price",children:a.price})]})]},a.id))})]})},G={title:"Components / SlotsCalendar",component:S,tags:["autodocs"],parameters:{layout:"padded"}},l={},t={args:{title:"Entrega disponible",days:[{date:"2026-04-20",dayName:"Lun",dayNum:20,slots:[{id:"a1",time:"10:00 - 12:00",price:"Gratis",available:!0,tag:"Recomendado"},{id:"a2",time:"18:00 - 20:00",price:"3,00 €",available:!0}]},{date:"2026-04-21",dayName:"Mar",dayNum:21,slots:[{id:"b1",time:"09:00 - 11:00",price:"Gratis",available:!0}]}]}},d={args:{title:"Sin franjas disponibles",days:[{date:"2026-04-22",dayName:"Mié",dayNum:22,slots:[{id:"c1",time:"09:00 - 11:00",price:"2,50 €",available:!1},{id:"c2",time:"11:00 - 13:00",price:"2,50 €",available:!1},{id:"c3",time:"17:00 - 19:00",price:"3,50 €",available:!1}]}]}};var u,b,v;l.parameters={...l.parameters,docs:{...(u=l.parameters)==null?void 0:u.docs,source:{originalSource:"{}",...(v=(b=l.parameters)==null?void 0:b.docs)==null?void 0:v.source}}};var _,y,N;t.parameters={...t.parameters,docs:{...(_=t.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    title: 'Entrega disponible',
    days: [{
      date: '2026-04-20',
      dayName: 'Lun',
      dayNum: 20,
      slots: [{
        id: 'a1',
        time: '10:00 - 12:00',
        price: 'Gratis',
        available: true,
        tag: 'Recomendado'
      }, {
        id: 'a2',
        time: '18:00 - 20:00',
        price: '3,00 €',
        available: true
      }]
    }, {
      date: '2026-04-21',
      dayName: 'Mar',
      dayNum: 21,
      slots: [{
        id: 'b1',
        time: '09:00 - 11:00',
        price: 'Gratis',
        available: true
      }]
    }]
  }
}`,...(N=(y=t.parameters)==null?void 0:y.docs)==null?void 0:N.source}}};var f,g,x;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    title: 'Sin franjas disponibles',
    days: [{
      date: '2026-04-22',
      dayName: 'Mié',
      dayNum: 22,
      slots: [{
        id: 'c1',
        time: '09:00 - 11:00',
        price: '2,50 €',
        available: false
      }, {
        id: 'c2',
        time: '11:00 - 13:00',
        price: '2,50 €',
        available: false
      }, {
        id: 'c3',
        time: '17:00 - 19:00',
        price: '3,50 €',
        available: false
      }]
    }]
  }
}`,...(x=(g=d.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};const I=["Default","FewSlots","AllUnavailable"];export{d as AllUnavailable,l as Default,t as FewSlots,I as __namedExportsOrder,G as default};
