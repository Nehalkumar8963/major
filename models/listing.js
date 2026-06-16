const mongoose = require('mongoose');
const schema = mongoose.Schema;

const listingSchema = new schema({
    title: { type: String, required: true },
    category: String,
    description: String,
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    owner:{  
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
        immutable: true
    },

    image:{
        filename: String,
        url: String
    }
});

      
const Listing = mongoose.model('Listing', listingSchema);
  
module.exports = Listing;
