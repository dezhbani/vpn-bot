const { GraphQLObjectType, GraphQLString, GraphQLInt } = require("graphql");

const planType = new GraphQLObjectType({
    name: "planType",
    fields: {
        _id : {type: GraphQLString},
        name: {type: GraphQLString}, 
        price: {type: GraphQLInt},
        user_count: {type: GraphQLInt},
        data_size: {type: GraphQLInt},
        month: {type: GraphQLInt},
    }
})

module.exports = {
    planType
}