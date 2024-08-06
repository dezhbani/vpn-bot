const { userModel } = require("../../models/user");
const { billType } = require("../typeDefs/bill.type");
const { userType } = require("../typeDefs/public.type");
const { checkToken } = require("./public.resolver");
const { GraphQLList } = require("graphql");

const getProfileDetails = {
    type: new GraphQLList(userType),
    resolve: async (_, args, context) => {
        const user = await checkToken(context);
        return [user]
    }
}

const getBills = {
    type: new GraphQLList(billType),
    resolve: async (_, args, context) => {
        const { _id, bills } = await checkToken(context);
        const user = await userModel.findById(_id).populate([
            {path: 'bills.planID'},
            {path: 'bills.paymentID'},
         ])
        return user.bills
    }
}

module.exports = {
    getProfileDetails,
    getBills
}