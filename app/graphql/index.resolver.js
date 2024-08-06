const { GraphQLObjectType, GraphQLSchema } = require("graphql");
const { getProfileDetails, getBills } = require("./queries/user.resolver");
const { getConfigs } = require("./queries/config.resolver");
const { getPlans } = require("./queries/plan.resolver");

const rootQuery = new GraphQLObjectType({
    name: "rootQuery",
    fields: {
        profile: getProfileDetails,
        configs: getConfigs,
        plans: getPlans,
        bills: getBills,

    }
}); 
// const rootMutation = new GraphQLObjectType({
//     name: "rootMutation",
//     fields: {
//     }
// });
const graphqlSchema = new GraphQLSchema({
    query: rootQuery,
    // mutation: rootMutation
}) 

module.exports = {
    graphqlSchema
}