const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt } = require("graphql");

const paymentType = new GraphQLObjectType({
    name: "paymentType",
    fields: {
        invoiceNumber : {type: GraphQLString},
        verify: {type: GraphQLBoolean}, 
        amount: {type: GraphQLInt}
    }
})

module.exports = {
    paymentType
}