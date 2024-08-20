const Queries = async (collectionModel, queryKeys, searchKeys, populatePath, selectFields) => {
    try {
        const { limit, page, sort, order, ...filters } = queryKeys;
        let query = {};
        if (Object.keys(searchKeys).length > 0) {
            query.$or = Object.keys(searchKeys).map(key => ({
                [key]: { $regex: searchKeys[key], $options: "i" }
            }));
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
            let queryExec = collectionModel.find(query);

            if (populatePath) {
                queryExec = queryExec.populate(populatePath);
            }
            if (selectFields) {
                queryExec = queryExec.select(selectFields);
            }

            const result = await queryExec;

            return {
                success: true,
                data: result,
            };
        } else {
            let queryExec = collectionModel.find(query)
                .sort(sortOrder)
                .skip((currentPage - 1) * itemsPerPage)
                .limit(itemsPerPage);
            if (populatePath) {
                queryExec = queryExec.populate(populatePath);
            }

            // Select specific fields if selectFields is provided
            if (selectFields) {
                queryExec = queryExec.select(selectFields);
            }

            const [result, totalItems] = await Promise.all([
                queryExec,
                collectionModel.countDocuments(query)
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
        // Improved error handling
        throw new Error(error.message || "An error occurred while executing the query");
    }
};

module.exports = Queries;
