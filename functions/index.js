const functions = require("firebase-functions");
const stripe = require('stripe')(functions.config().stripe.testkey);
//创建endpoint
// // Create and deploy your first functions 创建并部署您的第一个函数

const calculateAmount = (items) => {
    prices = [];
    catalog = [
        { 'id': '0', 'price': 2.99 },
        { 'id': '1', 'price': 3.99 },
        { 'id': '2', 'price': 4.99 },
        { 'id': '3', 'price': 5.99 },
        { 'id': '4', 'price': 6.99 },
    ];
    // items数组是要买的东西
    // catalog是商店所有的东西
    /// 把要买的东西的价格找 出来
    items.forEach(
        item => {
            price = catalog.find(x => x.id == item.id).price;
            prices.push(price);

        }
    );
    // 求和，  然后把0.02 变成2
    return parseInt(prices.reduce((a, b) => a + b) * 100);

};
/// 创建 服务器的 响应
const generateResponse = function(intent) {
    switch (intent.status) {
        case 'requires_action':
            return {
                clientSecret: intent.clientSecret,
                requireAction: true,
                status: intent.status,
            };

        case 'requires_payment_method':
            return {
                'error': 'Your card was denied, please provide a new payment method',
            };

        case 'succeeded':
            console.log('*****payment succeeded**');
            return { // 通过日志看应该是client_secret ，不应该是 clientSecret
                clientSecret: intent.client_secret,
                status: intent.status
            };
    }
    return { error: 'Failed' };
}

exports.StripePayEndpointMethodId = functions.https.onRequest(async(req, res) => {
    //从请求里取出4个数据，保存
    const { paymentMethodId, items, currency, useStripeSdk } = req.body;

    const orderAmount = calculateAmount(items);

    try {
        // 如果 有 paymentMethodId，则创建 paymentIntent
        if (paymentMethodId) {
            const params = {
                amount: orderAmount,
                confirm: true,
                confirmation_method: 'manual',
                currency: currency,
                payment_method: paymentMethodId,
                use_stripe_sdk: useStripeSdk,

            };
            //创建 payment Intent --object
            const intent = await stripe.paymentIntents.create(params);
            console.log('intent: ${intent}');
            return res.send(generateResponse(intent));
        }
        return res.sendStatus(400);
    } catch (e) {
        return res.send({ error: e.message });
    };

});
exports.StripePayEndpointIntentId = functions.https.onRequest(async(req, res) => {
    const { paymentIntentId } = req.body;
    try {
        if (paymentIntentId) {
            const intent = await stripe.paymentIntents.confirm(paymentIntentId);
            return res.send(generateResponse(intent));
        }
        return res.sendStatus(400);
    } catch (error) {
        return res.send({ error: error.message });
    }

});

// // https://firebase.google.com/docs/functions/get-started
//                                                   请求     响应
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });