export async function getLiveSeries(symbol) {

  const res = await fetch(
    `http://localhost:5000/api/candles?symbol=${symbol}.NS`
  );

  const data = await res.json();

  return data.candles.map(c => ({
    time: new Date(c.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    close: c.close
  }));

}