const { configModel } = require("../../models/config");
const { planModel } = require("../../models/plan");
const { planType } = require("../typeDefs/plan.type");
const { checkToken } = require("./public.resolver");
const { GraphQLList } = require("graphql");

const getPlans = {
    type: new GraphQLList(planType),
    resolve: async (_, args, context) => {
        checkToken(context);
        const plans = await planModel.find()
        return plans
    }
}

module.exports = {
    getPlans
}