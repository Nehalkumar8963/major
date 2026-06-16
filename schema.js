const joi=require('joi');

const listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        price: joi.number().required().min(0),
        description: joi.string().required(),
        location: joi.string().required(),
        country: joi.string().required(),
        category: joi.string().allow('', null).optional()
    }).unknown(true).required()
});

module.exports.listingSchema = listingSchema;
//module.exports = listingSchema;                           
module.exports.reviewSchema= joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required(),
    }).required()
})
