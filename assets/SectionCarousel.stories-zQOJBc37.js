import{j as e}from"./jsx-runtime-CR8kToUD.js";import{r as P}from"./index-D_eiCwOZ.js";try{let s=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},r=new s.Error().stack;r&&(s._sentryDebugIds=s._sentryDebugIds||{},s._sentryDebugIds[r]="b21438e0-7a52-4db4-bfdb-5ae20ca6434a",s._sentryDebugIdIdentifier="sentry-dbid-b21438e0-7a52-4db4-bfdb-5ae20ca6434a")}catch{}const w=[{id:"1",name:"Leche entera",price:"0,89 €",subtext:"1 litro"},{id:"2",name:"Pan de molde",price:"1,15 €",subtext:"460g"},{id:"3",name:"Aceite de oliva",price:"5,99 €",subtext:"1 litro"},{id:"4",name:"Yogur natural",price:"1,20 €",subtext:"Pack 4"},{id:"5",name:"Huevos camperos",price:"2,79 €",subtext:"12 unidades"},{id:"6",name:"Agua mineral",price:"1,98 €",subtext:"6x1,5L"},{id:"7",name:"Arroz integral",price:"1,55 €",subtext:"1 kg"},{id:"8",name:"Pasta espagueti",price:"0,79 €",subtext:"500g"},{id:"9",name:"Tomate triturado",price:"0,95 €",subtext:"800g"},{id:"10",name:"Atún en aceite",price:"4,29 €",subtext:"Pack 6"}],k=({title:s="Productos populares",items:r=w,onItemClick:c})=>{const d=P.useRef(null),m=a=>{if(!d.current)return;const l=340;d.current.scrollBy({left:a==="left"?-l:l,behavior:"smooth"})};return e.jsxs("div",{className:"section-carousel",children:[e.jsxs("div",{className:"section-carousel__header",children:[e.jsx("h3",{className:"section-carousel__title",children:s}),e.jsxs("div",{className:"section-carousel__arrows",children:[e.jsx("button",{className:"section-carousel__arrow",onClick:()=>m("left"),"aria-label":"Scroll left",children:"❮"}),e.jsx("button",{className:"section-carousel__arrow",onClick:()=>m("right"),"aria-label":"Scroll right",children:"❯"})]})]}),e.jsx("div",{className:"section-carousel__track-wrapper",children:e.jsx("div",{className:"section-carousel__track",ref:d,children:r.map(a=>e.jsxs("div",{className:"section-carousel__item",onClick:()=>c==null?void 0:c(a.id),children:[a.image?e.jsx("img",{className:"section-carousel__item-img",src:a.image,alt:a.name}):e.jsx("div",{className:"section-carousel__item-placeholder",children:"🛒"}),e.jsx("div",{className:"section-carousel__item-name",title:a.name,children:a.name}),a.price&&e.jsx("div",{className:"section-carousel__item-price",children:a.price}),a.subtext&&e.jsx("div",{className:"section-carousel__item-subtext",children:a.subtext})]},a.id))})})]})},$={title:"Components / SectionCarousel",component:k,tags:["autodocs"],parameters:{layout:"padded"}},n={},t={args:{title:"Recomendados para ti",items:Array.from({length:8},(s,r)=>({id:`img-${r}`,name:`Producto ${r+1}`,price:`${(Math.random()*5+.5).toFixed(2)} €`,subtext:["250g","500g","1 kg","1 litro","Pack 4","6 unidades"][r%6],image:`https://picsum.photos/seed/prod${r}/160/120`}))}},i={args:{title:"Últimas novedades",items:[{id:"1",name:"Kombucha",price:"2,10 €",subtext:"330ml"},{id:"2",name:"Hummus",price:"1,89 €",subtext:"200g"},{id:"3",name:"Guacamole",price:"2,49 €",subtext:"200g"}]}},o={args:{title:"Categorías",items:[{id:"1",name:"Frutas y verduras"},{id:"2",name:"Carnes"},{id:"3",name:"Pescados"},{id:"4",name:"Lácteos"},{id:"5",name:"Panadería"},{id:"6",name:"Bebidas"},{id:"7",name:"Congelados"},{id:"8",name:"Limpieza"}]}};var u,p,g;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:"{}",...(g=(p=n.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var b,x,h;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    title: 'Recomendados para ti',
    items: Array.from({
      length: 8
    }, (_, i) => ({
      id: \`img-\${i}\`,
      name: \`Producto \${i + 1}\`,
      price: \`\${(Math.random() * 5 + 0.5).toFixed(2)} €\`,
      subtext: ['250g', '500g', '1 kg', '1 litro', 'Pack 4', '6 unidades'][i % 6],
      image: \`https://picsum.photos/seed/prod\${i}/160/120\`
    }))
  }
}`,...(h=(x=t.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var _,f,v;i.parameters={...i.parameters,docs:{...(_=i.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    title: 'Últimas novedades',
    items: [{
      id: '1',
      name: 'Kombucha',
      price: '2,10 €',
      subtext: '330ml'
    }, {
      id: '2',
      name: 'Hummus',
      price: '1,89 €',
      subtext: '200g'
    }, {
      id: '3',
      name: 'Guacamole',
      price: '2,49 €',
      subtext: '200g'
    }]
  }
}`,...(v=(f=i.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var j,y,N;o.parameters={...o.parameters,docs:{...(j=o.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    title: 'Categorías',
    items: [{
      id: '1',
      name: 'Frutas y verduras'
    }, {
      id: '2',
      name: 'Carnes'
    }, {
      id: '3',
      name: 'Pescados'
    }, {
      id: '4',
      name: 'Lácteos'
    }, {
      id: '5',
      name: 'Panadería'
    }, {
      id: '6',
      name: 'Bebidas'
    }, {
      id: '7',
      name: 'Congelados'
    }, {
      id: '8',
      name: 'Limpieza'
    }]
  }
}`,...(N=(y=o.parameters)==null?void 0:y.docs)==null?void 0:N.source}}};const A=["Default","WithImages","FewItems","Categories"];export{o as Categories,n as Default,i as FewItems,t as WithImages,A as __namedExportsOrder,$ as default};
