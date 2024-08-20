const Queries = async (collectionModel, queryKeys, searchKeys) => {
    try {
        const { limit, page, sort, order, ...filters } = queryKeys;
        let query = {};
        if (Object.keys(searchKeys).length > 0) {
            query.$or = Object.keys(searchKeys).map(key => {
                return { [key]: { $regex: searchKeys[key], $options: "i" } }
            })

        }
        if (filters) {
            Object.keys(filters).forEach(key => {
                query[key] = filters[key];
            });
        }
        let sortOrder = {};
        if (sort) {
            sortOrder[sort] = order === "desc" ? -1 : 1;
        }
        const itemsPerPage = parseInt(limit) || 10;
        const currentPage = parseInt(page) || 1;
        if (isNaN(Number(page))) {
            const result = await collectionModel.find(query)
            return {
                success: true,
                data: result,
            }
        } else {
            const [result, totalItems] = await Promise.all([
                collectionModel.find(query)
                    .sort(sortOrder)
                    .skip((currentPage - 1) * itemsPerPage)
                    .limit(itemsPerPage),
                collectionModel.countDocuments()
            ]);

            return {
                success: true,
                data: result,
                pagination: {
                    currentPage,
                    itemsPerPage,
                    totalItems,
                    totalPages: Math.ceil(totalItems / itemsPerPage)
                }
            };

        }

    } catch (error) {
        throw new error(error)
    }
}
module.exports = Queries