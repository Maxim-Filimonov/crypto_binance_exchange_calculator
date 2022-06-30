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
  const fiat = query.fiat?.toString();
  const quote = query.quote?.toString();
  const price = await getP2PPrice({ symbol, fiat, quote });

  return {
    price: price,
  };
}

interface GetP2PFuncArgs {
  symbol: string;
  fiat?: string;
  payTypes?: string[];
  quote?: string;
  baseApi?: string;
}
export async function getP2PPrice({
  symbol,
  fiat = "RUB",
  // payTypes = ["Tinkoff"],
  payTypes = [],
  quote = "AUD",
  baseApi = "https://p2p.binance.com",
}: GetP2PFuncArgs): Promise<number> {
  const baseCurrency = symbol.replace(quote, "");

  const postData = {
    fiat: fiat,
    merchantCheck: true,
    payTypes: payTypes,
    publisherType: "merchant",
    rows: 10,
    tradeType: "SELL",
    transAmount: "25000",
    page: 1,
    asset: baseCurrency,
  };
  console.debug("Getting currency data for", postData);

  const { data } = await $fetch<Response>(
    `${baseApi}/bapi/c2c/v2/friendly/c2c/adv/search`,
    {
      method: "POST",
      body: postData,
    }
  );

  if (data.length > 0) {
    return data[0]["adv"]["price"];
  } else {
    return 0;
  }
}
export default defineEventHandler(eventHandler);
