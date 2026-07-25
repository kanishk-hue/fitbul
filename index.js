const express=require('express'),cors=require('cors'),helmet=require('helmet'),rateLimit=require('express-rate-limit'),path=require('path'),fs=require('fs'),{v4:uuidv4}=require('uuid');
const app=express(),PORT=process.env.PORT||3000,DB=path.join(__dirname,'../database/db.json');
const rdb=()=>JSON.parse(fs.readFileSync(DB,'utf8'));
const wdb=d=>fs.writeFileSync(DB,JSON.stringify(d,null,2));
app.use(helmet({contentSecurityPolicy:false}));app.use(cors({origin:'*'}));app.use(express.json());app.use(express.urlencoded({extended:true}));
app.use('/api',rateLimit({windowMs:15*60*1000,max:500}));
app.use(express.static(path.join(__dirname,'../client')));

app.get('/api/categories',(req,res)=>{try{const db=rdb();const cats=db.categories.map(c=>({...c,product_count:db.products.filter(p=>p.categoryId===c.id).length})).sort((a,b)=>a.sort-b.sort);res.json({success:true,data:cats});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.get('/api/products',(req,res)=>{try{const db=rdb();const{category,featured,bestseller,isNew,search,limit=100,offset=0}=req.query;let products=db.products.map(p=>{const cat=db.categories.find(c=>c.id===p.categoryId)||{};return{...p,categoryName:cat.name,categorySlug:cat.slug};});if(category)products=products.filter(p=>p.categorySlug===category);if(featured==='1')products=products.filter(p=>p.featured);if(bestseller==='1')products=products.filter(p=>p.bestseller);if(isNew==='1')products=products.filter(p=>p.isNew);if(search){const q=search.toLowerCase();products=products.filter(p=>p.name.toLowerCase().includes(q)||(p.shortDesc||'').toLowerCase().includes(q)||(p.modelCode||'').toLowerCase().includes(q)||(p.tags||[]).some(t=>t.toLowerCase().includes(q)));}products.sort((a,b)=>(b.featured?1:0)-(a.featured?1:0)||(b.bestseller?1:0)-(a.bestseller?1:0)||(a.sort||0)-(b.sort||0));const total=products.length;products=products.slice(Number(offset),Number(offset)+Number(limit));res.json({success:true,data:products,total});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.get('/api/products/:slug',(req,res)=>{try{const db=rdb();const product=db.products.find(p=>p.slug===req.params.slug||p.id===req.params.slug);if(!product)return res.status(404).json({success:false,error:'Product not found'});const cat=db.categories.find(c=>c.id===product.categoryId)||{};const related=db.products.filter(p=>p.categoryId===product.categoryId&&p.id!==product.id).slice(0,4).map(p=>({...p,categoryName:cat.name,categorySlug:cat.slug}));res.json({success:true,data:{...product,categoryName:cat.name,categorySlug:cat.slug},related});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.get('/api/testimonials',(req,res)=>{try{const db=rdb();res.json({success:true,data:db.testimonials||[]});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.get('/api/search',(req,res)=>{try{const{q}=req.query;if(!q||q.length<2)return res.json({success:true,data:[]});const db=rdb();const query=q.toLowerCase();const results=db.products.filter(p=>p.name.toLowerCase().includes(query)||(p.shortDesc||'').toLowerCase().includes(query)||(p.modelCode||'').toLowerCase().includes(query)||(p.tags||[]).some(t=>t.toLowerCase().includes(query))).slice(0,10).map(p=>{const cat=db.categories.find(c=>c.id===p.categoryId)||{};return{id:p.id,slug:p.slug,name:p.name,shortDesc:p.shortDesc,images:p.images,modelCode:p.modelCode,categoryName:cat.name};});res.json({success:true,data:results});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.get('/api/stats',(req,res)=>{try{const db=rdb();res.json({success:true,data:{products:db.products.length,categories:db.categories.length,established:1975,units:4}});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.post('/api/enquiries',(req,res)=>{try{const{name,email,phone,company,city,message,productId,enquiryType}=req.body;if(!name?.trim()||!email?.trim()||!message?.trim())return res.status(400).json({success:false,error:'Name, email and message are required.'});if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({success:false,error:'Please enter a valid email address.'});const db=rdb();if(!db.enquiries)db.enquiries=[];const enquiry={id:uuidv4(),name:name.trim(),email:email.trim(),phone:phone?.trim()||null,company:company?.trim()||null,city:city?.trim()||null,message:message.trim(),productId:productId||null,enquiryType:enquiryType||'general',status:'new',createdAt:new Date().toISOString()};db.enquiries.unshift(enquiry);wdb(db);res.json({success:true,message:'Enquiry submitted! We will contact you within 24 hours.',id:enquiry.id});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.post('/api/newsletter',(req,res)=>{try{const{email,name}=req.body;if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({success:false,error:'Valid email required.'});const db=rdb();if(!db.newsletter)db.newsletter=[];if(db.newsletter.find(s=>s.email===email))return res.json({success:true,message:'You are already subscribed!'});db.newsletter.push({id:uuidv4(),email,name:name||null,createdAt:new Date().toISOString()});wdb(db);res.json({success:true,message:'Subscribed! Welcome to FitBulls.'});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.post('/api/admin/login',(req,res)=>{try{const{username,password}=req.body;const db=rdb();const user=(db.admin||[]).find(u=>u.username===username&&u.password===password);if(!user)return res.status(401).json({success:false,error:'Invalid credentials.'});res.json({success:true,token:`fb_${user.id}`,user:{id:user.id,username:user.username,role:user.role}});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.get('/api/admin/stats',(req,res)=>{try{const db=rdb();res.json({success:true,data:{products:db.products.length,categories:db.categories.length,enquiries:(db.enquiries||[]).length,newEnquiries:(db.enquiries||[]).filter(e=>e.status==='new').length,subscribers:(db.newsletter||[]).length,recentEnquiries:(db.enquiries||[]).slice(0,5)}});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.get('/api/admin/enquiries',(req,res)=>{try{const db=rdb();res.json({success:true,data:db.enquiries||[]});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.patch('/api/admin/enquiries/:id',(req,res)=>{try{const{status}=req.body;const db=rdb();const e=(db.enquiries||[]).find(e=>e.id===req.params.id);if(!e)return res.status(404).json({success:false,error:'Not found'});e.status=status;wdb(db);res.json({success:true,message:'Updated.'});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.get('/api/admin/subscribers',(req,res)=>{try{const db=rdb();res.json({success:true,data:db.newsletter||[]});}catch(e){res.status(500).json({success:false,error:e.message});}});

app.get('*',(req,res)=>{res.sendFile(path.join(__dirname,'../client/index.html'));});

app.listen(PORT,()=>{console.log('\n🐂 FitBulls → http://localhost:'+PORT+'\n');});
