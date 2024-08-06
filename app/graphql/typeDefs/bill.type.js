const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLBoolean } = require("graphql");
const { planType } = require("./plan.type");
const { paymentType } = require("./payment.type");

const forType = new GraphQLObjectType({
    name: "forType",
    fields: {
        description: {type: GraphQLString},
        user: {type: GraphQLString}
    }
});
const billType = new GraphQLObjectType({
    name: "billType",
    fields: {
        planID: {type: planType},
        paymentID: {type: paymentType},
        buy_date: {type: GraphQLInt},
        for: {type: forType}, 
        price: {type: GraphQLInt},
        up: {type: GraphQLBoolean}
    }
})

module.exports = {
    billType
}