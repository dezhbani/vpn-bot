const { GraphQLObjectType, GraphQLString, GraphQLScalarType } = require("graphql");
const { toObject, parseLiteral } = require("../utils/functions");

const userType = new GraphQLObjectType({
    name: "userType",
    fields: {
        _id : {type: GraphQLString},
        first_name : {type: GraphQLString},
        last_name : {type: GraphQLString},
        full_name : {type: GraphQLString},
        mobile : {type: GraphQLString}
    }
})

const anyType = new GraphQLScalarType({
    name: "anyType",
    parseValue: toObject,
    serialize: toObject,
    parseLiteral: parseLiteral 
})


const responseType = new GraphQLObjectType({
    name: "responseType",
    fields:{
        statusCode: {type: GraphQLString},
        data:{type: anyType}
    }
})

module.exports = {
    userType,
    responseType,
    anyType
}