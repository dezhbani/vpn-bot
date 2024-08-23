const { GraphQLObjectType, GraphQLString, GraphQLBoolean } = require("graphql");
const { planType } = require("./plan.type");

const configType = new GraphQLObjectType({
    name: "configType",
    fields: {
        _id : {type: GraphQLString},
        userID: {type: GraphQLString}, 
        planID: {type: planType}, 
        configID: {type: GraphQLString},
        name: {type: GraphQLString}, 
        status: {type: GraphQLBoolean},
        config_content: {type: GraphQLString},
        expiry_date: {type: GraphQLString}
    }
})
const configUsageType = new GraphQLObjectType({
    name: "configUsageType",
    fields: {
        planID: {type: planType}, 
        configID: {type: GraphQLString},
        name: {type: GraphQLString}, 
        status: {type: GraphQLBoolean},
        config_content: {type: GraphQLString},
        expiry_date: {type: GraphQLString}
    }
})

module.exports = {
    configType
}