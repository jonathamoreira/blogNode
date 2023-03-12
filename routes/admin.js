const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require("../models/Postagem")
const Postagem = mongoose.model("postagens")

router.get('/', (req, res)=>{
    res.render("admin/index")
})

router.get('/posts', (req,res)=>{
    res.send("Página de Posts")
})

router.get('/categorias', (req, res)=>{
    Categoria.find().lean().sort({date:'desc'}).then((categorias)=>{
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err)=>{
        req.flash('error_msg', "Houve um erro"+err)
        res.redirect('/admin')
    })
})

router.get('/categorias/add', (req, res)=>{
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', (req, res)=>{

    var erros = []
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome inválido!"})
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido!"})
        }
        if(req.body.nome.length < 2 ){
            erros.push({texto:"Nome da categoria muito pequeno"})
        }
        if(erros.length >0){
            res.render("admin/addcategorias", {erros: erros})
        }
        else{
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
            new Categoria(novaCategoria).save().then(()=>{
                req.flash('success_msg', 'Categoria criada com sucesso')
                res.redirect('/admin/categorias')
            }).catch((err)=>{
                req.flash("error_msg", "erro ao salvar categoria"+err)
                res.redirect('/admin')
            })
        }
    })
router.get("/categorias/edit/:id", (req,res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err)=>{
        req.flash('error_msg', "Essa categoria não existe"+err)
        res.redirect('/admin/categorias')
    })
})
router.post("/categorias/edit", (req, res)=>{

    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: "Nome inválido!"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto: "Slug inválido!"})
    }
    if(req.body.nome.length < 2 ){
    erros.push({texto:"Nome da categoria muito pequeno"})
    }
    if(erros.length >0){
    res.render("admin/categorias", {erros: erros})
}
else{
    Categoria.findOne({_id:req.body.id}).then((categoria)=>{

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

    categoria.save().then(()=>{
        req.flash("success_msg", "categoria editada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg", "Erro interno"+err)
        res.redirect("/admin/categorias")
    })

    }).catch((err)=>{
        req.flash('error_msg', "houve um erro na edição"+err)
        res.redirect("/admin/categorias")
    })
}
         
})
router.post("/categorias/deletar", (req, res)=>{
    Categoria.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg", "Error ao deletar"+err)
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", (req, res)=>{

    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err)=>{
        req.flash("error_msg", "Error ao listar as postagens"+err)
        res.redirect("/admin")
    })
    
})

router.get("/postagens/add", (req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar formulário")
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", (req,res)=>{
    var erros = []
        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
            erros.push({texto: "Título inválido"})
        }
        if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
            erros.push({texto: "Conteúdo inválido!"})
        }
        if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
            erros.push({texto: "Descrição inválida!"})
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido!"})
        }
        if(req.body.conteudo.length < 2 ){
            erros.push({texto:"conteúdo muito pequeno"})
        }
        if(req.body.categoria == "0"){
            erros.push({texto: "Categoria inválida"})
        }
        if(erros.length >0){
            res.render("admin/addpostagens", {erros: erros})
        }
        else{
            const novaPostagem = {
                titulo: req.body.titulo,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria,
                slug: req.body.slug
            }
            new Postagem(novaPostagem).save().then(()=>{
                req.flash("success_msg", "postagem salva")
                res.redirect("/admin/postagens")
            }).catch((err)=>{
                req.flash("error_msg", "Houve um erro pra salvar postagem"+err)
                res.redirect("/admin/postagens")
            })
        }
})

router.get("/postagens/edit/:id", (req,res)=>{

    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err)=>{
        req.flash("error_msg", "Erro ao listar as categorias"+err)
        res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário"+err)
        res.redirect("/admin/postagens")
    })
})

router.post("/postagem/edit", (req, res)=>{
    var erros = []
        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
            erros.push({texto: "Título inválido"})
        }
        if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
            erros.push({texto: "Conteúdo inválido!"})
        }
        if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
            erros.push({texto: "Descrição inválida!"})
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido!"})
        }
        if(req.body.conteudo.length < 2 ){
            erros.push({texto:"conteúdo muito pequeno"})
        }
        if(req.body.categoria == "0"){
            erros.push({texto: "Categoria inválida"})
        }
        if(erros.length >0){
            res.render("admin/addpostagens", {erros: erros})
        }
        else{
            Postagem.findOne({_id: req.body.id}).then((postagem)=>{

                postagem.titulo=  req.body.titulo
                postagem.descricao=  req.body.descricao
                postagem.conteudo=  req.body.conteudo
                postagem.categoria=  req.body.categoria
                postagem.slug=  req.body.slug

                postagem.save().then(()=>{
                    req.flash("success_msg", "Postagem editada com sucesso")
                    res.redirect("/admin/postagens")
                }).catch((err)=>{
                    req.flash("error_msg", "erro interno"+err)
                    res.redirect("/admin/postagens")
                })   
            }).catch((err)=>{
                req.flash("error_msg", "erro ao salvar edição"+err)
                res.redirect("/admin/postagens")
            })
        }
})

router.get("/postagens/deletar/:id", (req,res)=>{
    Postagem.deleteOne({_id: req.params.id}).then(()=>{
        req.flash("success_msg", 'Postagem deletada')
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash("error_msg", "erro ao deletar"+err)
        res.redirect("/admin/postagens")
    })
})

module.exports = router