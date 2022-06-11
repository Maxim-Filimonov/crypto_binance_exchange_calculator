import { rest } from "msw";
export const restHandlers = [
  // Handles a POST /login request
  rest.post(
    "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ data: [{ adv: { price: 123 } }] })
      );
    }
  ),
  rest.get("api/get_p2p_priceapi/get_p2p_price", (req, res, ctx) =>
    req.passthrough()
  ),
  rest.post("https://telemetry.nuxtjs.com/", (req, res, ctx) =>
    req.passthrough()
  ),
];
