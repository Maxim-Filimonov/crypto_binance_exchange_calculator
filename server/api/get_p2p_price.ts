import { defineEventHandler } from "h3";
import { $fetch } from "ohmyfetch";

type PriceData = {
  adv: {
    price: number;
  };
};
type Response = {
  data: PriceData[];
};

async function eventHandler(event) {
  const query = useQuery(event);
  const symbol = query.symbol?.toString() || "BTC";
  const price = await getP2PPrice(symbol);

  return {
    price: price,
  };
}

export async function getP2PPrice(symbol: string): Promise<number> {
  const baseCurrency = symbol.replace("AUD", "");
  const postData = {
    fiat: "RUB",
    merchantCheck: true,
    payTypes: ["Tinkoff"],
    publisherType: "merchant",
    rows: 10,
    tradeType: "SELL",
    transAmount: "25000",
    page: 1,
    asset: baseCurrency,
  };
  const { data } = await $fetch<Response>(
    "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
    {
      method: "POST",
      body: postData,
    }
  );
  const price = data[0]["adv"]["price"];
  return price;
}
export default defineEventHandler(eventHandler);
