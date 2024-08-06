const { configModel } = require("../../models/config");
const { configType } = require("../typeDefs/config.type");
const { checkToken } = require("./public.resolver");
const { GraphQLList } = require("graphql");

const getConfigs = {
    type: new GraphQLList(configType),
    resolve: async (_, args, context) => {
        const {_id: userID} = await checkToken(context);
        const configs = await configModel.find({userID}).populate([
            {path:'planID'}
        ])
        return configs
    }
}

module.exports = {
    getConfigs
}