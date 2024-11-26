    import { motion } from "framer-motion";
    import { useCartStore } from "../stores/useCartStore";
    import { Link } from "react-router-dom";
    import { MoveRight } from "lucide-react";
    import { loadStripe } from "@stripe/stripe-js";
    import axios from "../lib/axios";

    const stripePromise = loadStripe(
        "pk_test_51Q4dqpCKqJi446xB6mpx0yBSVviyIImddpqRXqYn98xY8GKFfOgbXvaEhSlVTwgCYjxfZmGV0JzkfmFrWosZEQDy002OkQkfYk"
    );

    const OrderSummary = () => {
        const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();

        const savings = subtotal - total;
        const formattedSubtotal = subtotal.toFixed(2);
        const formattedTotal = total.toFixed(2);
        const formattedSavings = savings.toFixed(2);

        const handlePayment = async () => {
    const stripe = await stripePromise;
    
    // Log to check the structure of the cart and items
    console.log("Cart items:", cart);
    
    // Modify the product data to include 'images' as an array
    const modifiedCart = cart.map(item => {
        console.log("Processing item:", item);
        
        // Check if price_data and product_data exist
        if (item.price_data && item.price_data.product_data) {
            console.log("Item has price_data and product_data:", item.price_data);
            
            return {
                ...item,
                price_data: {
                    ...item.price_data,
                    product_data: {
                        ...item.price_data.product_data,
                        images: [item.image]  // Change 'image' to 'images' and wrap it in an array
                    }
                }
            };
        } else {
            // If price_data or product_data is missing, log the issue
            console.log("Missing price_data or product_data in item:", item);
            return item;  // Return the item as is
        }
    });

    // Log the modified cart to inspect changes
    console.log("Modified Cart:", modifiedCart);

    try {
        const res = await axios.post("/payments/create-checkout-session", {
            products: modifiedCart,
            couponCode: coupon ? coupon.code : null,
        });

        const session = res.data;
        const result = await stripe.redirectToCheckout({
            sessionId: session.id,
        });

        if (result.error) {
            console.error("Error:", result.error);
        }
    } catch (error) {
        console.error("Error during payment process:", error);
    }
};

        

        return (
            <motion.div
                className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <p className='text-xl font-semibold text-emerald-400'>Order summary</p>

                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <dl className='flex items-center justify-between gap-4'>
                            <dt className='text-base font-normal text-gray-300'>Original price</dt>
                            <dd className='text-base font-medium text-white'>${formattedSubtotal}</dd>
                        </dl>

                        {savings > 0 && (
                            <dl className='flex items-center justify-between gap-4'>
                                <dt className='text-base font-normal text-gray-300'>Savings</dt>
                                <dd className='text-base font-medium text-emerald-400'>-${formattedSavings}</dd>
                            </dl>
                        )}

                        {coupon && isCouponApplied && (
                            <dl className='flex items-center justify-between gap-4'>
                                <dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
                                <dd className='text-base font-medium text-emerald-400'>-{coupon.discountPercentage}%</dd>
                            </dl>
                        )}
                        <dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
                            <dt className='text-base font-bold text-white'>Total</dt>
                            <dd className='text-base font-bold text-emerald-400'>${formattedTotal}</dd>
                        </dl>
                    </div>

                    <motion.button
                        className='flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePayment}
                    >
                        Proceed to Checkout
                    </motion.button>

                    <div className='flex items-center justify-center gap-2'>
                        <span className='text-sm font-normal text-gray-400'>or</span>
                        <Link
                            to='/'
                            className='inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline'
                        >
                            Continue Shopping
                            <MoveRight size={16} />
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    };
    export default OrderSummary;