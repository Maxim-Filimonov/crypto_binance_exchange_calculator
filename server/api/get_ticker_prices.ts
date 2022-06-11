import { defineEventHandler } from "h3";

type SymbolData = {
  symbol: string;
};
type Response = {
  data: SymbolData[];
};

async function eventHandler(event) {
  const query = useQuery(event);
  const quote = query.quote.toString();
  const fiat = query.fiat.toString();
  const pairs = await getP2PCurrenciesTocheck({ quote, fiat });
  const res = await $fetch<Response>(
    "https://api.binance.com/api/v3/ticker/price",
    {
      method: "GET",
      params: {
        symbols: pairs,
      },
    }
  );
  return res;
}
interface BinanceExchangeInfo {
  symbols: [
    {
      quoteAsset: string;
      symbol: string;
      status: "TRADING";
      baseAsset: string;
    }
  ];
}

type PortalConfig = {
  data: {
    areas: [
      {
        area: "P2P" | "EXPRESS";
        tradeSides: [
          {
            side: "BUY" | "SELL";
            assets: [
              {
                asset: string;
              }
            ];
          }
        ];
      }
    ];
  };
};

async function getP2PCurrenciesTocheck({ quote, fiat }) {
  const p2pPairsConfig = await $fetch<PortalConfig>(
    "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/portal/config",
    {
      method: "POST",
      body: { fiat: fiat },
    }
  );
  const p2pSymbolsToCheck = p2pPairsConfig.data.areas
    .find((x) => x.area === "P2P")
    .tradeSides.find((x) => x.side === "SELL")
    .assets.map((x) => x.asset);
  // const p2pCryptos = ["BTC", "ETH", "SHIB", "BNB"];
  // const p2pStable = ["BUSD", "USDT"];
  // let p2pSymbolsToCheck = [...p2pCryptos, ...p2pStable];
  console.debug("P2P Symbols to check");
  const binanceData = await $fetch<BinanceExchangeInfo>(
    "https://api.binance.com/api/v1/exchangeInfo"
  );
  const baseTradingPairs = binanceData.symbols.filter(
    (x) => x.quoteAsset === quote && p2pSymbolsToCheck.includes(x.baseAsset)
  );
  const quoteTradingPairs = binanceData.symbols.filter(
    (x) => x.baseAsset === quote && p2pSymbolsToCheck.includes(x.quoteAsset)
  );

  const pairsToCheck = [...baseTradingPairs, ...quoteTradingPairs]
    .map((x) => x.symbol)
    .map((x) => `"${x}"`);
  console.debug("checking pairs", pairsToCheck);

  const priceSymbols = pairsToCheck.join(",");
  const asQueryStringArray = `[${priceSymbols}]`;
  return asQueryStringArray;
}

export default defineEventHandler(eventHandler);
