import{j as e}from"./jsx-runtime-CR8kToUD.js";import"./index-D_eiCwOZ.js";try{let a=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},r=new a.Error().stack;r&&(a._sentryDebugIds=a._sentryDebugIds||{},a._sentryDebugIds[r]="07586a40-5816-4d52-9d63-8a9909a61690",a._sentryDebugIdIdentifier="sentry-dbid-07586a40-5816-4d52-9d63-8a9909a61690")}catch{}const t=({name:a,format:r,price:y,priceUnit:N,image:w,quantity:o,isNew:v=!1})=>e.jsxs("div",{"data-testid":"product-cell",className:`product-cell product-cell--actionable${o>0?" product-cell--in-cart":""}`,children:[e.jsxs("button",{className:"product-cell__content-link","data-testid":"open-product-detail",children:[v&&e.jsx("span",{className:"product-cell__new-arrival-label",children:"Novedad"}),e.jsxs("div",{className:"product-cell__image-wrapper",children:[e.jsx("img",{src:w,alt:a}),e.jsx("span",{className:"product-cell__image-overlay"})]}),e.jsxs("div",{className:"product-cell__info",children:[e.jsx("h4",{className:"subhead1-r product-cell__description-name","data-testid":"product-cell-name",children:a}),e.jsx("div",{className:"product-format",children:e.jsx("span",{className:"product-format__size--cell",children:r})}),e.jsxs("div",{className:"product-price",children:[e.jsx("span",{className:"product-price__unit-price",children:y}),e.jsxs("span",{className:"product-price__extra-price",children:["/",N]})]})]})]}),e.jsx("div",{className:`product-quantity-button${o>0?" product-quantity-button--in-cart":""}`,children:o===0?e.jsx("button",{className:"button button-rounded button-rounded--small product-quantity-button__add",children:e.jsx("span",{className:"button__text",children:"Añadir al carro"})}):e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"button button-rounded button-rounded--small product-quantity-button__add",children:e.jsx("span",{className:"button__text",children:"Añadir al carro"})}),e.jsxs("div",{className:"button-picker button-picker--grid",children:[e.jsxs("div",{className:"product-feedback",style:{display:"flex",flexDirection:"column"},children:[e.jsx("label",{className:"product-feedback__cart-text footnote1-r",children:"En carro"}),e.jsxs("label",{className:"product-feedback__add-counter title2-b",children:[o," ud."]})]}),e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx("button",{className:"button button-oval button-oval--small button--small delete-28",children:"🗑"}),e.jsx("button",{className:"button button-oval button-oval--small button--small",children:"＋"})]})]})]})})]}),C={title:"Components/ProductCell",component:t,parameters:{layout:"centered"},argTypes:{quantity:{control:{type:"number",min:0,max:99}},isNew:{control:"boolean"}}},n={args:{name:"Sorbete de açaí Hacendado sabor guaraná",format:"Bote 220 ml",price:"2,90 €",priceUnit:"ud.",image:"https://prod-mercadona.imgix.net/images/a]cai_placeholder.jpg?fit=crop&h=300&w=300",quantity:0}},c={args:{name:"Helado bombón pistacho Hacendado con cobertura",format:"Caja 6 ud. (540 ml)",price:"4,60 €",priceUnit:"ud.",image:"https://prod-mercadona.imgix.net/images/pistacho_placeholder.jpg?fit=crop&h=300&w=300",quantity:1}},i={args:{name:"Yogur griego natural Hacendado",format:"Pack 4 x 125 g (500 g)",price:"1,85 €",priceUnit:"ud.",image:"https://prod-mercadona.imgix.net/images/yogur_placeholder.jpg?fit=crop&h=300&w=300",quantity:0,isNew:!0}},d={render:()=>e.jsxs("div",{style:{display:"flex",flexWrap:"wrap",gap:"8px",maxWidth:"440px"},children:[e.jsx(t,{name:"Sorbete de açaí Hacendado sabor guaraná",format:"Bote 220 ml",price:"2,90 €",priceUnit:"ud.",image:"https://prod-mercadona.imgix.net/images/acai_placeholder.jpg?fit=crop&h=300&w=300",quantity:0}),e.jsx(t,{name:"Helado bombón pistacho Hacendado con cobertura",format:"Caja 6 ud. (540 ml)",price:"4,60 €",priceUnit:"ud.",image:"https://prod-mercadona.imgix.net/images/pistacho_placeholder.jpg?fit=crop&h=300&w=300",quantity:1}),e.jsx(t,{name:"Leche entera Hacendado",format:"Brick 1 l",price:"0,89 €",priceUnit:"ud.",image:"https://prod-mercadona.imgix.net/images/leche_placeholder.jpg?fit=crop&h=300&w=300",quantity:3,isNew:!0}),e.jsx(t,{name:"Pan de molde integral Hacendado",format:"Paquete 820 g",price:"1,30 €",priceUnit:"ud.",image:"https://prod-mercadona.imgix.net/images/pan_placeholder.jpg?fit=crop&h=300&w=300",quantity:0})]})};var s,l,p;n.parameters={...n.parameters,docs:{...(s=n.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    name: 'Sorbete de açaí Hacendado sabor guaraná',
    format: 'Bote 220 ml',
    price: '2,90 \\u20AC',
    priceUnit: 'ud.',
    image: 'https://prod-mercadona.imgix.net/images/a]cai_placeholder.jpg?fit=crop&h=300&w=300',
    quantity: 0
  }
}`,...(p=(l=n.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};var m,u,g;c.parameters={...c.parameters,docs:{...(m=c.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    name: 'Helado bombón pistacho Hacendado con cobertura',
    format: 'Caja 6 ud. (540 ml)',
    price: '4,60 \\u20AC',
    priceUnit: 'ud.',
    image: 'https://prod-mercadona.imgix.net/images/pistacho_placeholder.jpg?fit=crop&h=300&w=300',
    quantity: 1
  }
}`,...(g=(u=c.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var h,x,b;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    name: 'Yogur griego natural Hacendado',
    format: 'Pack 4 x 125 g (500 g)',
    price: '1,85 \\u20AC',
    priceUnit: 'ud.',
    image: 'https://prod-mercadona.imgix.net/images/yogur_placeholder.jpg?fit=crop&h=300&w=300',
    quantity: 0,
    isNew: true
  }
}`,...(b=(x=i.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var f,j,_;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    maxWidth: '440px'
  }}>
      <ProductCell name="Sorbete de açaí Hacendado sabor guaraná" format="Bote 220 ml" price="2,90 &euro;" priceUnit="ud." image="https://prod-mercadona.imgix.net/images/acai_placeholder.jpg?fit=crop&h=300&w=300" quantity={0} />
      <ProductCell name="Helado bombón pistacho Hacendado con cobertura" format="Caja 6 ud. (540 ml)" price="4,60 &euro;" priceUnit="ud." image="https://prod-mercadona.imgix.net/images/pistacho_placeholder.jpg?fit=crop&h=300&w=300" quantity={1} />
      <ProductCell name="Leche entera Hacendado" format="Brick 1 l" price="0,89 &euro;" priceUnit="ud." image="https://prod-mercadona.imgix.net/images/leche_placeholder.jpg?fit=crop&h=300&w=300" quantity={3} isNew />
      <ProductCell name="Pan de molde integral Hacendado" format="Paquete 820 g" price="1,30 &euro;" priceUnit="ud." image="https://prod-mercadona.imgix.net/images/pan_placeholder.jpg?fit=crop&h=300&w=300" quantity={0} />
    </div>
}`,...(_=(j=d.parameters)==null?void 0:j.docs)==null?void 0:_.source}}};const U=["Default","InCart","NewArrival","Grid"];export{n as Default,d as Grid,c as InCart,i as NewArrival,U as __namedExportsOrder,C as default};
