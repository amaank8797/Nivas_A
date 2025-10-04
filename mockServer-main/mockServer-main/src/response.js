// responses.js

const loginResponses = {
    success: {
        jwt: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc1NzY2NTcxOCwiZXhwIjoxNzU3NjY2NjE4LCJpc3MiOiJnZW5jX2NvaG9ydCIsImF1ZCI6WyJHZW5DIl19.TomHldZbSpcIc6bb6gRqpGPw6bm2RSwaHWmwzL_cXmo",
        
    },
    failure: {
        success: false,
        message: 'Invalid username or password',
    },
};

const profileResponses = {
    success: {
        success: true,
        message: 'User profile retrieved successfully',
    },
    failure: {
        success: false,
        message: 'User not found',
    },
};

const bookingResponses = {
    success: {
        success: true,
        message: 'Booking confirmed successfully',
        bookingId: "B001"
    },
    failure: {
        success: false,
        message: 'Booking failed due to unavailability',
    },
};

const paymentResponses = {
    success: {
        success: true,
        message: 'Payment processed successfully',
        paymentId: "P1001"
    },
    failure: {
        success: false,
        message: 'Payment declined or failed',
    },
};

const reviewResponses = {
    success: {
        success: true,
        message: 'Review submitted successfully',
        reviewId: "RV001"
    },
    failure: {
        success: false,
        message: 'Unable to submit review',
    },
};

const loyaltyResponses = {
    success: {
        success: true,
        message: 'Loyalty points updated',
        loyaltyId: "L001"
    },
    failure: {
        success: false,
        message: 'Failed to update loyalty account',
    },
};

const redemptionResponses = {
    success: {
        success: true,
        message: 'Points redeemed successfully',
        redemptionId: "RD001"
    },
    failure: {
        success: false,
        message: 'Redemption failed due to insufficient points',
    },
};

module.exports = {
    loginResponses,
    profileResponses,
    bookingResponses,
    paymentResponses,
    reviewResponses,
    loyaltyResponses,
    redemptionResponses,
};
