<script setup>
let audSymbols = [
  "BTCAUD",
  "ETHAUD",
  "AUDBUSD",
  "AUDUSDT",
  "SHIBAUD",
  "BNBAUD",
];
audSymbols = audSymbols.map((x) => `"${x}"`);

const priceSymbols = audSymbols.join(",");
const QsSymbols = `[${priceSymbols}]`;

let { data: symbols } = await useFetch(
  "https://api.binance.com/api/v3/ticker/price",
  {
    params: {
      symbols: QsSymbols,
    },
  }
);

symbols = await Promise.all(
  symbols.value.map(async (sym) => {
    const { data } = await useFetch("/api/get_p2p_price", {
      params: { symbol: sym.symbol },
    });
    const p2pPrice = data.value.price;
    return {
      ...sym,
      p2pPrice,
      exchangeRate: calcExchangeRate(sym, p2pPrice),
    };
  })
);
symbols.sort((a, b) => b.exchangeRate - a.exchangeRate);
</script>
<script>
function calcExchangeRate({ symbol, price }, p2pPrice) {
  if (symbol.startsWith("AUD")) {
    return price * p2pPrice;
  } else {
    return p2pPrice / price;
  }
}
</script>
<template>
  <div>
    <h1>Crypto symbols</h1>
    <ul>
      <li v-for="sym in symbols" :key="sym.symbol">
        <p>{{ sym.symbol }}</p>
        <span>{{ sym.price }}</span>
        <p>{{ sym.p2pPrice }}</p>
        <p>{{ sym.exchangeRate }}</p>
      </li>
    </ul>
  </div>
</template>

