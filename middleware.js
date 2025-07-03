const listing = require("./models/listing.js");
const { listingSchema } = require("./schema.js")
const ExpressError = require("./utils/ExpressErrors.js");
const { reviewSchema } = require("./schema.js");
const Review = require("./models/reviews.js");
const wrapAsync = require("./utils/wrapAsync.js");


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {

        //mtlb jab tum add new listing pr jaate ho or logged in nhi hote ho..to login krne pr wo tumhe
        //listings pr fek dega but hm chahte hai jaha hm ja rhe the whi pahuche

        // If it’s a DELETE request, redirect to the listing show page instead of the full delete route
        if (req.method === "DELETE" && req.baseUrl.includes("reviews")) {
            const { id } = req.params;
            req.session.redirectUrl = `/listings/${id}`;
        } else {
            req.session.redirectUrl = req.originalUrl;
        }

        req.flash("error", "You must be logged in to continue.");
        return res.redirect("/login");
    }
    next();
};



module.exports.savedredirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        //original Url is the property of req object which shows the path you were visiting before login
    }
    next();
}

module.exports.//MIDDLEWARE FOR SERVER SIDE ERROR HANDLING
    validateListing = (req, res, next) => {
        let { error } = listingSchema.validate(req.body);
        if (error) {
            throw new ExpressError(400, error);
        } else {
            next();
        }
    };

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let list = await listing.findById(id);
    if (!list.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You dont have permission to perform this task");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    let { id, reviewID } = req.params;
    let review = await Review.findById(reviewID);

    if (!review) {
        req.flash("error", "Review does not exist.");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this Review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// const listing = require("./models/listing.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
// const ExpressError = require("./utils/ExpressErrors.js");
// const Review = require("./models/reviews.js");

// // Check if user is logged in
// module.exports.isLoggedIn = (req, res, next) => {
//     if (!req.isAuthenticated()) {
//         if (req.method === "DELETE" && req.baseUrl.includes("reviews")) {
//             const { id } = req.params;
//             req.session.redirectUrl = `/listings/${id}`;
//         } else {
//             req.session.redirectUrl = req.originalUrl;
//         }
//         req.flash("error", "You must be logged in to continue.");
//         return res.redirect("/login");
//     }
//     next();
// };

// // Restore redirect path from session
// module.exports.savedredirectUrl = (req, res, next) => {
//     if (req.session.redirectUrl) {
//         res.locals.redirectUrl = req.session.redirectUrl;
//     }
//     next();
// };

// // Validate listing input using Joi
// module.exports.validateListing = (req, res, next) => {
//     const { error } = listingSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(", ");
//         throw new ExpressError(msg, 400);
//     }
//     next();
// };

// // Validate review input using Joi
// module.exports.validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(", ");
//         throw new ExpressError(msg, 400);
//     }
//     next();
// };

// // Check if the current user owns the listing
// module.exports.isOwner = async (req, res, next) => {
//     const { id } = req.params;
//     const list = await listing.findById(id);
//     if (!req.user || !list.owner.equals(req.user._id)) {
//         req.flash("error", "You don't have permission to perform this task");
//         return res.redirect(`/listings/${id}`);
//     }
//     next();
// };

// // Check if the current user authored the review
// module.exports.isAuthor = async (req, res, next) => {
//     const { id, reviewID } = req.params;
//     const review = await Review.findById(reviewID);

//     if (!review) {
//         req.flash("error", "Review does not exist.");
//         return res.redirect(`/listings/${id}`);
//     }

//     if (!req.user || !review.author.equals(req.user._id)) {
//         req.flash("error", "You are not the author of this review.");
//         return res.redirect(`/listings/${id}`);
//     }

//     next();
// };
