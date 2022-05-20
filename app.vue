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

let { data: symbols, refresh } = await useAsyncData("tickers", () =>
  $fetch("https://api.binance.com/api/v3/ticker/price", {
    params: {
      symbols: QsSymbols,
    },
  })
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
      baseSymbol: sym.symbol.replace("AUD", ""),
      exchangeRate: calcExchangeRate(sym, p2pPrice),
    };
  })
);
symbols.sort((a, b) => b.exchangeRate - a.exchangeRate);

console.log("SYMS", symbols);
async function refreshData() {
  console.log("Refreshing...");
  await refresh();
}
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
      <li style="list-style: none" v-for="sym in symbols" :key="sym.symbol">
        <h3>{{ sym.baseSymbol }}</h3>
        <p>Price to buy with AUD: {{ sym.price }}</p>
        <p>Price to sell on p2p to RUB: {{ sym.p2pPrice }}</p>
        <p>
          Exchange Rate: <b>{{ sym.exchangeRate }}</b>
        </p>
      </li>
    </ul>
    <button @click="refreshData">Refresh</button>
  </div>
</template>

