const express = require('express');
const { graphqlHTTP  } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
}=require('graphql');

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const app = express();

const BookType = new GraphQLObjectType({
    name: 'Book', 
    description: 'This is just a description',
    fields: ()=>({
        id:{ type:  GraphQLNonNull(GraphQLInt) },
        name:{ type:  GraphQLNonNull(GraphQLString) },
        authorId:{ type:  GraphQLNonNull(GraphQLString) },
        author:{
            type: AuthorType,
            resolve :(book)=>{
                return authors.find(author => author.id===book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author', 
    description: 'This is just a Author description',
    fields: ()=>({
        id:{ type:  GraphQLNonNull(GraphQLInt) },
        name:{ type:  GraphQLNonNull(GraphQLString) },
        books:{ 
            type:  GraphQLList(BookType),
            resolve :(authors)=>{
                return books.filter(book => book.authorId===authors.id)
            }
        }
    })
})

const RootedQueryType = new GraphQLObjectType({
    name:'Query', 
    description:'This the ROOT Query',
    fields: ()=>({
        book:{
            type: BookType,
            description:'A Single Book',
            args:{ 
                id: {type : GraphQLInt}
            },
            resolve: (parent,args)=> books.find(book=> book.id === args.id)
        },
        author:{
            type: AuthorType,
            description:'A Single Author',
            args:{ 
                id: {type : GraphQLInt}
            },
            resolve: (parent,args)=> authors.find(author=> author.id === args.id)
        },
        books:{
            type: new GraphQLList(BookType),
            description:'List of all books',
             resolve: ()=> books
        },
        authors:{ 
            type:new GraphQLList((AuthorType)),
            description: 'Just a AuthorList',
            resolve: ()=>authors
        }
    })
})

const RootedMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'This is a Mutation',
    fields:()=>({
        addBook:{
            type:BookType,
            description:'A Single AddBook',
            args: {
                name: {type:  GraphQLNonNull(GraphQLString)},
                authorId : {type : GraphQLNonNull(GraphQLInt)}    
            },
            resolve: (parent,args)=>{
                const bk = {
                    id:books.length+1,
                    name:args.name,
                    authorId:args.authorId
                }
                books.push(bk);
                return bk;
            }
        }
    })

})

const schema = new GraphQLSchema({
    query : RootedQueryType,
    mutation:RootedMutationType
})

app.use('/graphql',graphqlHTTP ({
    schema:schema,
    graphiql:true
}))


app.listen(5000,()=>console.log(`Server start in 5000 port`));
