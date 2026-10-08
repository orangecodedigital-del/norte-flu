import { useMemo, useState } from "react";

type Category = "Mercearia" | "Hortifruti" | "Carnes" | "Frios e Laticínios" | "Bebidas" | "Limpeza" | "Higiene" | "Pet";
type Neighborhood = "Goitacazes" | "Donana" | "Bugalho" | "Campo Limpo";
type Product = { id:number; name:string; category:Category; price:number; unit:string; image:string; offer?:boolean };
type CartItem = Product & { quantity:number };

const WHATSAPP = "5522998940211";
const minimums: Record<Neighborhood, number> = { Goitacazes:80, Donana:100, Bugalho:100, "Campo Limpo":120 };
const categories: Category[] = ["Mercearia","Hortifruti","Carnes","Frios e Laticínios","Bebidas","Limpeza","Higiene","Pet"];

const products: Product[] = [
  { id:1, name:"Arroz Branco 5kg", category:"Mercearia", price:29.90, unit:"pct.", offer:true, image:"https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=80" },
  { id:2, name:"Feijão Carioca 1kg", category:"Mercearia", price:8.99, unit:"pct.", offer:true, image:"https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=700&q=80" },
  { id:3, name:"Café 500g", category:"Mercearia", price:19.90, unit:"pct.", image:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80" },
  { id:4, name:"Óleo de Soja 900ml", category:"Mercearia", price:7.49, unit:"un.", image:"https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=700&q=80" },
  { id:5, name:"Banana Prata", category:"Hortifruti", price:4.99, unit:"kg", offer:true, image:"https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=80" },
  { id:6, name:"Tomate", category:"Hortifruti", price:7.99, unit:"kg", image:"https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=700&q=80" },
  { id:7, name:"Batata Inglesa", category:"Hortifruti", price:5.49, unit:"kg", image:"https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=80" },
  { id:8, name:"Leite Integral 1L", category:"Frios e Laticínios", price:5.19, unit:"un.", offer:true, image:"https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=700&q=80" },
  { id:9, name:"Queijo Mussarela", category:"Frios e Laticínios", price:42.90, unit:"kg", image:"https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=700&q=80" },
  { id:10, name:"Refrigerante Cola 2L", category:"Bebidas", price:9.99, unit:"un.", offer:true, image:"https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=700&q=80" },
  { id:11, name:"Água Mineral 1,5L", category:"Bebidas", price:3.49, unit:"un.", image:"https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=700&q=80" },
  { id:12, name:"Detergente Líquido 500ml", category:"Limpeza", price:2.49, unit:"un.", offer:true, image:"https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=700&q=80" },
  { id:13, name:"Papel Higiênico 12 rolos", category:"Higiene", price:17.90, unit:"pct.", image:"https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=700&q=80" },
  { id:14, name:"Ração para Cães 3kg", category:"Pet", price:26.90, unit:"pct.", image:"https://images.unsplash.com/photo-1589924691106-073b5dd28f97?auto=format&fit=crop&w=700&q=80" },
];

const money = (value:number) => value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function App(){
  const [category,setCategory] = useState<"Todos"|Category>("Todos");
  const [cart,setCart] = useState<CartItem[]>([]);
  const [cartOpen,setCartOpen] = useState(false);
  const [deliveryOpen,setDeliveryOpen] = useState(false);
  const [neighborhood,setNeighborhood] = useState<Neighborhood|"">("");
  const [customer,setCustomer] = useState({name:"",phone:"",street:"",number:"",complement:"",reference:"",notes:""});

  const visible = useMemo(()=>category==="Todos"?products:products.filter(p=>p.category===category),[category]);
  const totalItems = cart.reduce((n,item)=>n+item.quantity,0);
  const total = cart.reduce((n,item)=>n+item.quantity*item.price,0);
  const minimum = neighborhood ? minimums[neighborhood] : 0;
  const missing = Math.max(0,minimum-total);

  const grouped = () => categories
    .map(cat=>({category:cat,items:cart.filter(item=>item.category===cat)}))
    .filter(group=>group.items.length);

  function add(product:Product){
    setCart(current=>{
      const found=current.find(item=>item.id===product.id);
      return found ? current.map(item=>item.id===product.id ? {...item,quantity:item.quantity+1}:item) : [...current,{...product,quantity:1}];
    });
  }

  function changeQuantity(id:number,delta:number){
    setCart(current=>current.flatMap(item=>{
      if(item.id!==id) return [item];
      const quantity=item.quantity+delta;
      return quantity>0 ? [{...item,quantity}] : [];
    }));
  }

  function message(){
    const lines:string[]=["*NOVO PEDIDO — NORTE FLU*",""];
    if(deliveryOpen){
      lines.push("*ENTREGA*");
      lines.push("Nome: "+customer.name);
      lines.push("Telefone: "+customer.phone);
      lines.push("Bairro: "+neighborhood);
      lines.push("Endereço: "+customer.street+", "+customer.number+(customer.complement?" — "+customer.complement:""));
      if(customer.reference) lines.push("Referência: "+customer.reference);
      if(customer.notes) lines.push("Observações: "+customer.notes);
      lines.push("");
    }
    lines.push("*ITENS DA COMPRA*");
    grouped().forEach(group=>{
      lines.push("", "*"+group.category.toUpperCase()+"*");
      group.items.forEach(item=>lines.push(item.quantity+"x "+item.name+" — "+money(item.quantity*item.price)));
    });
    lines.push("","*TOTAL ESTIMADO: "+money(total)+"*","","Pedido montado pelo catálogo digital do Norte Flu.");
    return lines.join("\n");
  }

  function sendWhatsApp(){
    if(!cart.length) return;
    // Lista pessoal: abre o seletor/compartilhamento do WhatsApp sem fixar destinatário.
    window.open("https://wa.me/?text="+encodeURIComponent(message()),"_blank");
  }

  function sendDeliveryOrder(){
    if(!cart.length || !ready) return;
    // Entrega: direciona o pedido preenchido ao WhatsApp oficial do supermercado.
    window.open("https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(message()),"_blank");
  }

  const ready = !!neighborhood && missing<=0 && customer.name.trim() && customer.phone.trim() && customer.street.trim() && customer.number.trim();

  return <div className="app-shell">
    <header className="topbar"><div className="topbar-inner">
      <img src="https://scontent.cdninstagram.com/v/t51.2885-19/443265606_972952780950106_2427098902530966390_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=104&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy45MDAuQzMifQ%3D%3D&_nc_ohc=a8TiiupGptIQ7kNvwX3I&_nc_oc=AdpwsndCm-da-Q83mv0dbnAO_vFjgWt-LbwVc-9MrTf7G7zcOGNjXxn1v4BMKyqjqXI&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_ss=7b689&oh=00_AQMKKXChXxU5wE0lHRB2q4A9DrXriUbeC3mVO4YNoayMUw&oe=6ACD67BA" alt="Supermercado Norte Flu" className="brand-logo" referrerPolicy="no-referrer" />
      <button className="cart-pill" onClick={()=>setCartOpen(true)}><span className="cart-icon">🛒</span><strong>{totalItems}</strong><span>Minha lista</span></button>
    </div></header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">DESDE 1977</span>
          <h1>HOJE COMEÇA<br/><span>NOSSA FESTA!</span></h1>
          <p>49 anos levando atendimento, variedade e ofertas para a nossa região. Monte sua compra pelo celular e mande tudo organizado para o WhatsApp.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={()=>document.getElementById("catalogo")?.scrollIntoView({behavior:"smooth"})}>Começar minha compra</button>
            <button className="secondary-button" onClick={()=>setCategory("Mercearia")}>Ver ofertas</button>
          </div>
        </div>
        <div className="anniversary-art" aria-label="49 anos Norte Flu">
    <span className="balloon balloon-red one"></span>
    <span className="balloon balloon-blue two"></span>
    <span className="balloon balloon-red three"></span>
    <span className="balloon balloon-blue four"></span>
    <div className="anniversary-number">49</div>
    <div className="anniversary-years">ANOS</div>
    <div className="anniversary-line">DESDE 1977</div>
  </div>
      </section>

      <section className="promo-strip"><div><strong>OFERTAS ESPECIAIS</strong><span>Enquanto durarem os estoques</span></div><div className="promo-price">PREÇO DE MERCADO. JEITO DE NORTE FLU.</div></section>

      <section className="catalog-section" id="catalogo">
        <div className="section-heading"><div><span className="section-kicker">CATÁLOGO</span><h2>Escolha por grupo</h2></div><span className="demo-note">Produtos de demonstração</span></div>
        <div className="category-row">
          <button className={category==="Todos"?"category active":"category"} onClick={()=>setCategory("Todos")}>Todos</button>
          {categories.map(cat=><button key={cat} className={category===cat?"category active":"category"} onClick={()=>setCategory(cat)}>{cat}</button>)}
        </div>
        {(category==="Todos"?categories:[category]).map(cat=>{
          const groupProducts=visible.filter(product=>product.category===cat);
          if(!groupProducts.length) return null;
          return <section className="catalog-group" key={cat}>
            <div className="catalog-group-heading"><h3>{cat}</h3><span>{groupProducts.length} {groupProducts.length===1?"produto":"produtos"}</span></div>
            <div className="product-grid">
              {groupProducts.map(product=><article className="product-card" key={product.id}>
                <div className="product-image-wrap">{product.offer&&<span className="offer-tag">OFERTA</span>}<img src={product.image} alt={product.name}/></div>
                <div className="product-body"><span className="product-category">{product.category}</span><h3>{product.name}</h3>
                  <div className="price-row"><div className="product-price"><strong>{money(product.price)}</strong><span>/{product.unit}</span></div><button className="add-button" onClick={()=>add(product)}>Adicionar</button></div>
                </div>
              </article>)}
            </div>
          </section>;
        })}
      </section>

      <section className="how-section">
        <div className="how-card"><span>01</span><strong>Escolha</strong><p>Selecione os produtos e defina a quantidade.</p></div>
        <div className="how-card"><span>02</span><strong>Organize</strong><p>Sua lista fica automaticamente separada por grupo.</p></div>
        <div className="how-card"><span>03</span><strong>Envie</strong><p>Salve em PDF ou mande tudo pronto para o WhatsApp.</p></div>
      </section>
    </main>

    {totalItems>0&&<button className="floating-cart" onClick={()=>setCartOpen(true)}><span>🛒 {totalItems} {totalItems===1?"item":"itens"}</span><strong>{money(total)}</strong></button>}

    {cartOpen&&<div className="modal-backdrop" onMouseDown={()=>setCartOpen(false)}><aside className="drawer" onMouseDown={e=>e.stopPropagation()}>
      <div className="drawer-header"><div><span className="section-kicker">SUA COMPRA</span><h2>Minha lista</h2></div><button className="close-button" onClick={()=>setCartOpen(false)}>×</button></div>
      {!cart.length ? <div className="empty-state">Sua lista está vazia.<br/>Comece adicionando produtos.</div> : <>
        <div className="list-scroll">{grouped().map(group=><section className="list-group" key={group.category}><h3>{group.category}</h3>{group.items.map(item=><div className="list-item" key={item.id}>
          <div className="list-item-copy"><strong>{item.name}</strong><span>{money(item.price)} / {item.unit}</span></div>
          <div className="qty-control"><button onClick={()=>changeQuantity(item.id,-1)}>−</button><strong>{item.quantity}</strong><button onClick={()=>changeQuantity(item.id,1)}>+</button></div>
        </div>)}</section>)}</div>
        <div className="drawer-footer"><div className="total-line"><span>Total estimado</span><strong>{money(total)}</strong></div>
          <div className="drawer-actions"><button className="outline-button" onClick={()=>window.print()}>Salvar PDF</button><button className="primary-button wide" onClick={()=>setDeliveryOpen(true)}>Quero receber em casa</button><button className="whatsapp-button" onClick={sendWhatsApp}>Enviar lista pelo WhatsApp</button></div>
        </div>
      </>}
    </aside></div>}

    {deliveryOpen&&<div className="modal-backdrop" onMouseDown={()=>setDeliveryOpen(false)}><aside className="delivery-modal" onMouseDown={e=>e.stopPropagation()}>
      <div className="drawer-header"><div><span className="section-kicker">ENTREGA</span><h2>Receba sua compra</h2></div><button className="close-button" onClick={()=>setDeliveryOpen(false)}>×</button></div>
      <p className="modal-intro">Os valores mínimos abaixo são demonstrativos e ficarão configuráveis no painel do Norte Flu.</p>
      <label>Bairro<select value={neighborhood} onChange={e=>setNeighborhood(e.target.value as Neighborhood|"")}><option value="">Selecione</option>{Object.keys(minimums).map(name=><option key={name} value={name}>{name}</option>)}</select></label>
      {neighborhood&&<div className={missing>0?"minimum-alert warning":"minimum-alert success"}>{missing>0?<>Faltam <strong>{money(missing)}</strong> para o mínimo de {money(minimum)}.</>:<>✓ Compra acima do mínimo de {money(minimum)} para {neighborhood}.</>}</div>}
      <div className="form-grid">
        <label>Nome<input value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} placeholder="Seu nome"/></label>
        <label>Telefone<input value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} placeholder="(22) 99999-9999"/></label>
        <label className="full">Rua<input value={customer.street} onChange={e=>setCustomer({...customer,street:e.target.value})} placeholder="Rua / avenida"/></label>
        <label>Número<input value={customer.number} onChange={e=>setCustomer({...customer,number:e.target.value})} placeholder="123"/></label>
        <label>Complemento<input value={customer.complement} onChange={e=>setCustomer({...customer,complement:e.target.value})} placeholder="Casa, apto..."/></label>
        <label className="full">Ponto de referência<input value={customer.reference} onChange={e=>setCustomer({...customer,reference:e.target.value})} placeholder="Próximo a..."/></label>
        <label className="full">Observações<textarea value={customer.notes} onChange={e=>setCustomer({...customer,notes:e.target.value})} placeholder="Alguma orientação para a entrega?"/></label>
      </div>
      <button className="whatsapp-button large" disabled={!ready} onClick={sendDeliveryOrder}>Enviar pedido pelo WhatsApp</button>
    </aside></div>}

    <div className="print-sheet"><img src="/logo-norteflu.svg?v=4" alt="Norte Flu"/><h1>Lista de Compras</h1>
      {grouped().map(group=><section key={group.category}><h2>{group.category}</h2>{group.items.map(item=><div className="print-row" key={item.id}><span>{item.quantity}x {item.name}</span><strong>{money(item.quantity*item.price)}</strong></div>)}</section>)}
      <div className="print-total"><span>Total estimado</span><strong>{money(total)}</strong></div><p>Supermercado Norte Flu · Desde 1977</p>
    </div>
  </div>;
}

export default App;
