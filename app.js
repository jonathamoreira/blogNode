//Carregando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require('./routes/admin')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require('./routes/usuario')
    const passport = require("passport")
    require("./config/auth")(passport)

//Configurações
    //Sessão
    app.use(session({
        secret: "cursonode",
        resave: true,
        saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    //Midleware
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        next()
    })

    //Body Parser
    //app.use(bodyParser.urlencoded({extended: true}))
    //app.use(bodyParser.json())
    app.use(express.json());
    app.use(express.urlencoded({extended:true}))
    //Handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    //Mongoose
    mongoose.Promise = global.Promise
    mongoose.connect("mongodb://127.0.0.1:27017/cursonode").then(()=>{
        console.log('Conectado ao Mongodb!')
    }).catch((err)=>{
        console.log('Erro ao se conectar' + err)
    })
    //Public
    app.use(express.static(path.join(__dirname, '/public')))

//Rotas
    app.get("/postagem/:slug", (req,res)=>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Essa postagem não existe")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro interno"+err)
            res.redirect("/")
        })
    })

    app.get('/', (req, res)=>{
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens)=>{
            res.render("index", {postagens: postagens})
        }).catch((err)=>{
            req.flash("error_msg", "Error ao exibir as postagens"+err)
            res.redirect("/404")
        })
    })

    app.get("/categorias", (req, res)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("categorias/index", {categorias: categorias})
        }).catch((err)=>{
            req.flash("error_msg", "erro ao listar categorias"+err)
            res.redirect("/")
        })
    })
    app.get("/categorias/:slug", (req,res)=>{
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err)=>{
                    req.flash("error_msg", "Houve um erro ao listar os posts"+err)
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Essa categoria não existe")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao listar as postagens da categoria"+err)
            res.redirect("/")
        })
    })

    app.get("/404", (req, res)=>{
        res.send("Erro 404")
    })
    app.use("/usuarios", usuarios)
    app.use('/admin', admin)
//Outros
const PORT = 8081 
app.listen(PORT,()=>{
    console.log('Servidor rodando!')
} )