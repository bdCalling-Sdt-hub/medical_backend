const CallHistory = require("../Models/CallHistoryModel")
const Queries = require("../utils/Queries")

const PostCallHistory = async (req, res) => {
    try {
        const { doctorId, userId } = req.body
        const callHistory = new CallHistory({ doctorId, userId })
        await callHistory.save()
        return res.status(200).send({ success: true, data: callHistory })
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message || 'Internal server error' })
    }
}

// get all call history
const GetCallHistory = async (req, res) => {
    try {
        const { id, role } = req.user
        const { search, ...queryKeys } = req.query
        if (role === "DOCTOR") {
            queryKeys.doctorId = id
        } else if (role === "USER") {
            queryKeys.userId = id
        }
        const populatePaths = ["doctorId", "userId"]
        const selectFields = ["name email phone location _id img specialization", "name email phone location _id img age"]
        const searchKey = {}
        const result = await Queries(CallHistory, queryKeys, searchKey, populatePath = populatePaths, selectField = selectFields)
        return res.status(200).send({ ...result })
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message || 'Internal server error' })
    }
}

module.exports = { PostCallHistory, GetCallHistory }